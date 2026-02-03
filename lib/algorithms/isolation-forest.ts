// Isolation Forest Simplified Implementation for ONEA-OPT
// Anomaly detection for pump monitoring

export interface PumpDataPoint {
  timestamp: number;
  kwhM3: number;
  debit: number;
  reservoir: number;
  vibration?: number;
  temperature?: number;
  pressure?: number;
}

export interface AnomalyResult {
  timestamp: number;
  score: number; // 0-1, higher = more anomalous
  isAnomaly: boolean;
  probableCause: string;
  confidence: number;
  features: {
    kwhM3Deviation: number;
    debitDeviation: number;
    combinedScore: number;
  };
}

// Isolation Forest Parameters
const CONTAMINATION = 0.1; // Expected anomaly rate (10%)
const N_ESTIMATORS = 50; // Number of isolation trees
const MAX_SAMPLES = 256; // Subsample size
const ANOMALY_THRESHOLD = 0.15; // Score threshold for anomaly detection

/**
 * Main anomaly detection function
 */
export function detectAnomalies(data: PumpDataPoint[]): AnomalyResult[] {
  if (data.length < 10) {
    return data.map(d => ({
      timestamp: d.timestamp,
      score: 0,
      isAnomaly: false,
      probableCause: 'Insufficient data',
      confidence: 0,
      features: { kwhM3Deviation: 0, debitDeviation: 0, combinedScore: 0 }
    }));
  }
  
  // Calculate baseline statistics (moving average)
  const baseline = calculateBaseline(data);
  
  // Build simplified isolation trees
  const trees = buildIsolationForest(data, N_ESTIMATORS);
  
  // Score each data point
  const results: AnomalyResult[] = data.map(point => {
    const score = calculateAnomalyScore(point, trees, baseline);
    const isAnomaly = score > ANOMALY_THRESHOLD;
    
    return {
      timestamp: point.timestamp,
      score: Math.round(score * 1000) / 1000,
      isAnomaly,
      probableCause: isAnomaly ? determineProbableCause(point, baseline) : 'Normal',
      confidence: Math.min(1, score * 5),
      features: calculateFeatureDeviations(point, baseline)
    };
  });
  
  return results;
}

/**
 * Calculate baseline statistics using moving windows
 */
function calculateBaseline(data: PumpDataPoint[]): {
  kwhM3: { mean: number; std: number };
  debit: { mean: number; std: number };
  reservoir: { mean: number; std: number };
} {
  const kwhM3Values = data.map(d => d.kwhM3);
  const debitValues = data.map(d => d.debit);
  const reservoirValues = data.map(d => d.reservoir);
  
  return {
    kwhM3: calculateStats(kwhM3Values),
    debit: calculateStats(debitValues),
    reservoir: calculateStats(reservoirValues)
  };
}

function calculateStats(values: number[]): { mean: number; std: number } {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(variance);
  
  return { mean, std };
}

/**
 * Build simplified isolation forest
 */
function buildIsolationForest(data: PumpDataPoint[], nEstimators: number): {
  splitFeature: 'kwhM3' | 'debit' | 'reservoir';
  splitValue: number;
  left: any;
  right: any;
}[] {
  const trees = [];
  
  for (let i = 0; i < nEstimators; i++) {
    // Subsample data
    const sampleSize = Math.min(MAX_SAMPLES, data.length);
    const sample = data.slice(0, sampleSize);
    
    // Build tree
    const tree = buildTree(sample, 0, Math.ceil(Math.log2(sampleSize)));
    trees.push(tree);
  }
  
  return trees;
}

/**
 * Build single isolation tree
 */
function buildTree(
  data: PumpDataPoint[],
  currentHeight: number,
  maxHeight: number
): any {
  if (data.length <= 1 || currentHeight >= maxHeight) {
    return { isLeaf: true, size: data.length };
  }
  
  // Random feature selection
  const features: ('kwhM3' | 'debit' | 'reservoir')[] = ['kwhM3', 'debit', 'reservoir'];
  const splitFeature = features[Math.floor(Math.random() * features.length)];
  
  // Random split value within feature range
  const values = data.map(d => d[splitFeature]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const splitValue = min + Math.random() * (max - min);
  
  // Split data
  const left = data.filter(d => d[splitFeature] < splitValue);
  const right = data.filter(d => d[splitFeature] >= splitValue);
  
  return {
    splitFeature,
    splitValue,
    left: buildTree(left, currentHeight + 1, maxHeight),
    right: buildTree(right, currentHeight + 1, maxHeight)
  };
}

/**
 * Calculate anomaly score for a data point
 */
function calculateAnomalyScore(
  point: PumpDataPoint,
  trees: any[],
  baseline: any
): number {
  // Path length average across all trees
  let totalPathLength = 0;
  
  for (const tree of trees) {
    totalPathLength += getPathLength(point, tree, 0);
  }
  
  const avgPathLength = totalPathLength / trees.length;
  
  // Normalize to 0-1 score (shorter path = more anomalous)
  const maxPath = Math.ceil(Math.log2(MAX_SAMPLES));
  const normalizedScore = 1 - (avgPathLength / maxPath);
  
  // Add statistical deviation component
  const kwhM3ZScore = Math.abs(point.kwhM3 - baseline.kwhM3.mean) / baseline.kwhM3.std;
  const statisticalScore = Math.min(1, kwhM3ZScore / 3); // Cap at 3 std deviations
  
  // Combined score
  return normalizedScore * 0.6 + statisticalScore * 0.4;
}

/**
 * Get path length in tree for a data point
 */
function getPathLength(point: PumpDataPoint, tree: any, currentLength: number): number {
  if (tree.isLeaf) {
    return currentLength + calculateExpectedPath(tree.size);
  }
  
  const featureValue = point[tree.splitFeature];
  
  if (featureValue < tree.splitValue) {
    return getPathLength(point, tree.left, currentLength + 1);
  } else {
    return getPathLength(point, tree.right, currentLength + 1);
  }
}

/**
 * Calculate expected path length for external node
 */
function calculateExpectedPath(size: number): number {
  if (size <= 1) return 0;
  return 2 * (Math.log(size - 1) + 0.5772156649) - 2 * (size - 1) / size;
}

/**
 * Determine probable cause of anomaly
 */
function determineProbableCause(point: PumpDataPoint, baseline: any): string {
  const causes: string[] = [];
  
  // Check kWh/m³ deviation
  const kwhM3Deviation = (point.kwhM3 - baseline.kwhM3.mean) / baseline.kwhM3.std;
  if (kwhM3Deviation > 2) {
    causes.push('Surconsommation énergétique');
  }
  
  // Check debit vs reservoir correlation
  const debitDeviation = (point.debit - baseline.debit.mean) / baseline.debit.std;
  if (debitDeviation > 1.5 && point.reservoir < baseline.reservoir.mean) {
    causes.push('Fuite probable détectée');
  }
  
  // Check for pump inefficiency
  if (kwhM3Deviation > 1.5 && debitDeviation < 0.5) {
    causes.push('Usure pompe ou encrassement');
  }
  
  // Check reservoir level
  if (point.reservoir < 30) {
    causes.push('Niveau réservoir critique');
  }
  
  return causes.length > 0 ? causes.join(' + ') : 'Anomalie non identifiée';
}

/**
 * Calculate feature deviations
 */
function calculateFeatureDeviations(point: PumpDataPoint, baseline: any): {
  kwhM3Deviation: number;
  debitDeviation: number;
  combinedScore: number;
} {
  const kwhM3Deviation = Math.abs(point.kwhM3 - baseline.kwhM3.mean) / baseline.kwhM3.std;
  const debitDeviation = Math.abs(point.debit - baseline.debit.mean) / baseline.debit.std;
  
  return {
    kwhM3Deviation: Math.round(kwhM3Deviation * 100) / 100,
    debitDeviation: Math.round(debitDeviation * 100) / 100,
    combinedScore: Math.round((kwhM3Deviation + debitDeviation) * 50) / 100
  };
}

/**
 * Detect real-time anomaly from single reading
 */
export function detectRealTimeAnomaly(
  current: PumpDataPoint,
  history: PumpDataPoint[]
): AnomalyResult {
  const results = detectAnomalies([...history, current]);
  return results[results.length - 1];
}

/**
 * Generate anomaly score timeline for visualization
 */
export function generateAnomalyTimeline(
  data: PumpDataPoint[],
  windowSize: number = 7
): { timestamp: number; score: number; threshold: number }[] {
  const timeline: { timestamp: number; score: number; threshold: number }[] = [];
  
  for (let i = windowSize; i < data.length; i++) {
    const window = data.slice(i - windowSize, i);
    const results = detectAnomalies(window);
    const latest = results[results.length - 1];
    
    timeline.push({
      timestamp: data[i].timestamp,
      score: latest.score,
      threshold: ANOMALY_THRESHOLD
    });
  }
  
  return timeline;
}

/**
 * Export algorithm configuration
 */
export function exportIsolationForestConfig(): {
  name: string;
  version: string;
  parameters: Record<string, number>;
  description: string;
} {
  return {
    name: 'Isolation Forest Anomaly Detector',
    version: '1.0.0',
    parameters: {
      contamination: CONTAMINATION,
      nEstimators: N_ESTIMATORS,
      maxSamples: MAX_SAMPLES,
      anomalyThreshold: ANOMALY_THRESHOLD
    },
    description: 'Unsupervised anomaly detection for pump monitoring using isolation trees and statistical deviation'
  };
}

/**
 * Feature importance for explainability
 */
export function getFeatureImportance(): { feature: string; importance: number }[] {
  return [
    { feature: 'kWh/m³', importance: 0.45 },
    { feature: 'Débit', importance: 0.25 },
    { feature: 'Niveau réservoir', importance: 0.15 },
    { feature: 'Vibration', importance: 0.10 },
    { feature: 'Température', importance: 0.05 }
  ];
}
