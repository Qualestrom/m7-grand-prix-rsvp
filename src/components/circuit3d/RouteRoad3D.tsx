import React, { useMemo } from 'react';
import * as THREE from 'three';

interface RouteRoad3DProps {
  curve: THREE.CatmullRomCurve3;
  accentColor?: string;
}

export const RouteRoad3D: React.FC<RouteRoad3DProps> = ({
  curve,
  accentColor = '#E10600',
}) => {
  // 1. Procedural Asphalt Road Ribbon Geometry
  const { roadGeo, centerLineGeo, kerbGeoLeft, kerbGeoRight } = useMemo(() => {
    const numPoints = 240;
    const roadWidth = 9.0;
    const halfWidth = roadWidth / 2;
    const kerbWidth = 1.2;
    const cWidth = 0.18;

    const points = curve.getPoints(numPoints);

    // Positions arrays
    const roadPositions: number[] = [];
    const roadNormals: number[] = [];
    const roadUvs: number[] = [];
    const roadIndices: number[] = [];

    const centerPositions: number[] = [];
    const kerbLeftPositions: number[] = [];
    const kerbRightPositions: number[] = [];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const t = i / (points.length - 1);
      const tangent = curve.getTangentAt(t).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Road left and right edges
      const leftEdge = p.clone().add(right.clone().multiplyScalar(-halfWidth));
      const rightEdge = p.clone().add(right.clone().multiplyScalar(halfWidth));

      // Push vertices (Road)
      roadPositions.push(leftEdge.x, leftEdge.y + 0.05, leftEdge.z);
      roadPositions.push(rightEdge.x, rightEdge.y + 0.05, rightEdge.z);

      roadNormals.push(0, 1, 0);
      roadNormals.push(0, 1, 0);

      roadUvs.push(0, t * 40);
      roadUvs.push(1, t * 40);

      // Center line ribbon
      const cLeft = p.clone().add(right.clone().multiplyScalar(-cWidth));
      const cRight = p.clone().add(right.clone().multiplyScalar(cWidth));
      centerPositions.push(cLeft.x, cLeft.y + 0.07, cLeft.z);
      centerPositions.push(cRight.x, cRight.y + 0.07, cRight.z);

      // Kerb outer edges
      const kerbLeftOuter = leftEdge.clone().add(right.clone().multiplyScalar(-kerbWidth));
      const kerbRightOuter = rightEdge.clone().add(right.clone().multiplyScalar(kerbWidth));

      kerbLeftPositions.push(kerbLeftOuter.x, kerbLeftOuter.y + 0.1, kerbLeftOuter.z);
      kerbLeftPositions.push(leftEdge.x, leftEdge.y + 0.06, leftEdge.z);

      kerbRightPositions.push(rightEdge.x, rightEdge.y + 0.06, rightEdge.z);
      kerbRightPositions.push(kerbRightOuter.x, kerbRightOuter.y + 0.1, kerbRightOuter.z);

      if (i < points.length - 1) {
        const base = i * 2;
        // Two triangles for quad
        roadIndices.push(base, base + 1, base + 2);
        roadIndices.push(base + 1, base + 3, base + 2);
      }
    }

    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
    rGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
    rGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    rGeo.setIndex(roadIndices);

    const cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute('position', new THREE.Float32BufferAttribute(centerPositions, 3));
    cGeo.setIndex(roadIndices);

    const klGeo = new THREE.BufferGeometry();
    klGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerbLeftPositions, 3));
    klGeo.setIndex(roadIndices);

    const krGeo = new THREE.BufferGeometry();
    krGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerbRightPositions, 3));
    krGeo.setIndex(roadIndices);

    return {
      roadGeo: rGeo,
      centerLineGeo: cGeo,
      kerbGeoLeft: klGeo,
      kerbGeoRight: krGeo,
    };
  }, [curve]);

  // 2. Streetlights spaced along the route
  const streetLamps = useMemo(() => {
    const lamps: { pos: THREE.Vector3; rotY: number }[] = [];
    const count = 28;
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      const isRightSide = i % 2 === 0;
      const offset = right.clone().multiplyScalar(isRightSide ? 6.5 : -6.5);
      const lampPos = p.clone().add(offset);
      const rotY = Math.atan2(tangent.x, tangent.z) + (isRightSide ? Math.PI / 2 : -Math.PI / 2);
      lamps.push({ pos: lampPos, rotY });
    }
    return lamps;
  }, [curve]);

  return (
    <group>
      {/* Asphalt Surface */}
      <mesh geometry={roadGeo} receiveShadow>
        <meshStandardMaterial
          color="#14141E"
          roughness={0.88}
          metalness={0.12}
        />
      </mesh>

      {/* Central Yellow Road Ribbon */}
      <mesh geometry={centerLineGeo}>
        <meshBasicMaterial color="#FFB800" />
      </mesh>

      {/* Left Racing Kerb */}
      <mesh geometry={kerbGeoLeft}>
        <meshStandardMaterial
          color={accentColor}
          roughness={0.7}
        />
      </mesh>

      {/* Right Racing Kerb */}
      <mesh geometry={kerbGeoRight}>
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.7}
        />
      </mesh>

      {/* Street Lamps casting ambient night pools */}
      {streetLamps.map((lamp, idx) => (
        <group key={`lamp-${idx}`} position={lamp.pos} rotation={[0, lamp.rotY, 0]}>
          {/* Lamp Post */}
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 7, 8]} />
            <meshStandardMaterial color="#2A2A38" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Overhanging Arm */}
          <mesh position={[0.6, 6.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.06, 0.06, 1.6, 8]} />
            <meshStandardMaterial color="#2A2A38" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Luminaire Glow Bulb */}
          <mesh position={[1.1, 7.1, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshBasicMaterial color="#FFFAEE" />
          </mesh>
        </group>
      ))}

      {/* Subtle Cyber-Grid Ground Floor */}
      <gridHelper
        args={[800, 120, '#00D2BE', '#181826']}
        position={[0, -0.05, 0]}
      />
    </group>
  );
};
