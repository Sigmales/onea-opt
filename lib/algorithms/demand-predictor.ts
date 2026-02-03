// Demand Predictor Simplified Implementation for ONEA-OPT
// LSTM-inspired time series forecasting

export interface DemandPredictionParams {
  historical: number[]; // Last 7 days hourly consumption (168 points)
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isHoliday: boolean;
  temperature: number; // Celsius
  season: 'dry' | 'rainy';
}

export interface DemandPrediction {
  hourly: number[]; // 24h predicted demand in m³/h
  dailyTotal: number; // Total daily demand
  confidence: number; // 0-1 prediction confidence
  peakHours: number[]; // Hours with highest demand
  factors: {
    dayOfWeekFactor: number;
    holidayFactor: number;
    temperatureFactor: number;
    seasonalFactor: number;
  };
}

// Prediction parameters
const BASE_CONSUMPTION = 6450; // m³/day - Station Ziga baseline
const PEAK_HOURS_MORNING = [6, 7, 8, 9];
const PEAK_HOURS_EVENING = [17, 18, 19, 20, 21];
const OFF_PEAK_HOURS = [22, 23, 0, 1, 2, 3, 4, 5];

/**
 * Main prediction function
 * Simplified LSTM-inspired approach using pattern matching and statistical analysis
 */
export function predictDemand(params: DemandPredictionParams): DemandPrediction {
  const { historical, dayOfWeek, isHoliday, temperature, season } = params;
  
  // Calculate base pattern from historical data
  const basePattern = extractDailyPattern(historical);
  
  // Apply adjustment factors
  const dayOfWeekFactor = calculateDayOfWeekFactor(dayOfWeek);
  const holidayFactor = isHoliday ? 0.85 : 1.0;
  const temperatureFactor = calculateTemperatureFactor(temperature);
  const seasonalFactor = season === 'dry' ? 1.15 : 1.0;
  
  // Generate 24h prediction
  const hourly: number[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    // Base from pattern
    let demand = basePattern[hour] || (BASE_CONSUMPTION / 24);
    
    // Apply factors
    demand *= dayOfWeekFactor;
    demand *= holidayFactor;
    demand *= temperatureFactor;
    demand *= seasonalFactor;
    
    // Add hour-specific adjustments
    if (PEAK_HOURS_MORNING.includes(hour)) {
      demand *= 1.3; // Morning peak
    } else if (PEAK_HOURS_EVENING.includes(hour)) {
      demand *= 1.4; // Evening peak
    } else if (OFF_PEAK_HOURS.includes(hour)) {
      demand *= 0.6; // Night low
    }
    
    // Add small random variation (±5%)
    const variation = 0.95 + Math.random() * 0.1;
    demand *= variation;
    
    hourly.push(Math.round(demand));
  }
  
  const dailyTotal = hourly.reduce((a, b) => a + b, 0);
  
  // Identify peak hours
  const sortedHours = hourly
    .map((demand, hour) => ({ demand, hour }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 6)
    .map(h => h.hour);
  
  return {
    hourly,
    dailyTotal,
    confidence: calculateConfidence(historical.length, isHoliday),
    peakHours: sortedHours.sort((a, b) => a - b),
    factors: {
      dayOfWeekFactor: Math.round(dayOfWeekFactor * 100) / 100,
      holidayFactor: Math.round(holidayFactor * 100) / 100,
      temperatureFactor: Math.round(temperatureFactor * 100) / 100,
      seasonalFactor: Math.round(seasonalFactor * 100) / 100
    }
  };
}

/**
 * Extract daily consumption pattern from historical data
 */
function extractDailyPattern(historical: number[]): number[] {
  if (historical.length < 24) {
    // Return default pattern if insufficient data
    return generateDefaultPattern();
  }
  
  // Average hourly consumption across available days
  const pattern: number[] = [];
  const numDays = Math.floor(historical.length / 24);
  
  for (let hour = 0; hour < 24; hour++) {
    let sum = 0;
    for (let day = 0; day < numDays; day++) {
      const idx = day * 24 + hour;
      if (idx < historical.length) {
        sum += historical[idx];
      }
    }
    pattern.push(sum / numDays);
  }
  
  return pattern;
}

/**
 * Generate default consumption pattern
 */
function generateDefaultPattern(): number[] {
  const pattern: number[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    let demand = BASE_CONSUMPTION / 24;
    
    if (PEAK_HOURS_MORNING.includes(hour)) {
      demand *= 1.3;
    } else if (PEAK_HOURS_EVENING.includes(hour)) {
      demand *= 1.4;
    } else if (OFF_PEAK_HOURS.includes(hour)) {
      demand *= 0.6;
    }
    
    pattern.push(demand);
  }
  
  return pattern;
}

/**
 * Calculate day of week factor
 */
function calculateDayOfWeekFactor(dayOfWeek: number): number {
  // Weekday vs weekend patterns
  const factors: Record<number, number> = {
    0: 0.90, // Sunday
    1: 1.00, // Monday
    2: 1.02, // Tuesday
    3: 1.01, // Wednesday
    4: 1.03, // Thursday
    5: 1.05, // Friday
    6: 0.92  // Saturday
  };
  
  return factors[dayOfWeek] || 1.0;
}

/**
 * Calculate temperature factor
 */
function calculateTemperatureFactor(temperature: number): number {
  // Higher temperature = higher water consumption
  if (temperature > 38) {
    return 1.25; // Heatwave
  } else if (temperature > 35) {
    return 1.15; // Hot day
  } else if (temperature > 30) {
    return 1.08; // Warm day
  } else if (temperature < 20) {
    return 0.92; // Cool day
  }
  
  return 1.0; // Normal
}

/**
 * Calculate prediction confidence
 */
function calculateConfidence(historicalLength: number, isHoliday: boolean): number {
  let confidence = 0.7;
  
  // More historical data = higher confidence
  if (historicalLength >= 168) { // 1 week
    confidence += 0.15;
  } else if (historicalLength >= 72) { // 3 days
    confidence += 0.08;
  }
  
  // Holidays reduce confidence (unusual patterns)
  if (isHoliday) {
    confidence -= 0.1;
  }
  
  return Math.min(0.95, Math.max(0.5, confidence));
}

/**
 * Predict demand for multiple days ahead
 */
export function predictMultiDay(
  params: DemandPredictionParams,
  daysAhead: number
): DemandPrediction[] {
  const predictions: DemandPrediction[] = [];
  
  for (let i = 0; i < daysAhead; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    
    const dayParams: DemandPredictionParams = {
      ...params,
      dayOfWeek: (params.dayOfWeek + i) % 7,
      isHoliday: checkIfHoliday(futureDate)
    };
    
    predictions.push(predictDemand(dayParams));
  }
  
  return predictions;
}

/**
 * Check if date is a holiday (Burkina Faso 2026)
 */
function checkIfHoliday(date: Date): boolean {
  const holidays = [
    '2026-01-01', // New Year
    '2026-01-03', // Martyrs' Day
    '2026-03-20', // March Equinox (approx)
    '2026-05-01', // Labour Day
    '2026-08-05', // Independence Day
    '2026-12-11', // Proclamation of Independence
    '2026-12-25', // Christmas
  ];
  
  const dateStr = date.toISOString().split('T')[0];
  return holidays.includes(dateStr);
}

/**
 * Compare prediction vs actual for accuracy tracking
 */
export function calculatePredictionAccuracy(
  predicted: number[],
  actual: number[]
): { mape: number; rmse: number; within5Percent: number } {
  if (predicted.length !== actual.length || predicted.length === 0) {
    return { mape: 0, rmse: 0, within5Percent: 0 };
  }
  
  let totalError = 0;
  let totalSquaredError = 0;
  let within5Percent = 0;
  
  for (let i = 0; i < predicted.length; i++) {
    const error = Math.abs(predicted[i] - actual[i]);
    const percentError = actual[i] > 0 ? (error / actual[i]) * 100 : 0;
    
    totalError += percentError;
    totalSquaredError += Math.pow(predicted[i] - actual[i], 2);
    
    if (percentError <= 5) {
      within5Percent++;
    }
  }
  
  const mape = totalError / predicted.length;
  const rmse = Math.sqrt(totalSquaredError / predicted.length);
  
  return {
    mape: Math.round(mape * 100) / 100,
    rmse: Math.round(rmse * 100) / 100,
    within5Percent: Math.round((within5Percent / predicted.length) * 100)
  };
}

/**
 * Generate demand forecast visualization data
 */
export function generateForecastData(
  historical: number[],
  prediction: DemandPrediction
): {
  labels: string[];
  historical: (number | null)[];
  predicted: (number | null)[];
  upperBound: (number | null)[];
  lowerBound: (number | null)[];
} {
  const labels: string[] = [];
  const histData: (number | null)[] = [];
  const predData: (number | null)[] = [];
  const upperBound: (number | null)[] = [];
  const lowerBound: (number | null)[] = [];
  
  // Last 24h historical
  for (let i = 0; i < 24; i++) {
    labels.push(`-${24 - i}h`);
    histData.push(historical[historical.length - 24 + i] || null);
    predData.push(null);
    upperBound.push(null);
    lowerBound.push(null);
  }
  
  // Next 24h prediction
  for (let i = 0; i < 24; i++) {
    labels.push(`+${i + 1}h`);
    histData.push(null);
    predData.push(prediction.hourly[i]);
    
    // Confidence interval (±10%)
    const margin = prediction.hourly[i] * 0.1;
    upperBound.push(prediction.hourly[i] + margin);
    lowerBound.push(Math.max(0, prediction.hourly[i] - margin));
  }
  
  return {
    labels,
    historical: histData,
    predicted: predData,
    upperBound,
    lowerBound
  };
}

/**
 * Export algorithm configuration
 */
export function exportDemandPredictorConfig(): {
  name: string;
  version: string;
  parameters: Record<string, any>;
  description: string;
} {
  return {
    name: 'LSTM-Inspired Demand Predictor',
    version: '1.0.0',
    parameters: {
      baseConsumption: BASE_CONSUMPTION,
      peakHoursMorning: PEAK_HOURS_MORNING,
      peakHoursEvening: PEAK_HOURS_EVENING,
      offPeakHours: OFF_PEAK_HOURS,
      temperatureThresholds: {
        heatwave: 38,
        hot: 35,
        warm: 30,
        cool: 20
      }
    },
    description: 'Time series forecasting for water demand using pattern matching, seasonal adjustments, and temperature correlation'
  };
}
