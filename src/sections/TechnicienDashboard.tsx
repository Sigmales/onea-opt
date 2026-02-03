import { useState, useEffect } from 'react';
import {
  TrendingDown,
  Zap,
  Droplets,
  Power,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  User as UserIcon,
  LogOut,
  Home,
  History,
  Wifi,
  WifiOff,
  ChevronRight,
  Wrench
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
// User type imported via interface

interface TechnicienDashboardProps {
  user: import('@/types').User;
  onLogout: () => void;
  isOnline: boolean;
}

// Mission TDR Coverage:
// Mission 3: Activation/désactivation intelligente pompes
// Mission 4: Modulation puissance via planning horaire
// Mission 7: Surveillance performance électrique continue
// Mission 14: Validation manuelle technicien (HITL)

const scheduleData = [
  { hour: '00', current: 2, optimized: 3, isOffPeak: true },
  { hour: '01', current: 2, optimized: 3, isOffPeak: true },
  { hour: '02', current: 2, optimized: 3, isOffPeak: true },
  { hour: '03', current: 2, optimized: 3, isOffPeak: true },
  { hour: '04', current: 2, optimized: 3, isOffPeak: true },
  { hour: '05', current: 2, optimized: 3, isOffPeak: true },
  { hour: '06', current: 2, optimized: 2, isOffPeak: false },
  { hour: '07', current: 3, optimized: 2, isOffPeak: false },
  { hour: '08', current: 3, optimized: 2, isOffPeak: false },
  { hour: '09', current: 3, optimized: 2, isOffPeak: false },
  { hour: '10', current: 3, optimized: 2, isOffPeak: false },
  { hour: '11', current: 3, optimized: 2, isOffPeak: false },
  { hour: '12', current: 3, optimized: 2, isOffPeak: false },
  { hour: '13', current: 3, optimized: 2, isOffPeak: false },
  { hour: '14', current: 2, optimized: 1, isOffPeak: false },
  { hour: '15', current: 2, optimized: 2, isOffPeak: false },
  { hour: '16', current: 2, optimized: 2, isOffPeak: false },
  { hour: '17', current: 3, optimized: 2, isOffPeak: false },
  { hour: '18', current: 3, optimized: 2, isOffPeak: false },
  { hour: '19', current: 3, optimized: 2, isOffPeak: false },
  { hour: '20', current: 3, optimized: 2, isOffPeak: false },
  { hour: '21', current: 3, optimized: 2, isOffPeak: false },
  { hour: '22', current: 2, optimized: 3, isOffPeak: true },
  { hour: '23', current: 2, optimized: 3, isOffPeak: true },
];

const actionHistory = [
  { id: '1', date: '02/02 09:15', action: 'Arrêt P3', result: '-8 900 FCFA', by: 'Vous', status: 'success' },
  { id: '2', date: '01/02 22:30', action: 'Démarrage P1', result: '-5 200 FCFA', by: 'Système', status: 'success' },
  { id: '3', date: '01/02 14:00', action: 'Modulation P2', result: '-3 100 FCFA', by: 'Vous', status: 'success' },
];

export function TechnicienDashboard({ onLogout, isOnline }: TechnicienDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [recommendationApplied, setRecommendationApplied] = useState(false);
  const [showAnomaly, setShowAnomaly] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleApplyRecommendation = () => {
    setRecommendationApplied(true);
    setTimeout(() => setRecommendationApplied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-lg font-bold">Station Ziga</h1>
            <p className="text-xs text-blue-100">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })} · {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${isOnline ? 'bg-green-500' : 'bg-orange-500'} text-white border-0`}>
              {isOnline ? (
                <><Wifi className="w-3 h-3 mr-1" /> En ligne</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> Hors ligne</>
              )}
            </Badge>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <span className="text-sm">👷</span>
              <span className="text-sm font-medium">Technicien</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card A - Économie */}
          <div className="bg-white rounded-xl p-4 shadow-sm card-hover animate-fade-in stagger-1">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#20AF24]" />
              </div>
              <span className="text-xs text-gray-400">Aujourd'hui</span>
            </div>
            <p className="text-2xl font-bold text-[#20AF24]">45 200 FCFA</p>
            <p className="text-xs text-gray-500">Économisé</p>
            <p className="text-xs text-green-600 mt-1">vs coût standard</p>
          </div>

          {/* Card B - Consommation */}
          <div className="bg-white rounded-xl p-4 shadow-sm card-hover animate-fade-in stagger-2">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#FF6600]" />
              </div>
              <span className="text-xs text-gray-400">24h</span>
            </div>
            <p className="text-2xl font-bold text-[#1E293B]">2 847 kWh</p>
            <p className="text-xs text-gray-500">Consommation</p>
            <p className="text-xs text-gray-400 mt-1">1.8 kWh/m³ (normal)</p>
          </div>

          {/* Card C - Réservoir */}
          <div className="bg-white rounded-xl p-4 shadow-sm card-hover animate-fade-in stagger-3">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-[#0066CC]" />
              </div>
              <span className="text-xs text-gray-400">Niveau</span>
            </div>
            <p className="text-2xl font-bold text-[#0066CC]">78%</p>
            <p className="text-xs text-gray-500">Réservoir</p>
            <div className="mt-2">
              <Progress value={78} className="h-2" />
            </div>
          </div>

          {/* Card D - Pompes */}
          <div className="bg-white rounded-xl p-4 shadow-sm card-hover animate-fade-in stagger-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Power className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs text-gray-400">État</span>
            </div>
            <p className="text-2xl font-bold text-[#1E293B]">2 / 3</p>
            <p className="text-xs text-gray-500">Pompes actives</p>
            <div className="flex gap-1 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" title="P1 active" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" title="P2 active" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" title="P3 inactive" />
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <span>🤖</span> Recommandations IA - Prochain cycle
            </h2>
          </div>
          
          <div className="p-4">
            <div className="border-l-4 border-[#20AF24] bg-green-50 rounded-r-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-[#20AF24]" />
                <h3 className="font-semibold text-[#1E293B]">
                  Action recommandée : Arrêter Pompe P3 à 14h00
                </h3>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-[#0066CC] mb-2">Justification :</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Tarif heures pleines SONABEL : 160 FCFA/kWh</li>
                  <li>• Réservoir suffisant (78% &gt; 60% mini)</li>
                  <li>• Demande prévue faible (6 200 m³)</li>
                </ul>
                <p className="text-sm font-bold text-[#20AF24] mt-2">
                  Économie estimée : 12 400 FCFA
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleApplyRecommendation}
                  className="flex-1 h-14 bg-[#20AF24] hover:bg-[#1a8f1d] text-white font-semibold btn-press"
                >
                  {recommendationApplied ? (
                    <><CheckCircle className="w-5 h-5 mr-2" /> Appliqué !</>
                  ) : (
                    <><CheckCircle className="w-5 h-5 mr-2" /> Appliquer maintenant</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-14 border-gray-300 text-gray-700 font-medium"
                >
                  <Clock className="w-5 h-5 mr-2" /> Reporter 1h
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 text-right">
              Calculé il y a 3 min · Dernière synchro: Il y a 12 min
            </p>
          </div>
        </div>

        {/* Anomaly Alert */}
        {showAnomaly && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in border-l-4 border-[#FF6600]">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#FF6600]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1E293B] flex items-center gap-2">
                    Surconsommation détectée - Pompe P2
                  </h3>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Consommation</p>
                      <p className="font-bold text-[#FF6600]">2.4 kWh/m³ <span className="text-xs">(+33%)</span></p>
                    </div>
                    <div>
                      <p className="text-gray-500">Normale</p>
                      <p className="font-medium">1.8 kWh/m³</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Impact</p>
                      <p className="font-bold text-red-600">-28 000 FCFA/jour</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Cause probable : Fuite réseau ou usure moteur
                  </p>
                  <div className="flex gap-3 mt-3">
                    <Button className="bg-[#FF6600] hover:bg-[#e65c00] text-white">
                      <Wrench className="w-4 h-4 mr-2" /> Signaler maintenance
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowAnomaly(false)}
                      className="text-gray-500"
                    >
                      Ignorer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 24H Schedule Chart */}
        <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1E293B]">Planning optimisé vs actuel</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded" />
                <span className="text-gray-600">Heures creuses (22h-6h)</span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scheduleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }}
                  interval={2}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  domain={[0, 3]}
                  ticks={[0, 1, 2, 3]}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number, name: string) => [
                    `${value} pompe${value > 1 ? 's' : ''}`,
                    name === 'current' ? 'Actuel' : 'Optimisé'
                  ]}
                />
                <Legend />
                <Bar dataKey="current" name="Actuel" fill="#94A3B8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="optimized" name="Optimisé" radius={[2, 2, 0, 0]}>
                  {scheduleData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isOffPeak ? '#20AF24' : '#0066CC'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1E293B]">Historique actions</h2>
            <button className="text-sm text-[#0066CC] flex items-center gap-1 hover:underline">
              Voir tout <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Heure</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Résultat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {actionHistory.map((action) => (
                  <tr key={action.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{action.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#1E293B]">{action.action}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-[#20AF24] font-medium">{action.result}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{action.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-7xl mx-auto">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 flex-1 py-2 ${activeTab === 'home' ? 'text-[#0066CC]' : 'text-gray-400'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Accueil</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 flex-1 py-2 ${activeTab === 'history' ? 'text-[#0066CC]' : 'text-gray-400'}`}
          >
            <History className="w-5 h-5" />
            <span className="text-xs">Historique</span>
          </button>
          <button 
            onClick={handleRefresh}
            className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-400 hover:text-[#0066CC] transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs">Actualiser</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 flex-1 py-2 ${activeTab === 'settings' ? 'text-[#0066CC]' : 'text-gray-400'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Paramètres</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 flex-1 py-2 ${activeTab === 'profile' ? 'text-[#0066CC]' : 'text-gray-400'}`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
