import { useState } from 'react';
import {
  TrendingUp,
  AlertCircle,
  Download,
  ChevronUp,
  ChevronDown,
  ArrowRightLeft,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  Legend
} from 'recharts';

// Mission TDR Coverage:
// Mission 5: Répartition charge inter-stations
// Mission 10: Priorisation sites énergivores

const stations = [
  {
    id: 'ziga',
    name: 'Ziga',
    capacity: '12,000 m³/h',
    consumption: 2847,
    consumptionTrend: -13,
    costPerM3: 40,
    savings: 45200,
    status: 'optimal' as const,
    pumps: 3,
    activePumps: 2
  },
  {
    id: 'paspanga',
    name: 'Paspanga',
    capacity: '5,500 m³/h',
    consumption: 890,
    consumptionTrend: 8,
    costPerM3: 58,
    savings: -12000,
    status: 'critical' as const,
    pumps: 2,
    activePumps: 2
  },
  {
    id: 'loumbila',
    name: 'Loumbila',
    capacity: '8,000 m³/h',
    consumption: 1520,
    consumptionTrend: -5,
    costPerM3: 45,
    savings: 18500,
    status: 'optimal' as const,
    pumps: 3,
    activePumps: 2
  },
  {
    id: 'tampouy',
    name: 'Tampouy',
    capacity: '6,500 m³/h',
    consumption: 1180,
    consumptionTrend: -2,
    costPerM3: 48,
    savings: 8200,
    status: 'warning' as const,
    pumps: 2,
    activePumps: 2
  },
  {
    id: 'ouaga2000',
    name: 'Ouaga 2000',
    capacity: '4,000 m³/h',
    consumption: 720,
    consumptionTrend: -8,
    costPerM3: 52,
    savings: 6500,
    status: 'warning' as const,
    pumps: 2,
    activePumps: 1
  },
];

const loadDistribution = [
  { name: 'Ziga', value: 35, color: '#0066CC' },
  { name: 'Paspanga', value: 18, color: '#EF4444' },
  { name: 'Loumbila', value: 22, color: '#20AF24' },
  { name: 'Tampouy', value: 15, color: '#F59E0B' },
  { name: 'Ouaga 2000', value: 10, color: '#94A3B8' },
];

const efficiencyRanking = [
  { name: 'Ziga', efficiency: 95, cost: 40 },
  { name: 'Loumbila', efficiency: 88, cost: 45 },
  { name: 'Tampouy', efficiency: 82, cost: 48 },
  { name: 'Ouaga 2000', efficiency: 75, cost: 52 },
  { name: 'Paspanga', efficiency: 65, cost: 58 },
];

const monthlyTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  ziga: 40 + Math.random() * 5,
  paspanga: 55 + Math.random() * 8,
  loumbila: 43 + Math.random() * 6,
  tampouy: 46 + Math.random() * 7,
  ouaga2000: 50 + Math.random() * 6,
}));

export function RegionalDashboard() {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUp className="w-3 h-3 text-gray-300" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-[#0066CC]" />
      : <ChevronDown className="w-3 h-3 text-[#0066CC]" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal':
        return <Badge className="bg-green-100 text-green-700 border-0">🟢 Optimal</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700 border-0">🟡 Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 border-0">🔴 Optimisation requise</Badge>;
    }
  };

  const totalSavings = stations.reduce((acc, s) => acc + s.savings, 0);
  const optimalStations = stations.filter(s => s.status === 'optimal').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-6">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-100 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Vue Régionale</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Zone Ouagadougou</h1>
              <p className="text-sm text-blue-100">5 stations · 36,000 m³/h capacité totale</p>
            </div>
            <Button variant="secondary" className="gap-2">
              <Download className="w-4 h-4" /> Exporter Excel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Aggregate KPIs */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[#20AF24]">{totalSavings.toLocaleString()} FCFA</p>
                <p className="text-sm text-gray-500 mt-1">Total économies/jour</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#20AF24]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[#1E293B]">{optimalStations}/5</p>
                <p className="text-sm text-gray-500 mt-1">Stations optimales</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#0066CC]" />
              </div>
            </div>
            <Progress value={(optimalStations / 5) * 100} className="mt-3 h-2" />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[#0066CC]">78%</p>
                <p className="text-sm text-gray-500 mt-1">Taux adoption IA</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Progress value={78} className="mt-3 h-2" />
          </div>
        </div>

        {/* Station Comparison Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1E293B]">Comparaison des stations</h2>
            <p className="text-sm text-gray-500">Cliquez sur les en-têtes pour trier</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">Station {getSortIcon('name')}</div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('capacity')}
                  >
                    <div className="flex items-center gap-1">Capacité {getSortIcon('capacity')}</div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('consumption')}
                  >
                    <div className="flex items-center gap-1">Consommation {getSortIcon('consumption')}</div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('costPerM3')}
                  >
                    <div className="flex items-center gap-1">Coût/m³ {getSortIcon('costPerM3')}</div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('savings')}
                  >
                    <div className="flex items-center gap-1">Économies {getSortIcon('savings')}</div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stations.map((station) => (
                  <tr key={station.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1E293B]">{station.name}</div>
                      <div className="text-xs text-gray-500">{station.activePumps}/{station.pumps} pompes</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{station.capacity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{station.consumption.toLocaleString()} kWh</span>
                        <Badge className={`text-xs ${
                          station.consumptionTrend < 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {station.consumptionTrend < 0 ? '' : '+'}{station.consumptionTrend}%
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${
                        station.costPerM3 <= 45 ? 'text-green-600' :
                        station.costPerM3 <= 52 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {station.costPerM3} FCFA
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${
                        station.savings >= 0 ? 'text-[#20AF24]' : 'text-red-600'
                      }`}>
                        {station.savings >= 0 ? '+' : ''}{station.savings.toLocaleString()} FCFA
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(station.status)}</td>
                    <td className="px-4 py-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={station.status === 'critical' ? 'border-red-300 text-red-600' : ''}
                      >
                        {station.status === 'critical' ? (
                          <><AlertCircle className="w-4 h-4 mr-1" /> Analyser</>
                        ) : (
                          'Détails'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Load Balancing Recommendation */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" /> Répartition charge optimale
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setShowSimulation(!showSimulation)}
            >
              <Play className="w-4 h-4 mr-2" /> Simuler scénario
            </Button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">Distribution actuelle de la production</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={loadDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {loadDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-[#0066CC] mb-2">💡 Recommandation IA</h3>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Transférer 15% production Paspanga → Ziga</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Ziga a un meilleur rendement énergétique (40 vs 58 FCFA/m³). 
                  Cette reallocation permettrait d'optimiser la consommation globale.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Impact économique</p>
                  <p className="text-xl font-bold text-[#20AF24]">+18,400 FCFA/jour</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Réduction CO₂</p>
                  <p className="text-xl font-bold text-[#0066CC]">-12 kg/jour</p>
                </div>
              </div>
              
              {showSimulation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-fade-in">
                  <p className="text-sm font-medium text-yellow-800">Simulation en cours...</p>
                  <Progress value={65} className="mt-2 h-2" />
                  <p className="text-xs text-yellow-600 mt-1">Calcul de l'impact sur le réseau</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Efficiency Ranking */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Classement efficacité énergétique</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyRanking} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" width={70} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'efficiency' ? `${value}%` : `${value} FCFA/m³`,
                    name === 'efficiency' ? 'Efficacité' : 'Coût/m³'
                  ]}
                />
                <ReferenceLine x={80} stroke="#20AF24" strokeDasharray="3 3" label="Objectif" />
                <Bar dataKey="efficiency" name="Efficacité" fill="#0066CC" radius={[0, 4, 4, 0]}>
                  {efficiencyRanking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.efficiency >= 80 ? '#20AF24' : entry.efficiency >= 70 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Heatmap */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Évolution coût/m³ - 30 derniers jours</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickFormatter={(v) => `${v}`} interval={4} />
                <YAxis domain={[35, 70]} tickFormatter={(v) => `${v} FCFA`} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)} FCFA/m³`} />
                <Legend />
                <Line type="monotone" dataKey="ziga" name="Ziga" stroke="#0066CC" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="paspanga" name="Paspanga" stroke="#EF4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="loumbila" name="Loumbila" stroke="#20AF24" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="tampouy" name="Tampouy" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ouaga2000" name="Ouaga 2000" stroke="#94A3B8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
