import * as THREE from 'three';
import type { Vec3 } from '../types/studio';

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export interface TwoBoneIKResult {
  upperEulerDeg: Vec3;
  midEulerDeg: Vec3;
}

/**
 * Exact analytical two-bone IK solver matching our Y-down limb bone convention.
 * - For 'arm': elbow pole points toward -Z (elbow tip), elbow bends via negative rot.x.
 * - For 'leg': knee pole points toward +Z (kneecap), knee bends via positive rot.x.
 */
export function solveTwoBoneIK(params: {
  kind: 'arm' | 'leg';
  side: 1 | -1; // +1 = left, -1 = right
  parentWorldMatrix: THREE.Matrix4;
  upperLocalPos: THREE.Vector3;
  upperLength: number;
  midLength: number;
  targetWorld: THREE.Vector3;
  poleAngleDeg: number;
  poleHintParent?: THREE.Vector3;
}): TwoBoneIKResult {
  const {
    kind,
    side,
    parentWorldMatrix,
    upperLocalPos,
    upperLength: L1,
    midLength: L2,
    targetWorld,
    poleAngleDeg,
    poleHintParent,
  } = params;

  // Convert world target to upperBone's parent local space (accounts for scale & rotation)
  const invParent = parentWorldMatrix.clone().invert();
  const pTarget = targetWorld.clone().applyMatrix4(invParent);
  const pRoot = upperLocalPos.clone();

  const delta = pTarget.sub(pRoot);
  const rawDist = delta.length();
  const minDist = Math.abs(L1 - L2) + 0.012;
  const maxDist = (L1 + L2) * 0.9992;
  const d = THREE.MathUtils.clamp(rawDist, minDist, maxDist);

  const dir =
    rawDist > 1e-5 ? delta.clone().divideScalar(rawDist) : new THREE.Vector3(0, -1, 0);

  // Law of cosines for root interior angle alpha
  const cosAlpha = THREE.MathUtils.clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1);
  const alpha = Math.acos(cosAlpha);
  const sinAlpha = Math.sin(alpha);

  // Law of cosines for mid joint flexion (0 = straight, PI = fully folded)
  const cosInterior = THREE.MathUtils.clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1);
  const flexion = Math.PI - Math.acos(cosInterior);

  // Default anatomical pole direction in parent space
  const basePole = poleHintParent
    ? poleHintParent.clone().normalize()
    : kind === 'arm'
    ? new THREE.Vector3(side * 0.42, -0.28, -0.86).normalize()
    : new THREE.Vector3(side * 0.12, 0.05, 0.99).normalize();

  // Project pole perpendicular to dir
  let bendDir = basePole.clone().addScaledVector(dir, -basePole.dot(dir));
  if (bendDir.lengthSq() < 1e-5) {
    const fallback =
      Math.abs(dir.x) < 0.8 ? new THREE.Vector3(side, 0, 0) : new THREE.Vector3(0, 1, 0);
    bendDir = fallback.addScaledVector(dir, -fallback.dot(dir));
  }
  bendDir.normalize();

  // Apply user swivel/pole angle around the limb chord axis
  if (Math.abs(poleAngleDeg) > 1e-4) {
    bendDir.applyAxisAngle(dir, poleAngleDeg * DEG2RAD);
  }

  // Upper bone axis from root -> mid
  const upperDir = dir
    .clone()
    .multiplyScalar(cosAlpha)
    .addScaledVector(bendDir, sinAlpha)
    .normalize();

  // Orthogonal direction in bend plane pointing away from bendDir (toward lower bone fold)
  const uPerp = dir
    .clone()
    .multiplyScalar(sinAlpha)
    .addScaledVector(bendDir, -cosAlpha)
    .normalize();

  // Local bone basis: -Y is along upperDir -> +Y = -upperDir
  const yAxis = upperDir.clone().negate();
  // Arm folds toward +Z (uPerp), Leg folds toward -Z (so +Z = -uPerp = toward knee)
  const zAxis = kind === 'arm' ? uPerp.clone() : uPerp.clone().negate();
  const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
  // Re-orthogonalize Z
  zAxis.crossVectors(xAxis, yAxis).normalize();

  const rotMat = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
  const upperEuler = new THREE.Euler().setFromRotationMatrix(rotMat, 'XYZ');

  const midRotX = kind === 'arm' ? -flexion * RAD2DEG : flexion * RAD2DEG;
  const clampedMidX =
    kind === 'arm'
      ? THREE.MathUtils.clamp(midRotX, -154, 0)
      : THREE.MathUtils.clamp(midRotX, 0, 154);

  return {
    upperEulerDeg: [
      roundDeg(upperEuler.x * RAD2DEG),
      roundDeg(upperEuler.y * RAD2DEG),
      roundDeg(upperEuler.z * RAD2DEG),
    ],
    midEulerDeg: [roundDeg(clampedMidX), 0, 0],
  };
}

/**
 * Computes local eye yaw & pitch angles (degrees) to look at a world-space target.
 */
export function solveEyeLookAt(
  headWorldMatrix: THREE.Matrix4,
  eyeLocalPos: THREE.Vector3,
  targetWorld: THREE.Vector3
): { yaw: number; pitch: number } {
  const invHead = headWorldMatrix.clone().invert();
  const localTarget = targetWorld.clone().applyMatrix4(invHead);
  const dir = localTarget.sub(eyeLocalPos).normalize();
  const yaw = THREE.MathUtils.clamp(Math.atan2(dir.x, Math.max(0.05, dir.z)) * RAD2DEG, -35, 35);
  const pitch = THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1)) * RAD2DEG, -25, 25);
  return { yaw: roundDeg(yaw), pitch: roundDeg(pitch) };
}

function roundDeg(v: number): number {
  return Math.round(v * 10) / 10;
}
