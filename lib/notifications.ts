// ONEA-OPT Push Notifications
// Browser notifications for anomaly alerts and recommendations

// Check if notifications are supported
export function areNotificationsSupported(): boolean {
  return 'Notification' in window;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!areNotificationsSupported()) {
    console.warn('[Notifications] Not supported in this browser');
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  console.log('[Notifications] Permission:', permission);
  return permission;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!areNotificationsSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

// Show notification
export function showNotification(
  title: string,
  options: NotificationOptions = {}
): Notification | null {
  if (!areNotificationsSupported()) {
    console.warn('[Notifications] Not supported');
    return null;
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return null;
  }
  
  const defaultOptions: NotificationOptions = {
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: 'onea-opt',
    requireInteraction: false,
    ...options
  };
  
  try {
    const notification = new Notification(title, defaultOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return notification;
  } catch (error) {
    console.error('[Notifications] Failed to show:', error);
    return null;
  }
}

// Show anomaly alert notification
export function showAnomalyNotification(
  pump: string,
  severity: 'urgent' | 'medium' | 'low',
  costImpact: number
): Notification | null {
  const severityText = {
    urgent: 'URGENT',
    medium: 'Moyenne',
    low: 'Faible'
  };
  
  return showNotification(
    `🚨 Anomalie ${severityText[severity]} - ${pump}`,
    {
      body: `Surconsommation détectée. Impact: -${costImpact.toLocaleString()} FCFA/jour. Cliquez pour voir les détails.`,
      tag: `anomaly-${pump}`,
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Voir détails' },
        { action: 'dismiss', title: 'Ignorer' }
      ]
    }
  );
}

// Show recommendation notification
export function showRecommendationNotification(
  action: string,
  savings: number
): Notification | null {
  return showNotification(
    '💡 Nouvelle recommandation IA',
    {
      body: `${action}. Économie estimée: ${savings.toLocaleString()} FCFA.`,
      tag: 'recommendation',
      requireInteraction: false
    }
  );
}

// Show sync complete notification
export function showSyncCompleteNotification(count: number): Notification | null {
  return showNotification(
    '✅ Synchronisation terminée',
    {
      body: `${count} action${count > 1 ? 's' : ''} synchronisée${count > 1 ? 's' : ''} avec succès.`,
      tag: 'sync-complete',
      requireInteraction: false
    }
  );
}

// Schedule notification (using setTimeout for demo)
export function scheduleNotification(
  title: string,
  options: NotificationOptions,
  delayMs: number
): () => void {
  const timeoutId = setTimeout(() => {
    showNotification(title, options);
  }, delayMs);
  
  // Return cancel function
  return () => clearTimeout(timeoutId);
}

// Register for push notifications (requires backend)
export async function registerPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Push] Service Worker not supported');
    return false;
  }
  
  if (!('PushManager' in window)) {
    console.warn('[Push] Push API not supported');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Request new subscription (requires VAPID public key from backend)
      // subscription = await registration.pushManager.subscribe({
      //   userVisibleOnly: true,
      //   applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      // });
      console.log('[Push] Subscription would be created here');
    }
    
    return true;
  } catch (error) {
    console.error('[Push] Registration failed:', error);
    return false;
  }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
