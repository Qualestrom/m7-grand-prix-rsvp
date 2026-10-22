import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TelemetryLoader } from './components/TelemetryLoader';
import { PaddockPass } from './components/PaddockPass';
import { CircuitGuide3D } from './components/circuit3d/CircuitGuide3D';
import { PitWallAdmin } from './components/PitWallAdmin';
import { DramaticIntro } from './components/DramaticIntro';
import { AudioController } from './components/AudioController';

type ScreenState = 'loader' | 'dramatic-intro' | 'briefing' | 'circuit-guide' | 'admin';

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

  // Konami Code listener to unlock Pit Wall Admin
  // Sequence: Up, Up, Down, Down, Left, Right, Left, Right, B, A, Enter
  useEffect(() => {
    let konamiIndex = 0;
    const KONAMI_SEQUENCE = [
      'arrowup',
      'arrowup',
      'arrowdown',
      'arrowdown',
      'arrowleft',
      'arrowright',
      'arrowleft',
      'arrowright',
      'b',
      'a',
      'enter',
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === KONAMI_SEQUENCE[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI_SEQUENCE.length) {
          konamiIndex = 0;
          navigateToAdmin();
        }
      } else {
        konamiIndex = key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-carbon-pattern text-white selection:bg-[#E10600] selection:text-white relative overflow-x-hidden">
      {/* Global F1 Soundtrack Controller */}
      <AudioController />

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
            <TelemetryLoader onComplete={() => setCurrentScreen('dramatic-intro')} />
          </motion.div>
        )}

        {currentScreen === 'dramatic-intro' && (
          <motion.div
            key="dramatic-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <DramaticIntro onComplete={() => setCurrentScreen('briefing')} />
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
            <PaddockPass onNavigateToAdmin={navigateToAdmin} />
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
    </div>
  );
}

export default App;
