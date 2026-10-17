import React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { RouteLandmark } from '../../config/routesConfig';

interface RouteCameraRigProps {
  curve: THREE.CatmullRomCurve3;
  progress: number;
  isOrbitMode: boolean;
  activeLandmark: RouteLandmark | null;
  isSlowMo: boolean;
}

export const RouteCameraRig: React.FC<RouteCameraRigProps> = ({
  curve,
  progress,
  isOrbitMode,
  activeLandmark,
  isSlowMo,
}) => {
  useFrame(({ camera }) => {
    if (isOrbitMode) return; // Free look mode enabled

    const t = Math.max(0, Math.min(1, progress));
    const carPos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();

    // Default Chase Camera Offset (Behind and elevated for great situational awareness)
    let cameraOffset = tangent.clone().multiplyScalar(-14).add(new THREE.Vector3(0, 6.2, 0));
    let lookTarget = carPos.clone().add(tangent.clone().multiplyScalar(10));

    // When near a landmark in Slow-Motion:
    // Pivot camera outward and elevate to create an expansive hero shot of both car and landmark
    if (isSlowMo && activeLandmark) {
      // Step to opposite side of landmark to get a clean view of the building
      const lateralBias =
        activeLandmark.side === 'right' ? -4.5 : activeLandmark.side === 'left' ? 4.5 : 0;

      cameraOffset = tangent
        .clone()
        .multiplyScalar(-11)
        .add(right.clone().multiplyScalar(lateralBias))
        .add(new THREE.Vector3(0, 5.8, 0));

      // Look toward the car and elevated landmark
      lookTarget = carPos
        .clone()
        .add(tangent.clone().multiplyScalar(4.5))
        .add(new THREE.Vector3(0, 2.6, 0));
    }

    const targetCameraPos = carPos.clone().add(cameraOffset);

    // Smooth camera interpolation
    camera.position.lerp(targetCameraPos, 0.07);
    camera.lookAt(lookTarget);
  });

  return null;
};
