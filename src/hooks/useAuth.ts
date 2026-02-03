import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';

const STORAGE_KEY = 'onea_opt_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, _password: string): boolean => {
    // Demo mode - accept any email/password
    const newUser: User = {
      email,
      role: 'technicien',
      offline: false,
      name: 'Technicien',
      station: 'Ziga'
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return true;
  }, []);

  const demoLogin = useCallback((role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      technicien: 'Technicien',
      regional: 'Manager Régional',
      dg: 'Directeur Général'
    };

    const newUser: User = {
      email: `demo.${role}@onea.bf`,
      role,
      offline: true,
      name: roleNames[role],
      station: role === 'technicien' ? 'Ziga' : undefined
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setUser(updated);
    }
  }, [user]);

  return {
    user,
    isLoading,
    isOnline,
    isAuthenticated: !!user,
    login,
    demoLogin,
    logout,
    updateUser
  };
}
