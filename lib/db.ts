// ONEA-OPT IndexedDB Database
// Using idb library for Promise-based API

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database version
const DB_NAME = 'onea-opt-v1';
const DB_VERSION = 1;

// Database schema interface
interface ONEAOptDB extends DBSchema {
  recommendations: {
    key: string;
    value: {
      id: string;
      timestamp: number;
      pump: string;
      action: string;
      explanation: string[];
      estimatedSavings: number;
      applied: boolean;
      appliedAt?: number;
      rejected?: boolean;
      rejectReason?: string;
      stationId: string;
    };
    indexes: { 'by-timestamp': number; 'by-station': string; 'by-applied': number };
  };
  
  anomalies: {
    key: string;
    value: {
      id: string;
      pump: string;
      severity: 'urgent' | 'medium' | 'low';
      type: string;
      kwhM3: number;
      baseline: number;
      costImpact: number;
      detectedAt: number;
      resolvedAt?: number;
      resolved: boolean;
      rootCauses: { cause: string; probability: number }[];
      citizenReports: number;
      stationId: string;
    };
    indexes: { 'by-detected': number; 'by-station': string; 'by-resolved': number };
  };
  
  historicalActions: {
    key: string;
    value: {
      id: string;
      timestamp: number;
      action: string;
      pump?: string;
      result: string;
      savings?: number;
      userId: string;
      userName: string;
      stationId: string;
      synced: boolean;
    };
    indexes: { 'by-timestamp': number; 'by-station': string; 'by-user': string };
  };
  
  pumpSchedules: {
    key: string;
    value: {
      id: string;
      date: string;
      stationId: string;
      planning24h: { hour: number; pumpsActive: number; isOffPeak: boolean; cost: number }[];
      totalCost: number;
      optimizedCost: number;
      savings: number;
      createdAt: number;
    };
    indexes: { 'by-date': string; 'by-station': string };
  };
  
  syncQueue: {
    key: string;
    value: {
      id: string;
      endpoint: string;
      payload: any;
      method: 'POST' | 'PUT' | 'DELETE';
      createdAt: number;
      retryCount: number;
      lastError?: string;
    };
    indexes: { 'by-created': number; 'by-retry': number };
  };
  
  userPreferences: {
    key: string;
    value: {
      id: string;
      userId: string;
      theme: 'light' | 'dark';
      notifications: boolean;
      offlineMode: boolean;
      lastSync: number;
    };
  };
}

// Database instance
let db: IDBPDatabase<ONEAOptDB> | null = null;

// Initialize database
export async function initDB(): Promise<IDBPDatabase<ONEAOptDB>> {
  if (db) return db;
  
  db = await openDB<ONEAOptDB>(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      console.log(`[DB] Upgrading from ${oldVersion} to ${newVersion}`);
      
      // Recommendations store
      if (!database.objectStoreNames.contains('recommendations')) {
        const recStore = database.createObjectStore('recommendations', { keyPath: 'id' });
        recStore.createIndex('by-timestamp', 'timestamp');
        recStore.createIndex('by-station', 'stationId');
        recStore.createIndex('by-applied', 'applied');
      }
      
      // Anomalies store
      if (!database.objectStoreNames.contains('anomalies')) {
        const anomStore = database.createObjectStore('anomalies', { keyPath: 'id' });
        anomStore.createIndex('by-detected', 'detectedAt');
        anomStore.createIndex('by-station', 'stationId');
        anomStore.createIndex('by-resolved', 'resolved');
      }
      
      // Historical actions store
      if (!database.objectStoreNames.contains('historicalActions')) {
        const actionStore = database.createObjectStore('historicalActions', { keyPath: 'id' });
        actionStore.createIndex('by-timestamp', 'timestamp');
        actionStore.createIndex('by-station', 'stationId');
        actionStore.createIndex('by-user', 'userId');
      }
      
      // Pump schedules store
      if (!database.objectStoreNames.contains('pumpSchedules')) {
        const scheduleStore = database.createObjectStore('pumpSchedules', { keyPath: 'id' });
        scheduleStore.createIndex('by-date', 'date');
        scheduleStore.createIndex('by-station', 'stationId');
      }
      
      // Sync queue store
      if (!database.objectStoreNames.contains('syncQueue')) {
        const syncStore = database.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-created', 'createdAt');
        syncStore.createIndex('by-retry', 'retryCount');
      }
      
      // User preferences store
      if (!database.objectStoreNames.contains('userPreferences')) {
        database.createObjectStore('userPreferences', { keyPath: 'id' });
      }
    },
    blocked() {
      console.warn('[DB] Database upgrade blocked');
    },
    blocking() {
      console.warn('[DB] Database blocking other connections');
    },
    terminated() {
      console.error('[DB] Database connection terminated');
      db = null;
    }
  });
  
  console.log('[DB] Database initialized');
  return db;
}

// Get database instance
export async function getDB(): Promise<IDBPDatabase<ONEAOptDB>> {
  if (!db) {
    return initDB();
  }
  return db;
}

// Close database connection
export async function closeDB(): Promise<void> {
  if (db) {
    db.close();
    db = null;
    console.log('[DB] Database closed');
  }
}

// Check storage quota
export async function checkStorageQuota(): Promise<{ used: number; total: number; percentage: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const total = estimate.quota || 0;
    const percentage = total > 0 ? (used / total) * 100 : 0;
    
    return { used, total, percentage };
  }
  
  return { used: 0, total: 0, percentage: 0 };
}

// Recommendations CRUD
export async function addRecommendation(rec: ONEAOptDB['recommendations']['value']): Promise<void> {
  const database = await getDB();
  await database.put('recommendations', rec);
}

export async function getRecommendations(stationId?: string, limit: number = 50): Promise<ONEAOptDB['recommendations']['value'][]> {
  const database = await getDB();
  
  if (stationId) {
    return database.getAllFromIndex('recommendations', 'by-station', stationId, limit);
  }
  
  return database.getAll('recommendations', undefined, limit);
}

export async function applyRecommendation(id: string): Promise<void> {
  const database = await getDB();
  const rec = await database.get('recommendations', id);
  
  if (rec) {
    rec.applied = true;
    rec.appliedAt = Date.now();
    await database.put('recommendations', rec);
  }
}

export async function rejectRecommendation(id: string, reason: string): Promise<void> {
  const database = await getDB();
  const rec = await database.get('recommendations', id);
  
  if (rec) {
    rec.rejected = true;
    rec.rejectReason = reason;
    await database.put('recommendations', rec);
  }
}

// Anomalies CRUD
export async function addAnomaly(anomaly: ONEAOptDB['anomalies']['value']): Promise<void> {
  const database = await getDB();
  await database.put('anomalies', anomaly);
}

export async function getAnomalies(stationId?: string, resolved: boolean = false): Promise<ONEAOptDB['anomalies']['value'][]> {
  const database = await getDB();
  
  if (stationId) {
    const all = await database.getAllFromIndex('anomalies', 'by-station', stationId);
    return all.filter(a => a.resolved === resolved);
  }
  
  return database.getAllFromIndex('anomalies', 'by-resolved', resolved ? 1 : 0);
}

export async function resolveAnomaly(id: string): Promise<void> {
  const database = await getDB();
  const anomaly = await database.get('anomalies', id);
  
  if (anomaly) {
    anomaly.resolved = true;
    anomaly.resolvedAt = Date.now();
    await database.put('anomalies', anomaly);
  }
}

// Historical actions CRUD
export async function addHistoricalAction(action: ONEAOptDB['historicalActions']['value']): Promise<void> {
  const database = await getDB();
  await database.put('historicalActions', action);
}

export async function getHistoricalActions(stationId?: string, limit: number = 100): Promise<ONEAOptDB['historicalActions']['value'][]> {
  const database = await getDB();
  
  if (stationId) {
    return database.getAllFromIndex('historicalActions', 'by-station', stationId, limit);
  }
  
  const all = await database.getAll('historicalActions');
  return all.slice(-limit).reverse();
}

// Sync queue CRUD
export async function addToSyncQueue(item: Omit<ONEAOptDB['syncQueue']['value'], 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
  const database = await getDB();
  const queueItem: ONEAOptDB['syncQueue']['value'] = {
    ...item,
    id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    retryCount: 0
  };
  await database.put('syncQueue', queueItem);
}

export async function getSyncQueue(): Promise<ONEAOptDB['syncQueue']['value'][]> {
  const database = await getDB();
  return database.getAll('syncQueue');
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('syncQueue', id);
}

export async function incrementRetryCount(id: string, error?: string): Promise<void> {
  const database = await getDB();
  const item = await database.get('syncQueue', id);
  
  if (item) {
    item.retryCount++;
    if (error) item.lastError = error;
    await database.put('syncQueue', item);
  }
}

// Pump schedules
export async function savePumpSchedule(schedule: ONEAOptDB['pumpSchedules']['value']): Promise<void> {
  const database = await getDB();
  await database.put('pumpSchedules', schedule);
}

export async function getPumpSchedule(date: string, stationId: string): Promise<ONEAOptDB['pumpSchedules']['value'] | undefined> {
  const database = await getDB();
  const all = await database.getAllFromIndex('pumpSchedules', 'by-date', date);
  return all.find(s => s.stationId === stationId);
}

// Clear all data (for logout/reset)
export async function clearAllData(): Promise<void> {
  const database = await getDB();
  
  const stores = ['recommendations', 'anomalies', 'historicalActions', 'pumpSchedules', 'syncQueue'] as const;
  
  for (const store of stores) {
    await database.clear(store);
  }
  
  console.log('[DB] All data cleared');
}

// Export data for backup
export async function exportAllData(): Promise<{
  recommendations: ONEAOptDB['recommendations']['value'][];
  anomalies: ONEAOptDB['anomalies']['value'][];
  historicalActions: ONEAOptDB['historicalActions']['value'][];
  pumpSchedules: ONEAOptDB['pumpSchedules']['value'][];
}> {
  const database = await getDB();
  
  return {
    recommendations: await database.getAll('recommendations'),
    anomalies: await database.getAll('anomalies'),
    historicalActions: await database.getAll('historicalActions'),
    pumpSchedules: await database.getAll('pumpSchedules')
  };
}
