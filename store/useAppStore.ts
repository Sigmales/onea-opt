// ONEA-OPT Zustand Store
// Global state management with IndexedDB persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../src/types';
import {
  initDB,
  addRecommendation,
  applyRecommendation,
  rejectRecommendation,
  getRecommendations,
  addAnomaly,
  resolveAnomaly,
  getAnomalies,
  addHistoricalAction,
  getHistoricalActions,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  incrementRetryCount,
  checkStorageQuota,
  exportAllData
} from '../src/lib/db';

// Recommendation type
interface Recommendation {
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
}

// Anomaly type
interface Anomaly {
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
}

// Historical action type
interface HistoricalAction {
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
}

// Sync queue item type
interface SyncQueueItem {
  id: string;
  endpoint: string;
  payload: any;
  method: 'POST' | 'PUT' | 'DELETE';
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

// App state interface
interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Network
  isOnline: boolean;
  lastSyncTime: number | null;
  
  // Data
  recommendations: Recommendation[];
  anomalies: Anomaly[];
  historicalActions: HistoricalAction[];
  syncQueue: SyncQueueItem[];
  
  // UI State
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingSyncCount: number;
  storageQuota: { used: number; total: number; percentage: number } | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setOnlineStatus: (status: boolean) => void;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  
  // Recommendation actions
  loadRecommendations: (stationId?: string) => Promise<void>;
  addRecommendation: (rec: Omit<Recommendation, 'id'>) => Promise<void>;
  applyRecommendation: (id: string) => Promise<void>;
  rejectRecommendation: (id: string, reason: string) => Promise<void>;
  
  // Anomaly actions
  loadAnomalies: (stationId?: string) => Promise<void>;
  addAnomaly: (anomaly: Omit<Anomaly, 'id'>) => Promise<void>;
  resolveAnomaly: (id: string) => Promise<void>;
  
  // Action history
  loadHistoricalActions: (stationId?: string) => Promise<void>;
  addHistoricalAction: (action: Omit<HistoricalAction, 'id'>) => Promise<void>;
  
  // Sync actions
  syncData: () => Promise<void>;
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>) => Promise<void>;
  checkStorageQuota: () => Promise<void>;
  exportData: () => Promise<any>;
  
  // Initialization
  initialize: () => Promise<void>;
}

// Create store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isOnline: navigator.onLine,
      lastSyncTime: null,
      recommendations: [],
      anomalies: [],
      historicalActions: [],
      syncQueue: [],
      syncStatus: 'idle',
      pendingSyncCount: 0,
      storageQuota: null,
      
      // User actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        if (isOnline) {
          // Auto-sync when coming back online
          get().syncData();
        }
      },
      
      login: (email, role) => {
        const roleNames: Record<UserRole, string> = {
          technicien: 'Technicien',
          regional: 'Manager Régional',
          dg: 'Directeur Général'
        };
        
        const user: User = {
          email,
          role,
          offline: false,
          name: roleNames[role],
          station: role === 'technicien' ? 'Ziga' : undefined
        };
        
        set({ user, isAuthenticated: true });
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          recommendations: [],
          anomalies: [],
          historicalActions: []
        });
      },
      
      // Recommendation actions
      loadRecommendations: async (stationId) => {
        try {
          const recs = await getRecommendations(stationId);
          set({ recommendations: recs as Recommendation[] });
        } catch (error) {
          console.error('Failed to load recommendations:', error);
        }
      },
      
      addRecommendation: async (rec) => {
        try {
          const newRec: Recommendation = {
            ...rec,
            id: `rec-${Date.now()}`
          };
          await addRecommendation(newRec);
          
          const current = get().recommendations;
          set({ recommendations: [newRec, ...current].slice(0, 50) });
        } catch (error) {
          console.error('Failed to add recommendation:', error);
        }
      },
      
      applyRecommendation: async (id) => {
        try {
          await applyRecommendation(id);
          
          // Update local state
          const current = get().recommendations.map(r =>
            r.id === id ? { ...r, applied: true, appliedAt: Date.now() } : r
          );
          set({ recommendations: current });
          
          // Add to sync queue if offline
          if (!get().isOnline) {
            await get().addToSyncQueue({
              endpoint: '/api/recommendations/apply',
              payload: { id },
              method: 'POST'
            });
          }
        } catch (error) {
          console.error('Failed to apply recommendation:', error);
        }
      },
      
      rejectRecommendation: async (id, reason) => {
        try {
          await rejectRecommendation(id, reason);
          
          const current = get().recommendations.map(r =>
            r.id === id ? { ...r, rejected: true, rejectReason: reason } : r
          );
          set({ recommendations: current });
        } catch (error) {
          console.error('Failed to reject recommendation:', error);
        }
      },
      
      // Anomaly actions
      loadAnomalies: async (stationId) => {
        try {
          const anoms = await getAnomalies(stationId, false);
          set({ anomalies: anoms as Anomaly[] });
        } catch (error) {
          console.error('Failed to load anomalies:', error);
        }
      },
      
      addAnomaly: async (anomaly) => {
        try {
          const newAnomaly: Anomaly = {
            ...anomaly,
            id: `anomaly-${Date.now()}`
          };
          await addAnomaly(newAnomaly);
          
          const current = get().anomalies;
          set({ anomalies: [newAnomaly, ...current].slice(0, 50) });
        } catch (error) {
          console.error('Failed to add anomaly:', error);
        }
      },
      
      resolveAnomaly: async (id) => {
        try {
          await resolveAnomaly(id);
          
          const current = get().anomalies.map(a =>
            a.id === id ? { ...a, resolved: true, resolvedAt: Date.now() } : a
          );
          set({ anomalies: current });
        } catch (error) {
          console.error('Failed to resolve anomaly:', error);
        }
      },
      
      // Historical actions
      loadHistoricalActions: async (stationId) => {
        try {
          const actions = await getHistoricalActions(stationId);
          set({ historicalActions: actions as HistoricalAction[] });
        } catch (error) {
          console.error('Failed to load historical actions:', error);
        }
      },
      
      addHistoricalAction: async (action) => {
        try {
          const newAction: HistoricalAction = {
            ...action,
            id: `action-${Date.now()}`,
            synced: get().isOnline
          };
          await addHistoricalAction(newAction);
          
          const current = get().historicalActions;
          set({ historicalActions: [newAction, ...current].slice(0, 100) });
          
          // Add to sync queue if offline
          if (!get().isOnline) {
            await get().addToSyncQueue({
              endpoint: '/api/actions',
              payload: newAction,
              method: 'POST'
            });
          }
        } catch (error) {
          console.error('Failed to add historical action:', error);
        }
      },
      
      // Sync actions
      syncData: async () => {
        const state = get();
        if (!state.isOnline || state.syncStatus === 'syncing') return;
        
        set({ syncStatus: 'syncing' });
        
        try {
          const queue = await getSyncQueue();
          
          for (const item of queue) {
            try {
              // Simulate API call (replace with actual fetch)
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Remove from queue on success
              await removeFromSyncQueue(item.id);
            } catch (error) {
              console.error('Sync failed for item:', item.id, error);
              await incrementRetryCount(item.id, String(error));
            }
          }
          
          const remainingQueue = await getSyncQueue();
          set({
            syncStatus: 'idle',
            lastSyncTime: Date.now(),
            syncQueue: remainingQueue as SyncQueueItem[],
            pendingSyncCount: remainingQueue.length
          });
        } catch (error) {
          console.error('Sync failed:', error);
          set({ syncStatus: 'error' });
        }
      },
      
      addToSyncQueue: async (item) => {
        try {
          await addToSyncQueue(item);
          const queue = await getSyncQueue();
          set({
            syncQueue: queue as SyncQueueItem[],
            pendingSyncCount: queue.length
          });
        } catch (error) {
          console.error('Failed to add to sync queue:', error);
        }
      },
      
      checkStorageQuota: async () => {
        try {
          const quota = await checkStorageQuota();
          set({ storageQuota: quota });
        } catch (error) {
          console.error('Failed to check storage quota:', error);
        }
      },
      
      exportData: async () => {
        try {
          return await exportAllData();
        } catch (error) {
          console.error('Failed to export data:', error);
          return null;
        }
      },
      
      // Initialization
      initialize: async () => {
        try {
          // Initialize IndexedDB
          await initDB();
          
          // Load initial data
          await get().loadRecommendations();
          await get().loadAnomalies();
          await get().loadHistoricalActions();
          await get().checkStorageQuota();
          
          // Set up online/offline listeners
          const handleOnline = () => get().setOnlineStatus(true);
          const handleOffline = () => get().setOnlineStatus(false);
          
          window.addEventListener('online', handleOnline);
          window.addEventListener('offline', handleOffline);
          
          console.log('[Store] Initialized successfully');
        } catch (error) {
          console.error('[Store] Initialization failed:', error);
        }
      }
    }),
    {
      name: 'onea-opt-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastSyncTime: state.lastSyncTime
      })
    }
  )
);

// Initialize store on import
if (typeof window !== 'undefined') {
  useAppStore.getState().initialize();
}
