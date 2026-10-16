import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { EVENT_CONFIG } from '../../config/eventConfig';
import { MapPin, Flag, Trophy } from 'lucide-react';

export const TRACK_POINTS = [
  new THREE.Vector3(0, 0, 0),         // Start / Grid
  new THREE.Vector3(25, 0, -10),      // Turn 1 Fast Sweeper
  new THREE.Vector3(50, 0, -30),      // S1 Apex
  new THREE.Vector3(80, 0, -25),      // S1 Landmark
  new THREE.Vector3(95, 0, 10),       // DRS Straight 1
  new THREE.Vector3(75, 0, 45),       // S2 Chicane Entry
  new THREE.Vector3(45, 0, 60),       // S2 Landmark (Game Arena)
  new THREE.Vector3(10, 0, 50),       // Hairpin
  new THREE.Vector3(-25, 0, 35),      // Straight 2
  new THREE.Vector3(-45, 0, 15),      // Stadium Complex
  new THREE.Vector3(-25, 0, -5),      // Final Corner
  new THREE.Vector3(0, 0, 0),         // Finish Line Arch / Venue
];

interface CircuitTrackProps {
  curve: THREE.CatmullRomCurve3;
}

export const CircuitTrack: React.FC<CircuitTrackProps> = ({ curve }) => {
  // Generate high-resolution extruded ribbon road mesh
  const { roadGeometry, racingLineGeometry, kerbsGeometry } = useMemo(() => {
    const segments = 240;
    const roadWidth = 5.5;
    const kerbWidth = 1.0;

    const roadPositions: number[] = [];
    const roadIndices: number[] = [];
    const kerbPositions: number[] = [];
    const kerbColors: number[] = [];
    const racingLinePositions: number[] = [];

    const redColor = new THREE.Color('#E10600');
    const whiteColor = new THREE.Color('#FFFFFF');

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Road left and right vertices
      const leftPoint = point.clone().add(normal.clone().multiplyScalar(roadWidth / 2));
      const rightPoint = point.clone().sub(normal.clone().multiplyScalar(roadWidth / 2));

      roadPositions.push(leftPoint.x, 0.05, leftPoint.z);
      roadPositions.push(rightPoint.x, 0.05, rightPoint.z);

      // Racing Line point (elevated slightly with glowing line)
      racingLinePositions.push(point.x, 0.12, point.z);

      // Kerb blocks alternating red and white on outer edge
      const kerbOuter = leftPoint.clone().add(normal.clone().multiplyScalar(kerbWidth));
      kerbPositions.push(leftPoint.x, 0.1, leftPoint.z);
      kerbPositions.push(kerbOuter.x, 0.1, kerbOuter.z);

      const isRed = Math.floor(i / 3) % 2 === 0;
      const col = isRed ? redColor : whiteColor;
      kerbColors.push(col.r, col.g, col.b);
      kerbColors.push(col.r, col.g, col.b);

      if (i < segments) {
        const base = i * 2;
        // Two triangles for quad road segment
        roadIndices.push(base, base + 1, base + 2);
        roadIndices.push(base + 1, base + 3, base + 2);
      }
    }

    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
    roadGeo.setIndex(roadIndices);
    roadGeo.computeVertexNormals();

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(racingLinePositions, 3));

    const kerbGeo = new THREE.BufferGeometry();
    kerbGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerbPositions, 3));
    kerbGeo.setAttribute('color', new THREE.Float32BufferAttribute(kerbColors, 3));
    // Index kerb strip quads
    const kerbIndices: number[] = [];
    for (let i = 0; i < segments; i++) {
      const base = i * 2;
      kerbIndices.push(base, base + 1, base + 2);
      kerbIndices.push(base + 1, base + 3, base + 2);
    }
    kerbGeo.setIndex(kerbIndices);
    kerbGeo.computeVertexNormals();

    return { roadGeometry: roadGeo, racingLineGeometry: lineGeo, kerbsGeometry: kerbGeo };
  }, [curve]);

  // Sector 1, Sector 2, and Finish Line 3D Landmark Positions
  const pS1 = useMemo(() => curve.getPointAt(0.28), [curve]);
  const pS2 = useMemo(() => curve.getPointAt(0.58), [curve]);
  const pFinish = useMemo(() => curve.getPointAt(0.98), [curve]);

  return (
    <group>
      {/* Asphalt Surface */}
      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial
          color="#1A1A22"
          roughness={0.8}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer Kerb Strip */}
      <mesh geometry={kerbsGeometry}>
        <meshStandardMaterial
          vertexColors
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing DRS Racing Line */}
      <primitive object={useMemo(() => new THREE.Line(racingLineGeometry, new THREE.LineBasicMaterial({ color: 0x00D2BE })), [racingLineGeometry])} />

      {/* Starting Grid Boxes on Asphalt */}
      <group position={[0, 0.08, 0]}>
        {[-3, -8, -13].map((zOffset, idx) => (
          <mesh key={idx} position={[idx % 2 === 0 ? 1.5 : -1.5, 0, zOffset]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.2, 3]} />
            <meshBasicMaterial color="#FFFFFF" wireframe />
          </mesh>
        ))}
      </group>

      {/* 3D Checkered Finish Arch at the Birthday Venue */}
      <group position={[pFinish.x, pFinish.y, pFinish.z]}>
        {/* Left Pillar */}
        <mesh position={[-3.5, 3, 0]}>
          <boxGeometry args={[0.5, 6, 0.5]} />
          <meshStandardMaterial color="#E10600" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Right Pillar */}
        <mesh position={[3.5, 3, 0]}>
          <boxGeometry args={[0.5, 6, 0.5]} />
          <meshStandardMaterial color="#E10600" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Top Crossbar */}
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[7.5, 1, 0.6]} />
          <meshStandardMaterial color="#111118" metalness={0.6} roughness={0.2} />
        </mesh>
        {/* Checkered Banner on Crossbar */}
        <mesh position={[0, 6, 0.35]}>
          <planeGeometry args={[7.2, 0.8]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#333333" />
        </mesh>

        {/* Celebratory Podium Podium Marker */}
        <mesh position={[0, 0.5, 4]}>
          <cylinderGeometry args={[2.5, 2.8, 1, 16]} />
          <meshStandardMaterial color="#FFB800" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Floating 3D HTML Venue Pin Banner */}
        <Html position={[0, 7.8, 0]} center distanceFactor={28}>
          <div className="bg-[#1C1C24]/95 border-2 border-[#E10600] text-white px-3 py-1.5 rounded-lg shadow-[0_0_25px_rgba(225,6,0,0.8)] backdrop-blur-md flex items-center gap-2 whitespace-nowrap select-none pointer-events-none">
            <Trophy size={16} className="text-[#FFB800] animate-bounce" />
            <div>
              <span className="text-[10px] font-telemetry text-[#00D2BE] block font-bold">
                FINISH LINE & PODIUM
              </span>
              <span className="font-f1-head text-xs font-black uppercase text-white">
                {EVENT_CONFIG.venueName}
              </span>
            </div>
          </div>
        </Html>
      </group>

      {/* Floating 3D HTML Sector 1 Callout */}
      <Html position={[pS1.x, pS1.y + 4.5, pS1.z]} center distanceFactor={30}>
        <div className="bg-[#1C1C24]/90 border border-[#00D2BE] text-white px-3 py-1 rounded-md shadow-lg backdrop-blur-sm flex items-center gap-2 whitespace-nowrap select-none pointer-events-none">
          <Flag size={14} className="text-[#00D2BE]" />
          <div>
            <span className="text-[9px] font-telemetry text-[#00D2BE] block font-bold">SECTOR 1</span>
            <span className="font-f1-head text-[11px] font-bold uppercase">{EVENT_CONFIG.sectors[0].name}</span>
          </div>
        </div>
      </Html>

      {/* Floating 3D HTML Sector 2 Callout */}
      <Html position={[pS2.x, pS2.y + 4.5, pS2.z]} center distanceFactor={30}>
        <div className="bg-[#1C1C24]/90 border border-[#FFB800] text-white px-3 py-1 rounded-md shadow-lg backdrop-blur-sm flex items-center gap-2 whitespace-nowrap select-none pointer-events-none">
          <MapPin size={14} className="text-[#FFB800]" />
          <div>
            <span className="text-[9px] font-telemetry text-[#FFB800] block font-bold">SECTOR 2</span>
            <span className="font-f1-head text-[11px] font-bold uppercase">{EVENT_CONFIG.sectors[1].name}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};
