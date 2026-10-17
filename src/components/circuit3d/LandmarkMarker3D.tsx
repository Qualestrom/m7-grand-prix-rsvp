import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { RouteLandmark } from '../../config/routesConfig';

interface LandmarkMarker3DProps {
  landmarks: RouteLandmark[];
  curve: THREE.CatmullRomCurve3;
}

export const LandmarkMarker3D: React.FC<LandmarkMarker3DProps> = ({
  landmarks,
  curve,
}) => {
  const landmarkObjects = useMemo(() => {
    return landmarks.map((lm) => {
      const pos = curve.getPointAt(lm.t);
      const tangent = curve.getTangentAt(lm.t).normalize();
      const rotY = Math.atan2(tangent.x, tangent.z) + Math.PI;

      return {
        ...lm,
        pos,
        rotY,
      };
    });
  }, [landmarks, curve]);

  return (
    <group>
      {landmarkObjects.map((lm) => (
        <group key={lm.id} position={lm.pos} rotation={[0, lm.rotY, 0]}>
          {/* Vertical Holographic Waypoint Light Beacon */}
          <mesh position={[0, 20, 0]}>
            <cylinderGeometry args={[0.15, 0.4, 40, 12]} />
            <meshBasicMaterial
              color={lm.accentColor}
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Ground Glowing Waypoint Ring on Asphalt */}
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.8, 3.4, 32]} />
            <meshBasicMaterial
              color={lm.accentColor}
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Inner Pulsing Pulse Ring */}
          <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.5, 32]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
