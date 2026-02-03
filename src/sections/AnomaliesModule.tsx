import { useState } from 'react';
import {
  AlertCircle,
  DollarSign,
  Target,
  Users,
  Wrench,
  Camera,
  X,
  CheckCircle,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  Area,
  AreaChart,
  Legend,
  Cell
} from 'recharts';

// Mission TDR Coverage:
// Mission 7: Surveillance performance électrique
// Mission 12: Détection automatique anomalies/fuites

const anomalyScoreData = Array.from({ length: 7 }, (_, i) => ({
  day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i],
  P1: 0.05 + Math.random() * 0.1,
  P2: i === 4 ? 0.35 : 0.08 + Math.random() * 0.08,
  P3: 0.06 + Math.random() * 0.09,
}));

const featureImportance = [
  { feature: 'kWh/m³', importance: 85 },
  { feature: 'Vibration', importance: 62 },
  { feature: 'Température', importance: 45 },
  { feature: 'Débit', importance: 38 },
  { feature: 'Pression', importance: 28 },
];

const historicalAnomalies = [
  { id: '1', date: '28/01', type: 'Fuite', pump: 'P3', duration: '4h', cost: '18 500 FCFA', status: 'Réparé' },
  { id: '2', date: '15/01', type: 'Usure', pump: 'P1', duration: '2j', cost: '62 000 FCFA', status: 'Maintenance' },
  { id: '3', date: '08/01', type: 'Surconsommation', pump: 'P2', duration: '6h', cost: '24 000 FCFA', status: 'Réparé' },
  { id: '4', date: '02/01', type: 'Fuite', pump: 'P1', duration: '8h', cost: '31 000 FCFA', status: 'Réparé' },
];

interface Anomaly {
  id: string;
  severity: 'urgent' | 'medium' | 'low';
  pump: string;
  type: string;
  kwhM3: number;
  baseline: number;
  costImpact: number;
  duration: string;
  rootCauses: { cause: string; probability: number }[];
  citizenReports: number;
  correlation: boolean;
}

const activeAnomalies: Anomaly[] = [
  {
    id: '1',
    severity: 'urgent',
    pump: 'P2',
    type: 'Surconsommation critique',
    kwhM3: 2.8,
    baseline: 1.8,
    costImpact: 35000,
    duration: '2h 15min',
    rootCauses: [
      { cause: 'Fuite', probability: 78 },
      { cause: 'Usure moteur', probability: 45 },
      { cause: 'Autre', probability: 12 },
    ],
    citizenReports: 2,
    correlation: true,
  },
  {
    id: '2',
    severity: 'medium',
    pump: 'P1',
    type: 'Dérive consommation',
    kwhM3: 2.1,
    baseline: 1.8,
    costImpact: 8200,
    duration: '45min',
    rootCauses: [
      { cause: 'Encrassement filtre', probability: 68 },
      { cause: 'Calibration', probability: 32 },
    ],
    citizenReports: 0,
    correlation: false,
  },
  {
    id: '3',
    severity: 'low',
    pump: 'P3',
    type: 'Variation pression',
    kwhM3: 1.95,
    baseline: 1.8,
    costImpact: 3200,
    duration: '1h 30min',
    rootCauses: [
      { cause: 'Regulation', probability: 55 },
    ],
    citizenReports: 1,
    correlation: false,
  },
];

// Severity colors for styling

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'urgent': return <Badge className="bg-red-500 text-white">URGENT</Badge>;
    case 'medium': return <Badge className="bg-orange-500 text-white">MOYENNE</Badge>;
    case 'low': return <Badge className="bg-yellow-500 text-white">FAIBLE</Badge>;
  }
};

export function AnomaliesModule() {
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>('1');
  const [dismissedAnomalies, setDismissedAnomalies] = useState<string[]>([]);

  const handleDismiss = (id: string) => {
    setDismissedAnomalies([...dismissedAnomalies, id]);
  };

  const visibleAnomalies = activeAnomalies.filter(a => !dismissedAnomalies.includes(a.id));

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#0066CC]">Détection Anomalies</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Détection d'Anomalies - Isolation Forest</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-red-500">{visibleAnomalies.length}</p>
                <p className="text-sm text-gray-500 mt-1">Anomalies en cours</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <Button variant="ghost" className="mt-4 text-red-600 hover:text-red-700 p-0 h-auto">
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-[#20AF24]">127 000 FCFA</p>
                <p className="text-sm text-gray-500 mt-1">Économies possibles/jour</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#20AF24]" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>↑ depuis hier</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#0066CC]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-[#0066CC]">94.2%</p>
                <p className="text-sm text-gray-500 mt-1">Précision détection</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-[#0066CC]" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">(validé sur 30j)</p>
          </div>
        </div>

        {/* Active Anomalies */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1E293B]">Alertes actives</h2>
          
          {visibleAnomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                anomaly.severity === 'urgent' ? 'border-red-500' :
                anomaly.severity === 'medium' ? 'border-orange-500' : 'border-yellow-500'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      anomaly.severity === 'urgent' ? 'bg-red-100' :
                      anomaly.severity === 'medium' ? 'bg-orange-100' : 'bg-yellow-100'
                    }`}>
                      <AlertCircle className={`w-5 h-5 ${
                        anomaly.severity === 'urgent' ? 'text-red-500' :
                        anomaly.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityBadge(anomaly.severity)}
                        <h3 className="font-semibold text-[#1E293B]">{anomaly.type} - Pompe {anomaly.pump}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm mt-2">
                        <div>
                          <span className="text-gray-500">Consommation: </span>
                          <span className={`font-bold ${
                            anomaly.severity === 'urgent' ? 'text-red-500' :
                            anomaly.severity === 'medium' ? 'text-orange-500' : 'text-yellow-600'
                          }`}>
                            {anomaly.kwhM3} kWh/m³
                          </span>
                          <span className="text-xs ml-1">
                            (+{Math.round((anomaly.kwhM3 / anomaly.baseline - 1) * 100)}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Normale: </span>
                          <span className="font-medium">{anomaly.baseline} kWh/m³</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Impact: </span>
                          <span className="font-bold text-red-600">
                            -{anomaly.costImpact.toLocaleString()} FCFA/jour
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Détecté depuis: {anomaly.duration}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedAnomaly(
                      expandedAnomaly === anomaly.id ? null : anomaly.id
                    )}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className={`w-5 h-5 transition-transform ${
                      expandedAnomaly === anomaly.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                </div>

                {expandedAnomaly === anomaly.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {/* Root Cause Analysis */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Analyse cause racine</h4>
                      <div className="space-y-2">
                        {anomaly.rootCauses.map((cause, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">{cause.cause}</span>
                              <span className="font-medium">{cause.probability}%</span>
                            </div>
                            <Progress 
                              value={cause.probability} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Citizen Reports */}
                    {anomaly.citizenReports > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-[#0066CC]" />
                          <div>
                            <p className="text-sm font-medium text-[#0066CC]">
                              {anomaly.citizenReports} signalement{anomaly.citizenReports > 1 ? 's' : ''} citoyen{anomaly.citizenReports > 1 ? 's' : ''} (51513404)
                            </p>
                            <p className="text-xs text-gray-500">
                              dans zone Karpala · Corrélation géographique: ✓ Confirmée
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        className={anomaly.severity === 'urgent' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}
                      >
                        <Wrench className="w-4 h-4 mr-2" /> Créer bon intervention
                      </Button>
                      <Button variant="outline">
                        <Camera className="w-4 h-4 mr-2" /> Demander photos terrain
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleDismiss(anomaly.id)}
                        className="text-gray-500"
                      >
                        <X className="w-4 h-4 mr-2" /> Fausse alerte
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Anomaly Score Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Évolution scores d'anomalie - 7 derniers jours</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={anomalyScoreData}>
                <defs>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 0.4]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <ReferenceLine y={0.15} stroke="#EF4444" strokeDasharray="3 3" label="Seuil alerte" />
                <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                <Legend />
                <Area type="monotone" dataKey="P1" name="Pompe P1" stroke="#0066CC" fill="#0066CC" fillOpacity={0.1} />
                <Area type="monotone" dataKey="P2" name="Pompe P2" stroke="#EF4444" fill="url(#colorRed)" />
                <Area type="monotone" dataKey="P3" name="Pompe P3" stroke="#20AF24" fill="#20AF24" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance & Correlation Map */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Feature Importance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1E293B] mb-4">Facteurs contributifs - Pompe P2</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportance} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="feature" type="category" width={70} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="importance" fill="#20AF24" radius={[0, 4, 4, 0]}>
                    {featureImportance.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#20AF24' : '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Correlation Map */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1E293B] mb-4">Validation croisée signalements citoyens</h2>
            <div className="relative h-64 bg-gray-50 rounded-lg overflow-hidden">
              {/* Simplified Map Visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Station */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-[#0066CC] rounded-full flex items-center justify-center">
                      <Droplets className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-xs text-center mt-1 font-medium">Ziga</p>
                  </div>
                  
                  {/* Radius circles */}
                  <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  <div className="w-32 h-32 border-2 border-dashed border-gray-400 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  
                  {/* Citizen reports */}
                  <div className="absolute left-[60%] top-[30%]">
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
                  </div>
                  <div className="absolute left-[40%] top-[65%]">
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
                  </div>
                  <div className="absolute left-[70%] top-[55%]">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#0066CC] rounded-full" />
                  <span>Station</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span>Signalement (confirmé)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span>Signalement (en attente)</span>
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                <strong>78%</strong> des alertes IA confirmées par signalements citoyens
              </p>
            </div>
          </div>
        </div>

        {/* Historical Anomalies */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#1E293B]">Historique des anomalies</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pompe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coût évité</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historicalAnomalies.map((anomaly) => (
                  <tr key={anomaly.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{anomaly.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#1E293B]">{anomaly.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{anomaly.pump}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{anomaly.duration}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#20AF24]">{anomaly.cost}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" /> {anomaly.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4">Performance modèle Isolation Forest</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#0066CC" strokeWidth="8" fill="none"
                    strokeDasharray={`${94.2 * 2.26} 226`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#0066CC]">
                  94.2%
                </span>
              </div>
              <p className="text-sm text-gray-600">Précision</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#20AF24" strokeWidth="8" fill="none"
                    strokeDasharray={`${89.1 * 2.26} 226`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#20AF24]">
                  89.1%
                </span>
              </div>
              <p className="text-sm text-gray-600">Rappel</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#FF6600" strokeWidth="8" fill="none"
                    strokeDasharray={`${91.5 * 2.26} 226`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#FF6600]">
                  91.5%
                </span>
              </div>
              <p className="text-sm text-gray-600">F1-Score</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#EF4444" strokeWidth="8" fill="none"
                    strokeDasharray={`${5.8 * 2.26} 226`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#EF4444]">
                  5.8%
                </span>
              </div>
              <p className="text-sm text-gray-600">Faux positifs</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-500">Dernier réentraînement: <span className="font-medium">12 janvier 2026</span></p>
            <Button variant="outline" size="sm">Historique réentraînements</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Droplets } from 'lucide-react';
