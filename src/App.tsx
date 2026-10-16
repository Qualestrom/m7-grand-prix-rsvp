import { useState } from 'react';
import { TelemetryLoader } from './components/TelemetryLoader';
import { PaddockPass } from './components/PaddockPass';
import { DriverRegistration } from './components/DriverRegistration';

type ScreenState = 'loader' | 'briefing' | 'registration-attending' | 'registration-dnf' | 'circuit-guide';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('loader');

  return (
    <div className="min-h-screen bg-carbon-pattern text-white selection:bg-[#E10600] selection:text-white">
      {currentScreen === 'loader' && (
        <TelemetryLoader onComplete={() => setCurrentScreen('briefing')} />
      )}

      {currentScreen === 'briefing' && (
        <PaddockPass
          onConfirmGridSlot={() => setCurrentScreen('registration-attending')}
          onBoxDnf={() => setCurrentScreen('registration-dnf')}
          onExploreCircuit={() => setCurrentScreen('circuit-guide')}
        />
      )}

      {currentScreen === 'registration-attending' && (
        <DriverRegistration
          initialAttending={true}
          onSuccess={() => setCurrentScreen('circuit-guide')}
          onBack={() => setCurrentScreen('briefing')}
        />
      )}

      {currentScreen === 'registration-dnf' && (
        <DriverRegistration
          initialAttending={false}
          onSuccess={() => setCurrentScreen('briefing')}
          onBack={() => setCurrentScreen('briefing')}
        />
      )}

      {/* Screen placeholder for Batch 5 */}
      {currentScreen === 'circuit-guide' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-f1-head text-2xl text-[#00D2BE]">3D Circuit Guide & Venue Reveal</h2>
          <p className="font-telemetry text-sm text-[#8E8E93] mt-2">Loading Screen 4 (Batch 5)...</p>
          <button
            onClick={() => setCurrentScreen('briefing')}
            className="mt-4 px-4 py-2 bg-[#252533] text-white font-telemetry rounded text-xs cursor-pointer hover:bg-[#323244]"
          >
            ← Back to Paddock Pass
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
