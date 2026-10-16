import { useState } from 'react';
import { TelemetryLoader } from './components/TelemetryLoader';
import { M7Logo } from './components/M7Logo';
import { EVENT_CONFIG } from './config/eventConfig';

function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  if (!hasStarted) {
    return <TelemetryLoader onComplete={() => setHasStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-carbon-pattern text-white flex flex-col items-center justify-center p-6">
      <M7Logo size="lg" showSubtitle={true} animated={false} />
      <div className="mt-8 p-6 bg-[#1F1F27] border border-[#2D2D3A] rounded-xl text-center max-w-lg">
        <h1 className="font-f1-head text-2xl text-[#E10600] font-black">{EVENT_CONFIG.eventTitle}</h1>
        <p className="font-telemetry text-sm text-[#8E8E93] mt-2">Paddock Pass Loaded Successfully.</p>
        <button
          onClick={() => setHasStarted(false)}
          className="mt-6 px-4 py-2 bg-[#E10600] text-white font-telemetry rounded font-bold text-xs hover:bg-[#FF1801] cursor-pointer"
        >
          REPLAY STARTING LIGHTS SEQUENCE
        </button>
      </div>
    </div>
  );
}

export default App;
