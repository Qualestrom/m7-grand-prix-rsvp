import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { RouteLandmark } from '../../config/routesConfig';

interface LandmarkMarker3DProps {
  landmarks: RouteLandmark[];
  curve: THREE.CatmullRomCurve3;
}

// Generate canvas texture for 3D billboard sign
function createLandmarkSignTexture(name: string, actionText: string, accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 190;
  const ctx = canvas.getContext('2d')!;

  // Background card
  ctx.fillStyle = '#0E0E18';
  if (ctx.roundRect) {
    ctx.roundRect(8, 8, 496, 174, 18);
  } else {
    ctx.rect(8, 8, 496, 174);
  }
  ctx.fill();

  // Glowing border
  ctx.lineWidth = 6;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  // Top header (Action / Guidance)
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`▶ ${actionText.replace(/_/g, ' ')}`, 28, 48);

  // Landmark Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  const displayTitle = name.length > 25 ? name.slice(0, 24) + '...' : name;
  ctx.fillText(displayTitle.toUpperCase(), 28, 102);

  // Bottom subtitle
  ctx.fillStyle = '#8E8E98';
  ctx.font = '16px monospace';
  ctx.fillText('M7 GRAND PRIX • VENUE RECON WAYPOINT', 28, 148);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export const LandmarkMarker3D: React.FC<LandmarkMarker3DProps> = ({
  landmarks,
  curve,
}) => {
  const landmarkObjects = useMemo(() => {
    return landmarks.map((lm) => {
      const pos = curve.getPointAt(lm.t);
      const tangent = curve.getTangentAt(lm.t).normalize();
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      const rotY = Math.atan2(tangent.x, tangent.z);
      const texture = createLandmarkSignTexture(lm.name, lm.action, lm.accentColor);

      return {
        ...lm,
        pos,
        tangent,
        right,
        rotY,
        texture,
      };
    });
  }, [landmarks, curve]);

  return (
    <group>
      {landmarkObjects.map((lm) => {
        const isVenue = lm.action === 'ARRIVE';

        return (
          <group key={lm.id} position={lm.pos} rotation={[0, lm.rotY, 0]}>
            {/* 1. Road Overhead Gantry Archway */}
            <group position={[0, 0, 0]}>
              {/* Left Pillar */}
              <mesh position={[-5.5, 3.8, 0]}>
                <boxGeometry args={[0.5, 7.6, 0.5]} />
                <meshStandardMaterial color="#1E1E2C" metalness={0.7} roughness={0.3} />
              </mesh>

              {/* Right Pillar */}
              <mesh position={[5.5, 3.8, 0]}>
                <boxGeometry args={[0.5, 7.6, 0.5]} />
                <meshStandardMaterial color="#1E1E2C" metalness={0.7} roughness={0.3} />
              </mesh>

              {/* Crossbeam */}
              <mesh position={[0, 7.5, 0]}>
                <boxGeometry args={[11.8, 0.6, 0.7]} />
                <meshStandardMaterial color="#252538" metalness={0.8} roughness={0.2} />
              </mesh>

              {/* Billboard Sign Canvas Plate */}
              <mesh position={[0, 5.6, 0]}>
                <planeGeometry args={[7.2, 2.7]} />
                <meshBasicMaterial map={lm.texture} side={THREE.DoubleSide} />
              </mesh>
            </group>

            {/* 2. Vertical Waypoint Light Beacon */}
            <mesh position={[0, 25, 0]}>
              <cylinderGeometry args={[0.2, 0.5, 50, 12]} />
              <meshBasicMaterial
                color={lm.accentColor}
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Ground Waypoint Rings */}
            <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.5, 3.0, 32]} />
              <meshBasicMaterial
                color={lm.accentColor}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* 3. Special Checkered Archway at Final Venue (JSH Events Place) */}
            {isVenue && (
              <group position={[0, 0, 4]}>
                <mesh position={[0, 8.8, 0]}>
                  <boxGeometry args={[12, 1.2, 0.8]} />
                  <meshStandardMaterial color="#E10600" />
                </mesh>
                {/* Spotlights */}
                <pointLight position={[0, 9, 2]} intensity={50} distance={25} color="#00D2BE" />
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
