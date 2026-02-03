import { useState, useEffect } from 'react';
import { 
  Droplets, 
  Eye, 
  EyeOff, 
  Wifi, 
  WifiOff, 
  Loader2,
  Waves
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { UserRole } from '@/types';

interface AuthPageProps {
  onLogin: (email: string, password: string) => boolean;
  onDemoLogin: (role: UserRole) => void;
  isOnline: boolean;
}

export function AuthPage({ onLogin, onDemoLogin, isOnline }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    if (password.length < 1) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = onLogin(email, password);
    if (!success) {
      setError('Identifiants incorrects');
    }
    setIsLoading(false);
  };

  const handleDemoLogin = (role: UserRole) => {
    onDemoLogin(role);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Water Wave Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 opacity-5">
          <Waves className="w-full h-48 text-[#0066CC] animate-wave" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 opacity-5" style={{ animationDelay: '2s' }}>
          <Waves className="w-full h-32 text-[#0066CC] animate-wave" />
        </div>
      </div>

      {/* Offline Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          isOnline 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-orange-100 text-orange-700 border border-orange-200'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>En ligne</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Mode hors ligne</span>
            </>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0066CC] to-[#009CD1] rounded-xl flex items-center justify-center">
                <Droplets className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#1E293B]">ONEA</span>
            </div>
            <h1 className="text-xl font-bold text-[#1E293B] mb-1">
              ONEA-OPT - Optimisation Énergétique
            </h1>
            <p className="text-sm text-gray-500">
              Système d'aide à la décision IA
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#1E293B]">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@onea.bf"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 touch-target ${error ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                aria-label="Adresse email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[#1E293B]">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 touch-target pr-12 ${error ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  aria-label="Mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPassword ? 'Masquer' : 'Afficher'}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-[#0066CC] transition-colors"
              >
                Mot de passe oublié?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold text-base btn-press transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Connexion'
              )}
            </Button>
          </form>

          {/* Demo Mode */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-4 uppercase tracking-wide">
              Mode démonstration
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('technicien')}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors touch-target"
              >
                Technicien
              </button>
              <button
                onClick={() => handleDemoLogin('regional')}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors touch-target"
              >
                Régional
              </button>
              <button
                onClick={() => handleDemoLogin('dg')}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors touch-target"
              >
                DG
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Données confidentielles ONEA - Usage interne uniquement
        </p>
      </div>
    </div>
  );
}
