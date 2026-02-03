import { useEffect, useState } from 'react';
import {
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  Leaf,
  Play,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { ZIGA_STATION, generateDemandPattern, generateTariffSchedule } from '../../lib/data/ziga-mock-data';
import { optimizePumpSchedule, generateParetoFront, type PumpScheduleParams } from '../../lib/algorithms/nsga2';

// Mission TDR Coverage:
// Mission 2: Modélisation demande (via prédictions intégrées)
// Mission 5: Répartition charge (multi-pompes)
// Mission 6: Automatisation décisions
// Mission 8: Réduction pénalités Cos φ
// Mission 11: Prévision énergétique (courbes)

const scheduleHeatmap = [
  { hour: 0, P1: 1, P2: 1, P3: 1, offPeak: true },
  { hour: 1, P1: 1, P2: 1, P3: 1, offPeak: true },
  { hour: 2, P1: 1, P2: 1, P3: 1, offPeak: true },
  { hour: 3, P1: 1, P2: 1, P3: 1, offPeak: true },
  { hour: 4, P1: 1, P2: 1, P3: 1, offPeak: true },
  { hour: 5, P1: 1, P2: 1, P3: 1, offPeak: true },
  { hour: 6, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 7, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 8, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 9, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 10, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 11, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 12, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 13, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 14, P1: 1, P2: 0, P3: 0, offPeak: false },
  { hour: 15, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 16, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 17, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 18, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 19, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 20, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 21, P1: 1, P2: 1, P3: 0, offPeak: false },
  { hour: 22, P1: 1, P2: 1, P3: 1, offPeak: true },
  { hour: 23, P1: 1, P2: 1, P3: 1, offPeak: true },
];

const costBreakdown = [
  { name: 'Heures pleines', value: 179900, color: '#0066CC' },
  { name: 'Heures creuses', value: 64300, color: '#20AF24' },
  { name: 'Prime fixe', value: 12800, color: '#94A3B8' }
];

const sensitivityData = [
  { variation: -20, actuel: 238000, optimise: 206000 },
  { variation: -15, actuel: 252000, optimise: 218000 },
  { variation: -10, actuel: 267000, optimise: 231000 },
  { variation: -5, actuel: 282000, optimise: 244000 },
  { variation: 0, actuel: 297000, optimise: 257000 },
  { variation: 5, actuel: 312000, optimise: 270000 },
  { variation: 10, actuel: 327000, optimise: 283000 },
  { variation: 15, actuel: 342000, optimise: 296000 },
  { variation: 20, actuel: 357000, optimise: 309000 },
];

export function OptimisationModule() {
  const [showSettings, setShowSettings] = useState(false);
  const [offPeakPercent, setOffPeakPercent] = useState(30);
  const [reservoirTarget, setReservoirTarget] = useState(75);
  const [isCalculating, setIsCalculating] = useState(false);

  const [baseCost, setBaseCost] = useState<number | null>(null);
  const [optimizedCost, setOptimizedCost] = useState<number | null>(null);
  const [optimizedCosPhi, setOptimizedCosPhi] = useState<number | null>(null);
  const [paretoPoints, setParetoPoints] = useState<{ cost: number; stability: number }[]>([]);

  const [algorithmParams, setAlgorithmParams] = useState({
    population: 50,
    generations: 100,
    crossover: 0.9,
    mutation: 0.1
  });

  const runOptimization = () => {
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

    const result = optimizePumpSchedule(params, {
      populationSize: algorithmParams.population,
      generations: algorithmParams.generations,
      crossoverRate: algorithmParams.crossover,
      mutationRate: algorithmParams.mutation
    });

    const uniformCost = result.cost + result.savings;

    setBaseCost(uniformCost);
    setOptimizedCost(result.cost);
    setOptimizedCosPhi(result.cosPhi);

    const front = generateParetoFront(params, 40);
    setParetoPoints(front.map((p) => ({ cost: p.cost, stability: p.stability })));
  };

  const handleRecalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      runOptimization();
      setIsCalculating(false);
    }, 300); // léger délai pour l'animation
  };

  useEffect(() => {
    runOptimization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPumpColor = (value: number, offPeak: boolean) => {
    if (value === 0) return '#E2E8F0';
    return offPeak ? '#20AF24' : '#0066CC';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Dashboard</span>
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            <span className="text-[#0066CC]">Optimisation</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1E293B]">Optimisation Multi-Objectifs NSGA-II</h1>
              <p className="text-sm text-gray-500">Station Ziga - Cycle 03/02/2026</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Exporter rapport PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Scenario Comparison */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Current Scenario */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <Badge variant="secondary" className="mb-4">📊 Référence</Badge>
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Scénario Actuel</h3>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-[#1E293B]">
                  {(baseCost ?? 297000).toLocaleString()} FCFA
                </p>
                <p className="text-sm text-gray-500">/jour</p>
              </div>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pompage</span>
                  <span className="font-medium">22h/jour uniforme</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">kWh</span>
                  <span className="font-medium">2 970 kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cos φ</span>
                  <span className="font-medium text-red-500">0.89</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pénalités</span>
                  <span className="font-medium text-red-500">8 900 FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Optimized */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#20AF24] relative">
            <Badge className="mb-4 bg-[#20AF24] text-white">✨ Recommandé</Badge>
            <h3 className="text-lg font-semibold text-[#20AF24] mb-4">IA Optimisé</h3>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-[#20AF24]">
                  {(optimizedCost ?? 257000).toLocaleString()} FCFA
                </p>
                <p className="text-sm text-gray-500">/jour</p>
              </div>
              {baseCost && optimizedCost ? (
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                  <ChevronDown className="w-4 h-4 rotate-180" />
                  {`${Math.round(((baseCost - optimizedCost) / baseCost) * 1000) / 10}%`}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                  <ChevronDown className="w-4 h-4 rotate-180" /> 13.5%
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pompage</span>
                  <span className="font-medium">30% heures creuses</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">kWh</span>
                  <span className="font-medium">2 970 kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cos φ</span>
                  <span className="font-medium text-green-600">
                    {(optimizedCosPhi ?? 0.94).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pénalités</span>
                  <span className="font-medium text-green-600">0 FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manual */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <Badge className="mb-4 bg-[#0066CC] text-white">👤 Personnalisé</Badge>
            <h3 className="text-lg font-semibold text-[#0066CC] mb-4">Manuel</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600 flex justify-between">
                  <span>% heures creuses</span>
                  <span className="font-medium">{offPeakPercent}%</span>
                </Label>
                <Slider
                  value={[offPeakPercent]}
                  onValueChange={(v) => setOffPeakPercent(v[0])}
                  max={50}
                  min={0}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 flex justify-between">
                  <span>Niveau réservoir cible</span>
                  <span className="font-medium">{reservoirTarget}%</span>
                </Label>
                <Slider
                  value={[reservoirTarget]}
                  onValueChange={(v) => setReservoirTarget(v[0])}
                  max={90}
                  min={60}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-2xl font-bold text-[#1E293B]">
                  {Math.round(
                    (optimizedCost ?? 257000) +
                    (offPeakPercent - 30) * 800 +
                    (reservoirTarget - 75) * 200
                  ).toLocaleString()} FCFA
                </p>
              </div>
              <Button className="w-full" variant="outline">Appliquer ce scénario</Button>
            </div>
          </div>
        </div>

        {/* Pareto Front */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Front de Pareto - Compromis Coût/Stabilité</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="cost" 
                  name="Coût" 
                  domain={[240000, 320000]}
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                  label={{ value: 'Coût énergétique (FCFA)', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="stability" 
                  name="Stabilité" 
                  domain={[0, 25]}
                  label={{ value: 'Variation réservoir (%)', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis type="number" dataKey="size" range={[50, 150]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
                          <p className="font-medium">Coût: {Math.round(data.cost).toLocaleString()} FCFA</p>
                          <p>Stabilité: {data.stability.toFixed(1)}%</p>
                          {data.isBest && <p className="text-[#20AF24] font-medium">⭐ Solution optimale</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={
                    paretoPoints.length
                      ? paretoPoints.map((p, i) => ({
                          cost: p.cost,
                          stability: p.stability,
                          size: 40 + (i === 0 ? 40 : 0),
                          isBest: i === 0
                        }))
                      : []
                  }
                  fill="#94A3B8"
                >
                  {paretoPoints.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#20AF24' : '#94A3B8'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown & Schedule Heatmap */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cost Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1E293B] mb-4">Répartition des charges - Scénario IA</h2>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} FCFA`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1E293B]">257k</p>
                  <p className="text-xs text-gray-500">FCFA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Heatmap */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1E293B] mb-4">Planning détaillé 24h</h2>
            <div className="space-y-3">
              {['P1', 'P2', 'P3'].map((pump) => (
                <div key={pump} className="flex items-center gap-2">
                  <span className="w-8 text-sm font-medium text-gray-600">{pump}</span>
                  <div className="flex-1 flex gap-0.5">
                    {scheduleHeatmap.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 h-8 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ 
                          backgroundColor: getPumpColor(h[pump as keyof typeof h] as number, h.offPeak),
                          minWidth: '8px'
                        }}
                        title={`${pump} - ${h.hour}h: ${h[pump as keyof typeof h] ? 'ON' : 'OFF'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#20AF24] rounded" />
                <span>ON (heures creuses)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#0066CC] rounded" />
                <span>ON (heures pleines)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-200 rounded" />
                <span>OFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Sensitivity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Sensibilité aux variations tarifaires</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="variation" 
                  tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
                  label={{ value: 'Variation tarif (%)', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                  label={{ value: 'Coût (FCFA)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} FCFA`} />
                <Legend />
                <Line type="monotone" dataKey="actuel" name="Scénario actuel" stroke="#94A3B8" strokeWidth={2} />
                <Line type="monotone" dataKey="optimise" name="IA optimisé" stroke="#20AF24" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-[#20AF24]" />
            <p className="text-sm text-green-700">
              <strong>Rentable même si tarif +15%</strong> - L'optimisation reste avantageuse dans tous les scénarios testés
            </p>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <Leaf className="w-8 h-8 text-[#20AF24]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#1E293B]">Impact environnemental</h2>
              <div className="grid sm:grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-2xl font-bold text-[#20AF24]">142 kg</p>
                  <p className="text-sm text-gray-500">CO₂ évités/mois</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1E293B]">12 arbres</p>
                  <p className="text-sm text-gray-500">Équivalent planté</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Objectif annuel ONEA</p>
                  <Progress value={28} className="h-2" />
                  <p className="text-xs text-gray-400 mt-1">28% atteint</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Settings */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-[#1E293B]">Paramètres algorithme NSGA-II</span>
            {showSettings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showSettings && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                <div>
                  <Label className="text-sm text-gray-600 flex justify-between">
                    <span>Population</span>
                    <span className="font-medium">{algorithmParams.population}</span>
                  </Label>
                  <Slider
                    value={[algorithmParams.population]}
                    onValueChange={(v) => setAlgorithmParams(p => ({ ...p, population: v[0] }))}
                    max={100}
                    min={20}
                    step={10}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600 flex justify-between">
                    <span>Générations</span>
                    <span className="font-medium">{algorithmParams.generations}</span>
                  </Label>
                  <Slider
                    value={[algorithmParams.generations]}
                    onValueChange={(v) => setAlgorithmParams(p => ({ ...p, generations: v[0] }))}
                    max={200}
                    min={50}
                    step={10}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600 flex justify-between">
                    <span>Crossover</span>
                    <span className="font-medium">{algorithmParams.crossover}</span>
                  </Label>
                  <Slider
                    value={[algorithmParams.crossover]}
                    onValueChange={(v) => setAlgorithmParams(p => ({ ...p, crossover: v[0] }))}
                    max={1}
                    min={0.5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600 flex justify-between">
                    <span>Mutation</span>
                    <span className="font-medium">{algorithmParams.mutation}</span>
                  </Label>
                  <Slider
                    value={[algorithmParams.mutation]}
                    onValueChange={(v) => setAlgorithmParams(p => ({ ...p, mutation: v[0] }))}
                    max={0.5}
                    min={0.01}
                    step={0.01}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-6">
                <Button 
                  onClick={handleRecalculate}
                  disabled={isCalculating}
                  className="bg-[#0066CC] hover:bg-[#0052a3]"
                >
                  {isCalculating ? (
                    <><Play className="w-4 h-4 mr-2 animate-pulse" /> Calcul en cours...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Recalculer optimisation</>
                  )}
                </Button>
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Recalcul ~30 secondes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { Label } from '@/components/ui/label';
