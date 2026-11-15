import * as THREE from 'three';
import type { BiotypeParams, StylizedParams } from '../types/studio';

export interface CrossSection {
  rx: number;
  rzFront: number;
  rzBack: number;
  centerX: number;
  centerZ: number;
}

export interface BodyMetrics {
  totalHeight: number;
  unitScale: number;

  // Style flags
  isStylized: boolean;
  roundness: number;
  muscle: number;
  mass: number;

  // Segment lengths (meters)
  footHeight: number;
  footLength: number;
  footWidth: number;
  calfLength: number;
  thighLength: number;
  pelvisHeight: number;      // hips bone Y in standing neutral
  hipsSegLen: number;        // hips -> spineLower
  spineLowerLen: number;     // spineLower -> spineUpper
  spineUpperLen: number;     // spineUpper -> neck
  torsoTotalLen: number;
  neckLength: number;
  headHeight: number;
  headWidth: number;
  headDepth: number;
  eyeScale: number;

  // Offsets
  hipJointX: number;         // half-distance between hip sockets
  clavicleY: number;         // relative to spineUpper
  clavicleX: number;         // clavicle start X
  shoulderOffsetX: number;   // clavicleL -> shoulderL X length
  upperArmLength: number;
  forearmLength: number;
  handLength: number;
  handWidth: number;
  handThickness: number;

  // Radii base factors
  pelvisRx: number;
  pelvisRz: number;
  waistRx: number;
  waistRz: number;
  chestRx: number;
  chestRz: number;
  shoulderShelfRx: number;
  abdomenProtrusion: number;
  bustAmount: number;
  gluteProtrusion: number;

  upperArmR: number;
  forearmR: number;
  thighR: number;
  calfR: number;
  neckR: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function gaussian(x: number, mean: number, sigma: number): number {
  const d = (x - mean) / sigma;
  return Math.exp(-0.5 * d * d);
}

export function computeBodyMetrics(
  bio: BiotypeParams,
  sty: StylizedParams
): BodyMetrics {
  const isSty = sty.mode === 'stylized';
  const headMul = isSty ? sty.headScale : 1.0;
  const eyeMul = isSty ? sty.eyeScale : 1.0;
  const neckMul = isSty ? sty.neckScale : 1.0;
  const torsoLenMul = isSty ? sty.torsoLength : 1.0;
  const taper = isSty ? sty.torsoTaper : 0.0;
  const limbStyMul = isSty ? sty.limbExaggeration : 1.0;
  const handStyMul = isSty ? sty.handExaggeration : 1.0;
  const footStyMul = isSty ? sty.footExaggeration : 1.0;
  const roundness = isSty ? sty.featureRoundness : 0.15;

  const mass = bio.bodyMass; // -1.0 .. +1.5
  const posMass = Math.max(0, mass);
  const negMass = Math.min(0, mass);
  const muscle = clamp(bio.muscleTone * (1 - posMass * 0.38), 0, 1.1);

  // Limb length multipliers (biotype + stylized work independently)
  const legLenMul =
    clamp(1 + bio.limbLength * 0.18 + bio.legLength * 0.18, 0.62, 1.48) * limbStyMul;
  const armLenMul =
    clamp(1 + bio.limbLength * 0.17 + bio.armLength * 0.18, 0.62, 1.48) * limbStyMul;

  // Unscaled canonical anatomical proportions (in ~1.75m space)
  const rawFootH = 0.068 * clamp(1 + bio.footSize * 0.15, 0.75, 1.35) * Math.pow(footStyMul, 0.45);
  const rawCalf = 0.405 * legLenMul;
  const rawThigh = 0.425 * legLenMul;
  const rawHipsSeg = 0.145 * torsoLenMul;
  const rawSpineLow = 0.175 * torsoLenMul;
  const rawSpineUp = 0.235 * torsoLenMul;
  const rawNeck = 0.092 * neckMul * (1 - posMass * 0.06);
  const rawHeadH = 0.225 * headMul;

  const rawTotal =
    rawFootH + rawCalf + rawThigh + rawHipsSeg + rawSpineLow + rawSpineUp + rawNeck + rawHeadH;

  // Normalize so character height equals bio.height while preserving independent proportion edits
  const s = bio.height / rawTotal;
  // Width reference scale ignores extreme head/limb length distortion so body stays cohesive
  const bodyWidthRef = bio.height / 1.75;

  const footHeight = rawFootH * s;
  const calfLength = rawCalf * s;
  const thighLength = rawThigh * s;
  const pelvisHeight = footHeight + calfLength + thighLength;

  const hipsSegLen = rawHipsSeg * s;
  const spineLowerLen = rawSpineLow * s;
  const spineUpperLen = rawSpineUp * s;
  const torsoTotalLen = hipsSegLen + spineLowerLen + spineUpperLen;
  const neckLength = rawNeck * s;
  const headHeight = rawHeadH * s;
  const headWidth = headHeight * (0.69 + posMass * 0.035 + roundness * 0.07);
  const headDepth = headHeight * (0.81 + posMass * 0.02 + roundness * 0.03);

  // Torso cross-section widths (half-widths in meters)
  const massTorsoW = 1 + posMass * 0.34 + negMass * 0.17;
  const massTorsoD = 1 + posMass * 0.42 + negMass * 0.2;

  const chestRx =
    0.154 *
    bodyWidthRef *
    clamp(1 + bio.chestVolume * 0.22 + bio.shoulderWidth * 0.12 + muscle * 0.08, 0.65, 1.65) *
    (1 + posMass * 0.26 + negMass * 0.15) *
    clamp(1 + taper * 0.28, 0.68, 1.45);

  const chestRz =
    0.112 *
    bodyWidthRef *
    clamp(1 + bio.chestVolume * 0.28 + muscle * 0.1, 0.64, 1.75) *
    massTorsoD *
    clamp(1 + taper * 0.16, 0.75, 1.35);

  const shoulderShelfRx =
    0.178 *
    bodyWidthRef *
    clamp(1 + bio.shoulderWidth * 0.26 + bio.chestVolume * 0.08 + muscle * 0.09, 0.64, 1.65) *
    (1 + posMass * 0.16 + negMass * 0.1) *
    clamp(1 + taper * 0.32, 0.65, 1.52);

  const waistRx =
    0.132 *
    bodyWidthRef *
    clamp(1 + bio.waistWidth * 0.32 + bio.abdomenVolume * 0.12, 0.56, 1.85) *
    massTorsoW *
    clamp(1 - taper * 0.18, 0.68, 1.42);

  const waistRz =
    0.098 *
    bodyWidthRef *
    clamp(1 + bio.waistWidth * 0.22 + bio.abdomenVolume * 0.26, 0.58, 1.95) *
    massTorsoD;

  const pelvisRx =
    0.158 *
    bodyWidthRef *
    clamp(1 + bio.hipWidth * 0.28, 0.66, 1.72) *
    (1 + posMass * 0.3 + negMass * 0.13) *
    clamp(1 - taper * 0.22, 0.68, 1.48);

  const pelvisRz =
    0.108 *
    bodyWidthRef *
    clamp(1 + bio.hipWidth * 0.14 + bio.gluteVolume * 0.14, 0.68, 1.7) *
    (1 + posMass * 0.32 + negMass * 0.15);

  const abdomenProtrusion =
    bodyWidthRef *
    Math.max(
      -0.022,
      bio.abdomenVolume * 0.068 + posMass * 0.062 + negMass * 0.016
    );

  const bustAmount =
    bodyWidthRef * clamp(bio.bustVolume, 0, 1.3) * (0.068 + posMass * 0.018);

  const gluteProtrusion =
    bodyWidthRef *
    clamp(0.036 + bio.gluteVolume * 0.036 + posMass * 0.028 + negMass * 0.014 + muscle * 0.01, 0.01, 0.13);

  // Limb radii
  const thighR =
    0.084 *
    bodyWidthRef *
    clamp(1 + bio.thighVolume * 0.32 + bio.hipWidth * 0.07 + muscle * 0.09, 0.54, 1.82) *
    (1 + posMass * 0.34 + negMass * 0.22);

  const calfR =
    0.056 *
    bodyWidthRef *
    clamp(1 + bio.calfVolume * 0.3 + muscle * 0.1, 0.55, 1.75) *
    (1 + posMass * 0.24 + negMass * 0.18);

  const upperArmR =
    0.051 *
    bodyWidthRef *
    clamp(1 + bio.armThickness * 0.34 + muscle * 0.16, 0.52, 1.88) *
    (1 + posMass * 0.32 + negMass * 0.22);

  const forearmR =
    0.043 *
    bodyWidthRef *
    clamp(1 + bio.forearmThickness * 0.32 + muscle * 0.12, 0.54, 1.8) *
    (1 + posMass * 0.22 + negMass * 0.18);

  const neckR =
    0.055 *
    bodyWidthRef *
    clamp(1 + posMass * 0.24 + negMass * 0.12 + muscle * 0.12 + bio.shoulderWidth * 0.06, 0.68, 1.55) *
    (isSty ? clamp(0.85 + (sty.neckScale - 1) * 0.2, 0.65, 1.25) : 1);

  // Hip joint spacing keeps thighs clear even on fuller bodies
  const hipJointX = Math.max(pelvisRx * 0.56, thighR * 0.96);

  // Shoulder socket position
  const clavicleX = shoulderShelfRx * 0.26;
  const totalShoulderX = shoulderShelfRx + upperArmR * 0.36;
  const shoulderOffsetX = Math.max(0.05, totalShoulderX - clavicleX);
  const clavicleY = spineUpperLen * 0.84;

  // Arms & hands
  const upperArmLength = 0.295 * armLenMul * s;
  const forearmLength = 0.262 * armLenMul * s;

  const handScale = clamp(1 + bio.handSize * 0.28, 0.62, 1.55) * handStyMul * bodyWidthRef;
  const handLength = 0.182 * handScale;
  const handWidth = 0.084 * handScale;
  const handThickness = 0.028 * handScale * (1 + posMass * 0.14);

  const footScale = clamp(1 + bio.footSize * 0.26, 0.64, 1.55) * footStyMul * bodyWidthRef;
  const footLength = 0.252 * footScale;
  const footWidth = 0.095 * footScale * (1 + posMass * 0.08);

  return {
    totalHeight: bio.height,
    unitScale: bodyWidthRef,
    isStylized: isSty,
    roundness,
    muscle,
    mass,
    footHeight,
    footLength,
    footWidth,
    calfLength,
    thighLength,
    pelvisHeight,
    hipsSegLen,
    spineLowerLen,
    spineUpperLen,
    torsoTotalLen,
    neckLength,
    headHeight,
    headWidth,
    headDepth,
    eyeScale: eyeMul,
    hipJointX,
    clavicleY,
    clavicleX,
    shoulderOffsetX,
    upperArmLength,
    forearmLength,
    handLength,
    handWidth,
    handThickness,
    pelvisRx,
    pelvisRz,
    waistRx,
    waistRz,
    chestRx,
    chestRz,
    shoulderShelfRx,
    abdomenProtrusion,
    bustAmount,
    gluteProtrusion,
    upperArmR,
    forearmR,
    thighR,
    calfR,
    neckR,
  };
}

/**
 * Evaluates the exact 3D point on the torso surface for normalized height
 * u in [0..1] (0 = groin/pelvis bottom, 1 = neck base) and angle theta in [0..2PI]
 * where x = cos(theta), z = sin(theta) (+z = front, -z = back).
 *
 * Shared between body generator and adaptive clothing generator!
 */
export function evaluateTorsoPoint(
  u: number,
  theta: number,
  m: BodyMetrics,
  extraClearance = 0,
  detailFactor = 1.0
): { x: number; z: number; baseRx: number; baseRzF: number; baseRzB: number; zShift: number } {
  const uc = clamp(u, 0, 1);
  const ct = Math.cos(theta);
  const st = Math.sin(theta);

  // Smooth multi-anchor interpolation for lateral half-width (rx)
  // u=0: groin, u=0.16: hip/trochanter peak, u=0.44: waist, u=0.76: chest, u=0.90: shoulder shelf, u=1.0: neck root
  let rx: number;
  if (uc < 0.16) {
    const k = smoothstep(0, 0.16, uc);
    rx = THREE.MathUtils.lerp(m.pelvisRx * 0.42, m.pelvisRx, Math.pow(k, 0.65));
  } else if (uc < 0.44) {
    const k = smoothstep(0.16, 0.44, uc);
    rx = THREE.MathUtils.lerp(m.pelvisRx, m.waistRx, k);
    // Flank / love-handle fullness on heavier bodies
    if (m.mass > 0.1) {
      rx += m.mass * 0.016 * m.unitScale * gaussian(uc, 0.34, 0.08);
    }
  } else if (uc < 0.78) {
    const k = smoothstep(0.44, 0.78, uc);
    rx = THREE.MathUtils.lerp(m.waistRx, m.chestRx, k);
  } else if (uc < 0.91) {
    const k = smoothstep(0.78, 0.91, uc);
    rx = THREE.MathUtils.lerp(m.chestRx, m.shoulderShelfRx, k);
  } else {
    const k = smoothstep(0.91, 1.0, uc);
    rx = THREE.MathUtils.lerp(m.shoulderShelfRx, m.neckR * 1.12, k);
  }

  // Front & back half-depth (rzF, rzB)
  let rzF: number;
  let rzB: number;
  if (uc < 0.16) {
    const k = Math.pow(smoothstep(0, 0.16, uc), 0.62);
    rzF = THREE.MathUtils.lerp(m.pelvisRz * 0.48, m.pelvisRz * 0.96, k);
    rzB = THREE.MathUtils.lerp(m.pelvisRz * 0.5, m.pelvisRz * 1.04, k);
  } else if (uc < 0.45) {
    const k = smoothstep(0.16, 0.45, uc);
    rzF = THREE.MathUtils.lerp(m.pelvisRz * 0.96, m.waistRz, k);
    rzB = THREE.MathUtils.lerp(m.pelvisRz * 1.04, m.waistRz * 0.92, k);
  } else if (uc < 0.8) {
    const k = smoothstep(0.45, 0.8, uc);
    rzF = THREE.MathUtils.lerp(m.waistRz, m.chestRz * 1.04, k);
    rzB = THREE.MathUtils.lerp(m.waistRz * 0.92, m.chestRz * 0.98, k);
  } else {
    const k = smoothstep(0.8, 1.0, uc);
    rzF = THREE.MathUtils.lerp(m.chestRz * 1.04, m.neckR * 1.02, Math.pow(k, 1.25));
    rzB = THREE.MathUtils.lerp(m.chestRz * 0.98, m.neckR * 1.04, Math.pow(k, 1.25));
  }

  // Natural S-curve of human spine in Z
  const zShift =
    m.unitScale *
    (-0.008 * gaussian(uc, 0.15, 0.1) +
      0.012 * gaussian(uc, 0.42, 0.12) -
      0.01 * gaussian(uc, 0.76, 0.14) +
      0.008 * smoothstep(0.86, 1.0, uc));

  // Soft abdominal fullness (lower for heavier mass to mimic natural gravity)
  const bellyCenter = m.abdomenProtrusion > 0.03 ? 0.34 : 0.37;
  const bellySigma = m.abdomenProtrusion > 0.03 ? 0.155 : 0.13;
  const bellyEnv = gaussian(uc, bellyCenter, bellySigma);
  if (m.abdomenProtrusion >= 0) {
    rzF += m.abdomenProtrusion * bellyEnv;
    rx += m.abdomenProtrusion * 0.32 * bellyEnv;
  } else {
    rzF += m.abdomenProtrusion * bellyEnv;
  }

  // Anatomical sculptural nuances
  let deltaZ = 0;
  let deltaX = 0;

  // Slightly squarer/boxier anatomical cross-section of ribcage & pelvis (superellipse feel)
  const squaring = 0.07 * (1 - m.roundness * 0.65) * gaussian(uc, 0.72, 0.22);
  const cos2 = Math.cos(2 * theta);
  const rSquareMod = 1 - squaring * cos2 * cos2 * 0.35 + squaring * Math.sin(2 * theta) * Math.sin(2 * theta) * 0.55;

  if (st > 0) {
    // FRONT FEATURES
    const frontCentered = Math.pow(st, 1.6);

    // Pectoral shelf (muscle & chest)
    const pecBand = gaussian(uc, 0.77, 0.068);
    const pecLateral = Math.pow(Math.sin(Math.min(Math.PI, Math.abs(ct) * 2.35)), 1.4);
    const pecAmount = m.unitScale * (0.01 + m.muscle * 0.022) * detailFactor;
    deltaZ += pecAmount * pecBand * pecLateral * st;

    // Sternum groove between pectorals
    const sternum = gaussian(ct, 0, 0.13) * gaussian(uc, 0.76, 0.085);
    deltaZ -= m.unitScale * (0.006 + m.muscle * 0.008) * sternum * detailFactor;

    // Bust / chest fullness (smooth twin teardrop volume)
    if (m.bustAmount > 0.001) {
      const bustYCenter = 0.73 - clamp(m.bustAmount / (0.1 * m.unitScale), 0, 1) * 0.025;
      const bustVert = gaussian(uc, bustYCenter, 0.078);
      // Slight asymmetry above vs below (fuller lower pole)
      const tearDrop = uc < bustYCenter ? 1.08 : 0.88;
      const leftMound = gaussian(ct, 0.44, 0.28);
      const rightMound = gaussian(ct, -0.44, 0.28);
      const bridge = detailFactor < 0.5 ? 0.55 * gaussian(ct, 0, 0.32) : 0.12 * gaussian(ct, 0, 0.22);
      const bustShape = Math.max(leftMound + rightMound * 0.12, rightMound + leftMound * 0.12, bridge);
      deltaZ += m.bustAmount * bustVert * tearDrop * bustShape * Math.pow(st, 0.9);
    }

    // Rectus abdominis (6-pack) + linea alba when muscular
    if (m.muscle > 0.2 && m.abdomenProtrusion < 0.035 && detailFactor > 0.5) {
      const abMask = smoothstep(0.28, 0.36, uc) * (1 - smoothstep(0.62, 0.69, uc));
      const abCols = gaussian(Math.abs(ct), 0.24, 0.13);
      const abRows = 0.5 + 0.5 * Math.sin((uc - 0.32) * Math.PI * 16.5);
      deltaZ += m.unitScale * m.muscle * 0.01 * abMask * abCols * abRows * frontCentered;
      // Linea alba center line
      deltaZ -= m.unitScale * m.muscle * 0.005 * abMask * gaussian(ct, 0, 0.07) * frontCentered;
    }

    // Subtle navel dip
    if (detailFactor > 0.7) {
      const navel = gaussian(uc, 0.36, 0.016) * gaussian(ct, 0, 0.065);
      deltaZ -= m.unitScale * 0.0065 * navel * frontCentered;
    }

    // Clavicle subtle ridge
    if (detailFactor > 0.6) {
      const clav = gaussian(uc, 0.915, 0.018) * smoothstep(0.12, 0.4, Math.abs(ct)) * (1 - smoothstep(0.75, 0.95, Math.abs(ct)));
      deltaZ += m.unitScale * 0.006 * (1 - Math.max(0, m.mass) * 0.4) * clav * st;
    }
  } else {
    // BACK FEATURES
    const backSt = -st;

    // Twin glutes
    const gluteVert = gaussian(uc, 0.145, 0.088);
    const gluteLobe = gaussian(Math.abs(ct), 0.42, 0.32);
    const gluteCleft = detailFactor > 0.5 ? gaussian(ct, 0, 0.1) : 0;
    deltaZ -= m.gluteProtrusion * gluteVert * gluteLobe * Math.pow(backSt, 0.85);
    deltaZ += m.gluteProtrusion * 0.42 * gluteVert * gluteCleft * Math.pow(backSt, 1.4);

    // Spinal furrow & erector spinae ridges
    if (detailFactor > 0.5) {
      const spineMask = smoothstep(0.26, 0.35, uc) * (1 - smoothstep(0.86, 0.95, uc));
      const furrow = gaussian(ct, 0, 0.085);
      const erectors = gaussian(Math.abs(ct), 0.24, 0.14);
      deltaZ += m.unitScale * (0.007 + m.muscle * 0.006) * spineMask * furrow * Math.pow(backSt, 1.5);
      deltaZ -= m.unitScale * (0.005 + m.muscle * 0.01) * spineMask * erectors * backSt;

      // Scapula planes
      const scap = gaussian(uc, 0.78, 0.075) * gaussian(Math.abs(ct), 0.52, 0.2);
      deltaZ -= m.unitScale * (0.007 + m.muscle * 0.01) * scap * backSt;
    }
  }

  // Latissimus dorsi side flare for muscular builds
  if (m.muscle > 0.25) {
    const lat = gaussian(uc, 0.73, 0.1) * Math.pow(Math.abs(ct), 1.6);
    deltaX += Math.sign(ct) * m.unitScale * m.muscle * 0.012 * lat;
  }

  const effRx = rx * rSquareMod + extraClearance;
  const effRz = (st >= 0 ? rzF : rzB) * rSquareMod + extraClearance;

  const x = ct * effRx + deltaX;
  const z = st * effRz + zShift + deltaZ;

  return {
    x,
    z,
    baseRx: rx + extraClearance,
    baseRzF: rzF + extraClearance,
    baseRzB: rzB + extraClearance,
    zShift,
  };
}

/**
 * Evaluates limb cross-section radii along normalized t in [0..1] (0 = proximal joint, 1 = distal joint).
 * Limb extends along -Y from y=0 to y=-length.
 */
export function evaluateLimbPoint(
  kind: 'upperArm' | 'forearm' | 'thigh' | 'calf' | 'neck',
  t: number,
  theta: number,
  side: 1 | -1, // +1 = left (+X), -1 = right (-X)
  m: BodyMetrics,
  extraClearance = 0,
  detailFactor = 1.0
): { x: number; z: number; rx: number; rz: number } {
  const tc = clamp(t, 0, 1);
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  // outward > 0 on lateral side of limb, < 0 on medial side
  const lateral = ct * side;
  const posMass = Math.max(0, m.mass);

  let rx = 0.05;
  let rz = 0.05;
  let xShift = 0;
  let zShift = 0;

  if (kind === 'upperArm') {
    const r = m.upperArmR;
    // Deltoid fullness near top -> biceps/triceps mid -> slightly flatter elbow
    const profile =
      0.98 * (1 - tc) +
      0.76 * tc +
      0.14 * gaussian(tc, 0.18, 0.14) +
      (0.08 + m.muscle * 0.16 + posMass * 0.1) * gaussian(tc, 0.48, 0.2);
    rx = r * profile * 0.94;
    rz = r * profile * 1.03;

    if (detailFactor > 0.3) {
      // Lateral deltoid cap
      if (lateral > 0) {
        rx += r * (0.22 + m.muscle * 0.16) * gaussian(tc, 0.16, 0.15) * lateral;
      }
      // Biceps front peak
      if (st > 0) {
        rz += r * (0.08 + m.muscle * 0.22) * gaussian(tc, 0.52, 0.17) * st;
      } else {
        // Triceps back curve
        rz += r * (0.1 + m.muscle * 0.18 + posMass * 0.12) * gaussian(tc, 0.42, 0.18) * -st;
      }
      // Humeral condyles width at elbow
      rx += r * 0.08 * gaussian(tc, 0.95, 0.07);
    }
  } else if (kind === 'forearm') {
    const r = m.forearmR;
    // Fuller muscular proximal belly, graceful taper to wrist
    const taper = THREE.MathUtils.lerp(0.95, 0.62, Math.pow(tc, 0.85));
    const belly = (0.18 + m.muscle * 0.16 + posMass * 0.08) * gaussian(tc, 0.24, 0.17);
    rx = r * (taper + belly * 0.92);
    rz = r * (taper * 1.06 + belly * 1.08);
    // At wrist, palm faces medially (-side X), so wrist is wider along Z than X
    const wristFlat = smoothstep(0.7, 1.0, tc);
    rx *= 1 - wristFlat * 0.16;
    rz *= 1 + wristFlat * 0.14;
    if (detailFactor > 0.4 && st < 0) {
      // Olecranon elbow tip
      rz += r * 0.1 * gaussian(tc, 0.05, 0.06) * -st;
    }
  } else if (kind === 'thigh') {
    const r = m.thighR;
    const taper = THREE.MathUtils.lerp(1.06, 0.67, Math.pow(tc, 0.92));
    const midFull = (0.1 + posMass * 0.14 + m.muscle * 0.1) * gaussian(tc, 0.36, 0.24);
    rx = r * (taper + midFull);
    rz = r * (taper * 1.06 + midFull * 1.05);

    if (detailFactor > 0.3) {
      // Outer thigh sweep (vastus lateralis / hip curve)
      if (lateral > 0) {
        rx += r * (0.12 + m.muscle * 0.12 + posMass * 0.08) * gaussian(tc, 0.32, 0.22) * lateral;
      } else {
        // Vastus medialis teardrop near inner knee
        rx += r * (0.07 + m.muscle * 0.12) * gaussian(tc, 0.78, 0.11) * -lateral;
      }
      // Quadriceps front curve
      if (st > 0) {
        rz += r * (0.12 + m.muscle * 0.14) * gaussian(tc, 0.42, 0.24) * st;
      } else {
        // Hamstring & glute fold transition
        rz += r * (0.14 + posMass * 0.08) * gaussian(tc, 0.28, 0.22) * -st;
      }
      // Knee condyle structure
      rx += r * 0.05 * gaussian(tc, 0.96, 0.06);
    }
  } else if (kind === 'calf') {
    const r = m.calfR;
    // Knee -> sculpted gastrocnemius -> slender Achilles/ankle
    const base = THREE.MathUtils.lerp(0.96, 0.56, smoothstep(0.0, 0.88, tc));
    const gastroc = (0.28 + m.muscle * 0.18 + posMass * 0.12) * gaussian(tc, 0.3, 0.16);
    rx = r * (base + gastroc * 0.88);
    rz = r * (base * 1.02 + gastroc * 0.55);

    if (detailFactor > 0.3) {
      if (st < 0) {
        // Strong gastrocnemius calf belly in back
        rz += r * (0.34 + m.muscle * 0.2 + posMass * 0.1) * gaussian(tc, 0.3, 0.16) * -st;
        zShift -= r * 0.08 * gaussian(tc, 0.3, 0.18);
      } else {
        // Patella bump at knee + crisp shin line
        rz += r * 0.12 * gaussian(tc, 0.05, 0.055) * Math.pow(st, 1.5);
      }
      // Subtle higher medial vs lower lateral calf asymmetry (classic figure drawing landmark!)
      if (lateral > 0) {
        rx += r * 0.08 * gaussian(tc, 0.27, 0.12) * lateral;
      } else {
        rx += r * 0.09 * gaussian(tc, 0.34, 0.12) * -lateral;
      }
      // Ankle malleoli bumps
      rx += r * 0.12 * gaussian(tc, 0.94, 0.038) * Math.abs(ct);
    }
  } else if (kind === 'neck') {
    // Extends +Y from 0 to 1
    const r = m.neckR;
    const flareBase = 0.22 * Math.pow(1 - tc, 2.2);
    const flareTop = 0.06 * Math.pow(tc, 2.0);
    rx = r * (0.98 + flareBase * 1.25 + flareTop);
    rz = r * (1.02 + flareBase * 0.85 + flareTop);
    zShift = m.unitScale * 0.008 * tc;
    if (detailFactor > 0.5 && st > 0) {
      // Subtle sternocleidomastoid definition
      const scm = gaussian(Math.abs(ct), 0.35 - tc * 0.2, 0.18);
      rz += r * 0.05 * scm * st;
    }
  }

  const effRx = rx + extraClearance;
  const effRz = rz + extraClearance;
  return {
    x: ct * effRx + xShift,
    z: st * effRz + zShift,
    rx: effRx,
    rz: effRz,
  };
}

export interface LoftOptions {
  yStart: number;
  yEnd: number;
  radialSegments: number;
  heightSegments: number;
  capStart?: number; // dome cap length extending before yStart (0 = flat closed, undefined = open)
  capEnd?: number;   // dome cap length extending after yEnd
  evalPoint: (t: number, theta: number) => { x: number; z: number; yOffset?: number };
}

/**
 * Builds a clean, watertight, smooth-shaded lofted BufferGeometry with optional
 * organic hemispherical dome caps (preventing gaps when joints bend!).
 */
export function buildLoftedGeometry(opts: LoftOptions): THREE.BufferGeometry {
  const { yStart, yEnd, radialSegments, heightSegments, capStart, capEnd, evalPoint } = opts;
  const dir = Math.sign(yEnd - yStart) || 1;

  interface RingSpec {
    y: number;
    t: number;
    scale: number;
  }

  const rings: RingSpec[] = [];
  const capSteps = 5;

  if (capStart !== undefined) {
    for (let i = 0; i < capSteps; i++) {
      const a = (i / capSteps) * (Math.PI / 2); // 0 = pole, PI/2 = equator
      const scale = Math.max(0.002, Math.sin(a));
      const y = yStart - dir * capStart * Math.cos(a);
      rings.push({ y, t: 0, scale });
    }
  }

  for (let i = 0; i <= heightSegments; i++) {
    const t = i / heightSegments;
    const y = THREE.MathUtils.lerp(yStart, yEnd, t);
    rings.push({ y, t, scale: 1 });
  }

  if (capEnd !== undefined) {
    for (let i = 1; i <= capSteps; i++) {
      const a = (i / capSteps) * (Math.PI / 2); // 0 = equator, PI/2 = pole
      const scale = Math.max(0.002, Math.cos(a));
      const y = yEnd + dir * capEnd * Math.sin(a);
      rings.push({ y, t: 1, scale });
    }
  }

  const cols = radialSegments + 1;
  const rows = rings.length;
  const positions = new Float32Array(rows * cols * 3);
  const uvs = new Float32Array(rows * cols * 2);
  const indices: number[] = [];

  for (let r = 0; r < rows; r++) {
    const ring = rings[r];
    // Compute ring center so cap shrinks smoothly toward actual center, not (0,0)
    const pF = evalPoint(ring.t, Math.PI / 2);
    const pB = evalPoint(ring.t, (3 * Math.PI) / 2);
    const pL = evalPoint(ring.t, 0);
    const pR = evalPoint(ring.t, Math.PI);
    const cx = (pL.x + pR.x) * 0.5;
    const cz = (pF.z + pB.z) * 0.5;

    for (let c = 0; c <= radialSegments; c++) {
      const u = c / radialSegments;
      // Ensure seam vertices share identical coordinates for seamless normals
      const theta = c === radialSegments ? 0 : u * Math.PI * 2;
      const pt = evalPoint(ring.t, theta);
      const px = cx + (pt.x - cx) * ring.scale;
      const pz = cz + (pt.z - cz) * ring.scale;
      const py = ring.y + (pt.yOffset || 0) * ring.scale;

      const idx = (r * cols + c) * 3;
      positions[idx] = px;
      positions[idx + 1] = py;
      positions[idx + 2] = pz;

      const uidx = (r * cols + c) * 2;
      uvs[uidx] = u;
      uvs[uidx + 1] = r / (rows - 1);
    }
  }

  // Ensure outward-facing triangle winding regardless of yStart -> yEnd direction!
  // With x = cos(theta), z = sin(theta): dP/dtheta = (-sin, 0, cos).
  // If dir > 0 (dP/dr = +Y): cross((0,1,0), (-sin,0,cos)) = (cos, 0, sin) = OUTWARD -> (a, c, b)
  // If dir < 0 (dP/dr = -Y): cross((-sin,0,cos), (0,-1,0)) = (cos, 0, sin) = OUTWARD -> (a, b, c)
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < radialSegments; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;
      if (dir > 0) {
        indices.push(a, d, b);
        indices.push(b, d, e);
      } else {
        indices.push(a, b, d);
        indices.push(b, e, d);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  // Fix seam normals so column 0 and column radialSegments share exact averaged normal
  const normAttr = geo.getAttribute('normal') as THREE.BufferAttribute;
  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  for (let r = 0; r < rows; r++) {
    const i0 = r * cols;
    const i1 = r * cols + radialSegments;
    v0.fromBufferAttribute(normAttr, i0);
    v1.fromBufferAttribute(normAttr, i1);
    v0.add(v1).normalize();
    normAttr.setXYZ(i0, v0.x, v0.y, v0.z);
    normAttr.setXYZ(i1, v0.x, v0.y, v0.z);
  }
  normAttr.needsUpdate = true;

  return geo;
}

export interface HeadLayout {
  geometry: THREE.BufferGeometry;
  noseGeometry: THREE.BufferGeometry;
  earGeometryL: THREE.BufferGeometry;
  earGeometryR: THREE.BufferGeometry;
  lipUpperGeo: THREE.BufferGeometry;
  lipLowerGeo: THREE.BufferGeometry;
  eyePosL: [number, number, number];
  eyePosR: [number, number, number];
  eyeRadius: number;
  browPosL: [number, number, number];
  browPosR: [number, number, number];
  crownCenterY: number;
  craniumRx: number;
  craniumRy: number;
  craniumRz: number;
}

/**
 * Builds a sculptural anatomical human head anchored at the skull base (y = 0)
 * rising to y = headHeight, facing +Z. Adapts smoothly to bodyMass and stylized roundness/eyeScale.
 */
export function buildSculptedHead(m: BodyMetrics): HeadLayout {
  const H = m.headHeight;
  const W = m.headWidth * 0.5;
  const D = m.headDepth * 0.5;
  const posMass = Math.max(0, m.mass);
  const negMass = Math.min(0, m.mass);
  const round = m.roundness;

  // Start from a high-resolution sphere and sculpt anatomical planes
  const segW = 44;
  const segH = 34;
  const geo = new THREE.SphereGeometry(1, segW, segH);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i);
    const sy = pos.getY(i); // -1 = chin, +1 = crown
    const sz = pos.getZ(i); // +1 = face front, -1 = occiput

    const v = (sy + 1) * 0.5; // 0 = chin bottom, 0.5 = eye line, 1 = crown
    const absX = Math.abs(sx);

    let x = sx * W;
    let y = v * H;
    let z = sz * D;

    // 1. Jaw & chin taper on lower front half (classic Loomis head proportions!)
    if (v < 0.52) {
      const low = 1 - v / 0.52; // 0 at eyes, 1 at chin
      const jawTaper = THREE.MathUtils.lerp(0.36, 0.16, round) - posMass * 0.08 + negMass * 0.04;
      x *= 1 - Math.pow(low, 1.35) * Math.max(0.1, jawTaper);

      // Back of skull (occiput) tucks cleanly up into neck at v ~ 0.18..0.42
      if (sz < 0) {
        const backLow = smoothstep(0.46, 0.08, v);
        z *= 1 - backLow * 0.46 * (-sz);
        y += H * 0.095 * backLow * Math.pow(-sz, 1.2);
      }

      // Forward chin projection & gentle jaw plane
      if (sz > 0) {
        const chinSpot = gaussian(v, 0.09, 0.075) * gaussian(sx, 0, 0.34);
        z += D * 0.14 * (1 - round * 0.35) * chinSpot * sz;
        // Double-chin / fuller jaw softness at higher bodyMass
        if (posMass > 0.15) {
          const jowl = gaussian(v, 0.18, 0.12) * gaussian(absX, 0.52, 0.28);
          x += Math.sign(sx) * W * posMass * 0.1 * jowl;
          y -= H * posMass * 0.025 * gaussian(v, 0.05, 0.08) * sz;
        }
      }
    } else {
      // Slight temporal flattening on sides of forehead (planar anatomy)
      const temple = gaussian(v, 0.64, 0.11) * Math.pow(absX, 2) * (1 - round * 0.7);
      x *= 1 - 0.06 * temple;
      // Cranium fullness at back-top (parietal/occipital dome)
      if (sz < 0) {
        z -= D * 0.09 * gaussian(v, 0.62, 0.18) * (-sz);
      }
    }

    // 2. Facial landmarks (front sz > 0.15)
    if (sz > 0.15) {
      const faceMask = smoothstep(0.15, 0.55, sz);

      // Zygomatic cheekbones (classic figure landmark!)
      const cheek = gaussian(v, 0.4, 0.085) * gaussian(absX, 0.54, 0.24);
      z += D * (0.075 + posMass * 0.04 + round * 0.04) * cheek * faceMask;
      x += Math.sign(sx) * W * (0.045 + posMass * 0.045 + round * 0.03) * cheek * faceMask;

      // Subtle hollow cheeks on very lean builds
      if (negMass < -0.2) {
        const hollow = gaussian(v, 0.27, 0.075) * gaussian(absX, 0.56, 0.2);
        x -= Math.sign(sx) * W * (-negMass) * 0.06 * hollow * faceMask;
      }

      // Supraorbital brow ridge
      const brow = gaussian(v, 0.555, 0.038) * (1 - smoothstep(0.55, 0.82, absX));
      z += D * 0.085 * (1 - round * 0.45) * brow * faceMask;

      // Eye socket recesses (receive 3D eyeballs cleanly!)
      const eyeSpacing = 0.34;
      const socketSize = 0.155 * Math.pow(m.eyeScale, 0.45);
      const sockL = gaussian(sx, eyeSpacing, socketSize) * gaussian(v, 0.485, 0.052 * Math.pow(m.eyeScale, 0.45));
      const sockR = gaussian(sx, -eyeSpacing, socketSize) * gaussian(v, 0.485, 0.052 * Math.pow(m.eyeScale, 0.45));
      const socket = sockL + sockR;
      z -= D * 0.155 * socket * faceMask;

      // Nasal root bridge blend
      const bridge = gaussian(sx, 0, 0.11) * smoothstep(0.32, 0.48, v) * (1 - smoothstep(0.5, 0.57, v));
      z += D * 0.095 * bridge * faceMask;

      // Mouth / muzzle subtle mound & labiomental crease above chin
      const muzzle = gaussian(v, 0.23, 0.055) * gaussian(sx, 0, 0.28);
      z += D * 0.055 * muzzle * faceMask;
      const chinCrease = gaussian(v, 0.155, 0.024) * gaussian(sx, 0, 0.25);
      z -= D * 0.035 * chinCrease * faceMask;
    }

    // Shift slightly forward relative to neck pivot so skull balances naturally over cervical spine
    z += D * 0.1;

    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();

  // Sculpted nose geometry (smooth rounded wedge integrated into face)
  const noseScale = 1 - round * 0.22;
  const noseGeo = new THREE.SphereGeometry(1, 16, 14);
  const nPos = noseGeo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < nPos.count; i++) {
    const nx = nPos.getX(i);
    const ny = nPos.getY(i); // -1 bottom/tip, +1 bridge top
    const nz = nPos.getZ(i);
    const nv = (ny + 1) * 0.5; // 0 = base, 1 = bridge
    // Narrow at bridge, softly flared at nostrils
    const wingFlare = 1 + 0.65 * gaussian(nv, 0.18, 0.18) * gaussian(Math.abs(nx), 0.75, 0.35);
    const width = W * 0.185 * THREE.MathUtils.lerp(1.08, 0.45, Math.pow(nv, 0.75)) * wingFlare * noseScale;
    const proj = D * 0.23 * THREE.MathUtils.lerp(1.0, 0.32, Math.pow(nv, 0.85)) * noseScale;
    const px = nx * width;
    const py = H * (0.335 + ny * 0.088);
    const pz = D * (0.98 + (nz > 0 ? nz * (proj / D) : nz * 0.08)) + D * 0.1 - D * 0.06 * nv;
    nPos.setXYZ(i, px, py, pz);
  }
  noseGeo.computeVertexNormals();

  // Subtle sculpted upper & lower lips
  const makeLip = (isUpper: boolean) => {
    const lg = new THREE.SphereGeometry(1, 16, 10);
    const lp = lg.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < lp.count; i++) {
      const lx = lp.getX(i);
      const ly = lp.getY(i);
      const lz = lp.getZ(i);
      const cornerTaper = Math.max(0.15, 1 - lx * lx * 0.85);
      const cupid = isUpper ? 1 - 0.22 * gaussian(lx, 0, 0.16) * Math.max(0, ly) : 1;
      const px = lx * W * 0.285;
      const py = H * (isUpper ? 0.242 : 0.214) + ly * H * (isUpper ? 0.017 : 0.02) * cornerTaper * cupid;
      const curveBack = lx * lx * D * 0.14;
      const pz = D * (isUpper ? 1.015 : 1.005) + lz * D * 0.065 * cornerTaper - curveBack;
      lp.setXYZ(i, px, py, pz);
    }
    lg.computeVertexNormals();
    return lg;
  };

  // Sculpted ears (left +X, right -X)
  const makeEar = (side: 1 | -1) => {
    const eg = new THREE.SphereGeometry(1, 14, 14);
    const ep = eg.getAttribute('position') as THREE.BufferAttribute;
    const earScale = 1 + (m.isStylized ? round * 0.18 : 0);
    for (let i = 0; i < ep.count; i++) {
      const ex = ep.getX(i);
      const ey = ep.getY(i);
      const ez = ep.getZ(i);
      const ev = (ey + 1) * 0.5;
      // Wider helix at top, narrower earlobe at bottom
      const lobeFactor = THREE.MathUtils.lerp(0.62, 1.08, ev);
      // Slight concave concha cup on outer front
      const cup = ex * side > 0 && ez > -0.2 ? -0.22 * gaussian(ey, 0, 0.5) * gaussian(ez, 0.1, 0.5) : 0;
      const localX = (ex * W * 0.12 + side * cup * W * 0.08) * earScale;
      const localY = ey * H * 0.105 * earScale;
      const localZ = ez * D * 0.145 * lobeFactor * earScale;
      // Angle ear slightly outward backward
      const ang = -side * 0.26;
      const rx = localX * Math.cos(ang) - localZ * Math.sin(ang);
      const rz = localX * Math.sin(ang) + localZ * Math.cos(ang);
      ep.setXYZ(i, side * W * 0.96 + rx, H * 0.445 + localY, D * 0.04 + rz);
    }
    eg.computeVertexNormals();
    return eg;
  };

  // Eye socket world-local coordinates
  const eyeRadius = Math.min(W, D) * 0.165 * Math.pow(m.eyeScale, 0.58);
  const eyeX = W * 0.355;
  const eyeY = H * 0.485;
  const eyeZ = D * 0.875 - eyeRadius * 0.22;

  const browY = eyeY + eyeRadius * 1.32 + H * 0.018;
  const browZ = D * 0.99;

  return {
    geometry: geo,
    noseGeometry: noseGeo,
    earGeometryL: makeEar(1),
    earGeometryR: makeEar(-1),
    lipUpperGeo: makeLip(true),
    lipLowerGeo: makeLip(false),
    eyePosL: [eyeX, eyeY, eyeZ],
    eyePosR: [-eyeX, eyeY, eyeZ],
    eyeRadius,
    browPosL: [eyeX * 1.02, browY, browZ],
    browPosR: [-eyeX * 1.02, browY, browZ],
    crownCenterY: H * 0.56,
    craniumRx: W * 1.01,
    craniumRy: H * 0.46,
    craniumRz: D * 1.03,
  };
}

/**
 * Builds sculpted foot (rear/midfoot anchored at ankle (0,0,0), sole at y = -footHeight)
 * and articulated toe section (anchored at ball of foot).
 */
export function buildSculptedFoot(
  side: 1 | -1,
  m: BodyMetrics,
  extraClearance = 0
): {
  footGeo: THREE.BufferGeometry;
  toeGeo: THREE.BufferGeometry;
  toeJointZ: number;
  toeJointY: number;
} {
  const L = m.footLength;
  const W = m.footWidth * 0.5 + extraClearance;
  const H = m.footHeight + extraClearance * 0.5;

  const heelBack = -L * 0.24;
  const ballZ = L * 0.48;
  const tipZ = L * 0.76;

  // Main foot: lofted along Z from heelBack to ballZ
  const segZ = 16;
  const segR = 22;
  const makeFootPart = (z0: number, z1: number, isToe: boolean) => {
    const cols = segR + 1;
    const rows = segZ + 3; // closed caps at both ends
    const positions = new Float32Array(rows * cols * 3);
    const indices: number[] = [];

    for (let r = 0; r < rows; r++) {
      let t: number;
      let capScale = 1;
      if (r === 0) {
        t = 0;
        capScale = 0.01;
      } else if (r === rows - 1) {
        t = 1;
        capScale = 0.01;
      } else {
        t = (r - 1) / segZ;
        if (r === 1) capScale = 0.72;
        if (r === rows - 2) capScale = 0.78;
      }

      const zGlobal = THREE.MathUtils.lerp(z0, z1, t);
      const u = (zGlobal - heelBack) / (tipZ - heelBack); // 0 = heel, 0.72 = ball, 1 = toes

      // Width profile: narrow rounded heel -> wider forefoot ball -> gently asymmetric toe taper
      const widthFactor =
        u < 0.74
          ? THREE.MathUtils.lerp(0.64, 1.04, smoothstep(0, 0.72, u))
          : THREE.MathUtils.lerp(1.04, 0.72, Math.pow((u - 0.74) / 0.26, 1.35));

      // Top height profile (instep slopes down smoothly from ankle to toes)
      const topY =
        u < 0.25
          ? THREE.MathUtils.lerp(-H * 0.18, H * 0.12, smoothstep(0, 0.24, u))
          : THREE.MathUtils.lerp(H * 0.12, -H * 0.62, Math.pow((u - 0.25) / 0.75, 0.78));

      const soleY = -H;
      const midY = (topY + soleY) * 0.5;
      const halfY = Math.max(0.008, (topY - soleY) * 0.5);

      // Slight medial bias on big toe side (-side * X)
      const xCenter = -side * W * 0.08 * smoothstep(0.45, 0.95, u);

      for (let c = 0; c <= segR; c++) {
        const theta = c === segR ? 0 : (c / segR) * Math.PI * 2;
        const ct = Math.cos(theta);
        const st = Math.sin(theta); // +1 = top, -1 = sole

        let px = xCenter + ct * W * widthFactor * capScale;
        let py: number;
        if (st < 0) {
          // Flat planted sole! With subtle medial arch lift when bare
          const flatSt = -Math.pow(-st, 0.42);
          const medial = -ct * side;
          const archLift =
            extraClearance > 0.002
              ? 0
              : H * 0.16 * gaussian(u, 0.46, 0.14) * Math.max(0, medial);
          py = midY + flatSt * halfY * capScale + archLift * capScale;
        } else {
          py = midY + Math.pow(st, 0.85) * halfY * capScale;
        }

        const pz = isToe ? zGlobal - ballZ : zGlobal;
        const pyLocal = isToe ? py - -H * 0.72 : py;

        const idx = (r * cols + c) * 3;
        positions[idx] = px;
        positions[idx + 1] = pyLocal;
        positions[idx + 2] = pz;
      }
    }

    // Winding: advancing along +Z with (ct, st, 0): dP/dtheta = (-sin, cos, 0), dP/dr = (0, 0, 1)
    // cross(dP/dtheta, dP/dr) = (cos, sin, 0) = OUTWARD -> (a, b, d)
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < segR; c++) {
        const a = r * cols + c;
        const b = a + 1;
        const d = (r + 1) * cols + c;
        const e = d + 1;
        indices.push(a, b, d);
        indices.push(b, e, d);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  };

  return {
    footGeo: makeFootPart(heelBack, ballZ + L * 0.04, false),
    toeGeo: makeFootPart(ballZ - L * 0.03, tipZ, true),
    toeJointZ: ballZ,
    toeJointY: -H * 0.72,
  };
}

/**
 * Builds subtle Body-Kun cross-contour guideline loops on a surface so artists can
 * read 3D perspective, centerline, ribcage tilt, and foreshortening effortlessly!
 */
export function buildLoopLine(
  points: THREE.Vector3[],
  closed = true
): THREE.BufferGeometry {
  const pts = closed && points.length > 0 ? [...points, points[0].clone()] : points;
  return new THREE.BufferGeometry().setFromPoints(pts);
}
