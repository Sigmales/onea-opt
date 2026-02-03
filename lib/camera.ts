// ONEA-OPT Camera Access for Field Photos
// Capture and compress images from device camera

export interface CapturedImage {
  id: string;
  dataUrl: string;
  fileSize: number;
  width: number;
  height: number;
  timestamp: number;
  location?: { lat: number; lng: number };
}

// Check if camera is supported
export function isCameraSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Request camera permission and open stream
export async function openCamera(
  videoElement: HTMLVideoElement,
  facingMode: 'user' | 'environment' = 'environment'
): Promise<MediaStream | null> {
  if (!isCameraSupported()) {
    throw new Error('Camera not supported on this device');
  }
  
  try {
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    
    return stream;
  } catch (error) {
    console.error('[Camera] Failed to open:', error);
    throw error;
  }
}

// Capture photo from video stream
export function capturePhoto(
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement
): CapturedImage | null {
  if (!videoElement.videoWidth || !videoElement.videoHeight) {
    console.error('[Camera] Video not ready');
    return null;
  }
  
  const context = canvasElement.getContext('2d');
  if (!context) {
    console.error('[Camera] Canvas context not available');
    return null;
  }
  
  // Set canvas size to match video
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  
  // Draw video frame to canvas
  context.drawImage(videoElement, 0, 0);
  
  // Get data URL (will be compressed later)
  const dataUrl = canvasElement.toDataURL('image/jpeg', 0.9);
  
  // Calculate approximate file size
  const base64Length = dataUrl.split(',')[1].length;
  const fileSize = Math.round((base64Length * 3) / 4);
  
  return {
    id: `photo-${Date.now()}`,
    dataUrl,
    fileSize,
    width: canvasElement.width,
    height: canvasElement.height,
    timestamp: Date.now()
  };
}

// Compress image to target size (default 500KB)
export async function compressImage(
  image: CapturedImage,
  targetSizeKB: number = 500,
  maxWidth: number = 1280,
  maxHeight: number = 720
): Promise<CapturedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Create canvas for compression
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Find optimal quality
      let quality = 0.9;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      let fileSize = estimateFileSize(dataUrl);
      
      // Binary search for optimal quality
      let minQuality = 0.1;
      let maxQuality = 0.9;
      const targetSize = targetSizeKB * 1024;
      
      for (let i = 0; i < 10; i++) {
        if (Math.abs(fileSize - targetSize) < targetSize * 0.1) {
          break; // Close enough
        }
        
        if (fileSize > targetSize) {
          maxQuality = quality;
          quality = (minQuality + quality) / 2;
        } else {
          minQuality = quality;
          quality = (quality + maxQuality) / 2;
        }
        
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        fileSize = estimateFileSize(dataUrl);
      }
      
      resolve({
        ...image,
        dataUrl,
        fileSize,
        width,
        height
      });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = image.dataUrl;
  });
}

// Estimate file size from base64 data URL
function estimateFileSize(dataUrl: string): number {
  const base64Length = dataUrl.split(',')[1]?.length || 0;
  return Math.round((base64Length * 3) / 4);
}

// Stop camera stream
export function stopCamera(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

// Get current location (for geotagging photos)
export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  if (!('geolocation' in navigator)) {
    return null;
  }
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('[Location] Failed:', error.message);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// Store image in IndexedDB
export async function storeImage(
  image: CapturedImage,
  anomalyId?: string
): Promise<void> {
  const { initDB } = await import('./db');
  const db = await initDB();
  
  const imageRecord = {
    id: image.id,
    dataUrl: image.dataUrl,
    fileSize: image.fileSize,
    width: image.width,
    height: image.height,
    timestamp: image.timestamp,
    location: image.location,
    anomalyId,
    synced: false
  };
  
  await db.put('images', imageRecord);
  
  // Add to sync queue
  await db.put('syncQueue', {
    id: `sync-${image.id}`,
    endpoint: '/api/images/upload',
    payload: imageRecord,
    method: 'POST',
    createdAt: Date.now(),
    retryCount: 0
  });
}

// Open file picker for existing photos
export async function pickImageFromGallery(): Promise<CapturedImage | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      
      try {
        const dataUrl = await fileToDataUrl(file);
        const image: CapturedImage = {
          id: `gallery-${Date.now()}`,
          dataUrl,
          fileSize: file.size,
          width: 0, // Will be set after loading
          height: 0,
          timestamp: Date.now()
        };
        
        // Get dimensions
        const img = new Image();
        img.onload = () => {
          image.width = img.width;
          image.height = img.height;
          resolve(image);
        };
        img.src = dataUrl;
      } catch (error) {
        reject(error);
      }
    };
    
    input.click();
  });
}

// Convert File to data URL
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
