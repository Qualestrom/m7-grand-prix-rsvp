import { useState } from 'react';
import { TelemetryLoader } from './components/TelemetryLoader';
import { PaddockPass } from './components/PaddockPass';
import { DriverRegistration } from './components/DriverRegistration';
import { CircuitGuide3D } from './components/circuit3d/CircuitGuide3D';

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

      {currentScreen === 'circuit-guide' && (
        <CircuitGuide3D onBack={() => setCurrentScreen('briefing')} />
      )}
    </div>
  );
}

export default App;
