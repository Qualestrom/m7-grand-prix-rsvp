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

    // Default Chase Camera Offset (Behind and slightly elevated)
    let cameraOffset = tangent.clone().multiplyScalar(-14).add(new THREE.Vector3(0, 6.2, 0));
    let lookTarget = carPos.clone().add(tangent.clone().multiplyScalar(10));

    // When near a landmark in Slow-Motion:
    // Pivot camera outward and lower slightly to create a dramatic side/three-quarter hero shot
    if (isSlowMo && activeLandmark) {
      cameraOffset = tangent
        .clone()
        .multiplyScalar(-10)
        .add(right.clone().multiplyScalar(5.5))
        .add(new THREE.Vector3(0, 4.5, 0));

      // Look between the car and the elevated landmark sign
      lookTarget = carPos
        .clone()
        .add(tangent.clone().multiplyScalar(4))
        .add(new THREE.Vector3(0, 2.5, 0));
    }

    const targetCameraPos = carPos.clone().add(cameraOffset);

    // Smooth camera interpolation
    camera.position.lerp(targetCameraPos, 0.07);
    camera.lookAt(lookTarget);
  });

  return null;
};
