// Station Ziga Realistic Mock Data
// Based on actual ONEA operational parameters

import { detectAnomalies, PumpDataPoint } from '../algorithms/isolation-forest';
import { predictDemand } from '../algorithms/demand-predictor';
import { optimizePumpSchedule, PumpScheduleParams } from '../algorithms/nsga2';

// Station configuration
export const ZIGA_STATION = {
  id: 'ziga',
  name: 'Station Ziga',
  location: 'Ouagadougou, Burkina Faso',
  capacity: {
    max: 12000, // m³/h
    average: 6450, // m³/day actual production
    min: 3000
  },
  reservoir: {
    capacity: 50000, // m³
    currentLevel: 78, // %
    minLevel: 60, // %
    maxLevel: 95 // %
  },
  pumps: [
    { id: 'P1', name: 'Pompe P1', power: 450, efficiency: 1.75, maxFlow: 4000, status: 'active' as const },
    { id: 'P2', name: 'Pompe P2', power: 450, efficiency: 1.80, maxFlow: 4000, status: 'active' as const },
    { id: 'P3', name: 'Pompe P3', power: 450, efficiency: 1.85, maxFlow: 4000, status: 'inactive' as const }
  ],
  electrical: {
    voltage: 400, // V
    frequency: 50, // Hz
    cosPhi: 0.94,
    cosPhiMin: 0.93
  }
};

// SONABEL Tariffs 2026
export const SONABEL_TARIFFS = {
  peakHours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // 6h-22h
  offPeakHours: [22, 23, 0, 1, 2, 3, 4, 5], // 22h-6h
  peakPrice: 160, // FCFA/kWh
  offPeakPrice: 65, // FCFA/kWh
  fixedCharge: 12800 // FCFA/day
};

// Burkina Faso Holidays 2026
export const HOLIDAYS_2026 = [
  '2026-01-01', // New Year
  '2026-01-03', // Martyrs' Day
  '2026-03-08', // International Women's Day
  '2026-05-01', // Labour Day
  '2026-08-05', // Independence Day
  '2026-10-15', // Proclamation of Independence
  '2026-11-01', // All Saints' Day
  '2026-12-11', // Proclamation of Independence (cont.)
  '2026-12-25', // Christmas
];

/**
 * Generate 24h tariff schedule
 */
export function generateTariffSchedule(): number[] {
  const tariffs: number[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    if (SONABEL_TARIFFS.offPeakHours.includes(hour)) {
      tariffs.push(SONABEL_TARIFFS.offPeakPrice);
    } else {
      tariffs.push(SONABEL_TARIFFS.peakPrice);
    }
  }
  
  return tariffs;
}

/**
 * Generate realistic 24h demand pattern
 */
export function generateDemandPattern(date: Date = new Date()): number[] {
  const demand: number[] = [];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isHoliday = HOLIDAYS_2026.includes(date.toISOString().split('T')[0]);
  
  // Base hourly consumption
  const baseHourly = ZIGA_STATION.capacity.average / 24;
  
  for (let hour = 0; hour < 24; hour++) {
    let hourlyDemand = baseHourly;
    
    // Morning peak (6h-9h)
    if (hour >= 6 && hour <= 9) {
      hourlyDemand *= 1.35;
    }
    // Evening peak (17h-21h)
    else if (hour >= 17 && hour <= 21) {
      hourlyDemand *= 1.45;
    }
    // Night low (22h-5h)
    else if (hour >= 22 || hour <= 5) {
      hourlyDemand *= 0.55;
    }
    
    // Weekend adjustment (-15%)
    if (isWeekend) {
      hourlyDemand *= 0.85;
    }
    
    // Holiday adjustment (-20%)
    if (isHoliday) {
      hourlyDemand *= 0.80;
    }
    
    // Add small random variation (±3%)
    const variation = 0.97 + Math.random() * 0.06;
    hourlyDemand *= variation;
    
    demand.push(Math.round(hourlyDemand));
  }
  
  return demand;
}

/**
 * Generate 60 days of historical consumption data
 */
export function generateHistoricalData(days: number = 60): {
  date: string;
  hourly: number[];
  dailyTotal: number;
  kwhTotal: number;
  cost: number;
}[] {
  const data: ReturnType<typeof generateHistoricalData> = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const hourly = generateDemandPattern(date);
    const dailyTotal = hourly.reduce((a, b) => a + b, 0);
    
    // Simulate energy consumption with occasional anomalies
    let kwhTotal = 0;
    const avgEfficiency = ZIGA_STATION.pumps.reduce((s, p) => s + p.efficiency, 0) / 3;
    
    // 3% chance of anomaly (×1.5-2.2 consumption)
    const isAnomalyDay = Math.random() < 0.03;
    const anomalyMultiplier = isAnomalyDay ? 1.5 + Math.random() * 0.7 : 1;
    
    for (let h = 0; h < 24; h++) {
      kwhTotal += hourly[h] * avgEfficiency * anomalyMultiplier;
    }
    
    // Calculate cost with SONABEL tariffs
    const tariffs = generateTariffSchedule();
    let cost = 0;
    for (let h = 0; h < 24; h++) {
      cost += (hourly[h] * avgEfficiency * anomalyMultiplier / 1000) * tariffs[h];
    }
    cost += SONABEL_TARIFFS.fixedCharge;
    
    data.push({
      date: date.toISOString().split('T')[0],
      hourly,
      dailyTotal,
      kwhTotal: Math.round(kwhTotal),
      cost: Math.round(cost)
    });
  }
  
  return data;
}

/**
 * Generate pump data points for anomaly detection
 */
export function generatePumpDataPoints(days: number = 7): PumpDataPoint[] {
  const points: PumpDataPoint[] = [];
  const historical = generateHistoricalData(days);
  
  for (const day of historical) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(day.date).getTime() + hour * 3600000;
      
      // Normal kWh/m³ around 1.8
      const baseKwhM3 = 1.8;
      const variation = 0.9 + Math.random() * 0.2;
      
      points.push({
        timestamp,
        kwhM3: baseKwhM3 * variation,
        debit: day.hourly[hour],
        reservoir: 60 + Math.random() * 30,
        vibration: 2 + Math.random() * 3,
        temperature: 35 + Math.random() * 10
      });
    }
  }
  
  return points;
}

/**
 * Generate current KPIs
 */
export function generateCurrentKPIs() {
  const today = new Date();
  const demand = generateDemandPattern(today);
  const tariffs = generateTariffSchedule();
  
  // Calculate current consumption
  const avgEfficiency = ZIGA_STATION.pumps.reduce((s, p) => s + p.efficiency, 0) / 3;
  const consumption24h = demand.reduce((sum, d) => sum + d * avgEfficiency, 0);
  
  // Calculate cost
  let cost = 0;
  for (let h = 0; h < 24; h++) {
    cost += (demand[h] * avgEfficiency / 1000) * tariffs[h];
  }
  cost += SONABEL_TARIFFS.fixedCharge;
  
  // Calculate savings vs uniform schedule
  const uniformCost = consumption24h * (SONABEL_TARIFFS.peakPrice / 1000) + SONABEL_TARIFFS.fixedCharge;
  const savings = uniformCost - cost;
  
  return {
    dailySavings: Math.round(savings),
    consumption24h: Math.round(consumption24h),
    reservoirLevel: ZIGA_STATION.reservoir.currentLevel,
    activePumps: ZIGA_STATION.pumps.filter(p => p.status === 'active').length,
    totalPumps: ZIGA_STATION.pumps.length,
    costPerM3: Math.round(cost / demand.reduce((a, b) => a + b, 0) * 100) / 100,
    cosPhi: ZIGA_STATION.electrical.cosPhi
  };
}

/**
 * Generate optimized schedule using NSGA-II
 */
export function generateOptimizedSchedule(): ReturnType<typeof optimizePumpSchedule> {
  const today = new Date();
  const demand = generateDemandPattern(today);
  const tariffs = generateTariffSchedule();
  
  const params: PumpScheduleParams = {
    demand,
    tariffs,
    reservoirLevel: ZIGA_STATION.reservoir.currentLevel,
    pumps: ZIGA_STATION.pumps.map(p => ({
      id: p.id,
      power: p.power,
      efficiency: p.efficiency,
      maxFlow: p.maxFlow
    })),
    constraints: {
      minReservoir: ZIGA_STATION.reservoir.minLevel,
      maxReservoir: ZIGA_STATION.reservoir.maxLevel,
      minCosPhi: ZIGA_STATION.electrical.cosPhiMin,
      maxActivePumps: 3
    }
  };
  
  return optimizePumpSchedule(params);
}

/**
 * Generate AI recommendation
 */
export function generateRecommendation() {
  const schedule = generateOptimizedSchedule();
  const hour = new Date().getHours();
  
  // Find next optimization opportunity
  let nextActionHour = -1;
  let action = '';
  let savings = 0;
  
  for (let h = hour + 1; h < 24; h++) {
    if (schedule.planning[h] < schedule.planning[hour]) {
      nextActionHour = h;
      action = `Arrêter ${schedule.planning[hour] - schedule.planning[h]} pompe(s)`;
      savings = Math.round(schedule.savings / (24 - hour));
      break;
    }
  }
  
  if (nextActionHour === -1) {
    nextActionHour = hour + 2;
    action = 'Maintenir configuration actuelle';
    savings = 0;
  }
  
  return {
    id: `rec-${Date.now()}`,
    timestamp: Date.now(),
    pump: 'P3',
    action: `${action} à ${nextActionHour}:00`,
    explanation: [
      `Tarif heures pleines SONABEL : ${SONABEL_TARIFFS.peakPrice} FCFA/kWh`,
      `Réservoir suffisant (${ZIGA_STATION.reservoir.currentLevel}% > ${ZIGA_STATION.reservoir.minLevel}% mini)`,
      `Demande prévue : ${generateDemandPattern()[nextActionHour]} m³/h`,
      `Économie estimée : ${savings.toLocaleString()} FCFA`
    ],
    estimatedSavings: savings,
    applied: false,
    stationId: ZIGA_STATION.id
  };
}

/**
 * Generate active anomalies
 */
export function generateActiveAnomalies() {
  const pumpData = generatePumpDataPoints(3);
  const results = detectAnomalies(pumpData);
  
  // Get last few anomalies
  const anomalies = results
    .filter(r => r.isAnomaly)
    .slice(-3)
    .map((r, idx) => ({
      id: `anomaly-${Date.now()}-${idx}`,
      pump: ['P1', 'P2', 'P3'][Math.floor(Math.random() * 3)],
      severity: r.score > 0.3 ? 'urgent' as const : r.score > 0.2 ? 'medium' as const : 'low' as const,
      type: r.probableCause.includes('Fuite') ? 'Fuite détectée' : 
            r.probableCause.includes('Surconsommation') ? 'Surconsommation' : 'Dérive performance',
      kwhM3: 1.8 + r.score * 2,
      baseline: 1.8,
      costImpact: Math.round(r.score * 50000),
      detectedAt: r.timestamp,
      resolved: false,
      rootCauses: [
        { cause: r.probableCause, probability: Math.round(r.confidence * 100) },
        { cause: 'Usure normale', probability: Math.round((1 - r.confidence) * 50) }
      ],
      citizenReports: Math.floor(Math.random() * 3),
      stationId: ZIGA_STATION.id
    }));
  
  return anomalies;
}

/**
 * Generate action history
 */
export function generateActionHistory(count: number = 10) {
  const actions = [
    { action: 'Arrêt P3', result: '-8,900 FCFA' },
    { action: 'Démarrage P1', result: '-5,200 FCFA' },
    { action: 'Modulation P2', result: '-3,100 FCFA' },
    { action: 'Optimisation planning', result: '-12,400 FCFA' },
    { action: 'Correction Cos φ', result: '-2,800 FCFA' }
  ];
  
  const history = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - i * 6);
    
    const actionItem = actions[Math.floor(Math.random() * actions.length)];
    
    history.push({
      id: `action-${Date.now()}-${i}`,
      timestamp: date.getTime(),
      action: actionItem.action,
      result: actionItem.result,
      savings: parseInt(actionItem.result.replace(/[^0-9]/g, '')),
      userId: 'tech-001',
      userName: 'Technicien Ziga',
      stationId: ZIGA_STATION.id,
      synced: true
    });
  }
  
  return history;
}

/**
 * Export all station data
 */
export function exportStationData() {
  return {
    station: ZIGA_STATION,
    tariffs: SONABEL_TARIFFS,
    holidays: HOLIDAYS_2026,
    historicalData: generateHistoricalData(30),
    currentKPIs: generateCurrentKPIs(),
    optimizedSchedule: generateOptimizedSchedule(),
    demandPrediction: predictDemand({
      historical: generateHistoricalData(7).flatMap(d => d.hourly),
      dayOfWeek: new Date().getDay(),
      isHoliday: false,
      temperature: 38,
      season: 'dry'
    })
  };
}
