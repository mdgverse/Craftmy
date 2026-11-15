import * as THREE from 'three';
import type { AppearanceParams } from '../types/studio';
import type { HeadLayout } from './anatomyProfile';

type HairTexKind = 'straight' | 'wavy' | 'curly' | 'coily' | 'buzz' | 'braid';

const textureCache = new Map<HairTexKind, THREE.CanvasTexture>();

function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getHairBumpTexture(kind: HairTexKind): THREE.CanvasTexture {
  const existing = textureCache.get(kind);
  if (existing) return existing;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const rand = seededRng(kind.charCodeAt(0) * 997 + kind.charCodeAt(1) * 31);

  if (kind === 'straight') {
    for (let i = 0; i < 420; i++) {
      const x = rand() * size;
      const v = Math.floor(85 + rand() * 140);
      ctx.strokeStyle = `rgb(${v},${v},${v})`;
      ctx.lineWidth = 0.7 + rand() * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (rand() - 0.5) * 3, size);
      ctx.stroke();
    }
  } else if (kind === 'wavy') {
    for (let i = 0; i < 260; i++) {
      const x0 = rand() * size;
      const amp = 4 + rand() * 6;
      const phase = rand() * Math.PI * 2;
      const v = Math.floor(80 + rand() * 145);
      ctx.strokeStyle = `rgb(${v},${v},${v})`;
      ctx.lineWidth = 0.9 + rand() * 1.6;
      ctx.beginPath();
      for (let y = 0; y <= size; y += 8) {
        const x = x0 + Math.sin((y / size) * Math.PI * 4 + phase) * amp;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (kind === 'curly') {
    for (let i = 0; i < 360; i++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const r = 4 + rand() * 8;
      const v = Math.floor(70 + rand() * 165);
      ctx.strokeStyle = `rgb(${v},${v},${v})`;
      ctx.lineWidth = 1.4 + rand() * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, rand() * Math.PI, rand() * Math.PI + Math.PI * 1.4);
      ctx.stroke();
    }
  } else if (kind === 'coily') {
    for (let i = 0; i < 1600; i++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const r = 1.6 + rand() * 3.4;
      const v = Math.floor(45 + rand() * 195);
      ctx.strokeStyle = `rgb(${v},${v},${v})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 1.7);
      ctx.stroke();
    }
  } else if (kind === 'buzz') {
    for (let i = 0; i < 3200; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const v = Math.floor(60 + rand() * 170);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 1.5, 2.2);
    }
  } else if (kind === 'braid') {
    const step = 12;
    for (let y = -step; y < size + step; y += step) {
      for (let x = 0; x < size; x += 24) {
        ctx.strokeStyle = '#d4d4d4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 12, y + step * 0.8);
        ctx.lineTo(x + 24, y);
        ctx.stroke();
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y + step * 0.5);
        ctx.lineTo(x + 12, y + step * 1.3);
        ctx.lineTo(x + 24, y + step * 0.5);
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  textureCache.set(kind, tex);
  return tex;
}

function makeHairMaterial(
  colorHex: string,
  roughness: number,
  kind: HairTexKind,
  bumpScale = 0.004,
  opacity = 1
): THREE.MeshStandardMaterial {
  const bump = getHairBumpTexture(kind);
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: THREE.MathUtils.clamp(roughness, 0.15, 0.98),
    metalness: 0.03,
    bumpMap: bump,
    bumpScale,
    transparent: opacity < 1,
    opacity,
    side: THREE.FrontSide,
  });
}

/**
 * Builds a fitted cranial hair cap that respects forehead, ears, and nape.
 */
function buildScalpCap(
  head: HeadLayout,
  opts: {
    thickness: number;
    foreheadCut?: number; // higher = recedes higher up forehead (default 0.24)
    sideCut?: number;     // higher = shorter sides (default -0.05)
    napeCut?: number;     // lower = extends further down neck (default -0.52)
    topLift?: number;     // extra crown volume
    waveAmp?: number;
    waveFreq?: number;
    sidePart?: number;    // e.g. 0.38 creates a part groove on +X or -X
  }
): THREE.BufferGeometry {
  const {
    thickness,
    foreheadCut = 0.24,
    sideCut = -0.02,
    napeCut = -0.52,
    topLift = 0,
    waveAmp = 0,
    waveFreq = 12,
    sidePart,
  } = opts;

  const rx = head.craniumRx + thickness;
  const ry = head.craniumRy + thickness;
  const rz = head.craniumRz + thickness;
  const cy = head.crownCenterY;
  const cz = head.craniumRz * 0.08;

  const geo = new THREE.SphereGeometry(1, 38, 28);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i);
    const sy = pos.getY(i);
    const sz = pos.getZ(i);

    // Compute hairline boundary sy as function of azimuth around head
    const frontFactor = Math.max(0, sz);
    const backFactor = Math.max(0, -sz);
    const sideFactor = Math.abs(sx);

    // Ear arch cutout centered around sz ~ -0.04, |sx| ~ 1
    const earArch =
      0.24 * Math.exp(-Math.pow((sz + 0.04) / 0.26, 2)) * Math.pow(sideFactor, 2.2);

    const minSy =
      foreheadCut * Math.pow(frontFactor, 1.35) +
      napeCut * Math.pow(backFactor, 1.2) +
      sideCut * Math.pow(sideFactor, 1.8) +
      earArch;

    let effSy = sy;
    let tuck = 1.0;
    if (sy < minSy) {
      // Smoothly tuck sub-hairline vertices tightly inside the hairline rim
      effSy = minSy + (sy - minSy) * 0.05;
      tuck = 0.91;
    }

    // Recompute unit ring radius for effSy
    const ringScale = Math.sqrt(Math.max(0.001, 1 - effSy * effSy));
    const origRing = Math.sqrt(Math.max(0.0001, sx * sx + sz * sz));
    const nx = origRing > 1e-4 ? (sx / origRing) * ringScale : 0;
    const nz = origRing > 1e-4 ? (sz / origRing) * ringScale : 0;

    let ripple = 1;
    if (waveAmp > 0 && sy >= minSy) {
      const az = Math.atan2(nx, nz);
      ripple += waveAmp * Math.sin(az * waveFreq + effSy * 6);
    }

    let lift = effSy > 0.15 ? topLift * Math.pow((effSy - 0.15) / 0.85, 1.1) : 0;
    if (sidePart !== undefined && effSy > 0.2 && nz > -0.3) {
      const partGroove = Math.exp(-Math.pow((nx - sidePart) / 0.075, 2));
      lift -= thickness * 0.65 * partGroove;
      ripple -= 0.03 * partGroove;
    }

    // Taper nape smoothly toward neck
    const napeTaper = effSy < -0.15 && nz < 0 ? 1 - Math.min(0.32, (-effSy - 0.15) * 0.55) : 1;

    const px = nx * rx * tuck * ripple * napeTaper;
    const py = cy + effSy * ry + lift;
    const pz = cz + nz * rz * tuck * ripple * napeTaper;
    pos.setXYZ(i, px, py, pz);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a plump, tapered 3D sculpted hair strand lock along control points.
 */
function buildTaperedStrand(
  points: THREE.Vector3[],
  radiusBase: number,
  options?: {
    flatten?: number; // <1 makes ribbon-like flat lock, 1 = round tube
    tipScale?: number;
    rootScale?: number;
    tubularSegments?: number;
    radialSegments?: number;
    twistTurns?: number;
    braidNodes?: number;
  }
): THREE.BufferGeometry {
  const {
    flatten = 0.58,
    tipScale = 0.08,
    rootScale = 0.72,
    tubularSegments = 18,
    radialSegments = 7,
    twistTurns = 0,
    braidNodes = 0,
  } = options || {};

  const curve = new THREE.CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const cols = radialSegments + 1;
  const rows = tubularSegments + 1;
  const positions = new Float32Array(rows * cols * 3);
  const uvs = new Float32Array(rows * cols * 2);
  const indices: number[] = [];
  const p = new THREE.Vector3();

  for (let r = 0; r < rows; r++) {
    const t = r / tubularSegments;
    curve.getPointAt(t, p);
    const N = frames.normals[r];
    const B = frames.binormals[r];

    // Plump mid-body taper to clean sculpted tip
    let profile: number;
    if (t < 0.18) {
      profile = THREE.MathUtils.lerp(rootScale, 1.0, t / 0.18);
    } else {
      profile = THREE.MathUtils.lerp(1.0, tipScale, Math.pow((t - 0.18) / 0.82, 1.35));
    }

    if (braidNodes > 0) {
      profile *= 0.84 + 0.24 * Math.abs(Math.sin(t * Math.PI * braidNodes));
    }

    const twist = t * Math.PI * 2 * twistTurns;

    for (let c = 0; c <= radialSegments; c++) {
      const u = c / radialSegments;
      const ang = (c === radialSegments ? 0 : u * Math.PI * 2) + twist;
      let ca = Math.cos(ang) * radiusBase * profile;
      let sa = Math.sin(ang) * radiusBase * profile * flatten;

      // Double-lobe figure-8 cross-section when twisted (two-strand twists!)
      if (twistTurns > 1.5) {
        const lobe = 0.78 + 0.34 * Math.cos(2 * (ang - twist) + twist * 2);
        ca *= lobe;
        sa = Math.sin(ang) * radiusBase * profile * lobe;
      }

      const idx = (r * cols + c) * 3;
      positions[idx] = p.x + N.x * ca + B.x * sa;
      positions[idx + 1] = p.y + N.y * ca + B.y * sa;
      positions[idx + 2] = p.z + N.z * ca + B.z * sa;

      const uidx = (r * cols + c) * 2;
      uvs[uidx] = u;
      uvs[uidx + 1] = t * 3;
    }
  }

  for (let r = 0; r < tubularSegments; r++) {
    for (let c = 0; c < radialSegments; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;
      indices.push(a, d, b);
      indices.push(b, d, e);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates a real 3D spiral curl / ringlet along an axis from start to end.
 */
function buildSpiralCurl(
  start: THREE.Vector3,
  end: THREE.Vector3,
  coilRadius: number,
  tubeRadius: number,
  turns: number,
  phase = 0
): THREE.BufferGeometry {
  const steps = Math.max(14, Math.round(turns * 6));
  const axis = end.clone().sub(start);
  const up = Math.abs(axis.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(axis, up).normalize();
  const v = new THREE.Vector3().crossVectors(axis, u).normalize();

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const env = Math.sin(Math.min(1, t * 3.5) * (Math.PI / 2)) * (1 - t * 0.32);
    const a = phase + t * turns * Math.PI * 2;
    const pt = start
      .clone()
      .addScaledVector(axis, t)
      .addScaledVector(u, Math.cos(a) * coilRadius * env)
      .addScaledVector(v, Math.sin(a) * coilRadius * env);
    pts.push(pt);
  }
  return buildTaperedStrand(pts, tubeRadius, {
    flatten: 0.92,
    tipScale: 0.25,
    rootScale: 0.7,
    tubularSegments: steps,
    radialSegments: 6,
  });
}

/**
 * Generates an organic sculpted 4C afro / coily volume with bumpy micro-coil harmonics
 * + perimeter coil clusters for unmistakable texture & silhouette.
 */
function addCoilyVolume(
  group: THREE.Group,
  center: THREE.Vector3,
  radii: THREE.Vector3,
  mat: THREE.MeshStandardMaterial,
  matAlt: THREE.MeshStandardMaterial | null,
  options: {
    flatTop?: number;
    bottomCut?: number;
    faceCutZ?: number;
    faceCutY?: number;
    puffClusters?: number;
    seed?: number;
  }
) {
  const {
    flatTop = 0,
    bottomCut = -0.68,
    faceCutZ,
    faceCutY,
    puffClusters = 65,
    seed = 42,
  } = options;
  const rand = seededRng(seed);

  const core = new THREE.SphereGeometry(1, 36, 28);
  const pos = core.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    let sx = pos.getX(i);
    let sy = pos.getY(i);
    let sz = pos.getZ(i);

    if (flatTop > 0 && sy > 1 - flatTop) {
      sy = 1 - flatTop + (sy - (1 - flatTop)) * 0.18;
    }
    if (sy < bottomCut) {
      sy = bottomCut + (sy - bottomCut) * 0.15;
      sx *= 0.82;
      sz *= 0.82;
    }

    // Multi-frequency organic coily bumpiness so silhouette is never a plain sphere
    const n1 = Math.sin(sx * 11.3 + sz * 7.1) * Math.cos(sy * 10.7 - sx * 5.2);
    const n2 = Math.sin(sy * 19.1 + sz * 17.3) * Math.cos(sx * 18.4);
    const bump = 1 + n1 * 0.055 + n2 * 0.032;

    let px = center.x + sx * radii.x * bump;
    let py = center.y + sy * radii.y * bump;
    let pz = center.z + sz * radii.z * bump;

    // Carve clean face opening so eyes/brows/face remain visible
    if (faceCutZ !== undefined && faceCutY !== undefined && pz > faceCutZ && py < faceCutY) {
      const push = (faceCutY - py) / Math.max(0.04, radii.y);
      pz = THREE.MathUtils.lerp(pz, faceCutZ * 0.72, Math.min(1, push * 1.4));
    }

    pos.setXYZ(i, px, py, pz);
  }
  core.computeVertexNormals();
  const coreMesh = new THREE.Mesh(core, mat);
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;
  group.add(coreMesh);

  // Add perimeter 3D coily puff clusters using a shared mini-sphere geometry
  const puffGeo = new THREE.IcosahedronGeometry(1, 1);
  for (let i = 0; i < puffClusters; i++) {
    // Fibonacci sphere distribution + jitter
    const y = 1 - (i / Math.max(1, puffClusters - 1)) * (1 - bottomCut);
    const rRing = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * 2.39996 + (rand() - 0.5) * 0.35;
    let sx = Math.cos(theta) * rRing;
    let sy = y;
    let sz = Math.sin(theta) * rRing;

    if (flatTop > 0 && sy > 1 - flatTop) {
      sy = 1 - flatTop + rand() * 0.04;
    }

    const px = center.x + sx * radii.x * 0.96;
    const py = center.y + sy * radii.y * 0.96;
    const pz = center.z + sz * radii.z * 0.96;

    if (faceCutZ !== undefined && faceCutY !== undefined && pz > faceCutZ * 0.88 && py < faceCutY * 1.03 && Math.abs(sx) < 0.72) {
      continue;
    }

    const puffR = Math.min(radii.x, radii.y) * (0.13 + rand() * 0.085);
    const useAlt = matAlt && sy > 0.42 && rand() > 0.62;
    const m = new THREE.Mesh(puffGeo, useAlt ? matAlt : mat);
    m.position.set(px, py, pz);
    m.scale.setScalar(puffR);
    m.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    m.castShadow = true;
    group.add(m);
  }
}

/**
 * Helper to place cascading draped strands around head perimeter (left, back, right).
 */
function addPerimeterCurtain(
  group: THREE.Group,
  head: HeadLayout,
  mat: THREE.MeshStandardMaterial,
  matTip: THREE.MeshStandardMaterial,
  opts: {
    count: number;
    azStart: number;  // angle in rad (0 = +Z front, PI = -Z back, PI/2 = +X left)
    azEnd: number;
    length: number;
    strandRadius: number;
    flare: number;
    waveAmp?: number;
    waveFreq?: number;
    flatten?: number;
    layers?: number;
    twistTurns?: number;
    braidNodes?: number;
    volume: number;
    seed?: number;
  }
) {
  const {
    count,
    azStart,
    azEnd,
    length,
    strandRadius,
    flare,
    waveAmp = 0,
    waveFreq = 2.5,
    flatten = 0.52,
    layers = 1,
    twistTurns = 0,
    braidNodes = 0,
    volume,
    seed = 101,
  } = opts;

  const rand = seededRng(seed);
  const rx = head.craniumRx * (1.02 + (volume - 1) * 0.16);
  const ry = head.craniumRy;
  const rz = head.craniumRz * (1.02 + (volume - 1) * 0.16);
  const cy = head.crownCenterY;
  const cz = head.craniumRz * 0.08;

  for (let layer = 0; layer < layers; layer++) {
    const layerLen = length * (1 - layer * 0.24);
    const layerOut = 1 + layer * 0.085;
    const n = Math.max(4, Math.round(count * (1 - layer * 0.15)));

    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const az = THREE.MathUtils.lerp(azStart, azEnd, u) + (rand() - 0.5) * 0.05;
      const sx = Math.sin(az);
      const sz = Math.cos(az);

      // Push slightly further back when wrapping over shoulders (at back/sides)
      const root = new THREE.Vector3(
        sx * rx * 0.58,
        cy + ry * (0.86 - layer * 0.08),
        cz + sz * rz * 0.58
      );
      const temple = new THREE.Vector3(
        sx * rx * 1.04 * layerOut,
        cy + ry * (0.28 - layer * 0.1),
        cz + sz * rz * 1.04 * layerOut
      );
      const jaw = new THREE.Vector3(
        sx * rx * (1.07 + flare * 0.35) * layerOut + Math.sin(layer + i) * waveAmp * 0.4,
        cy - layerLen * 0.34,
        cz + sz * rz * (1.05 + flare * 0.28) * layerOut
      );
      // Shoulder clearance when falling long down back/sides
      const shoulderPush = layerLen > ry * 1.7 ? 1.18 + flare * 0.55 : 1.02 + flare * 0.5;
      const mid = new THREE.Vector3(
        sx * rx * shoulderPush * layerOut + Math.sin(waveFreq * 1.6 + i * 0.7) * waveAmp,
        cy - layerLen * 0.68,
        cz + sz * rz * (1.08 + (sz < -0.2 ? 0.22 : 0.06) + flare * 0.3) * layerOut +
          Math.cos(waveFreq * 1.4 + i * 0.5) * waveAmp * 0.6
      );
      const tip = new THREE.Vector3(
        sx * rx * (shoulderPush + flare * 0.25) * layerOut +
          Math.sin(waveFreq * 3.1 + i * 0.7) * waveAmp * 1.15,
        cy - layerLen * (0.95 + (rand() - 0.5) * 0.09),
        cz + sz * rz * (1.1 + (sz < -0.2 ? 0.28 : 0.05) + flare * 0.32) * layerOut
      );

      const geo = buildTaperedStrand([root, temple, jaw, mid, tip], strandRadius * volume, {
        flatten,
        tipScale: braidNodes > 0 || twistTurns > 1 ? 0.42 : 0.12,
        rootScale: 0.78,
        twistTurns,
        braidNodes,
        tubularSegments: waveAmp > 0.008 || twistTurns > 1 || braidNodes > 0 ? 20 : 14,
      });

      const useSecondary = layer > 0 && i % 4 === 1;
      const mesh = new THREE.Mesh(geo, useSecondary ? matTip : mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  }
}

/**
 * Helper to add bangs / fringe across the forehead (+Z).
 */
function addFringe(
  group: THREE.Group,
  head: HeadLayout,
  mat: THREE.MeshStandardMaterial,
  style: 'blunt' | 'wispy' | 'curtain' | 'sideSweep' | 'choppy',
  volume = 1
) {
  const rx = head.craniumRx;
  const ry = head.craniumRy;
  const rz = head.craniumRz;
  const cy = head.crownCenterY;
  const cz = rz * 0.08;

  const count = style === 'blunt' ? 11 : style === 'curtain' ? 8 : 9;
  for (let i = 0; i < count; i++) {
    const u = (i / (count - 1)) * 2 - 1; // -1 (right) to +1 (left)
    if (style === 'curtain' && Math.abs(u) < 0.14) continue;

    const az = u * 0.68;
    const sx = Math.sin(az);
    const sz = Math.cos(az);

    let drop = ry * 0.46;
    let curveX = 0;
    if (style === 'curtain') {
      drop = ry * (0.42 + Math.abs(u) * 0.48);
      curveX = Math.sign(u) * rx * 0.22 * (1 - Math.abs(u) * 0.3);
    } else if (style === 'sideSweep') {
      drop = ry * (0.32 + (u + 1) * 0.22);
      curveX = rx * 0.26;
    } else if (style === 'choppy') {
      drop = ry * (0.34 + ((i * 7) % 3) * 0.07);
    } else if (style === 'wispy') {
      drop = ry * (0.44 + Math.abs(u) * 0.1);
    }

    const p0 = new THREE.Vector3(sx * rx * 0.45, cy + ry * 0.85, cz + sz * rz * 0.55);
    const p1 = new THREE.Vector3(
      sx * rx * 0.86 + curveX * 0.35,
      cy + ry * 0.48,
      cz + sz * rz * 1.03
    );
    const p2 = new THREE.Vector3(
      sx * rx * 0.94 + curveX,
      cy + ry * 0.52 - drop,
      cz + sz * rz * 1.05
    );

    const w =
      style === 'blunt'
        ? rx * 0.145
        : style === 'curtain'
        ? rx * 0.14
        : rx * 0.115;
    const geo = buildTaperedStrand([p0, p1, p2], w * (0.9 + (volume - 1) * 0.25), {
      flatten: 0.42,
      tipScale: style === 'blunt' ? 0.58 : 0.12,
      tubularSegments: 10,
    });
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    group.add(m);
  }
}

/**
 * Master procedural generator for all 32 hairstyles in HAIR_CATALOG.
 */
export function buildHairMesh(
  hairId: string,
  head: HeadLayout,
  appearance: AppearanceParams
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'hairRoot';
  if (!hairId || hairId === 'bald') return group;

  const vol = THREE.MathUtils.clamp(appearance.hairVolume, 0.7, 1.55);
  const len = THREE.MathUtils.clamp(appearance.hairLength, 0.7, 1.55);
  const rough = appearance.hairRoughness;
  const c1 = appearance.hairColor;
  const c2 = appearance.hairSecondaryColor || appearance.hairColor;

  const rx = head.craniumRx;
  const ry = head.craniumRy;
  const rz = head.craniumRz;
  const cy = head.crownCenterY;
  const cz = rz * 0.08;
  const u = rx; // proportional hair unit scaled seamlessly to head (including chibi/stylized!)

  const addCap = (
    mat: THREE.MeshStandardMaterial,
    opts: Parameters<typeof buildScalpCap>[1]
  ) => {
    const mesh = new THREE.Mesh(buildScalpCap(head, opts), mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  switch (hairId) {
    case 'buzz_cut': {
      const mat = makeHairMaterial(c1, Math.max(0.85, rough), 'buzz', 0.005);
      addCap(mat, {
        thickness: u * 0.025 * vol,
        foreheadCut: 0.28,
        sideCut: 0.04,
        napeCut: -0.46,
      });
      break;
    }

    case 'low_fade': {
      const fadeMat = makeHairMaterial(c1, 0.9, 'buzz', 0.004, 0.62);
      const topMat = makeHairMaterial(c1, rough, 'wavy', 0.006);
      addCap(fadeMat, {
        thickness: u * 0.02,
        foreheadCut: 0.34,
        sideCut: 0.06,
        napeCut: -0.42,
      });
      addCap(topMat, {
        thickness: u * 0.095 * vol,
        foreheadCut: 0.24,
        sideCut: 0.38,
        napeCut: -0.05,
        topLift: u * 0.14 * vol * len,
        waveAmp: 0.025,
        waveFreq: 16,
      });
      // Textured forward crop locks on crown
      const rand = seededRng(12);
      for (let i = 0; i < 14; i++) {
        const fx = ((i / 13) * 2 - 1) * rx * 0.68;
        const p0 = new THREE.Vector3(fx * 0.7, cy + ry * 0.98 + u * 0.1 * vol, cz - rz * 0.1);
        const p1 = new THREE.Vector3(fx * 0.92 + (rand() - 0.5) * u * 0.08, cy + ry * 0.88 + u * 0.12 * vol, cz + rz * 0.55);
        const p2 = new THREE.Vector3(fx * 0.95, cy + ry * 0.56, cz + rz * 0.98);
        const m = new THREE.Mesh(
          buildTaperedStrand([p0, p1, p2], u * 0.13 * vol, { flatten: 0.55, tipScale: 0.2, tubularSegments: 8 }),
          topMat
        );
        m.castShadow = true;
        group.add(m);
      }
      break;
    }

    case 'high_top_fade': {
      const fadeMat = makeHairMaterial(c1, 0.92, 'buzz', 0.004, 0.55);
      const coilyMat = makeHairMaterial(c1, Math.max(0.88, rough), 'coily', 0.009);
      addCap(fadeMat, {
        thickness: u * 0.018,
        foreheadCut: 0.36,
        sideCut: 0.12,
        napeCut: -0.35,
      });
      // Sculpted cylindrical flat-top afro crown
      const height = ry * 0.72 * vol * len;
      const topGeo = new THREE.CylinderGeometry(
        rx * 0.86 * vol,
        rx * 0.78,
        height,
        32,
        10,
        false
      );
      const tp = topGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < tp.count; i++) {
        const x = tp.getX(i);
        const y = tp.getY(i);
        const z = tp.getZ(i);
        // Slightly oval in Z to match skull + subtle sponge-coil bumps
        const noise = 1 + 0.03 * Math.sin(x * 65 + z * 55) * Math.cos(y * 50);
        const edgeRound = Math.abs(y) > height * 0.42 ? 0.95 : 1;
        tp.setXYZ(i, x * noise * edgeRound, y, z * (rz / rx) * 0.94 * noise * edgeRound);
      }
      topGeo.computeVertexNormals();
      const topMesh = new THREE.Mesh(topGeo, coilyMat);
      topMesh.position.set(0, cy + ry * 0.72 + height * 0.32, cz + rz * 0.03);
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      group.add(topMesh);
      break;
    }

    case 'undercut_swept': {
      const sideMat = makeHairMaterial(c1, 0.86, 'buzz', 0.004, 0.72);
      const topMat = makeHairMaterial(c1, rough, 'straight', 0.005);
      const hiMat = makeHairMaterial(c2, rough, 'straight', 0.005);
      addCap(sideMat, {
        thickness: u * 0.028,
        foreheadCut: 0.35,
        sideCut: 0.02,
        napeCut: -0.45,
      });
      // Voluminous swept-back quiff strands on crown
      for (let i = 0; i < 15; i++) {
        const s = (i / 14) * 2 - 1;
        const x0 = s * rx * 0.66;
        const lift = (1 - s * s * 0.45) * u * 0.34 * vol * len;
        const sweepSide = rx * 0.12 * (1 - Math.abs(s) * 0.5);
        const p0 = new THREE.Vector3(x0 * 0.9, cy + ry * 0.52, cz + rz * 0.88 * Math.cos(s * 0.65));
        const p1 = new THREE.Vector3(x0 * 0.92 + sweepSide, cy + ry * 0.98 + lift, cz + rz * 0.48);
        const p2 = new THREE.Vector3(x0 * 0.88 + sweepSide * 0.7, cy + ry * 1.02 + lift * 0.65, cz - rz * 0.25);
        const p3 = new THREE.Vector3(x0 * 0.72, cy + ry * 0.58, cz - rz * 0.96);
        const m = new THREE.Mesh(
          buildTaperedStrand([p0, p1, p2, p3], u * 0.165 * vol, {
            flatten: 0.55,
            rootScale: 0.82,
            tipScale: 0.18,
          }),
          i % 5 === 2 ? hiMat : topMat
        );
        m.castShadow = true;
        group.add(m);
      }
      break;
    }

    case 'classic_part': {
      const mat = makeHairMaterial(c1, Math.min(0.65, rough), 'straight', 0.004);
      addCap(mat, {
        thickness: u * 0.095 * vol,
        foreheadCut: 0.24,
        sideCut: -0.02,
        napeCut: -0.5,
        topLift: u * 0.13 * vol,
        sidePart: -0.42,
      });
      // Neat side-combed front sweep across forehead
      for (let i = 0; i < 8; i++) {
        const k = i / 7;
        const p0 = new THREE.Vector3(-rx * 0.44, cy + ry * 0.82, cz + rz * (0.68 - k * 0.55));
        const p1 = new THREE.Vector3(rx * 0.12, cy + ry * 1.0 + u * 0.12 * vol, cz + rz * (0.82 - k * 0.58));
        const p2 = new THREE.Vector3(rx * 0.74, cy + ry * 0.68, cz + rz * (0.62 - k * 0.52));
        const m = new THREE.Mesh(
          buildTaperedStrand([p0, p1, p2], u * 0.15 * vol, { flatten: 0.48, tipScale: 0.28 }),
          mat
        );
        m.castShadow = true;
        group.add(m);
      }
      break;
    }

    case 'modern_mullet': {
      const mat = makeHairMaterial(c1, rough, 'wavy', 0.005);
      const tipMat = makeHairMaterial(c2, rough, 'wavy', 0.005);
      addCap(mat, {
        thickness: u * 0.1 * vol,
        foreheadCut: 0.22,
        sideCut: 0.12,
        napeCut: -0.55,
        topLift: u * 0.18 * vol,
        waveAmp: 0.035,
      });
      addFringe(group, head, mat, 'choppy', vol);
      // Iconic flowing layered neck tail in the back!
      addPerimeterCurtain(group, head, mat, tipMat, {
        count: 13,
        azStart: Math.PI * 0.68,
        azEnd: Math.PI * 1.32,
        length: ry * 1.78 * len,
        strandRadius: u * 0.15,
        flare: 0.36,
        waveAmp: u * 0.08,
        waveFreq: 2.4,
        layers: 2,
        volume: vol,
        seed: 77,
      });
      break;
    }

    case 'pixie_layered': {
      const mat = makeHairMaterial(c1, rough, 'straight', 0.005);
      addCap(mat, {
        thickness: u * 0.105 * vol,
        foreheadCut: 0.22,
        sideCut: -0.06,
        napeCut: -0.54,
        topLift: u * 0.15 * vol,
        sidePart: -0.35,
      });
      addFringe(group, head, mat, 'sideSweep', vol);
      // Feathered crown layers
      for (let i = 0; i < 12; i++) {
        const az = (i / 12) * Math.PI * 2;
        const p0 = new THREE.Vector3(0, cy + ry * 1.06, cz - rz * 0.05);
        const p1 = new THREE.Vector3(Math.sin(az) * rx * 0.78 * vol, cy + ry * 0.88, cz + Math.cos(az) * rz * 0.78 * vol);
        const p2 = new THREE.Vector3(Math.sin(az) * rx * 1.09 * vol, cy + ry * 0.36, cz + Math.cos(az) * rz * 1.08 * vol);
        const m = new THREE.Mesh(
          buildTaperedStrand([p0, p1, p2], u * 0.16 * vol, { flatten: 0.45, tipScale: 0.1 }),
          mat
        );
        m.castShadow = true;
        group.add(m);
      }
      break;
    }

    case 'bob_bangs': {
      const mat = makeHairMaterial(c1, Math.min(0.55, rough), 'straight', 0.004);
      const mat2 = makeHairMaterial(c2, Math.min(0.55, rough), 'straight', 0.004);
      addCap(mat, {
        thickness: u * 0.12 * vol,
        foreheadCut: 0.18,
        sideCut: -0.1,
        napeCut: -0.52,
        topLift: u * 0.1 * vol,
      });
      addFringe(group, head, mat, 'blunt', vol);
      // Sleek chin-length bob curving subtly inward at jaw!
      addPerimeterCurtain(group, head, mat, mat2, {
        count: 24,
        azStart: 0.62,
        azEnd: Math.PI * 2 - 0.62,
        length: ry * 1.18 * len,
        strandRadius: u * 0.19,
        flare: -0.08,
        flatten: 0.46,
        volume: vol,
        seed: 201,
      });
      break;
    }

    case 'straight_layered_mid': {
      const mat = makeHairMaterial(c1, rough, 'straight', 0.004);
      const mat2 = makeHairMaterial(c2, rough, 'straight', 0.004);
      addCap(mat, {
        thickness: u * 0.115 * vol,
        foreheadCut: 0.2,
        sideCut: -0.08,
        napeCut: -0.52,
        topLift: u * 0.11 * vol,
        sidePart: 0.0,
      });
      addFringe(group, head, mat, 'curtain', vol);
      addPerimeterCurtain(group, head, mat, mat2, {
        count: 24,
        azStart: 0.66,
        azEnd: Math.PI * 2 - 0.66,
        length: ry * 2.15 * len,
        strandRadius: u * 0.18,
        flare: 0.22,
        flatten: 0.48,
        layers: 2,
        volume: vol,
        seed: 202,
      });
      break;
    }

    case 'straight_long': {
      const mat = makeHairMaterial(c1, Math.min(0.58, rough), 'straight', 0.004);
      const mat2 = makeHairMaterial(c2, Math.min(0.58, rough), 'straight', 0.004);
      addCap(mat, {
        thickness: u * 0.12 * vol,
        foreheadCut: 0.22,
        sideCut: -0.08,
        napeCut: -0.54,
        topLift: u * 0.1 * vol,
        sidePart: 0.0,
      });
      addFringe(group, head, mat, 'wispy', vol);
      addPerimeterCurtain(group, head, mat, mat2, {
        count: 26,
        azStart: 0.68,
        azEnd: Math.PI * 2 - 0.68,
        length: ry * 3.45 * len,
        strandRadius: u * 0.19,
        flare: 0.26,
        flatten: 0.46,
        layers: 2,
        volume: vol,
        seed: 203,
      });
      break;
    }

    case 'straight_hime_xlong': {
      const mat = makeHairMaterial(c1, Math.min(0.5, rough), 'straight', 0.004);
      const mat2 = makeHairMaterial(c2, Math.min(0.5, rough), 'straight', 0.004);
      addCap(mat, {
        thickness: u * 0.125 * vol,
        foreheadCut: 0.16,
        sideCut: -0.1,
        napeCut: -0.55,
        topLift: u * 0.1 * vol,
      });
      addFringe(group, head, mat, 'blunt', vol);
      // Iconic cheek-length blunt Hime sidelocks!
      for (const side of [-1, 1] as const) {
        const p0 = new THREE.Vector3(side * rx * 0.62, cy + ry * 0.72, cz + rz * 0.62);
        const p1 = new THREE.Vector3(side * rx * 0.96, cy + ry * 0.12, cz + rz * 0.68);
        const p2 = new THREE.Vector3(side * rx * 0.88, cy - ry * 0.82, cz + rz * 0.64);
        const lock = new THREE.Mesh(
          buildTaperedStrand([p0, p1, p2], u * 0.22 * vol, { flatten: 0.36, tipScale: 0.68 }),
          mat
        );
        lock.castShadow = true;
        group.add(lock);
      }
      // Extra-long dramatic cascading back length
      addPerimeterCurtain(group, head, mat, mat2, {
        count: 24,
        azStart: 0.95,
        azEnd: Math.PI * 2 - 0.95,
        length: ry * 4.75 * len,
        strandRadius: u * 0.2,
        flare: 0.32,
        flatten: 0.45,
        layers: 2,
        volume: vol,
        seed: 204,
      });
      break;
    }

    case 'wavy_surfer': {
      const mat = makeHairMaterial(c1, rough, 'wavy', 0.006);
      addCap(mat, {
        thickness: u * 0.12 * vol,
        foreheadCut: 0.2,
        sideCut: -0.12,
        napeCut: -0.55,
        topLift: u * 0.16 * vol,
        waveAmp: 0.04,
        waveFreq: 10,
      });
      addFringe(group, head, mat, 'curtain', vol);
      addPerimeterCurtain(group, head, mat, mat, {
        count: 20,
        azStart: 0.72,
        azEnd: Math.PI * 2 - 0.72,
        length: ry * 1.15 * len,
        strandRadius: u * 0.17,
        flare: 0.3,
        waveAmp: u * 0.11,
        waveFreq: 2.2,
        flatten: 0.58,
        volume: vol,
        seed: 301,
      });
      break;
    }

    case 'wavy_shag_wolf': {
      const mat = makeHairMaterial(c1, rough, 'wavy', 0.006);
      const mat2 = makeHairMaterial(c2, rough, 'wavy', 0.006);
      addCap(mat, {
        thickness: u * 0.14 * vol,
        foreheadCut: 0.18,
        sideCut: -0.08,
        napeCut: -0.55,
        topLift: u * 0.22 * vol,
        waveAmp: 0.05,
        waveFreq: 11,
      });
      addFringe(group, head, mat, 'curtain', vol * 1.1);
      addPerimeterCurtain(group, head, mat, mat2, {
        count: 24,
        azStart: 0.65,
        azEnd: Math.PI * 2 - 0.65,
        length: ry * 2.25 * len,
        strandRadius: u * 0.18,
        flare: 0.44,
        waveAmp: u * 0.14,
        waveFreq: 2.8,
        flatten: 0.55,
        layers: 3,
        volume: vol,
        seed: 302,
      });
      break;
    }

    case 'wavy_long_glam': {
      const mat = makeHairMaterial(c1, rough, 'wavy', 0.006);
      const mat2 = makeHairMaterial(c2, rough, 'wavy', 0.006);
      addCap(mat, {
        thickness: u * 0.135 * vol,
        foreheadCut: 0.2,
        sideCut: -0.1,
        napeCut: -0.55,
        topLift: u * 0.16 * vol,
        sidePart: -0.28,
      });
      addFringe(group, head, mat, 'curtain', vol);
      addPerimeterCurtain(group, head, mat, mat2, {
        count: 26,
        azStart: 0.64,
        azEnd: Math.PI * 2 - 0.64,
        length: ry * 3.55 * len,
        strandRadius: u * 0.21,
        flare: 0.42,
        waveAmp: u * 0.19,
        waveFreq: 3.4,
        flatten: 0.6,
        layers: 2,
        volume: vol,
        seed: 303,
      });
      break;
    }

    case 'curly_tapered': {
      // Short tapered fade sides + crown full of bouncy 3B/3C spiral curls pitching slightly forward
      const sideMat = makeHairMaterial(c1, 0.88, 'coily', 0.006, 0.78);
      const curlMat = makeHairMaterial(c1, rough, 'curly', 0.007);
      const curlHi = makeHairMaterial(c2, rough, 'curly', 0.007);
      addCap(sideMat, {
        thickness: u * 0.045,
        foreheadCut: 0.28,
        sideCut: 0.02,
        napeCut: -0.45,
      });
      const rand = seededRng(401);
      for (let i = 0; i < 42; i++) {
        const fx = (rand() * 2 - 1) * 0.78;
        const fz = rand() * 1.55 - 0.65;
        if (fx * fx + fz * fz > 0.92) continue;
        const sy = Math.sqrt(Math.max(0.15, 1 - (fx * fx + fz * fz) * 0.72));
        const start = new THREE.Vector3(fx * rx * 0.9, cy + sy * ry * 0.92, cz + fz * rz * 0.9);
        const end = start
          .clone()
          .add(
            new THREE.Vector3(
              fx * u * 0.28 * vol,
              (0.32 - Math.max(0, fz) * 0.42) * u * vol * len,
              (fz * 0.22 + 0.18) * u * vol * len
            )
          );
        const g = buildSpiralCurl(start, end, u * 0.095 * vol, u * 0.058 * vol, 2.6, rand() * 6);
        const m = new THREE.Mesh(g, i % 6 === 0 ? curlHi : curlMat);
        m.castShadow = true;
        group.add(m);
      }
      break;
    }

    case 'curly_round_halo': {
      // Rounded 3C spherical curly halo with bouncy curly bangs — distinct round silhouette!
      const curlMat = makeHairMaterial(c1, rough, 'curly', 0.008);
      const curlHi = makeHairMaterial(c2, rough, 'curly', 0.008);
      addCap(curlMat, {
        thickness: u * 0.16 * vol,
        foreheadCut: 0.18,
        sideCut: -0.18,
        napeCut: -0.58,
        topLift: u * 0.22 * vol,
        waveAmp: 0.06,
      });
      const rand = seededRng(402);
      // Surrounding rings of defined spiral ringlets forming a lush rounded halo
      const total = 56;
      for (let i = 0; i < total; i++) {
        const ring = i < 10 ? 0 : i < 32 ? 1 : 2; // 0 = bangs, 1 = mid crown halo, 2 = lower halo
        let az: number;
        if (ring === 0) {
          az = ((i / 9) * 2 - 1) * 0.62;
        } else {
          const idx = ring === 1 ? i - 10 : i - 32;
          const cnt = ring === 1 ? 22 : 24;
          az = THREE.MathUtils.lerp(0.55, Math.PI * 2 - 0.55, idx / (cnt - 1));
        }
        const sx = Math.sin(az);
        const sz = Math.cos(az);
        const startY = ring === 0 ? cy + ry * 0.72 : ring === 1 ? cy + ry * 0.78 : cy + ry * 0.28;
        const start = new THREE.Vector3(sx * rx * 0.92, startY, cz + sz * rz * 0.92);
        const drop =
          ring === 0
            ? ry * 0.42
            : ring === 1
            ? ry * 0.92 * len
            : ry * 1.15 * len;
        const spread = ring === 0 ? 1.06 : ring === 1 ? 1.48 * vol : 1.42 * vol;
        const end = new THREE.Vector3(
          sx * rx * spread,
          startY - drop,
          cz + sz * rz * (ring === 0 ? 1.12 : spread * 0.95)
        );
        const g = buildSpiralCurl(start, end, u * 0.115 * vol, u * 0.068 * vol, ring === 0 ? 2.4 : 3.6, rand() * 6);
        const m = new THREE.Mesh(g, i % 7 === 0 ? curlHi : curlMat);
        m.castShadow = true;
        group.add(m);
      }
      break;
    }

    case 'curly_long_cascade': {
      // Pyramidal/triangular cascading long 3A/3B spiral curls — flatter root, dramatic wide cascading volume!
      const curlMat = makeHairMaterial(c1, rough, 'curly', 0.007);
      const curlHi = makeHairMaterial(c2, rough, 'curly', 0.007);
      addCap(curlMat, {
        thickness: u * 0.12 * vol,
        foreheadCut: 0.22,
        sideCut: -0.1,
        napeCut: -0.55,
        topLift: u * 0.12 * vol,
        sidePart: 0.0,
      });
      const rand = seededRng(403);
      for (let layer = 0; layer < 2; layer++) {
        const cnt = layer === 0 ? 26 : 18;
        for (let i = 0; i < cnt; i++) {
          const az = THREE.MathUtils.lerp(0.62, Math.PI * 2 - 0.62, i / (cnt - 1));
          const sx = Math.sin(az);
          const sz = Math.cos(az);
          const start = new THREE.Vector3(
            sx * rx * 0.96,
            cy + ry * (0.48 - layer * 0.12),
            cz + sz * rz * 0.96
          );
          const dropLen = ry * (3.05 - layer * 0.72) * len;
          const outFlare = (1.55 + layer * 0.22) * vol;
          const end = new THREE.Vector3(
            sx * rx * outFlare,
            cy - dropLen,
            cz + sz * rz * (outFlare * 0.9 + (sz < -0.2 ? 0.25 : 0))
          );
          const g = buildSpiralCurl(start, end, u * 0.125 * vol, u * 0.072 * vol, 4.8 - layer, rand() * 6);
          const m = new THREE.Mesh(g, (i + layer) % 6 === 0 ? curlHi : curlMat);
          m.castShadow = true;
          group.add(m);
        }
      }
      break;
    }

    case 'curly_side_volume': {
      // Deep side-part asymmetric glamorous curly sweep (heavy volume on +X left side, tucked on -X right!)
      const curlMat = makeHairMaterial(c1, rough, 'curly', 0.007);
      const curlHi = makeHairMaterial(c2, rough, 'curly', 0.007);
      addCap(curlMat, {
        thickness: u * 0.12 * vol,
        foreheadCut: 0.22,
        sideCut: -0.08,
        napeCut: -0.55,
        topLift: u * 0.18 * vol,
        sidePart: -0.48,
      });
      const rand = seededRng(404);
      const cnt = 38;
      for (let i = 0; i < cnt; i++) {
        const az = THREE.MathUtils.lerp(0.42, Math.PI * 2 - 0.78, i / (cnt - 1));
        const sx = Math.sin(az);
        const sz = Math.cos(az);
        const isVolSide = sx > 0;
        const asymVol = isVolSide ? 1.65 * vol : 1.12 * vol;
        const asymLift = isVolSide ? ry * 0.22 : 0;
        const start = new THREE.Vector3(
          sx * rx * 0.92,
          cy + ry * 0.56 + asymLift,
          cz + sz * rz * 0.92
        );
        const end = new THREE.Vector3(
          sx * rx * asymVol + (isVolSide ? rx * 0.15 : 0),
          cy - ry * (isVolSide ? 2.05 : 1.55) * len,
          cz + sz * rz * (1.28 * vol)
        );
        const g = buildSpiralCurl(start, end, u * 0.12 * vol, u * 0.07 * vol, 3.8, rand() * 6);
        const m = new THREE.Mesh(g, i % 5 === 0 ? curlHi : curlMat);
        m.castShadow = true;
        group.add(m);
      }
      break;
    }

    case 'coily_sponge': {
      const mat = makeHairMaterial(c1, Math.max(0.88, rough), 'coily', 0.009);
      addCoilyVolume(
        group,
        new THREE.Vector3(0, cy + ry * 0.24, cz - rz * 0.03),
        new THREE.Vector3(rx * 1.12 * vol, ry * 0.95 * vol, rz * 1.1 * vol),
        mat,
        null,
        {
          bottomCut: -0.42,
          faceCutZ: cz + rz * 0.62,
          faceCutY: cy + ry * 0.34,
          puffClusters: 58,
          seed: 501,
        }
      );
      break;
    }

    case 'afro_classic': {
      const mat = makeHairMaterial(c1, Math.max(0.9, rough), 'coily', 0.01);
      addCoilyVolume(
        group,
        new THREE.Vector3(0, cy + ry * 0.32, cz - rz * 0.08),
        new THREE.Vector3(rx * 1.46 * vol, ry * 1.28 * vol * Math.pow(len, 0.4), rz * 1.42 * vol),
        mat,
        null,
        {
          bottomCut: -0.68,
          faceCutZ: cz + rz * 0.58,
          faceCutY: cy + ry * 0.34,
          puffClusters: 72,
          seed: 502,
        }
      );
      break;
    }

    case 'black_power': {
      const mat = makeHairMaterial(c1, Math.max(0.9, rough), 'coily', 0.011);
      const matHi = c2 !== c1 ? makeHairMaterial(c2, Math.max(0.9, rough), 'coily', 0.011) : null;
      addCoilyVolume(
        group,
        new THREE.Vector3(0, cy + ry * 0.44, cz - rz * 0.1),
        new THREE.Vector3(rx * 1.88 * vol, ry * 1.62 * vol * Math.pow(len, 0.5), rz * 1.78 * vol),
        mat,
        matHi,
        {
          bottomCut: -0.72,
          faceCutZ: cz + rz * 0.56,
          faceCutY: cy + ry * 0.36,
          puffClusters: 92,
          seed: 503,
        }
      );
      break;
    }

    case 'afro_puffs': {
      const baseMat = makeHairMaterial(c1, Math.max(0.85, rough), 'coily', 0.007);
      const tieMat = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.45 });
      addCap(baseMat, {
        thickness: u * 0.045,
        foreheadCut: 0.25,
        sideCut: -0.04,
        napeCut: -0.48,
        sidePart: 0.0,
      });
      for (const side of [-1, 1] as const) {
        const tiePos = new THREE.Vector3(side * rx * 0.78, cy + ry * 0.78, cz - rz * 0.08);
        const tie = new THREE.Mesh(new THREE.TorusGeometry(u * 0.22, u * 0.055, 10, 20), tieMat);
        tie.position.copy(tiePos);
        tie.rotation.set(Math.PI * 0.35, side * 0.55, 0);
        group.add(tie);

        const puffCenter = new THREE.Vector3(
          side * rx * (1.18 + (vol - 1) * 0.3),
          cy + ry * (1.12 + (vol - 1) * 0.25),
          cz - rz * 0.14
        );
        const pr = u * 0.62 * vol * Math.pow(len, 0.45);
        addCoilyVolume(
          group,
          puffCenter,
          new THREE.Vector3(pr, pr * 0.96, pr),
          baseMat,
          null,
          { bottomCut: -0.95, puffClusters: 34, seed: side > 0 ? 510 : 511 }
        );
      }
      break;
    }

    case 'two_strand_twists': {
      const mat = makeHairMaterial(c1, Math.max(0.78, rough), 'coily', 0.007);
      const tipMat = makeHairMaterial(c2, Math.max(0.78, rough), 'coily', 0.007);
      addCap(mat, {
        thickness: u * 0.055,
        foreheadCut: 0.24,
        sideCut: -0.05,
        napeCut: -0.5,
        sidePart: 0.0,
      });
      // Dozens of genuine 2-strand twisted helical ropes framing face & shoulders
      addPerimeterCurtain(group, head, mat, tipMat, {
        count: 30,
        azStart: 0.48,
        azEnd: Math.PI * 2 - 0.48,
        length: ry * 1.95 * len,
        strandRadius: u * 0.092,
        flare: 0.28,
        flatten: 0.95,
        twistTurns: 6,
        layers: 2,
        volume: vol,
        seed: 601,
      });
      break;
    }

    case 'box_braids_long': {
      const scalpMat = makeHairMaterial(c1, 0.85, 'buzz', 0.004, 0.68);
      const braidMat = makeHairMaterial(c1, rough, 'braid', 0.007);
      const braidAlt = makeHairMaterial(c2, rough, 'braid', 0.007);
      addCap(scalpMat, {
        thickness: u * 0.035,
        foreheadCut: 0.24,
        sideCut: -0.04,
        napeCut: -0.5,
        sidePart: 0.0,
      });
      addPerimeterCurtain(group, head, braidMat, braidAlt, {
        count: 34,
        azStart: 0.56,
        azEnd: Math.PI * 2 - 0.56,
        length: ry * 3.85 * len,
        strandRadius: u * 0.082,
        flare: 0.34,
        flatten: 0.92,
        braidNodes: 15,
        layers: 2,
        volume: vol,
        seed: 602,
      });
      break;
    }

    case 'cornrows_nago': {
      const scalpMat = makeHairMaterial(c1, 0.9, 'buzz', 0.003, 0.32);
      const rowMat = makeHairMaterial(c1, rough, 'braid', 0.008);
      const beadMat = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.3, metalness: 0.7 });
      addCap(scalpMat, {
        thickness: u * 0.015,
        foreheadCut: 0.26,
        sideCut: 0.02,
        napeCut: -0.48,
      });
      // 9 crisp parallel cornrow ridges hugging the skull from forehead to nape + small braided tails!
      const rows = 9;
      for (let i = 0; i < rows; i++) {
        const s = (i / (rows - 1)) * 2 - 1; // -1 to +1
        const latAng = s * 1.12;
        const pts: THREE.Vector3[] = [];
        const arcSteps = 10;
        for (let k = 0; k <= arcSteps; k++) {
          const t = k / arcSteps; // 0 = forehead, 1 = nape
          const pitch = THREE.MathUtils.lerp(0.32, Math.PI + 0.42, t);
          // Converge slightly at nape
          const wScale = 1 - t * 0.25;
          const x = Math.sin(latAng * wScale) * rx * (1.03 - Math.abs(Math.cos(pitch)) * 0.06);
          const rMerid = Math.sqrt(Math.max(0.08, 1 - Math.pow((x / (rx * 1.06)), 2)));
          const y = cy + Math.sin(pitch) * ry * rMerid * 1.03;
          const z = cz + Math.cos(pitch) * rz * rMerid * 1.03;
          pts.push(new THREE.Vector3(x, y, z));
        }
        // Small hanging tail at nape
        const last = pts[pts.length - 1];
        pts.push(new THREE.Vector3(last.x * 0.92, last.y - ry * 0.38 * len, last.z - u * 0.04));

        const g = buildTaperedStrand(pts, u * 0.085 * vol, {
          flatten: 0.85,
          rootScale: 0.65,
          tipScale: 0.45,
          braidNodes: 14,
          tubularSegments: 22,
        });
        const m = new THREE.Mesh(g, rowMat);
        m.castShadow = true;
        group.add(m);

        // Golden/secondary cuff bead at tip
        const tipPt = pts[pts.length - 1];
        const bead = new THREE.Mesh(new THREE.CylinderGeometry(u * 0.052, u * 0.052, u * 0.07, 8), beadMat);
        bead.position.copy(tipPt);
        group.add(bead);
      }
      break;
    }

    case 'dreadlocks_mid': {
      const mat = makeHairMaterial(c1, Math.max(0.86, rough), 'coily', 0.009);
      const cuffMat = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.3, metalness: 0.78 });
      addCap(mat, {
        thickness: u * 0.075,
        foreheadCut: 0.24,
        sideCut: -0.06,
        napeCut: -0.52,
      });
      const rand = seededRng(605);
      const count = 32;
      for (let i = 0; i < count; i++) {
        const az = THREE.MathUtils.lerp(0.38, Math.PI * 2 - 0.38, i / (count - 1));
        const sx = Math.sin(az);
        const sz = Math.cos(az);
        const drop = ry * (Math.abs(az) < 0.75 || Math.abs(az - Math.PI * 2) < 0.75 ? 1.35 : 2.15) * len;
        const p0 = new THREE.Vector3(sx * rx * 0.55, cy + ry * 0.88, cz + sz * rz * 0.55);
        const p1 = new THREE.Vector3(sx * rx * 1.1 * vol, cy + ry * 0.28, cz + sz * rz * 1.1 * vol);
        const p2 = new THREE.Vector3(
          sx * rx * 1.24 * vol + (rand() - 0.5) * u * 0.1,
          cy - drop * 0.52,
          cz + sz * rz * 1.18 * vol
        );
        const p3 = new THREE.Vector3(
          sx * rx * 1.28 * vol + (rand() - 0.5) * u * 0.12,
          cy - drop * (0.92 + rand() * 0.14),
          cz + sz * rz * 1.22 * vol
        );
        const g = buildTaperedStrand([p0, p1, p2, p3], u * 0.118 * vol, {
          flatten: 0.96,
          rootScale: 0.85,
          tipScale: 0.72,
          tubularSegments: 14,
        });
        const m = new THREE.Mesh(g, mat);
        m.castShadow = true;
        group.add(m);

        if (i % 7 === 2) {
          const cuff = new THREE.Mesh(
            new THREE.CylinderGeometry(u * 0.125 * vol, u * 0.125 * vol, u * 0.1, 10),
            cuffMat
          );
          cuff.position.copy(p2);
          group.add(cuff);
        }
      }
      break;
    }

    case 'dreadlocks_high_tie': {
      const fadeMat = makeHairMaterial(c1, 0.9, 'buzz', 0.004, 0.65);
      const locMat = makeHairMaterial(c1, Math.max(0.86, rough), 'coily', 0.009);
      const wrapMat = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.45, metalness: 0.25 });
      addCap(fadeMat, {
        thickness: u * 0.025,
        foreheadCut: 0.3,
        sideCut: 0.05,
        napeCut: -0.45,
      });
      const knot = new THREE.Vector3(0, cy + ry * 1.05, cz - rz * 0.24);
      const band = new THREE.Mesh(new THREE.TorusGeometry(u * 0.34 * vol, u * 0.075, 10, 22), wrapMat);
      band.position.copy(knot);
      band.rotation.x = Math.PI * 0.42;
      group.add(band);

      // Fountain of thick locs erupting from top tie and cascading back & sides!
      const rand = seededRng(606);
      for (let i = 0; i < 22; i++) {
        const az = (i / 22) * Math.PI * 2;
        const sx = Math.sin(az);
        const sz = Math.cos(az) * 0.7 - 0.45; // bias backward
        const p0 = new THREE.Vector3(sx * u * 0.24, knot.y - u * 0.1, knot.z + Math.cos(az) * u * 0.22);
        const p1 = new THREE.Vector3(sx * u * 0.52 * vol, knot.y + u * 0.38 * vol, knot.z + sz * u * 0.48 * vol);
        const p2 = new THREE.Vector3(sx * u * 0.88 * vol, knot.y - ry * 0.45 * len, knot.z + sz * u * 0.95 * vol);
        const p3 = new THREE.Vector3(
          sx * u * 0.95 * vol,
          knot.y - ry * (1.28 + rand() * 0.35) * len,
          knot.z + sz * u * 1.12 * vol
        );
        const m = new THREE.Mesh(
          buildTaperedStrand([p0, p1, p2, p3], u * 0.115 * vol, {
            flatten: 0.96,
            rootScale: 0.88,
            tipScale: 0.72,
          }),
          locMat
        );
        m.castShadow = true;
        group.add(m);
      }
      break;
    }

    case 'high_ponytail': {
      const mat = makeHairMaterial(c1, rough, 'straight', 0.005);
      const tieMat = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.4 });
      addCap(mat, {
        thickness: u * 0.095 * vol,
        foreheadCut: 0.22,
        sideCut: -0.04,
        napeCut: -0.5,
        topLift: u * 0.08 * vol,
      });
      addFringe(group, head, mat, 'curtain', vol);

      const tiePos = new THREE.Vector3(0, cy + ry * 0.68, cz - rz * 0.98);
      const tie = new THREE.Mesh(new THREE.TorusGeometry(u * 0.22, u * 0.06, 10, 20), tieMat);
      tie.position.copy(tiePos);
      tie.rotation.x = Math.PI * 0.28;
      group.add(tie);

      // Sweeping voluminous multi-lock arched ponytail!
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const ox = Math.cos(a) * u * 0.16 * vol;
        const oy = Math.sin(a) * u * 0.16 * vol;
        const p0 = tiePos.clone().add(new THREE.Vector3(ox * 0.5, oy * 0.5, u * 0.05));
        const p1 = tiePos.clone().add(new THREE.Vector3(ox * 1.5, u * 0.34 * vol + oy, -u * 0.48 * vol));
        const p2 = tiePos.clone().add(new THREE.Vector3(ox * 2.1, -ry * 1.15 * len + oy * 0.5, -u * 0.85 * vol));
        const p3 = tiePos.clone().add(new THREE.Vector3(ox * 1.4, -ry * 2.55 * len, -u * 0.62 * vol));
        const m = new THREE.Mesh(
          buildTaperedStrand([p0, p1, p2, p3], u * 0.18 * vol, { flatten: 0.58, tipScale: 0.12 }),
          mat
        );
        m.castShadow = true;
        group.add(m);
      }
      break;
    }

    case 'messy_high_bun': {
      const mat = makeHairMaterial(c1, rough, 'wavy', 0.005);
      const tieMat = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.45 });
      addCap(mat, {
        thickness: u * 0.095 * vol,
        foreheadCut: 0.22,
        sideCut: -0.05,
        napeCut: -0.5,
        topLift: u * 0.09 * vol,
      });
      // Delicate face-framing loose tendrils!
      for (const side of [-1, 1] as const) {
        const p0 = new THREE.Vector3(side * rx * 0.72, cy + ry * 0.45, cz + rz * 0.65);
        const p1 = new THREE.Vector3(side * rx * 0.98, cy - ry * 0.12, cz + rz * 0.72);
        const p2 = new THREE.Vector3(side * rx * 0.88, cy - ry * 0.78 * len, cz + rz * 0.66);
        const t = new THREE.Mesh(
          buildTaperedStrand([p0, p1, p2], u * 0.09 * vol, { flatten: 0.5, tipScale: 0.08 }),
          mat
        );
        t.castShadow = true;
        group.add(t);
      }
      // Sculpted coiled messy top bun
      const bunCenter = new THREE.Vector3(0, cy + ry * 1.15, cz - rz * 0.36);
      const band = new THREE.Mesh(new THREE.TorusGeometry(u * 0.32 * vol, u * 0.055, 10, 22), tieMat);
      band.position.copy(bunCenter).add(new THREE.Vector3(0, -u * 0.14, u * 0.06));
      band.rotation.x = Math.PI * 0.38;
      group.add(band);

      const bunPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 28; i++) {
        const t = i / 28;
        const ang = t * Math.PI * 4.5;
        const rad = u * (0.42 - t * 0.22) * vol * Math.pow(len, 0.35);
        bunPts.push(
          new THREE.Vector3(
            bunCenter.x + Math.cos(ang) * rad,
            bunCenter.y + t * u * 0.28 * vol + Math.sin(ang * 2) * u * 0.06,
            bunCenter.z + Math.sin(ang) * rad
          )
        );
      }
      const bunMesh = new THREE.Mesh(
        buildTaperedStrand(bunPts, u * 0.24 * vol, {
          flatten: 0.85,
          rootScale: 0.9,
          tipScale: 0.35,
          tubularSegments: 34,
        }),
        mat
      );
      bunMesh.castShadow = true;
      group.add(bunMesh);
      break;
    }

    case 'half_up_wavy': {
      const mat = makeHairMaterial(c1, rough, 'wavy', 0.006);
      const mat2 = makeHairMaterial(c2, rough, 'wavy', 0.006);
      addCap(mat, {
        thickness: u * 0.12 * vol,
        foreheadCut: 0.2,
        sideCut: -0.08,
        napeCut: -0.54,
        topLift: u * 0.12 * vol,
      });
      addFringe(group, head, mat, 'curtain', vol);
      // Top crown knot
      const knot = new THREE.Mesh(new THREE.SphereGeometry(u * 0.32 * vol, 18, 14), mat);
      knot.scale.set(1.1, 0.85, 1.0);
      knot.position.set(0, cy + ry * 0.88, cz - rz * 0.78);
      knot.castShadow = true;
      group.add(knot);
      // Flowing wavy lower length
      addPerimeterCurtain(group, head, mat, mat2, {
        count: 22,
        azStart: 0.72,
        azEnd: Math.PI * 2 - 0.72,
        length: ry * 2.85 * len,
        strandRadius: u * 0.19,
        flare: 0.38,
        waveAmp: u * 0.16,
        waveFreq: 3.0,
        flatten: 0.56,
        layers: 2,
        volume: vol,
        seed: 701,
      });
      break;
    }

    case 'twin_tails': {
      const mat = makeHairMaterial(c1, rough, 'straight', 0.004);
      const tieMat = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.4 });
      addCap(mat, {
        thickness: u * 0.11 * vol,
        foreheadCut: 0.18,
        sideCut: -0.06,
        napeCut: -0.5,
        topLift: u * 0.1 * vol,
        sidePart: 0.0,
      });
      addFringe(group, head, mat, 'choppy', vol);

      for (const side of [-1, 1] as const) {
        const tiePos = new THREE.Vector3(side * rx * 0.96, cy + ry * 0.52, cz - rz * 0.28);
        const tie = new THREE.Mesh(new THREE.TorusGeometry(u * 0.17, u * 0.05, 10, 18), tieMat);
        tie.position.copy(tiePos);
        tie.rotation.y = side * Math.PI * 0.4;
        group.add(tie);

        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2;
          const oz = Math.cos(a) * u * 0.12 * vol;
          const oy = Math.sin(a) * u * 0.12 * vol;
          const p0 = tiePos.clone();
          const p1 = tiePos.clone().add(new THREE.Vector3(side * u * 0.42 * vol, u * 0.18 * vol + oy, oz));
          const p2 = tiePos.clone().add(new THREE.Vector3(side * u * 0.68 * vol, -ry * 1.35 * len, oz * 1.4 - u * 0.1));
          const p3 = tiePos.clone().add(new THREE.Vector3(side * u * 0.56 * vol, -ry * 2.95 * len, oz * 1.6 - u * 0.15));
          const m = new THREE.Mesh(
            buildTaperedStrand([p0, p1, p2, p3], u * 0.16 * vol, { flatten: 0.55, tipScale: 0.1 }),
            mat
          );
          m.castShadow = true;
          group.add(m);
        }
      }
      break;
    }

    default:
      break;
  }

  return group;
}
