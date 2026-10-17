import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { RouteIntersection } from '../../config/routesConfig';

interface RouteRoad3DProps {
  curve: THREE.CatmullRomCurve3;
  accentColor?: string;
  intersections?: RouteIntersection[];
}

export const RouteRoad3D: React.FC<RouteRoad3DProps> = ({
  curve,
  accentColor = '#E10600',
  intersections = [],
}) => {
  // 1. Procedural Road, Center Divider, Kerbs, and Sidewalks
  const { roadGeo, centerLineGeo, kerbGeoLeft, kerbGeoRight, sidewalkGeoLeft, sidewalkGeoRight } = useMemo(() => {
    const numPoints = 280;
    const kerbWidth = 0.9;
    const sidewalkWidth = 2.4;
    const cWidth = 0.16;

    const points = curve.getPoints(numPoints);

    // Arrays
    const roadPositions: number[] = [];
    const roadNormals: number[] = [];
    const roadUvs: number[] = [];
    const roadIndices: number[] = [];

    const centerPositions: number[] = [];
    const kerbLeftPositions: number[] = [];
    const kerbRightPositions: number[] = [];
    const sidewalkLeftPositions: number[] = [];
    const sidewalkRightPositions: number[] = [];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const t = i / (points.length - 1);
      const tangent = curve.getTangentAt(t).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Realistic road width modulation:
      // Wider on national highways & boulevards (9.6), slightly narrower in historic town streets (8.2), cozy inside subdivision (7.2)
      const roadWidth = t < 0.6 ? 9.6 : t < 0.88 ? 8.2 : 7.2;
      const halfWidth = roadWidth / 2;

      // Road outer edges
      const leftEdge = p.clone().add(right.clone().multiplyScalar(-halfWidth));
      const rightEdge = p.clone().add(right.clone().multiplyScalar(halfWidth));

      // Push vertices (Road)
      roadPositions.push(leftEdge.x, leftEdge.y + 0.05, leftEdge.z);
      roadPositions.push(rightEdge.x, rightEdge.y + 0.05, rightEdge.z);
      roadNormals.push(0, 1, 0, 0, 1, 0);
      roadUvs.push(0, t * 60, 1, t * 60);

      // Center line ribbon
      const cLeft = p.clone().add(right.clone().multiplyScalar(-cWidth));
      const cRight = p.clone().add(right.clone().multiplyScalar(cWidth));
      centerPositions.push(cLeft.x, cLeft.y + 0.07, cLeft.z);
      centerPositions.push(cRight.x, cRight.y + 0.07, cRight.z);

      // Kerbs
      const kerbLeftOuter = leftEdge.clone().add(right.clone().multiplyScalar(-kerbWidth));
      const kerbRightOuter = rightEdge.clone().add(right.clone().multiplyScalar(kerbWidth));

      kerbLeftPositions.push(kerbLeftOuter.x, kerbLeftOuter.y + 0.12, kerbLeftOuter.z);
      kerbLeftPositions.push(leftEdge.x, leftEdge.y + 0.06, leftEdge.z);

      kerbRightPositions.push(rightEdge.x, rightEdge.y + 0.06, rightEdge.z);
      kerbRightPositions.push(kerbRightOuter.x, kerbRightOuter.y + 0.12, kerbRightOuter.z);

      // Sidewalks
      const swLeftOuter = kerbLeftOuter.clone().add(right.clone().multiplyScalar(-sidewalkWidth));
      const swRightOuter = kerbRightOuter.clone().add(right.clone().multiplyScalar(sidewalkWidth));

      sidewalkLeftPositions.push(swLeftOuter.x, swLeftOuter.y + 0.22, swLeftOuter.z);
      sidewalkLeftPositions.push(kerbLeftOuter.x, kerbLeftOuter.y + 0.22, kerbLeftOuter.z);

      sidewalkRightPositions.push(kerbRightOuter.x, kerbRightOuter.y + 0.22, kerbRightOuter.z);
      sidewalkRightPositions.push(swRightOuter.x, swRightOuter.y + 0.22, swRightOuter.z);

      if (i < points.length - 1) {
        const base = i * 2;
        roadIndices.push(base, base + 1, base + 2);
        roadIndices.push(base + 1, base + 3, base + 2);
      }
    }

    const createGeo = (positions: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      g.setIndex(roadIndices);
      return g;
    };

    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
    rGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
    rGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    rGeo.setIndex(roadIndices);

    return {
      roadGeo: rGeo,
      centerLineGeo: createGeo(centerPositions),
      kerbGeoLeft: createGeo(kerbLeftPositions),
      kerbGeoRight: createGeo(kerbRightPositions),
      sidewalkGeoLeft: createGeo(sidewalkLeftPositions),
      sidewalkGeoRight: createGeo(sidewalkRightPositions),
    };
  }, [curve]);

  // 2. Street Lamps & Roadside Trees along the corridor
  const roadsideProps = useMemo(() => {
    const lamps: { pos: THREE.Vector3; rotY: number; isHistoric: boolean }[] = [];
    const trees: { pos: THREE.Vector3; scale: number }[] = [];
    const count = 32;

    for (let i = 1; i < count; i++) {
      const t = i / count;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      const isRight = i % 2 === 0;

      // In the historic town core (t between 0.65 and 0.85), use historic colonial style lamps
      const isHistoric = t >= 0.65 && t <= 0.85;

      // Street Lamp
      const lampOffset = right.clone().multiplyScalar(isRight ? 6.5 : -6.5);
      const lampPos = p.clone().add(lampOffset);
      const rotY = Math.atan2(tangent.x, tangent.z) + (isRight ? Math.PI / 2 : -Math.PI / 2);
      lamps.push({ pos: lampPos, rotY, isHistoric });

      // Roadside Trees on sidewalks
      const treeOffset = right.clone().multiplyScalar(isRight ? -7.8 : 7.8);
      const treePos = p.clone().add(treeOffset);
      trees.push({ pos: treePos, scale: 0.85 + Math.sin(i * 3.7) * 0.25 });
    }

    return { lamps, trees };
  }, [curve]);

  // 3. Realistic Intersections based on Real-World Map Coordinates
  const intersectionData = useMemo(() => {
    return intersections.map((itx) => {
      const pos = curve.getPointAt(itx.t);
      const tangent = curve.getTangentAt(itx.t).normalize();
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      const rotY = Math.atan2(tangent.x, tangent.z);

      return {
        ...itx,
        pos,
        tangent,
        right,
        rotY,
      };
    });
  }, [curve, intersections]);

  return (
    <group>
      {/* Asphalt Surface */}
      <mesh geometry={roadGeo} receiveShadow>
        <meshStandardMaterial color="#171724" roughness={0.88} metalness={0.12} />
      </mesh>

      {/* Central Yellow Road Divider Ribbon */}
      <mesh geometry={centerLineGeo}>
        <meshBasicMaterial color="#FFB800" />
      </mesh>

      {/* Concrete Sidewalks (Left & Right) */}
      <mesh geometry={sidewalkGeoLeft}>
        <meshStandardMaterial color="#353545" roughness={0.9} />
      </mesh>
      <mesh geometry={sidewalkGeoRight}>
        <meshStandardMaterial color="#353545" roughness={0.9} />
      </mesh>

      {/* Left Racing Kerb */}
      <mesh geometry={kerbGeoLeft}>
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>

      {/* Right Racing Kerb */}
      <mesh geometry={kerbGeoRight}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>

      {/* Real-World Intersections, Cross-Street Branches, and Zebra Stripes */}
      {intersectionData.map((itx, idx) => {
        const hasLeft = itx.branchDirection === 'left' || itx.branchDirection === 'both';
        const hasRight = itx.branchDirection === 'right' || itx.branchDirection === 'both';

        return (
          <group key={`itx-${idx}`} position={itx.pos}>
            {/* 1. Branch Road to Left (Oriented flat on ground XZ plane via rotation.x = -PI/2) */}
            {hasLeft && (
              <group position={itx.right.clone().multiplyScalar(-16)} rotation={[0, itx.rotY + Math.PI / 2, 0]}>
                <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[7.8, 24]} />
                  <meshStandardMaterial color="#171724" roughness={0.9} />
                </mesh>
                {/* Branch road kerbs */}
                <mesh position={[3.9, 0.1, 0]}>
                  <boxGeometry args={[0.3, 0.15, 24]} />
                  <meshStandardMaterial color="#353545" />
                </mesh>
                <mesh position={[-3.9, 0.1, 0]}>
                  <boxGeometry args={[0.3, 0.15, 24]} />
                  <meshStandardMaterial color="#353545" />
                </mesh>
              </group>
            )}

            {/* 2. Branch Road to Right (Oriented flat on ground XZ plane) */}
            {hasRight && (
              <group position={itx.right.clone().multiplyScalar(16)} rotation={[0, itx.rotY - Math.PI / 2, 0]}>
                <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[7.8, 24]} />
                  <meshStandardMaterial color="#171724" roughness={0.9} />
                </mesh>
                <mesh position={[3.9, 0.1, 0]}>
                  <boxGeometry args={[0.3, 0.15, 24]} />
                  <meshStandardMaterial color="#353545" />
                </mesh>
                <mesh position={[-3.9, 0.1, 0]}>
                  <boxGeometry args={[0.3, 0.15, 24]} />
                  <meshStandardMaterial color="#353545" />
                </mesh>
              </group>
            )}

            {/* 3. Pedestrian Crosswalk Zebra Stripes (Lying FLAT on asphalt surface) */}
            <group rotation={[0, itx.rotY, 0]}>
              {[-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map((offset) => (
                <mesh key={`cw-stripe-${offset}`} position={[offset, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.65, 3.0]} />
                  <meshBasicMaterial color="#FFFFFF" />
                </mesh>
              ))}
              {/* White stop bar line across lane */}
              <mesh position={[0, 0.085, -2.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[8.0, 0.45]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>

            {/* 4. Traffic Signal Post (For signalized intersections) */}
            {itx.hasTrafficLight && (
              <group position={itx.right.clone().multiplyScalar(5.4)} rotation={[0, itx.rotY, 0]}>
                {/* Vertical Pole */}
                <mesh position={[0, 3.5, 0]}>
                  <cylinderGeometry args={[0.1, 0.14, 7, 10]} />
                  <meshStandardMaterial color="#263238" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Cantilever Arm over road */}
                <mesh position={[-2.2, 6.7, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.08, 0.08, 4.4, 8]} />
                  <meshStandardMaterial color="#263238" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Traffic Light Housing */}
                <mesh position={[-3.6, 6.2, 0]}>
                  <boxGeometry args={[0.5, 1.5, 0.4]} />
                  <meshStandardMaterial color="#1B1B1B" />
                </mesh>
                {/* Red, Yellow, Green Lenses */}
                <mesh position={[-3.6, 6.6, 0.22]}>
                  <sphereGeometry args={[0.14, 12, 12]} />
                  <meshBasicMaterial color="#00E676" />
                </mesh>
                <mesh position={[-3.6, 6.2, 0.22]}>
                  <sphereGeometry args={[0.14, 12, 12]} />
                  <meshBasicMaterial color="#554400" />
                </mesh>
                <mesh position={[-3.6, 5.8, 0.22]}>
                  <sphereGeometry args={[0.14, 12, 12]} />
                  <meshBasicMaterial color="#550000" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Street Lamps (Modern steel along highway, Colonial cast-iron around plaza & town) */}
      {roadsideProps.lamps.map((lamp, idx) => (
        <group key={`lamp-${idx}`} position={lamp.pos} rotation={[0, lamp.rotY, 0]}>
          {lamp.isHistoric ? (
            // Historic Colonial Cast-Iron Lamppost
            <group>
              <mesh position={[0, 2.4, 0]}>
                <cylinderGeometry args={[0.09, 0.16, 4.8, 8]} />
                <meshStandardMaterial color="#1B1C22" roughness={0.6} metalness={0.8} />
              </mesh>
              <mesh position={[0, 4.9, 0]}>
                <octahedronGeometry args={[0.35]} />
                <meshStandardMaterial color="#FFD54F" roughness={0.2} metalness={0.9} />
              </mesh>
              <mesh position={[0, 4.9, 0]}>
                <sphereGeometry args={[0.2, 12, 12]} />
                <meshBasicMaterial color="#FFF9C4" />
              </mesh>
            </group>
          ) : (
            // Modern Highway High-Mast Streetlight
            <group>
              <mesh position={[0, 3.5, 0]}>
                <cylinderGeometry args={[0.08, 0.12, 7, 8]} />
                <meshStandardMaterial color="#2A2A38" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0.6, 6.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
                <cylinderGeometry args={[0.06, 0.06, 1.6, 8]} />
                <meshStandardMaterial color="#2A2A38" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[1.1, 7.1, 0]}>
                <sphereGeometry args={[0.22, 12, 12]} />
                <meshBasicMaterial color="#FFFAEE" />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* Roadside Trees (Laguna Narra and Acacia Street Trees) */}
      {roadsideProps.trees.map((tree, idx) => (
        <group key={`tree-${idx}`} position={tree.pos} scale={tree.scale}>
          {/* Trunk */}
          <mesh position={[0, 2.0, 0]}>
            <cylinderGeometry args={[0.22, 0.38, 4.0, 8]} />
            <meshStandardMaterial color="#4E342E" roughness={0.9} />
          </mesh>
          {/* Foliage Canopy */}
          <mesh position={[0, 4.5, 0]}>
            <sphereGeometry args={[2.0, 8, 8]} />
            <meshStandardMaterial color="#2E7D32" roughness={0.8} />
          </mesh>
          <mesh position={[0, 5.8, 0]}>
            <sphereGeometry args={[1.4, 8, 8]} />
            <meshStandardMaterial color="#388E3C" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Subtle Night Ground Floor */}
      <gridHelper args={[950, 150, '#00D2BE', '#141422']} position={[0, -0.05, 0]} />
    </group>
  );
};
