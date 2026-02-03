// ONEA-OPT Types

export type UserRole = 'technicien' | 'regional' | 'dg';

export interface User {
  email: string;
  role: UserRole;
  offline: boolean;
  name?: string;
  station?: string;
}

export interface Station {
  id: string;
  name: string;
  capacity: number;
  consumption: number;
  costPerM3: number;
  savings: number;
  status: 'optimal' | 'warning' | 'critical';
  pumps: Pump[];
  reservoirLevel: number;
}

export interface Pump {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  kwhPerM3: number;
  consumption: number;
}

export interface Recommendation {
  id: string;
  action: string;
  explanation: string[];
  estimatedSavings: number;
  timestamp: Date;
  applied: boolean;
}

export interface Anomaly {
  id: string;
  severity: 'urgent' | 'medium' | 'low';
  pump: string;
  type: string;
  kwhM3: number;
  baseline: number;
  costImpact: number;
  duration: number;
  rootCauses: RootCause[];
  citizenReports: number;
  correlation: boolean;
}

export interface RootCause {
  cause: string;
  probability: number;
}

export interface KPIData {
  dailySavings: number;
  consumption24h: number;
  reservoirLevel: number;
  activePumps: number;
  totalPumps: number;
}

export interface Scenario {
  name: string;
  cost: number;
  pumping: string;
  kwh: number;
  cosPhi: number;
  penalties: number;
  recommended?: boolean;
}

export interface HourlySchedule {
  hour: number;
  current: number;
  optimized: number;
  isOffPeak: boolean;
}

export interface ActionHistory {
  id: string;
  date: string;
  action: string;
  result: string;
  by: string;
}
