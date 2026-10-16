import { useState, useEffect } from 'react';
import { TelemetryLoader } from './components/TelemetryLoader';
import { PaddockPass } from './components/PaddockPass';
import { DriverRegistration } from './components/DriverRegistration';
import { CircuitGuide3D } from './components/circuit3d/CircuitGuide3D';
import { PitWallAdmin } from './components/PitWallAdmin';
import { ShieldAlert } from 'lucide-react';

type ScreenState = 'loader' | 'briefing' | 'registration-attending' | 'registration-dnf' | 'circuit-guide' | 'admin';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
        return 'admin';
      }
    }
    return 'loader';
  });

  // Handle browser URL path changes
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
        setCurrentScreen('admin');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setCurrentScreen('admin');
  };

  const navigateToHome = () => {
    window.history.pushState(null, '', '/');
    setCurrentScreen('briefing');
  };

  return (
    <div className="min-h-screen bg-carbon-pattern text-white selection:bg-[#E10600] selection:text-white relative">
      {/* Screen 1: 5-Lights Telemetry Loader */}
      {currentScreen === 'loader' && (
        <TelemetryLoader onComplete={() => setCurrentScreen('briefing')} />
      )}

      {/* Screen 2: Paddock Pass Event Briefing */}
      {currentScreen === 'briefing' && (
        <PaddockPass
          onConfirmGridSlot={() => setCurrentScreen('registration-attending')}
          onBoxDnf={() => setCurrentScreen('registration-dnf')}
          onExploreCircuit={() => setCurrentScreen('circuit-guide')}
        />
      )}

      {/* Screen 3: Driver Registration (Attending) */}
      {currentScreen === 'registration-attending' && (
        <DriverRegistration
          initialAttending={true}
          onSuccess={() => setCurrentScreen('circuit-guide')}
          onBack={() => setCurrentScreen('briefing')}
        />
      )}

      {/* Screen 3 DNF: Driver Registration (Declining) */}
      {currentScreen === 'registration-dnf' && (
        <DriverRegistration
          initialAttending={false}
          onSuccess={() => setCurrentScreen('briefing')}
          onBack={() => setCurrentScreen('briefing')}
        />
      )}

      {/* Screen 4: 3D Circuit Guide & Venue Reveal */}
      {currentScreen === 'circuit-guide' && (
        <CircuitGuide3D onBack={() => setCurrentScreen('briefing')} />
      )}

      {/* Screen 5: /admin — The Pit Wall Live Telemetry Dashboard */}
      {currentScreen === 'admin' && (
        <PitWallAdmin onBackToApp={navigateToHome} />
      )}

      {/* Subtle Floating Admin Access Trigger (visible outside of loader and admin screen) */}
      {currentScreen !== 'loader' && currentScreen !== 'admin' && (
        <div className="fixed bottom-3 right-3 z-50">
          <button
            onClick={navigateToAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171720]/80 hover:bg-[#1F1F2C] border border-[#303042] rounded-full text-[10px] font-telemetry text-[#8E8E93] hover:text-[#00D2BE] shadow-lg backdrop-blur-sm transition-all cursor-pointer"
            title="Pit Wall Admin Portal (/admin)"
          >
            <ShieldAlert size={12} className="text-[#00D2BE]" />
            <span>PIT WALL ADMIN</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
