import React, { useMemo } from 'react';
import * as THREE from 'three';
import { EVENT_CONFIG } from '../../config/eventConfig';

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

// Helper to create pure WebGL 3D billboard sign textures (zero React 19 DOM portal unmount conflicts)
function createBillboardTexture(title: string, subtitle: string, accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 180;
  const ctx = canvas.getContext('2d')!;

  // Background panel
  ctx.fillStyle = '#161622';
  if (ctx.roundRect) {
    ctx.roundRect(6, 6, 500, 168, 16);
  } else {
    ctx.rect(6, 6, 500, 168);
  }
  ctx.fill();

  // Accent border
  ctx.lineWidth = 8;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  // Top header text
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(title.toUpperCase(), 24, 46);

  // Subtitle / Landmark text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(subtitle.toUpperCase().slice(0, 26), 24, 98);

  // Bottom brand strip
  ctx.fillStyle = '#8E8E93';
  ctx.font = '16px monospace';
  ctx.fillText('M7 GRAND PRIX • OFFICIAL VENUE CIRCUIT', 24, 142);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

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

  // Pure WebGL Billboard Textures
  const s1Texture = useMemo(() => createBillboardTexture('SECTOR 1 LANDMARK', EVENT_CONFIG.sectors[0].name, '#00D2BE'), []);
  const s2Texture = useMemo(() => createBillboardTexture('SECTOR 2 LANDMARK', EVENT_CONFIG.sectors[1].name, '#FFB800'), []);
  const finishTexture = useMemo(() => createBillboardTexture('FINISH PODIUM // VENUE', EVENT_CONFIG.venueName, '#E10600'), []);

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

        {/* Celebratory Podium Marker */}
        <mesh position={[0, 0.5, 4]}>
          <cylinderGeometry args={[2.5, 2.8, 1, 16]} />
          <meshStandardMaterial color="#FFB800" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* 3D Native WebGL Finish Line Billboard Sign */}
        <mesh position={[0, 8.2, 0]}>
          <planeGeometry args={[7.5, 2.6]} />
          <meshBasicMaterial map={finishTexture} transparent side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3D Native WebGL Sector 1 Billboard Sign */}
      <group position={[pS1.x, pS1.y + 4.5, pS1.z]}>
        <mesh>
          <planeGeometry args={[6.5, 2.3]} />
          <meshBasicMaterial map={s1Texture} transparent side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -2.4, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.6]} />
          <meshStandardMaterial color="#333345" />
        </mesh>
      </group>

      {/* 3D Native WebGL Sector 2 Billboard Sign */}
      <group position={[pS2.x, pS2.y + 4.5, pS2.z]}>
        <mesh>
          <planeGeometry args={[6.5, 2.3]} />
          <meshBasicMaterial map={s2Texture} transparent side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -2.4, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.6]} />
          <meshStandardMaterial color="#333345" />
        </mesh>
      </group>
    </group>
  );
};
