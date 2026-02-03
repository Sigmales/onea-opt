// NSGA-II Simplified Implementation for ONEA-OPT
// Multi-objective optimization for pump scheduling

export interface PumpScheduleParams {
  demand: number[]; // 24h demand in m³/h
  tariffs: number[]; // 24h tariff in FCFA/kWh
  reservoirLevel: number; // Current reservoir level %
  pumps: {
    id: string;
    power: number; // kW
    efficiency: number; // kWh/m³
    maxFlow: number; // m³/h
  }[];
  constraints: {
    minReservoir: number; // %
    maxReservoir: number; // %
    minCosPhi: number;
    maxActivePumps: number;
  };
}

export interface OptimizedSchedule {
  planning: number[]; // 0-1 for each hour (pumps active count)
  cost: number; // FCFA
  savings: number; // vs uniform schedule
  cosPhi: number;
  reservoirLevels: number[]; // 24h evolution
  fitness: number;
}

interface Individual {
  chromosome: number[]; // 24 genes (0-3 pumps active)
  fitness: number;
  cost: number;
  reservoirViolation: number;
  cosPhi: number;
}

// NSGA-II Parameters (default values, overridable via function options)
const POPULATION_SIZE = 50;
const GENERATIONS = 20;
const CROSSOVER_RATE = 0.9;
const MUTATION_RATE = 0.1;
const ELITE_COUNT = 5;

export interface Nsga2Options {
  populationSize?: number;
  generations?: number;
  crossoverRate?: number;
  mutationRate?: number;
  eliteCount?: number;
}

/**
 * Main optimization function - NSGA-II simplified
 */
export function optimizePumpSchedule(
  params: PumpScheduleParams,
  options?: Nsga2Options
): OptimizedSchedule {
  const { constraints } = params;

  const populationSize = options?.populationSize ?? POPULATION_SIZE;
  const generations = options?.generations ?? GENERATIONS;
  const crossoverRate = options?.crossoverRate ?? CROSSOVER_RATE;
  const mutationRate = options?.mutationRate ?? MUTATION_RATE;
  const eliteCount = options?.eliteCount ?? ELITE_COUNT;
  
  // Generate initial population
  let population = initializePopulation(populationSize, constraints.maxActivePumps);
  
  // Evaluate initial population
  population = population.map(ind => evaluateIndividual(ind, params));
  
  // Evolution loop
  for (let gen = 0; gen < generations; gen++) {
    // Create offspring through crossover and mutation
    const offspring: Individual[] = [];
    
    while (offspring.length < populationSize) {
      // Tournament selection
      const parent1 = tournamentSelection(population);
      const parent2 = tournamentSelection(population);
      
      // Crossover
      if (Math.random() < crossoverRate) {
        const [child1, child2] = crossover(parent1, parent2);
        offspring.push(child1, child2);
      } else {
        offspring.push({ ...parent1 }, { ...parent2 });
      }
    }
    
    // Mutation
    for (let i = eliteCount; i < offspring.length; i++) {
      if (Math.random() < mutationRate) {
        offspring[i] = mutate(offspring[i], constraints.maxActivePumps);
      }
    }
    
    // Evaluate offspring
    const evaluatedOffspring = offspring.map(ind => evaluateIndividual(ind, params));
    
    // Combine and select next generation (elitism)
    const combined = [...population, ...evaluatedOffspring];
    combined.sort((a, b) => a.fitness - b.fitness);
    
    population = combined.slice(0, populationSize);
  }
  
  // Return best solution
  const best = population[0];
  const uniformCost = calculateUniformCost(params);
  
  return {
    planning: best.chromosome,
    cost: best.cost,
    savings: uniformCost - best.cost,
    cosPhi: best.cosPhi,
    reservoirLevels: simulateReservoir(best.chromosome, params),
    fitness: best.fitness
  };
}

/**
 * Initialize random population
 */
function initializePopulation(size: number, maxPumps: number): Individual[] {
  return Array.from({ length: size }, () => ({
    chromosome: Array.from({ length: 24 }, () => Math.floor(Math.random() * (maxPumps + 1))),
    fitness: Infinity,
    cost: 0,
    reservoirViolation: 0,
    cosPhi: 0.95
  }));
}

/**
 * Evaluate individual fitness
 */
function evaluateIndividual(individual: Individual, params: PumpScheduleParams): Individual {
  const { demand, tariffs, reservoirLevel, pumps, constraints } = params;
  
  let totalCost = 0;
  let reservoirViolation = 0;
  let currentReservoir = reservoirLevel;
  const avgPumpEfficiency = pumps.reduce((sum, p) => sum + p.efficiency, 0) / pumps.length;
  
  for (let hour = 0; hour < 24; hour++) {
    const pumpsActive = individual.chromosome[hour];
    const hourlyDemand = demand[hour];
    const hourlyTariff = tariffs[hour];
    
    // Calculate production capacity
    const productionCapacity = pumpsActive * pumps[0].maxFlow;
    const actualProduction = Math.min(productionCapacity, hourlyDemand * 1.2);
    
    // Calculate energy consumption
    const energyKWh = actualProduction * avgPumpEfficiency;
    const hourlyCost = energyKWh * hourlyTariff;
    totalCost += hourlyCost;
    
    // Update reservoir level
    const netFlow = actualProduction - hourlyDemand;
    currentReservoir += (netFlow / 1000) * 100; // Convert to percentage
    
    // Check constraints
    if (currentReservoir < constraints.minReservoir) {
      reservoirViolation += constraints.minReservoir - currentReservoir;
    }
    if (currentReservoir > constraints.maxReservoir) {
      reservoirViolation += currentReservoir - constraints.maxReservoir;
    }
  }
  
  // Calculate Cos φ (power factor)
  const avgPumpsActive = individual.chromosome.reduce((a, b) => a + b, 0) / 24;
  const loadFactor = avgPumpsActive / pumps.length;
  const cosPhi = 0.85 + loadFactor * 0.15; // Simplified model
  const cosPhiPenalty = cosPhi < constraints.minCosPhi ? (constraints.minCosPhi - cosPhi) * 100000 : 0;
  
  // Multi-objective fitness (minimize)
  const fitness = totalCost + 
    reservoirViolation * 1000 + // Heavy penalty for constraint violation
    cosPhiPenalty +
    (individual.chromosome.reduce((a, b) => a + b, 0) * 10); // Prefer fewer pump switches
  
  return {
    ...individual,
    fitness,
    cost: Math.round(totalCost),
    reservoirViolation,
    cosPhi: Math.round(cosPhi * 100) / 100
  };
}

/**
 * Tournament selection
 */
function tournamentSelection(population: Individual[]): Individual {
  const tournamentSize = 3;
  let best = population[Math.floor(Math.random() * population.length)];
  
  for (let i = 1; i < tournamentSize; i++) {
    const contender = population[Math.floor(Math.random() * population.length)];
    if (contender.fitness < best.fitness) {
      best = contender;
    }
  }
  
  return best;
}

/**
 * Single-point crossover
 */
function crossover(parent1: Individual, parent2: Individual): [Individual, Individual] {
  const crossoverPoint = Math.floor(Math.random() * 24);
  
  const child1: Individual = {
    chromosome: [
      ...parent1.chromosome.slice(0, crossoverPoint),
      ...parent2.chromosome.slice(crossoverPoint)
    ],
    fitness: Infinity,
    cost: 0,
    reservoirViolation: 0,
    cosPhi: 0
  };
  
  const child2: Individual = {
    chromosome: [
      ...parent2.chromosome.slice(0, crossoverPoint),
      ...parent1.chromosome.slice(crossoverPoint)
    ],
    fitness: Infinity,
    cost: 0,
    reservoirViolation: 0,
    cosPhi: 0
  };
  
  return [child1, child2];
}

/**
 * Mutation - random bit flip
 */
function mutate(individual: Individual, maxPumps: number): Individual {
  const mutationPoint = Math.floor(Math.random() * 24);
  const newChromosome = [...individual.chromosome];
  newChromosome[mutationPoint] = Math.floor(Math.random() * (maxPumps + 1));
  
  return {
    ...individual,
    chromosome: newChromosome
  };
}

/**
 * Calculate uniform schedule cost (baseline)
 */
function calculateUniformCost(params: PumpScheduleParams): number {
  const { demand, tariffs, pumps } = params;
  const avgPumpEfficiency = pumps.reduce((sum, p) => sum + p.efficiency, 0) / pumps.length;
  
  let totalCost = 0;
  
  for (let hour = 0; hour < 24; hour++) {
    const hourlyDemand = demand[hour];
    const hourlyTariff = tariffs[hour];
    const energyKWh = hourlyDemand * avgPumpEfficiency;
    totalCost += energyKWh * hourlyTariff;
  }
  
  return Math.round(totalCost);
}

/**
 * Simulate reservoir levels over 24h
 */
function simulateReservoir(planning: number[], params: PumpScheduleParams): number[] {
  const { demand, reservoirLevel, pumps } = params;
  const levels: number[] = [reservoirLevel];
  let currentLevel = reservoirLevel;
  
  for (let hour = 0; hour < 24; hour++) {
    const pumpsActive = planning[hour];
    const production = pumpsActive * pumps[0].maxFlow;
    const netFlow = production - demand[hour];
    currentLevel += (netFlow / 1000) * 100;
    levels.push(Math.max(0, Math.min(100, currentLevel)));
  }
  
  return levels;
}

/**
 * Generate Pareto front for visualization
 */
export function generateParetoFront(params: PumpScheduleParams, points: number = 50): {
  cost: number;
  stability: number;
  schedule: number[];
}[] {
  const front: { cost: number; stability: number; schedule: number[] }[] = [];
  
  // Generate diverse solutions
  for (let i = 0; i < points; i++) {
    // Vary off-peak percentage
    const offPeakRatio = 0.2 + (i / points) * 0.4;
    
    const schedule = generateScheduleWithOffPeakRatio(params, offPeakRatio);
    const result = evaluateSchedule(schedule, params);
    
    front.push({
      cost: result.cost,
      stability: result.stability,
      schedule
    });
  }
  
  return front.sort((a, b) => a.cost - b.cost);
}

function generateScheduleWithOffPeakRatio(params: PumpScheduleParams, ratio: number): number[] {
  const { constraints, tariffs } = params;
  const schedule: number[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const isOffPeak = tariffs[hour] < 100; // Off-peak detection
    if (isOffPeak) {
      schedule.push(constraints.maxActivePumps);
    } else {
      schedule.push(Math.random() > ratio ? constraints.maxActivePumps - 1 : constraints.maxActivePumps);
    }
  }
  
  return schedule;
}

function evaluateSchedule(schedule: number[], params: PumpScheduleParams): { cost: number; stability: number } {
  const { demand, tariffs, pumps } = params;
  const avgPumpEfficiency = pumps.reduce((sum, p) => sum + p.efficiency, 0) / pumps.length;
  
  let totalCost = 0;
  let levelVariation = 0;
  let prevLevel = 50;
  
  for (let hour = 0; hour < 24; hour++) {
    const pumpsActive = schedule[hour];
    const production = pumpsActive * pumps[0].maxFlow;
    const energyKWh = production * avgPumpEfficiency;
    totalCost += energyKWh * tariffs[hour];
    
    const netFlow = production - demand[hour];
    const currentLevel = prevLevel + (netFlow / 1000) * 100;
    levelVariation += Math.abs(currentLevel - prevLevel);
    prevLevel = currentLevel;
  }
  
  return {
    cost: Math.round(totalCost),
    stability: Math.round(levelVariation * 10) / 10
  };
}

/**
 * Export algorithm configuration
 */
export function exportAlgorithmConfig(): {
  name: string;
  version: string;
  parameters: Record<string, number>;
  description: string;
} {
  return {
    name: 'NSGA-II Multi-Objective Pump Optimizer',
    version: '1.0.0',
    parameters: {
      populationSize: POPULATION_SIZE,
      generations: GENERATIONS,
      crossoverRate: CROSSOVER_RATE,
      mutationRate: MUTATION_RATE,
      eliteCount: ELITE_COUNT
    },
    description: 'Optimizes pump scheduling for energy cost minimization while maintaining reservoir levels and power factor constraints'
  };
}
