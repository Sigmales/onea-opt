import { useState, useEffect } from 'react';
import { AuthPage } from './sections/AuthPage';
import { TechnicienDashboard } from './sections/TechnicienDashboard';
import { OptimisationModule } from './sections/OptimisationModule';
import { AnomaliesModule } from './sections/AnomaliesModule';
import { RegionalDashboard } from './sections/RegionalDashboard';
import { DGDashboard } from './sections/DGDashboard';
import { LandingPage } from './sections/LandingPage';
import { useAuth } from './hooks/useAuth';
import type { UserRole } from './types';

// Navigation component for logged-in users
function Navigation({ 
  currentView, 
  setCurrentView, 
  userRole 
}: { 
  currentView: string; 
  setCurrentView: (view: string) => void;
  userRole: UserRole;
}) {
  const navItems: { id: string; label: string; roles: UserRole[] }[] = [
    { id: 'dashboard', label: 'Dashboard', roles: ['technicien', 'regional', 'dg'] },
    { id: 'optimisation', label: 'Optimisation', roles: ['technicien', 'regional', 'dg'] },
    { id: 'anomalies', label: 'Anomalies', roles: ['technicien', 'regional', 'dg'] },
    { id: 'regional', label: 'Vue Régionale', roles: ['regional', 'dg'] },
    { id: 'dg', label: 'Vue DG', roles: ['dg'] },
  ];

  const availableItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0066CC] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="font-bold text-[#1E293B]">ONEA-OPT</span>
          </div>
          
          <div className="flex items-center gap-1">
            {availableItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-[#0066CC] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Main App Content
function AppContent() {
  const { user, isOnline, login, demoLogin, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);

  // Handle demo start from landing page
  const handleStartDemo = () => {
    setShowLanding(false);
  };

  // Handle demo login
  const handleDemoLogin = (role: UserRole) => {
    demoLogin(role);
    // Set default view based on role
    if (role === 'dg') {
      setCurrentView('dg');
    } else if (role === 'regional') {
      setCurrentView('regional');
    } else {
      setCurrentView('dashboard');
    }
  };

  // Show landing page
  if (showLanding) {
    return <LandingPage onStartDemo={handleStartDemo} />;
  }

  // Show auth page if not logged in
  if (!user) {
    return (
      <AuthPage 
        onLogin={login} 
        onDemoLogin={handleDemoLogin}
        isOnline={isOnline}
      />
    );
  }

  // Show appropriate dashboard based on role and view
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <TechnicienDashboard user={user} onLogout={logout} isOnline={isOnline} />;
      case 'optimisation':
        return <OptimisationModule />;
      case 'anomalies':
        return <AnomaliesModule />;
      case 'regional':
        if (user.role === 'regional' || user.role === 'dg') {
          return <RegionalDashboard />;
        }
        return <TechnicienDashboard user={user} onLogout={logout} isOnline={isOnline} />;
      case 'dg':
        if (user.role === 'dg') {
          return <DGDashboard />;
        }
        return <RegionalDashboard />;
      default:
        return <TechnicienDashboard user={user} onLogout={logout} isOnline={isOnline} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        userRole={user.role}
      />
      <div className="pt-16">
        {renderContent()}
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth initial render
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0066CC] rounded-lg flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#1E293B]">ONEA-OPT</span>
        </div>
      </div>
    );
  }

  return <AppContent />;
}

export default App;
