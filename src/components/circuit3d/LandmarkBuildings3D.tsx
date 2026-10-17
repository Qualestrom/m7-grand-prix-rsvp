import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { RouteLandmark } from '../../config/routesConfig';

interface LandmarkBuildings3DProps {
  landmarks: RouteLandmark[];
  curve: THREE.CatmullRomCurve3;
}

// Procedural texture generator for building signs & logos
function createSignTexture(text: string, bgColor: string, textColor: string, subText = ''): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 160);

  ctx.fillStyle = textColor;
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), 256, subText ? 65 : 80);

  if (subText) {
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(subText.toUpperCase(), 256, 115);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export const LandmarkBuildings3D: React.FC<LandmarkBuildings3DProps> = ({
  landmarks,
  curve,
}) => {
  // Pre-generate textures for the major Santa Rosa landmarks
  const textures = useMemo(() => {
    return {
      caltex: createSignTexture('CALTEX', '#E10600', '#FFFFFF', 'BIÑAN - SANTA ROSA BOUNDARY'),
      holyRosary: createSignTexture('HOLY ROSARY COLLEGE', '#002B49', '#FFD100', 'EST. 1979 • SANTA ROSA'),
      puregold: createSignTexture('PUREGOLD', '#0F5132', '#FFD100', 'ALWAYS PANALO • TAGAPO'),
      santaRosaArch: createSignTexture('LUNGSOD NG SANTA ROSA', '#7A6B58', '#FFD700', 'HISTORIC CITY GATEWAY'),
      church: createSignTexture('SANTA ROSA DE LIMA PARISH', '#4A3B32', '#FFFFFF', 'FOUNDED 1792 • BAYAN'),
      balibago: createSignTexture('BALIBAGO COMPLEX', '#1A237E', '#FFFFFF', 'TRANSPORT & COMMERCIAL HUB'),
      tram: createSignTexture('TRAM PLAZA', '#2E7D32', '#FFFFFF', 'COMMERCIAL CENTER • TRAMO'),
      villas: createSignTexture('GARDEN VILLAS 3', '#1B5E20', '#FFFFFF', 'RESIDENTIAL GATEWAY'),
      smMall: createSignTexture('SM CITY SANTA ROSA', '#003399', '#FFFFFF', 'EVERYTHING\'S HERE'),
      metrogate: createSignTexture('METROGATE', '#880E4F', '#FFFFFF', 'INTERSECTION & SUBDIVISION'),
      sports: createSignTexture('CITY SPORTS COMPLEX', '#00695C', '#FFFFFF', 'SANTA ROSA MULTI-PURPOSE'),
      jollibee: createSignTexture('JOLLIBEE', '#E31837', '#FFFFFF', 'BAYAN SANTA ROSA'),
      gate: createSignTexture('SAINT JOHN SUBDIVISION', '#263238', '#00D2BE', 'BARANGAY IBABA • MAIN GATE'),
      venue: createSignTexture('JSH EVENTS PLACE', '#E10600', '#FFFFFF', 'BLOCK 5, LOT 27 • VIP PADDOCK'),
    };
  }, []);

  // Compute 3D coordinate frame for each landmark
  const landmarkData = useMemo(() => {
    return landmarks.map((lm) => {
      const pos = curve.getPointAt(lm.t);
      const tangent = curve.getTangentAt(lm.t).normalize();
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      const rotY = Math.atan2(tangent.x, tangent.z);

      return {
        ...lm,
        pos,
        tangent,
        right,
        rotY,
      };
    });
  }, [landmarks, curve]);

  return (
    <group>
      {landmarkData.map((lm) => {
        // Offset laterally depending on 'left', 'right', or 'center' (25 units ensures ample setback beyond sidewalk)
        const sideOffset = lm.side === 'left' ? -25 : lm.side === 'right' ? 25 : 0;
        const buildingPos = lm.pos.clone().add(lm.right.clone().multiplyScalar(sideOffset));

        // Facade orientation: roadside buildings face inward toward the street, center arches face oncoming driver
        const buildingRotY =
          lm.side === 'right'
            ? lm.rotY + Math.PI / 2
            : lm.side === 'left'
            ? lm.rotY - Math.PI / 2
            : lm.rotY + Math.PI;

        switch (lm.buildingType) {
          // ==========================================
          // 1. Caltex Gasoline Station
          // ==========================================
          case 'caltex':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                {/* Station Canopy Roof */}
                <mesh position={[0, 4.8, 0]}>
                  <boxGeometry args={[16, 0.9, 11]} />
                  <meshStandardMaterial color="#FFFFFF" metalness={0.4} roughness={0.4} />
                </mesh>
                {/* Red & Green Fascia Trim */}
                <mesh position={[0, 4.8, 5.55]}>
                  <boxGeometry args={[16.1, 0.8, 0.15]} />
                  <meshBasicMaterial map={textures.caltex} />
                </mesh>
                {/* 4 Canopy Support Pillars */}
                {[-5.5, 5.5].map((px) =>
                  [-3.5, 3.5].map((pz) => (
                    <mesh key={`c-pil-${px}-${pz}`} position={[px, 2.3, pz]}>
                      <cylinderGeometry args={[0.3, 0.3, 4.6, 8]} />
                      <meshStandardMaterial color="#E8E8E8" />
                    </mesh>
                  ))
                )}
                {/* 2 Fuel Pump Island Platforms */}
                {[-4, 4].map((px) => (
                  <group key={`c-pump-${px}`} position={[px, 0.2, 0]}>
                    <mesh position={[0, 0.1, 0]}>
                      <boxGeometry args={[1.6, 0.3, 5]} />
                      <meshStandardMaterial color="#888899" />
                    </mesh>
                    <mesh position={[0, 1.0, 0]}>
                      <boxGeometry args={[0.9, 1.5, 1.4]} />
                      <meshStandardMaterial color="#E10600" />
                    </mesh>
                  </group>
                ))}
                {/* Station C-Store Building */}
                <mesh position={[0, 2.2, -10]}>
                  <boxGeometry args={[14, 4.4, 7]} />
                  <meshStandardMaterial color="#ECEFF1" roughness={0.5} />
                </mesh>
                {/* Price Totem Sign */}
                <mesh position={[8, 4.0, 7]}>
                  <boxGeometry args={[1.2, 8.0, 0.4]} />
                  <meshBasicMaterial color="#E10600" />
                </mesh>
              </group>
            );

          // ==========================================
          // 2. Holy Rosary College
          // ==========================================
          case 'school':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                {/* Main 3-Story School Building */}
                <mesh position={[0, 5.5, -4]}>
                  <boxGeometry args={[26, 11, 14]} />
                  <meshStandardMaterial color="#F5F5F0" roughness={0.6} />
                </mesh>
                {/* Roof Coping */}
                <mesh position={[0, 11.2, -4]}>
                  <boxGeometry args={[26.4, 0.5, 14.4]} />
                  <meshStandardMaterial color="#002B49" />
                </mesh>
                {/* Entrance Banner Sign */}
                <mesh position={[0, 9.2, 3.05]}>
                  <planeGeometry args={[14, 3.2]} />
                  <meshBasicMaterial map={textures.holyRosary} />
                </mesh>
                {/* School Gate Portal */}
                <mesh position={[0, 2.5, 5.5]}>
                  <boxGeometry args={[12, 5.0, 0.8]} />
                  <meshStandardMaterial color="#002B49" metalness={0.5} />
                </mesh>
              </group>
            );

          // ==========================================
          // 3. Puregold Tagapo
          // ==========================================
          case 'puregold':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                {/* Supermarket Superstructure */}
                <mesh position={[0, 4.0, 0]}>
                  <boxGeometry args={[28, 8, 16]} />
                  <meshStandardMaterial color="#0F5132" roughness={0.5} />
                </mesh>
                {/* Yellow Accent Facia */}
                <mesh position={[0, 7.2, 8.05]}>
                  <planeGeometry args={[18, 3.2]} />
                  <meshBasicMaterial map={textures.puregold} />
                </mesh>
                {/* Customer Glass Entrance */}
                <mesh position={[0, 1.8, 8.05]}>
                  <planeGeometry args={[8, 3.5]} />
                  <meshStandardMaterial color="#80D8FF" roughness={0.1} metalness={0.9} />
                </mesh>
              </group>
            );

          // ==========================================
          // 4. Historic Santa Rosa Arch (Spans 100% across the Road!)
          // ==========================================
          case 'arch':
            return (
              <group key={lm.id} position={lm.pos} rotation={[0, buildingRotY, 0]}>
                {/* Left Stone Pier */}
                <mesh position={[-6.2, 4.8, 0]}>
                  <boxGeometry args={[2.4, 9.6, 3.0]} />
                  <meshStandardMaterial color="#C8C2B8" roughness={0.8} />
                </mesh>
                {/* Right Stone Pier */}
                <mesh position={[6.2, 4.8, 0]}>
                  <boxGeometry args={[2.4, 9.6, 3.0]} />
                  <meshStandardMaterial color="#C8C2B8" roughness={0.8} />
                </mesh>
                {/* Overhead Arch Spanning Road */}
                <mesh position={[0, 9.0, 0]}>
                  <boxGeometry args={[14.8, 2.2, 3.2]} />
                  <meshStandardMaterial color="#B0A99E" roughness={0.8} />
                </mesh>
                {/* Upper Decorative Pediment */}
                <mesh position={[0, 10.8, 0]}>
                  <boxGeometry args={[10.5, 1.6, 2.8]} />
                  <meshStandardMaterial color="#9C958A" roughness={0.8} />
                </mesh>
                {/* Gold City Gateway Plate */}
                <mesh position={[0, 9.0, 1.65]}>
                  <planeGeometry args={[9.5, 1.8]} />
                  <meshBasicMaterial map={textures.santaRosaArch} />
                </mesh>
                {/* Night Floodlights */}
                <pointLight position={[-4, 8, 2]} intensity={25} color="#FFD180" distance={20} />
                <pointLight position={[4, 8, 2]} intensity={25} color="#FFD180" distance={20} />
              </group>
            );

          // ==========================================
          // 5. Santa Rosa Plaza & Church (Santa Rosa de Lima)
          // ==========================================
          case 'church':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                {/* Colonial Church Nave */}
                <mesh position={[0, 6.0, 0]}>
                  <boxGeometry args={[18, 12, 26]} />
                  <meshStandardMaterial color="#D7CCC8" roughness={0.9} />
                </mesh>
                {/* Church Bell Tower (Campanario) */}
                <group position={[-11, 0, 8]}>
                  <mesh position={[0, 9.0, 0]}>
                    <cylinderGeometry args={[2.8, 3.4, 18, 8]} />
                    <meshStandardMaterial color="#BCAAA4" roughness={0.9} />
                  </mesh>
                  {/* Tower Bell Dome */}
                  <mesh position={[0, 18.8, 0]}>
                    <sphereGeometry args={[2.4, 12, 12]} />
                    <meshStandardMaterial color="#8D6E63" metalness={0.6} roughness={0.4} />
                  </mesh>
                </group>
                {/* Plaza Green Park & Trees */}
                <mesh position={[12, 0.08, 0]}>
                  <boxGeometry args={[18, 0.15, 26]} />
                  <meshStandardMaterial color="#2E7D32" roughness={0.9} />
                </mesh>
                {/* Church Facade Sign */}
                <mesh position={[0, 9.0, 13.05]}>
                  <planeGeometry args={[10, 2.5]} />
                  <meshBasicMaterial map={textures.church} />
                </mesh>
              </group>
            );

          // ==========================================
          // 6. Balibago Commercial Complex
          // ==========================================
          case 'balibago':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                <mesh position={[0, 5.0, 0]}>
                  <boxGeometry args={[24, 10, 18]} />
                  <meshStandardMaterial color="#283593" roughness={0.5} />
                </mesh>
                <mesh position={[0, 8.5, 9.05]}>
                  <planeGeometry args={[16, 2.8]} />
                  <meshBasicMaterial map={textures.balibago} />
                </mesh>
                {/* Terminal Bus Bay Canopy */}
                <mesh position={[0, 3.8, 14]}>
                  <boxGeometry args={[22, 0.5, 10]} />
                  <meshStandardMaterial color="#455A64" />
                </mesh>
              </group>
            );

          // ==========================================
          // 7. Tram Plaza
          // ==========================================
          case 'tram':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                <mesh position={[0, 3.8, 0]}>
                  <boxGeometry args={[24, 7.5, 12]} />
                  <meshStandardMaterial color="#37474F" roughness={0.6} />
                </mesh>
                <mesh position={[0, 6.2, 6.05]}>
                  <planeGeometry args={[14, 2.2]} />
                  <meshBasicMaterial map={textures.tram} />
                </mesh>
              </group>
            );

          // ==========================================
          // 8. Garden Villas 3 Entrance
          // ==========================================
          case 'villas':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                <mesh position={[0, 2.8, 0]}>
                  <boxGeometry args={[14, 5.5, 2.5]} />
                  <meshStandardMaterial color="#1B5E20" roughness={0.7} />
                </mesh>
                <mesh position={[0, 4.5, 1.3]}>
                  <planeGeometry args={[10, 1.8]} />
                  <meshBasicMaterial map={textures.villas} />
                </mesh>
              </group>
            );

          // ==========================================
          // 9. SM City Santa Rosa (Mega-Mall Landmark)
          // ==========================================
          case 'sm_mall':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                {/* Curved Mega-Mall Structure */}
                <mesh position={[0, 6.5, 0]}>
                  <boxGeometry args={[48, 13, 24]} />
                  <meshStandardMaterial color="#F5F5F7" roughness={0.4} metalness={0.2} />
                </mesh>
                {/* Signature SM Blue Upper Trim */}
                <mesh position={[0, 12.2, 0]}>
                  <boxGeometry args={[48.4, 1.8, 24.4]} />
                  <meshStandardMaterial color="#003399" />
                </mesh>
                {/* Iconic SM Signage */}
                <mesh position={[0, 10.0, 12.1]}>
                  <planeGeometry args={[22, 4.0]} />
                  <meshBasicMaterial map={textures.smMall} />
                </mesh>
                {/* Glass Mall Entrance Atrium */}
                <mesh position={[0, 3.5, 12.1]}>
                  <planeGeometry args={[14, 7.0]} />
                  <meshStandardMaterial color="#00E5FF" metalness={0.8} roughness={0.1} />
                </mesh>
                <pointLight position={[0, 10, 16]} intensity={45} color="#00E5FF" distance={35} />
              </group>
            );

          // ==========================================
          // 10. Metrogate Intersection
          // ==========================================
          case 'metrogate':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                <mesh position={[0, 3.2, 0]}>
                  <boxGeometry args={[16, 6.4, 3.0]} />
                  <meshStandardMaterial color="#4A148C" roughness={0.6} />
                </mesh>
                <mesh position={[0, 4.8, 1.55]}>
                  <planeGeometry args={[10, 2.2]} />
                  <meshBasicMaterial map={textures.metrogate} />
                </mesh>
              </group>
            );

          // ==========================================
          // 11. Santa Rosa Multi-Purpose Sports Complex
          // ==========================================
          case 'sports_complex':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                {/* Domed Stadium / Arena */}
                <mesh position={[0, 7.0, 0]}>
                  <cylinderGeometry args={[18, 21, 14, 24]} />
                  <meshStandardMaterial color="#CFD8DC" metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Curved Roof Trusses */}
                <mesh position={[0, 14.2, 0]}>
                  <sphereGeometry args={[18.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
                  <meshStandardMaterial color="#00695C" metalness={0.5} roughness={0.3} />
                </mesh>
                {/* Signboard */}
                <mesh position={[0, 6.0, 20]}>
                  <planeGeometry args={[16, 3.0]} />
                  <meshBasicMaterial map={textures.sports} />
                </mesh>
              </group>
            );

          // ==========================================
          // 12. Jollibee Bayan
          // ==========================================
          case 'jollibee':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                <mesh position={[0, 3.2, 0]}>
                  <boxGeometry args={[14, 6.4, 12]} />
                  <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
                </mesh>
                {/* Sloped Red Roof */}
                <mesh position={[0, 6.8, 0]}>
                  <boxGeometry args={[14.8, 1.2, 12.8]} />
                  <meshStandardMaterial color="#E31837" />
                </mesh>
                <mesh position={[0, 5.2, 6.05]}>
                  <planeGeometry args={[10, 2.5]} />
                  <meshBasicMaterial map={textures.jollibee} />
                </mesh>
              </group>
            );

          // ==========================================
          // 13. Saint John Subdivision Main Gate (Barangay Ibaba)
          // ==========================================
          case 'gate':
            return (
              <group key={lm.id} position={lm.pos} rotation={[0, buildingRotY, 0]}>
                {/* Left Gate Column */}
                <mesh position={[-5.8, 3.2, 0]}>
                  <boxGeometry args={[1.8, 6.4, 2.0]} />
                  <meshStandardMaterial color="#37474F" roughness={0.8} />
                </mesh>
                {/* Right Gate Column */}
                <mesh position={[5.8, 3.2, 0]}>
                  <boxGeometry args={[1.8, 6.4, 2.0]} />
                  <meshStandardMaterial color="#37474F" roughness={0.8} />
                </mesh>
                {/* Subdivision Entrance Arch */}
                <mesh position={[0, 6.6, 0]}>
                  <boxGeometry args={[13.6, 1.6, 2.2]} />
                  <meshStandardMaterial color="#263238" roughness={0.8} />
                </mesh>
                {/* Signboard */}
                <mesh position={[0, 6.6, 1.15]}>
                  <planeGeometry args={[10.5, 1.4]} />
                  <meshBasicMaterial map={textures.gate} side={THREE.DoubleSide} />
                </mesh>
                {/* Security Guardhouse */}
                <mesh position={[-8.0, 1.8, 0]}>
                  <boxGeometry args={[2.5, 3.6, 3.2]} />
                  <meshStandardMaterial color="#ECEFF1" />
                </mesh>
              </group>
            );

          // ==========================================
          // 14. JSH Events Place (Destination: Block 5, Lot 27)
          // ==========================================
          case 'venue':
            return (
              <group key={lm.id} position={buildingPos} rotation={[0, buildingRotY, 0]}>
                {/* Event Hall Main Building (Behind arrival arch) */}
                <mesh position={[0, 4.5, -14]}>
                  <boxGeometry args={[24, 9.0, 18]} />
                  <meshStandardMaterial color="#1A1A24" roughness={0.3} metalness={0.7} />
                </mesh>
                {/* Illuminated Glass Front */}
                <mesh position={[0, 3.5, -4.9]}>
                  <planeGeometry args={[18, 6.0]} />
                  <meshStandardMaterial color="#00D2BE" transparent opacity={0.75} roughness={0.1} side={THREE.DoubleSide} />
                </mesh>
                {/* Grand Prix Venue Banner on Hall */}
                <mesh position={[0, 8.2, -4.85]}>
                  <planeGeometry args={[18, 3.2]} />
                  <meshBasicMaterial map={textures.venue} side={THREE.DoubleSide} />
                </mesh>
                {/* Chequered VIP Finish Line Archway Spanning the Road right at Arrival */}
                <group position={[0, 0, 0]}>
                  <mesh position={[-5.8, 4.0, 0]}>
                    <boxGeometry args={[0.9, 8, 0.9]} />
                    <meshStandardMaterial color="#E10600" />
                  </mesh>
                  <mesh position={[5.8, 4.0, 0]}>
                    <boxGeometry args={[0.9, 8, 0.9]} />
                    <meshStandardMaterial color="#E10600" />
                  </mesh>
                  <mesh position={[0, 8.2, 0]}>
                    <boxGeometry args={[13.5, 1.4, 1.0]} />
                    <meshStandardMaterial color="#FFFFFF" />
                  </mesh>
                  {/* VIP Finish Line Banner facing arriving driver */}
                  <mesh position={[0, 8.2, 0.55]}>
                    <planeGeometry args={[12.5, 1.3]} />
                    <meshBasicMaterial map={textures.venue} side={THREE.DoubleSide} />
                  </mesh>
                  <pointLight position={[0, 8.5, 2]} intensity={60} color="#FFD100" distance={35} />
                </group>
              </group>
            );

          default:
            return null;
        }
      })}
    </group>
  );
};
