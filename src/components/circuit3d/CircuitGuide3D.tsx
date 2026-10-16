import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CircuitTrack, TRACK_POINTS } from './CircuitTrack';
import { M7Car } from './M7Car';
import { EVENT_CONFIG } from '../../config/eventConfig';
import { 
  Compass, 
  RotateCcw, 
  Eye, 
  MapPin, 
  Navigation, 
  Download, 
  ArrowLeft,
  Gauge,
  Trophy
} from 'lucide-react';

interface CameraRigProps {
  curve: THREE.CatmullRomCurve3;
  progress: number;
  isOrbitMode: boolean;
}

const CameraRig: React.FC<CameraRigProps> = ({ curve, progress, isOrbitMode }) => {
  useFrame(({ camera }) => {
    if (isOrbitMode) return; // OrbitControls handles camera in orbit mode

    const t = Math.max(0, Math.min(1, progress));
    const carPos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    // Position camera behind and above car
    const cameraOffset = tangent.clone().multiplyScalar(-14).add(new THREE.Vector3(0, 7, 0));
    const targetCameraPos = carPos.clone().add(cameraOffset);

    // Smoothly interpolate camera position
    camera.position.lerp(targetCameraPos, 0.08);

    // Look ahead of the car
    const lookAtTarget = carPos.clone().add(tangent.clone().multiplyScalar(10));
    camera.lookAt(lookAtTarget);
  });

  return null;
};

interface CircuitGuide3DProps {
  onBack: () => void;
}

export const CircuitGuide3D: React.FC<CircuitGuide3DProps> = ({ onBack }) => {
  const [isOrbitMode, setIsOrbitMode] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const orbitRef = useRef<OrbitControlsImpl>(null);

  // Initialize closed 3D CatmullRom track spline
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(TRACK_POINTS, true, 'centripetal', 0.5);
  }, []);

  // Animate car progression along spline
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.99) {
          setIsPlaying(false);
          return 0.99; // Rest at Finish Line Arch & Venue Podium
        }
        return prev + 0.003;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Derived Telemetry Values
  const currentSector = useMemo(() => {
    if (progress < 0.33) return 'SECTOR 1';
    if (progress < 0.70) return 'SECTOR 2';
    return 'FINISH / PODIUM';
  }, [progress]);

  const speed = useMemo(() => {
    if (progress >= 0.98) return 0; // Stopped at Podium
    // Higher speed on straights (e.g. 0.35 - 0.50), lower in corners
    if (progress > 0.30 && progress < 0.50) return 318;
    if (progress > 0.70 && progress < 0.85) return 295;
    return 210 + Math.floor(Math.sin(progress * 20) * 35);
  }, [progress]);

  const gear = useMemo(() => {
    if (speed === 0) return 'N';
    if (speed > 280) return '8';
    if (speed > 240) return '7';
    if (speed > 190) return '5';
    return '3';
  }, [speed]);

  const isDrsActive = speed > 270;

  const handleReplayFlyover = () => {
    setIsOrbitMode(false);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleDownloadSummary = () => {
    const summaryText = `
=====================================================
🏁 M7 GRAND PRIX — OFFICIAL PADDOCK PASS SUMMARY 🏁
=====================================================
CELEBRANT: ${EVENT_CONFIG.celebrantName} (7th Birthday)
EVENT: ${EVENT_CONFIG.eventTitle}
ROUND: ${EVENT_CONFIG.round} • ${EVENT_CONFIG.season}

DATE & TIME:
${EVENT_CONFIG.date}
${EVENT_CONFIG.time}
${EVENT_CONFIG.lightsOutTime}

CIRCUIT & VENUE LOCATION:
${EVENT_CONFIG.venueName}
${EVENT_CONFIG.venueAddress}

NAVIGATION LINKS:
Google Maps: ${EVENT_CONFIG.googleMapsUrl}
Waze: ${EVENT_CONFIG.wazeUrl}

CIRCUIT SECTORS:
- ${EVENT_CONFIG.sectors[0].name} (${EVENT_CONFIG.sectors[0].landmark})
- ${EVENT_CONFIG.sectors[1].name} (${EVENT_CONFIG.sectors[1].landmark})
- ${EVENT_CONFIG.sectors[2].name} (${EVENT_CONFIG.sectors[2].landmark})

WEATHER & TRACK CONDITIONS:
${EVENT_CONFIG.weather.condition} | Track Temp: ${EVENT_CONFIG.weather.trackTemp}
=====================================================
Present this pass at the Paddock Entrance for VIP check-in!
    `.trim();

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `M7_Grand_Prix_Paddock_Pass_${EVENT_CONFIG.celebrantName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-screen bg-[#0F0F16] overflow-hidden flex flex-col select-none">
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 8, -12], fov: 50 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#101018']} />
          <fog attach="fog" args={['#101018', 40, 180]} />

          {/* Ambient & Track Lighting */}
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[40, 60, 20]}
            intensity={1.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={250}
            shadow-camera-left={-70}
            shadow-camera-right={70}
            shadow-camera-top={70}
            shadow-camera-bottom={-70}
          />
          <pointLight position={[0, 15, 0]} intensity={1.2} color="#00D2BE" distance={60} />

          {/* Background Stars / Night Grand Prix Atmosphere */}
          <Stars radius={120} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

          {/* Ground Grass / Runoff Grid Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="#0A0A0E" roughness={0.95} />
          </mesh>

          {/* Procedural Track Ribbon & 3D Markers */}
          <CircuitTrack curve={curve} />

          {/* Stylized M7 F1 Car */}
          <M7Car curve={curve} progress={progress} />

          {/* Camera Rig (Chase Mode) */}
          <CameraRig curve={curve} progress={progress} isOrbitMode={isOrbitMode} />

          {/* Free Orbit Controls Mode */}
          {isOrbitMode && (
            <OrbitControls
              ref={orbitRef}
              enableDamping
              dampingFactor={0.05}
              maxPolarAngle={Math.PI / 2 - 0.05}
              minDistance={10}
              maxDistance={150}
            />
          )}
        </Canvas>
      </div>

      {/* TOP HUD BAR */}
      <div className="relative z-10 w-full p-4 flex items-center justify-between pointer-events-none">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="pointer-events-auto px-3.5 py-2 bg-[#1C1C24]/90 hover:bg-[#252533] border border-[#333345] rounded-lg text-xs font-telemetry font-bold text-white flex items-center gap-2 backdrop-blur-md transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> <span>PADDOCK PASS</span>
        </button>

        {/* F1 Timing Tower Widget (Top Right) */}
        <div className="bg-[#15151E]/90 border border-[#2E2E3E] rounded-lg p-2.5 backdrop-blur-md shadow-2xl flex items-center gap-3 font-telemetry text-xs">
          <div className="px-2 py-1 bg-[#E10600] text-white font-bold rounded text-[11px]">
            P1
          </div>
          <div>
            <div className="font-f1-head font-black text-white uppercase tracking-wider text-xs">
              M. AMARI #07
            </div>
            <div className="text-[10px] text-[#00D2BE] font-bold">
              GAP: LEADER • LAP 7/7
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 border-l border-[#2E2E3E] pl-3">
            <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
            <span className="text-[#A855F7] text-[10px] font-bold">S1: PURPLE</span>
            <span className="w-2 h-2 rounded-full bg-[#A855F7] ml-1" />
            <span className="text-[#A855F7] text-[10px] font-bold">S2: PURPLE</span>
          </div>
        </div>
      </div>

      {/* MIDDLE HUD TELEMETRY BADGE (Top Center) */}
      <div className="relative z-10 mx-auto pointer-events-none">
        <div className="bg-[#15151E]/90 border border-[#2D2D3E] px-4 py-2 rounded-full backdrop-blur-md shadow-lg flex items-center gap-3 font-telemetry text-xs">
          <span className="flex items-center gap-1.5 text-[#FFB800] font-bold">
            <Compass size={14} /> {currentSector}
          </span>
          <span className="text-[#8E8E93]">|</span>
          <span className="text-white">
            {EVENT_CONFIG.venueName}
          </span>
        </div>
      </div>

      {/* BOTTOM HUD CONTROLS & VENUE ACTIONS */}
      <div className="relative z-10 mt-auto p-4 flex flex-col gap-3 pointer-events-none">
        {/* Live Gauges & Camera Mode Switchers */}
        <div className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Speedometer & Gear HUD */}
          <div className="pointer-events-auto bg-[#15151E]/95 border border-[#2E2E3E] p-3 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-4 font-telemetry">
            <div className="flex items-center gap-2">
              <Gauge size={22} className="text-[#00D2BE]" />
              <div>
                <span className="text-[9px] text-[#8E8E93] uppercase block">SPEED</span>
                <span className="font-bold text-xl text-white">
                  {speed} <span className="text-xs text-[#8E8E93]">KM/H</span>
                </span>
              </div>
            </div>

            <div className="border-l border-[#2E2E3E] pl-4">
              <span className="text-[9px] text-[#8E8E93] uppercase block">GEAR</span>
              <span className="font-f1-head font-black text-xl text-[#FFB800]">{gear}</span>
            </div>

            <div className="border-l border-[#2E2E3E] pl-4">
              <span className="text-[9px] text-[#8E8E93] uppercase block">DRS STATUS</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                isDrsActive
                  ? 'bg-[#00D2BE]/20 text-[#00D2BE] border border-[#00D2BE]/40 shadow-[0_0_10px_#00D2BE]'
                  : 'bg-[#252533] text-[#8E8E93]'
              }`}>
                {isDrsActive ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Camera Modes Switcher */}
          <div className="pointer-events-auto bg-[#15151E]/95 border border-[#2E2E3E] p-1.5 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-1 font-telemetry">
            <button
              onClick={handleReplayFlyover}
              className="px-3 py-2 bg-[#252533] hover:bg-[#323244] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Replay cinematic car flyover"
            >
              <RotateCcw size={14} className="text-[#FFB800]" />
              <span>REPLAY FLYOVER</span>
            </button>

            <button
              onClick={() => setIsOrbitMode(!isOrbitMode)}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOrbitMode
                  ? 'bg-[#00D2BE] text-[#15151E] shadow-[0_0_15px_#00D2BE]'
                  : 'bg-[#252533] hover:bg-[#323244] text-white'
              }`}
              title="Toggle free orbit camera rotation"
            >
              <Eye size={14} />
              <span>{isOrbitMode ? 'FREE ORBIT: ON' : 'FREE ORBIT VIEW'}</span>
            </button>
          </div>
            {/* Venue Action Navigation Buttons Bar */}
        <div className="w-full max-w-4xl mx-auto pointer-events-auto bg-[#171722]/95 border-2 border-[#2E2E3E] p-3 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#00D2BE] font-telemetry text-xs font-bold">
              <Trophy size={14} className="text-[#FFB800]" />
              <span>{EVENT_CONFIG.venueName ? `CIRCUIT DESTINATION: ${EVENT_CONFIG.venueName}` : 'VENUE CIRCUIT GUIDE'}</span>
            </div>
            {EVENT_CONFIG.venueAddress ? (
              <p className="text-[11px] text-[#8E8E98] font-telemetry truncate max-w-md">
                {EVENT_CONFIG.venueAddress}
              </p>
            ) : (
              <p className="text-[11px] text-[#8E8E98] font-telemetry">
                November 22, 2026 • Starts at 2:00 PM
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {EVENT_CONFIG.googleMapsUrl && (
              <a
                href={EVENT_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-[#252533] hover:bg-[#303042] text-white font-telemetry text-xs font-bold rounded-lg border border-[#3E3E52] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MapPin size={15} className="text-[#E10600]" />
                <span>GOOGLE MAPS</span>
              </a>
            )}

            {EVENT_CONFIG.wazeUrl && (
              <a
                href={EVENT_CONFIG.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-[#252533] hover:bg-[#303042] text-white font-telemetry text-xs font-bold rounded-lg border border-[#3E3E52] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Navigation size={15} className="text-[#00D2BE]" />
                <span>WAZE</span>
              </a>
            )}

            {/* Download Summary Pass Button */}
            <button
              onClick={handleDownloadSummary}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-[#252533] hover:bg-[#303042] text-white font-telemetry text-xs font-bold rounded-lg border border-[#3E3E52] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Save Event Pass Summary"
            >
              <Download size={14} className="text-[#00D2BE]" />
              <span>SAVE PASS</span>
            </button>

            {/* Back to Invitation Button */}
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#E10600] hover:bg-[#FF1801] text-white font-telemetry text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(225,6,0,0.5)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>INVITATION</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
