import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface M7CarProps {
  curve: THREE.CatmullRomCurve3;
  progress: number; // 0 to 1
  onPositionUpdate?: (pos: THREE.Vector3, tangent: THREE.Vector3) => void;
}

export const M7Car: React.FC<M7CarProps> = ({
  curve,
  progress,
  onPositionUpdate,
}) => {
  const carGroupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);

  useFrame((_, delta) => {
    if (!carGroupRef.current) return;

    // Calculate current point and tangent on spline
    const t = Math.max(0, Math.min(1, progress));
    const position = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    carGroupRef.current.position.copy(position);
    carGroupRef.current.position.y += 0.35; // Lift above asphalt

    // Orient car facing along track tangent
    const lookAtTarget = position.clone().add(tangent);
    carGroupRef.current.lookAt(lookAtTarget);

    // Rotate wheels while car is in motion
    wheelsRef.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x += delta * 24;
      }
    });

    if (onPositionUpdate) {
      onPositionUpdate(position, tangent);
    }
  });

  return (
    <group ref={carGroupRef}>
      {/* Main Monocoque Chassis */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.1, 0.45, 3.2]} />
        <meshStandardMaterial color="#E10600" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Aerodynamic Tapered Nose Cone */}
      <mesh position={[0, 0.18, 2.0]} rotation={[0.12, 0, 0]} castShadow>
        <coneGeometry args={[0.45, 1.6, 4]} />
        <meshStandardMaterial color="#E10600" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Front Wing Assembly */}
      <group position={[0, 0.05, 2.6]}>
        {/* Main Lower Plane */}
        <mesh castShadow>
          <boxGeometry args={[3.0, 0.08, 0.6]} />
          <meshStandardMaterial color="#111118" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Upper Red Flap */}
        <mesh position={[0, 0.1, -0.05]}>
          <boxGeometry args={[2.7, 0.05, 0.35]} />
          <meshStandardMaterial color="#E10600" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Left Endplate */}
        <mesh position={[-1.5, 0.15, 0]}>
          <boxGeometry args={[0.06, 0.4, 0.7]} />
          <meshStandardMaterial color="#E10600" />
        </mesh>
        {/* Right Endplate */}
        <mesh position={[1.5, 0.15, 0]}>
          <boxGeometry args={[0.06, 0.4, 0.7]} />
          <meshStandardMaterial color="#E10600" />
        </mesh>
      </group>

      {/* Sidepods (Air Intakes & Radiator Ducts) */}
      <group position={[0, 0.22, -0.1]}>
        {/* Left Sidepod */}
        <mesh position={[-0.8, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.4, 1.8]} />
          <meshStandardMaterial color="#15151E" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Left Intake Glow */}
        <mesh position={[-0.8, 0.02, 0.91]}>
          <planeGeometry args={[0.45, 0.3]} />
          <meshBasicMaterial color="#00D2BE" />
        </mesh>

        {/* Right Sidepod */}
        <mesh position={[0.8, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.4, 1.8]} />
          <meshStandardMaterial color="#15151E" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Right Intake Glow */}
        <mesh position={[0.8, 0.02, 0.91]}>
          <planeGeometry args={[0.45, 0.3]} />
          <meshBasicMaterial color="#00D2BE" />
        </mesh>
      </group>

      {/* Cockpit & Halo Hoop */}
      <group position={[0, 0.48, 0.2]}>
        {/* Cockpit Hole Opening */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.6, 0.15, 0.9]} />
          <meshStandardMaterial color="#08080C" />
        </mesh>

        {/* Driver Helmet */}
        <mesh position={[0, 0.12, -0.05]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#00D2BE" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Helmet Visor (Gold) */}
        <mesh position={[0, 0.14, 0.1]}>
          <boxGeometry args={[0.26, 0.09, 0.12]} />
          <meshStandardMaterial color="#FFB800" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Halo Protection Hoop */}
        <mesh position={[0, 0.22, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.04, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#111118" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.14, 0.4]}>
          <cylinderGeometry args={[0.035, 0.035, 0.26]} />
          <meshStandardMaterial color="#111118" />
        </mesh>
      </group>

      {/* Rear Wing Assembly with DRS Flap */}
      <group position={[0, 0.7, -1.7]}>
        {/* Main Dual Wing Flaps */}
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.1, 0.5]} />
          <meshStandardMaterial color="#E10600" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.2, -0.05]}>
          <boxGeometry args={[2.2, 0.08, 0.4]} />
          <meshStandardMaterial color="#111118" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Left Endplate */}
        <mesh position={[-1.1, 0.05, 0]}>
          <boxGeometry args={[0.06, 0.65, 0.7]} />
          <meshStandardMaterial color="#E10600" />
        </mesh>
        {/* Right Endplate */}
        <mesh position={[1.1, 0.05, 0]}>
          <boxGeometry args={[0.06, 0.65, 0.7]} />
          <meshStandardMaterial color="#E10600" />
        </mesh>
        {/* Dual Support Pylons */}
        <mesh position={[-0.3, -0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8]} />
          <meshStandardMaterial color="#22222E" />
        </mesh>
        <mesh position={[0.3, -0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8]} />
          <meshStandardMaterial color="#22222E" />
        </mesh>
        {/* Rear Rain Safety Light (flashing red) */}
        <mesh position={[0, -0.35, -0.2]}>
          <boxGeometry args={[0.15, 0.15, 0.05]} />
          <meshBasicMaterial color="#FF0000" />
        </mesh>
      </group>

      {/* 4 Wheels with Soft Pirelli-Style Red Sidewall Bands */}
      {[
        { id: 0, x: -1.2, z: 1.3, r: 0.38, w: 0.4 },  // Front Left
        { id: 1, x: 1.2, z: 1.3, r: 0.38, w: 0.4 },   // Front Right
        { id: 2, x: -1.3, z: -1.1, r: 0.44, w: 0.5 }, // Rear Left
        { id: 3, x: 1.3, z: -1.1, r: 0.44, w: 0.5 },  // Rear Right
      ].map((wheelCfg) => (
        <group
          key={wheelCfg.id}
          ref={(el) => {
            if (el) wheelsRef.current[wheelCfg.id] = el;
          }}
          position={[wheelCfg.x, wheelCfg.r - 0.25, wheelCfg.z]}
        >
          {/* Rubber Tire Cylinder */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[wheelCfg.r, wheelCfg.r, wheelCfg.w, 24]} />
            <meshStandardMaterial color="#15151A" roughness={0.9} />
          </mesh>

          {/* Red Soft-Compound Sidewall Stripe */}
          <mesh position={[wheelCfg.x > 0 ? wheelCfg.w / 2 + 0.005 : -wheelCfg.w / 2 - 0.005, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[wheelCfg.r * 0.65, wheelCfg.r * 0.82, 24]} />
            <meshBasicMaterial color="#E10600" side={THREE.DoubleSide} />
          </mesh>

          {/* Central Wheel Rim Hub */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[wheelCfg.r * 0.48, wheelCfg.r * 0.48, wheelCfg.w + 0.02, 16]} />
            <meshStandardMaterial color="#2E2E3A" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
