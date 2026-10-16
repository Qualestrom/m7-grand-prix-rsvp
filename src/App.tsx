import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen bg-carbon-pattern text-white selection:bg-[#E10600] selection:text-white relative overflow-x-hidden">
      {/* Animated Screen Transitions */}
      <AnimatePresence mode="wait">
        {currentScreen === 'loader' && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <TelemetryLoader onComplete={() => setCurrentScreen('briefing')} />
          </motion.div>
        )}

        {currentScreen === 'briefing' && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <PaddockPass
              onConfirmGridSlot={() => setCurrentScreen('registration-attending')}
              onBoxDnf={() => setCurrentScreen('registration-dnf')}
            />
          </motion.div>
        )}

        {currentScreen === 'registration-attending' && (
          <motion.div
            key="registration-attending"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <DriverRegistration
              initialAttending={true}
              onSuccess={() => setCurrentScreen('circuit-guide')}
              onBack={() => setCurrentScreen('briefing')}
            />
          </motion.div>
        )}

        {currentScreen === 'registration-dnf' && (
          <motion.div
            key="registration-dnf"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <DriverRegistration
              initialAttending={false}
              onSuccess={() => setCurrentScreen('briefing')}
              onBack={() => setCurrentScreen('briefing')}
            />
          </motion.div>
        )}

        {currentScreen === 'circuit-guide' && (
          <motion.div
            key="circuit-guide"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <CircuitGuide3D onBack={() => setCurrentScreen('briefing')} />
          </motion.div>
        )}

        {currentScreen === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PitWallAdmin onBackToApp={navigateToHome} />
          </motion.div>
        )}
      </AnimatePresence>

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
