import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { VENUE_ROUTES } from '../../config/routesConfig';
import { RouteRoad3D } from './RouteRoad3D';
import { LandmarkMarker3D } from './LandmarkMarker3D';
import { M7Car } from './M7Car';
import { RouteCameraRig } from './RouteCameraRig';
import { RouteTelemetryHUD } from './RouteTelemetryHUD';
import { RouteArrivalCard } from './RouteArrivalCard';

interface CircuitGuide3DProps {
  onBack: () => void;
}

export const CircuitGuide3D: React.FC<CircuitGuide3DProps> = ({ onBack }) => {
  const [selectedRouteId, setSelectedRouteId] = useState<'route-1' | 'route-2' | 'route-3'>('route-1');
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isOrbitMode, setIsOrbitMode] = useState<boolean>(false);
  const [showArrivalCard, setShowArrivalCard] = useState<boolean>(false);
  const orbitRef = useRef<OrbitControlsImpl>(null);

  // Active route definition
  const activeRoute = useMemo(() => {
    return VENUE_ROUTES.find((r) => r.id === selectedRouteId) || VENUE_ROUTES[0];
  }, [selectedRouteId]);

  // Construct 3D CatmullRom spline curve from route waypoints
  const curve = useMemo(() => {
    const vectors = activeRoute.splinePoints.map(
      ([x, y, z]) => new THREE.Vector3(x, y, z)
    );
    // Open curve (false) so it's a realistic road from start point to destination
    return new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.5);
  }, [activeRoute]);

  // Reset progress when switching routes
  const handleSelectRoute = (routeId: 'route-1' | 'route-2' | 'route-3') => {
    setSelectedRouteId(routeId);
    setProgress(0);
    setIsPlaying(true);
    setShowArrivalCard(false);
  };

  // Landmark proximity detection for Slow-Motion effect
  const SLOW_MO_WINDOW = 0.035; // Proximity threshold along spline
  const { isSlowMo, activeLandmark } = useMemo(() => {
    for (const lm of activeRoute.landmarks) {
      if (Math.abs(progress - lm.t) <= SLOW_MO_WINDOW) {
        return { isSlowMo: true, activeLandmark: lm };
      }
    }
    return { isSlowMo: false, activeLandmark: null };
  }, [activeRoute, progress]);

  // Animate car progression along the spline with dynamic slow-motion speeds
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.985) {
          setIsPlaying(false);
          setShowArrivalCard(true);
          return 1.0;
        }

        // When nearing a landmark, slow down progression speed by 75% for dramatic slow-mo
        const speedStep = isSlowMo ? 0.0007 : 0.0024;
        return Math.min(1.0, prev + speedStep);
      });
    }, 28);

    return () => clearInterval(interval);
  }, [isPlaying, isSlowMo]);

  const handleReplay = () => {
    setProgress(0);
    setIsPlaying(true);
    setShowArrivalCard(false);
    setIsOrbitMode(false);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#07070D] overflow-hidden flex flex-col select-none">
      {/* 1. 3D WebGL Canvas Layer (F1 Night/Dusk Grand Prix Atmosphere) */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 8, -18], fov: 50, near: 0.1, far: 1200 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          {/* Night Sky Gradient & Distant F1 Track Stars */}
          <color attach="background" args={['#080811']} />
          <fog attach="fog" args={['#080811', 40, 320]} />
          <Stars radius={180} depth={60} count={1200} factor={3} saturation={0.5} fade />

          {/* Ambient & Track Floodlights */}
          <ambientLight intensity={0.5} color="#B4C6FF" />
          <directionalLight
            position={[50, 80, 40]}
            intensity={1.2}
            color="#FFFFFF"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[0, 30, 0]} intensity={25} color="#00D2BE" distance={150} />

          {/* 3D Road Mesh for Active Route */}
          <RouteRoad3D curve={curve} accentColor={activeRoute.color} />

          {/* 3D Overhead Gantries & Waypoint Beacons */}
          <LandmarkMarker3D landmarks={activeRoute.landmarks} curve={curve} />

          {/* M7 Formula 1 Car moving along the route spline */}
          <M7Car curve={curve} progress={progress} />

          {/* Dynamic Chase Camera with Slow-Mo Pivot & Lerp */}
          <RouteCameraRig
            curve={curve}
            progress={progress}
            isOrbitMode={isOrbitMode}
            activeLandmark={activeLandmark}
            isSlowMo={isSlowMo}
          />

          {/* Orbit Controls (Active when in Orbit View mode) */}
          {isOrbitMode && (
            <OrbitControls
              ref={orbitRef}
              enableDamping
              dampingFactor={0.05}
              maxPolarAngle={Math.PI / 2.05}
              minDistance={8}
              maxDistance={180}
            />
          )}
        </Canvas>
      </div>

      {/* 2. Live F1 Telemetry HUD, Route Switcher & Slow-Motion Indicator */}
      <RouteTelemetryHUD
        routes={VENUE_ROUTES}
        activeRoute={activeRoute}
        onSelectRoute={handleSelectRoute}
        progress={progress}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReplay={handleReplay}
        isOrbitMode={isOrbitMode}
        onToggleOrbit={() => setIsOrbitMode(!isOrbitMode)}
        activeLandmark={activeLandmark}
        isSlowMo={isSlowMo}
        onBack={onBack}
      />

      {/* 3. Arrival Celebration Modal (When arriving at JSH Events Place) */}
      {showArrivalCard && (
        <RouteArrivalCard
          onReplay={handleReplay}
          onBack={onBack}
        />
      )}
    </div>
  );
};
