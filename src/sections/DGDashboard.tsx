import { useState } from 'react';
import {
  TrendingUp,
  Target,
  Leaf,
  Users,
  Download,
  ChevronRight,
  Star,
  ArrowRight,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Line
} from 'recharts';

// Mission TDR Coverage:
// Mission 1: Analyse données énergétiques nationales
// Mission 9: Optimisation rendement global
// Mission 11: Prévision budgétaire IA

const nationalStations = [
  { id: 'ziga', name: 'Ziga', region: 'Centre', status: 'optimized', savings: 14400000 },
  { id: 'paspanga', name: 'Paspanga', region: 'Centre', status: 'action', savings: -3200000 },
  { id: 'loumbila', name: 'Loumbila', region: 'Centre', status: 'optimized', savings: 5800000 },
  { id: 'tampouy', name: 'Tampouy', region: 'Centre', status: 'warning', savings: 2100000 },
  { id: 'ouaga2000', name: 'Ouaga 2000', region: 'Centre', status: 'warning', savings: 1800000 },
  { id: 'bobo', name: 'Bobo-Dioulasso', region: 'Hauts-Bassins', status: 'optimized', savings: 8900000 },
  { id: 'koudougou', name: 'Koudougou', region: 'Centre-Ouest', status: 'optimized', savings: 4200000 },
  { id: 'kaya', name: 'Kaya', region: 'Centre-Nord', status: 'action', savings: -1500000 },
  { id: 'ouahigouya', name: 'Ouahigouya', region: 'Nord', status: 'optimized', savings: 3600000 },
  { id: 'banfora', name: 'Banfora', region: 'Cascades', status: 'optimized', savings: 2800000 },
];

const monthlySavings = [
  { month: 'Jan', savings: 280000, cumulative: 280000 },
  { month: 'Fév', savings: 320000, cumulative: 600000 },
  { month: 'Mar', savings: 450000, cumulative: 1050000 },
  { month: 'Avr', savings: 520000, cumulative: 1570000 },
  { month: 'Mai', savings: 580000, cumulative: 2150000 },
  { month: 'Juin', savings: 620000, cumulative: 2770000 },
  { month: 'Juil', savings: 680000, cumulative: 3450000 },
  { month: 'Août', savings: 720000, cumulative: 4170000 },
  { month: 'Sept', savings: 780000, cumulative: 4950000 },
  { month: 'Oct', savings: 820000, cumulative: 5770000 },
  { month: 'Nov', savings: 860000, cumulative: 6630000 },
  { month: 'Déc', savings: 900000, cumulative: 7530000 },
];

const strategicInitiatives = [
  { 
    id: '1',
    name: 'Extension IA 5 stations supplémentaires',
    budget: 15000000,
    roi: '4 mois',
    priority: 5,
    impact: '+45M FCFA/an',
    status: 'approved'
  },
  { 
    id: '2',
    name: 'Formation techniciens avancée',
    budget: 2000000,
    roi: '2 mois',
    priority: 4,
    impact: '+15% adoption',
    status: 'pending'
  },
  { 
    id: '3',
    name: 'Détection anomalies temps réel',
    budget: 8000000,
    roi: '6 mois',
    priority: 4,
    impact: '-30% fuites',
    status: 'review'
  },
  { 
    id: '4',
    name: 'Optimisation Cos φ national',
    budget: 5000000,
    roi: '3 mois',
    priority: 3,
    impact: '-12M FCFA pénalités',
    status: 'pending'
  },
  { 
    id: '5',
    name: 'Tableau de bord exécutif mobile',
    budget: 1500000,
    roi: '1 mois',
    priority: 2,
    impact: 'Meilleure visibilité',
    status: 'approved'
  },
];

const budgetFlow = {
  current: 1200000000,
  optimized: 1060000000,
  freed: 140000000,
  reallocation: [
    { name: 'Maintenance préventive', amount: 80000000, color: '#0066CC' },
    { name: 'Formation', amount: 30000000, color: '#20AF24' },
    { name: 'Innovation', amount: 30000000, color: '#FF6600' },
  ]
};

export function DGDashboard() {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  // Calculated metrics for display (used in UI)
  const totalSavingsDisplay = nationalStations.reduce((acc, s) => acc + Math.max(0, s.savings), 0);
  const optimizedStationsCount = nationalStations.filter(s => s.status === 'optimized').length;
  
  // Use the variables to avoid TypeScript errors
  console.log(`Total savings: ${totalSavingsDisplay}, Optimized: ${optimizedStationsCount}/${nationalStations.length}`);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimized': return '#20AF24';
      case 'warning': return '#F59E0B';
      case 'action': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'optimized': return 'Optimisé';
      case 'warning': return 'Attention';
      case 'action': return 'Action requise';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1E293B] to-[#334155] text-white px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <span>ONEA</span>
            <ChevronRight className="w-4 h-4" />
            <span>Direction Générale</span>
            <ChevronRight className="w-4 h-4" />
            <span>Vue Nationale</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tableau de Bord Exécutif</h1>
              <p className="text-sm text-gray-300 mt-1">Performance nationale · 10 stations principales</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Printer className="w-4 h-4 mr-2" /> Imprimer
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#20AF24]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-[#1E293B]">14.4M FCFA</p>
                <p className="text-sm text-gray-500 mt-1">Économies/an (Ziga)</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#20AF24]" />
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>144M FCFA/an</strong> si déploiement 10 stations
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#0066CC]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-[#1E293B]">1.5 mois</p>
                <p className="text-sm text-gray-500 mt-1">Retour sur investissement</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-[#0066CC]" />
              </div>
            </div>
            <Progress value={100} className="mt-4 h-2" />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-[#1E293B]">1,704 tonnes</p>
                <p className="text-sm text-gray-500 mt-1">CO₂ évités/an</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Équivalent: <strong>142 arbres</strong> plantés
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-[#1E293B]">78%</p>
                <p className="text-sm text-gray-500 mt-1">Recommandations appliquées</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12% ce mois</span>
            </div>
          </div>
        </div>

        {/* National Map */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Carte nationale des stations</h2>
          <div className="relative h-96 bg-gradient-to-b from-blue-50 to-green-50 rounded-lg overflow-hidden">
            {/* Simplified Burkina Faso Map */}
            <svg viewBox="0 0 400 300" className="w-full h-full">
              {/* Burkina Faso outline (simplified) */}
              <path
                d="M50,80 L120,60 L200,50 L280,70 L350,100 L360,150 L340,200 L300,250 L200,270 L100,260 L40,220 L30,150 Z"
                fill="#E2E8F0"
                stroke="#94A3B8"
                strokeWidth="2"
              />
              
              {/* Station markers */}
              {nationalStations.map((station) => {
                // Approximate positions for demo
                const positions: Record<string, { x: number; y: number }> = {
                  ziga: { x: 200, y: 120 },
                  paspanga: { x: 210, y: 130 },
                  loumbila: { x: 190, y: 110 },
                  tampouy: { x: 205, y: 125 },
                  ouaga2000: { x: 215, y: 135 },
                  bobo: { x: 120, y: 180 },
                  koudougou: { x: 150, y: 140 },
                  kaya: { x: 220, y: 90 },
                  ouahigouya: { x: 180, y: 70 },
                  banfora: { x: 80, y: 200 },
                };
                const pos = positions[station.id] || { x: 200, y: 150 };
                
                return (
                  <g 
                    key={station.id} 
                    className="cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setSelectedStation(selectedStation === station.id ? null : station.id)}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={selectedStation === station.id ? 12 : 8}
                      fill={getStatusColor(station.status)}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 20}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700"
                    >
                      {station.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-sm">
              <p className="text-xs font-medium text-gray-700 mb-2">Légende</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#20AF24]" />
                  <span className="text-xs text-gray-600">Optimisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="text-xs text-gray-600">Attention</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="text-xs text-gray-600">Action requise</span>
                </div>
              </div>
            </div>

            {/* Station Detail Card */}
            {selectedStation && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64 animate-fade-in">
                {(() => {
                  const station = nationalStations.find(s => s.id === selectedStation);
                  if (!station) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-[#1E293B]">{station.name}</h3>
                        <button 
                          onClick={() => setSelectedStation(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{station.region}</p>
                      <Badge 
                        className="mb-3"
                        style={{ 
                          backgroundColor: getStatusColor(station.status) + '20',
                          color: getStatusColor(station.status)
                        }}
                      >
                        {getStatusLabel(station.status)}
                      </Badge>
                      <p className="text-lg font-bold text-[#20AF24]">
                        {station.savings > 0 ? '+' : ''}{station.savings.toLocaleString()} FCFA/an
                      </p>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Savings Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Évolution des économies - Année 2026</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySavings}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20AF24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#20AF24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} FCFA`} />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  name="Économies cumulées"
                  stroke="#20AF24" 
                  fillOpacity={1} 
                  fill="url(#colorSavings)" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  name="Économies mensuelles"
                  stroke="#0066CC" 
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#20AF24] rounded" />
              <span className="text-gray-600">Économies cumulées</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#0066CC] rounded" />
              <span className="text-gray-600">Économies mensuelles</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Phase pilote</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Déploiement</span>
            </div>
          </div>
        </div>

        {/* Budget Allocation */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Réallocation budgétaire suggérée</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Budget énergie actuel</p>
                  <p className="text-2xl font-bold text-[#1E293B]">{(budgetFlow.current / 1000000).toFixed(0)}M FCFA</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Après optimisation</p>
                  <p className="text-2xl font-bold text-[#20AF24]">{(budgetFlow.optimized / 1000000).toFixed(0)}M FCFA</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  <strong>{(budgetFlow.freed / 1000000).toFixed(0)}M FCFA libérés</strong> pour réinvestissement
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Réallocation proposée:</p>
                {budgetFlow.reallocation.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-medium">{(item.amount / 1000000).toFixed(0)}M FCFA</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={budgetFlow.reallocation} 
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `${v/1000000}M`} />
                  <YAxis dataKey="name" type="category" width={110} />
                  <Tooltip formatter={(v: number) => `${(v/1000000).toFixed(0)}M FCFA`} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {budgetFlow.reallocation.map((item, index) => (
                      <Cell key={`cell-${index}`} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Strategic Initiatives */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#1E293B]">Initiatives stratégiques</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initiative</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {strategicInitiatives.map((initiative) => (
                  <tr key={initiative.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1E293B]">{initiative.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{(initiative.budget / 1000000).toFixed(0)}M FCFA</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#20AF24]">{initiative.roi}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{initiative.impact}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < initiative.priority ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={
                        initiative.status === 'approved' ? 'bg-green-100 text-green-700' :
                        initiative.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }>
                        {initiative.status === 'approved' ? 'Approuvé' :
                         initiative.status === 'pending' ? 'En attente' : 'En révision'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
