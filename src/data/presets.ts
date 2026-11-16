import type {
  AppearanceParams,
  BiotypeParams,
  CameraSettings,
  CharacterData,
  EffectsSettings,
  GazeState,
  HandPose,
  IKState,
  JointId,
  PoseData,
  StylizedParams,
  SurfaceMaterialMode,
  Vec3,
} from '../types/studio';
import { createEmptyClothing } from './clothingCatalog';

export interface JointMeta {
  id: JointId;
  label: string;
  shortLabel: string;
  side: 'center' | 'left' | 'right';
  mirror: JointId;
  axisLabels: [string, string, string];
  min: Vec3;
  max: Vec3;
  /** 2D picker coordinates normalized [0..100, 0..100] (front view: left arm is on right side x>50) */
  mapPos: [number, number];
}

export const ALL_JOINT_IDS: JointId[] = [
  'hips',
  'spineLower',
  'spineUpper',
  'neck',
  'head',
  'clavicleL',
  'shoulderL',
  'elbowL',
  'wristL',
  'clavicleR',
  'shoulderR',
  'elbowR',
  'wristR',
  'hipL',
  'kneeL',
  'ankleL',
  'toeL',
  'hipR',
  'kneeR',
  'ankleR',
  'toeR',
];

export const JOINT_META: Record<JointId, JointMeta> = {
  hips: {
    id: 'hips',
    label: 'Quadril / Pelve (Base)',
    shortLabel: 'Quadril',
    side: 'center',
    mirror: 'hips',
    axisLabels: ['Inclinar Frente/Trás', 'Girar Corpo', 'Balanço Lateral'],
    min: [-120, -180, -90],
    max: [120, 180, 90],
    mapPos: [50, 49],
  },
  spineLower: {
    id: 'spineLower',
    label: 'Coluna Lombar / Abdômen',
    shortLabel: 'Lombar',
    side: 'center',
    mirror: 'spineLower',
    axisLabels: ['Flexão / Extensão', 'Torção', 'Inclinação Lateral'],
    min: [-45, -45, -38],
    max: [55, 45, 38],
    mapPos: [50, 40],
  },
  spineUpper: {
    id: 'spineUpper',
    label: 'Tórax / Coluna Torácica',
    shortLabel: 'Tórax',
    side: 'center',
    mirror: 'spineUpper',
    axisLabels: ['Curvar / Arquear', 'Torção Torácica', 'Inclinação Lateral'],
    min: [-40, -50, -35],
    max: [50, 50, 35],
    mapPos: [50, 30],
  },
  neck: {
    id: 'neck',
    label: 'Pescoço',
    shortLabel: 'Pescoço',
    side: 'center',
    mirror: 'neck',
    axisLabels: ['Baixar / Erguer', 'Girar', 'Inclinar'],
    min: [-45, -55, -38],
    max: [45, 55, 38],
    mapPos: [50, 20],
  },
  head: {
    id: 'head',
    label: 'Cabeça',
    shortLabel: 'Cabeça',
    side: 'center',
    mirror: 'head',
    axisLabels: ['Olhar Baixo/Cima', 'Virar Esq/Dir', 'Inclinar'],
    min: [-50, -75, -42],
    max: [50, 75, 42],
    mapPos: [50, 11],
  },
  clavicleL: {
    id: 'clavicleL',
    label: 'Clavícula Esquerda',
    shortLabel: 'Clav. E',
    side: 'left',
    mirror: 'clavicleR',
    axisLabels: ['Inclinar', 'Avançar / Recuar', 'Encolher Ombro'],
    min: [-20, -30, -18],
    max: [20, 30, 32],
    mapPos: [58, 24],
  },
  shoulderL: {
    id: 'shoulderL',
    label: 'Ombro / Braço Esquerdo',
    shortLabel: 'Ombro E',
    side: 'left',
    mirror: 'shoulderR',
    axisLabels: ['Elevar Frente / Trás', 'Rotação Axial', 'Abrir / Fechar'],
    min: [-175, -110, -45],
    max: [85, 110, 175],
    mapPos: [68, 26],
  },
  elbowL: {
    id: 'elbowL',
    label: 'Cotovelo / Antebraço Esq.',
    shortLabel: 'Cotov. E',
    side: 'left',
    mirror: 'elbowR',
    axisLabels: ['Dobrar Cotovelo', 'Pronação / Supinação', 'Ajuste Lateral'],
    min: [-152, -100, -25],
    max: [8, 100, 25],
    mapPos: [74, 39],
  },
  wristL: {
    id: 'wristL',
    label: 'Punho / Mão Esquerda',
    shortLabel: 'Mão E',
    side: 'left',
    mirror: 'wristR',
    axisLabels: ['Desvio Radial/Ulnar', 'Giro do Punho', 'Flexão / Extensão'],
    min: [-65, -90, -85],
    max: [65, 90, 85],
    mapPos: [79, 52],
  },
  clavicleR: {
    id: 'clavicleR',
    label: 'Clavícula Direita',
    shortLabel: 'Clav. D',
    side: 'right',
    mirror: 'clavicleL',
    axisLabels: ['Inclinar', 'Avançar / Recuar', 'Encolher Ombro'],
    min: [-20, -30, -32],
    max: [20, 30, 18],
    mapPos: [42, 24],
  },
  shoulderR: {
    id: 'shoulderR',
    label: 'Ombro / Braço Direito',
    shortLabel: 'Ombro D',
    side: 'right',
    mirror: 'shoulderL',
    axisLabels: ['Elevar Frente / Trás', 'Rotação Axial', 'Fechar / Abrir'],
    min: [-175, -110, -175],
    max: [85, 110, 45],
    mapPos: [32, 26],
  },
  elbowR: {
    id: 'elbowR',
    label: 'Cotovelo / Antebraço Dir.',
    shortLabel: 'Cotov. D',
    side: 'right',
    mirror: 'elbowL',
    axisLabels: ['Dobrar Cotovelo', 'Pronação / Supinação', 'Ajuste Lateral'],
    min: [-152, -100, -25],
    max: [8, 100, 25],
    mapPos: [26, 39],
  },
  wristR: {
    id: 'wristR',
    label: 'Punho / Mão Direita',
    shortLabel: 'Mão D',
    side: 'right',
    mirror: 'wristL',
    axisLabels: ['Desvio Radial/Ulnar', 'Giro do Punho', 'Flexão / Extensão'],
    min: [-65, -90, -85],
    max: [65, 90, 85],
    mapPos: [21, 52],
  },
  hipL: {
    id: 'hipL',
    label: 'Coxa / Quadril Esquerdo',
    shortLabel: 'Coxa E',
    side: 'left',
    mirror: 'hipR',
    axisLabels: ['Elevar Frente / Trás', 'Rotação Coxa', 'Abrir / Cruzar'],
    min: [-140, -75, -35],
    max: [75, 85, 95],
    mapPos: [58, 53],
  },
  kneeL: {
    id: 'kneeL',
    label: 'Joelho / Perna Esquerda',
    shortLabel: 'Joelho E',
    side: 'left',
    mirror: 'kneeR',
    axisLabels: ['Dobrar Joelho', 'Torção Tibial', 'Ajuste'],
    min: [-6, -35, -12],
    max: [152, 35, 12],
    mapPos: [60, 71],
  },
  ankleL: {
    id: 'ankleL',
    label: 'Tornozelo / Pé Esquerdo',
    shortLabel: 'Pé E',
    side: 'left',
    mirror: 'ankleR',
    axisLabels: ['Ponta / Calcanhar', 'Virar Pé', 'Inversão / Eversão'],
    min: [-48, -50, -40],
    max: [68, 50, 40],
    mapPos: [61, 87],
  },
  toeL: {
    id: 'toeL',
    label: 'Dedos do Pé Esquerdo',
    shortLabel: 'Dedos Pé E',
    side: 'left',
    mirror: 'toeR',
    axisLabels: ['Dobrar Dedos', 'Desvio', 'Torção'],
    min: [-65, -15, -15],
    max: [35, 15, 15],
    mapPos: [64, 94],
  },
  hipR: {
    id: 'hipR',
    label: 'Coxa / Quadril Direito',
    shortLabel: 'Coxa D',
    side: 'right',
    mirror: 'hipL',
    axisLabels: ['Elevar Frente / Trás', 'Rotação Coxa', 'Cruzar / Abrir'],
    min: [-140, -85, -95],
    max: [75, 75, 35],
    mapPos: [42, 53],
  },
  kneeR: {
    id: 'kneeR',
    label: 'Joelho / Perna Direita',
    shortLabel: 'Joelho D',
    side: 'right',
    mirror: 'kneeL',
    axisLabels: ['Dobrar Joelho', 'Torção Tibial', 'Ajuste'],
    min: [-6, -35, -12],
    max: [152, 35, 12],
    mapPos: [40, 71],
  },
  ankleR: {
    id: 'ankleR',
    label: 'Tornozelo / Pé Direito',
    shortLabel: 'Pé D',
    side: 'right',
    mirror: 'ankleL',
    axisLabels: ['Ponta / Calcanhar', 'Virar Pé', 'Inversão / Eversão'],
    min: [-48, -50, -40],
    max: [68, 50, 40],
    mapPos: [39, 87],
  },
  toeR: {
    id: 'toeR',
    label: 'Dedos do Pé Direito',
    shortLabel: 'Dedos Pé D',
    side: 'right',
    mirror: 'toeL',
    axisLabels: ['Dobrar Dedos', 'Desvio', 'Torção'],
    min: [-65, -15, -15],
    max: [35, 15, 15],
    mapPos: [36, 94],
  },
};

export const HAND_PRESETS: Record<string, { label: string; pose: HandPose }> = {
  relaxed: {
    label: 'Relaxada',
    pose: { thumb: 0.22, index: 0.24, middle: 0.3, ring: 0.36, pinky: 0.42, spread: 0.08, thumbOppose: 0.15 },
  },
  open: {
    label: 'Aberta',
    pose: { thumb: -0.18, index: -0.05, middle: -0.05, ring: -0.04, pinky: -0.04, spread: 0.55, thumbOppose: -0.1 },
  },
  flat: {
    label: 'Estendida',
    pose: { thumb: 0.0, index: 0.0, middle: 0.0, ring: 0.0, pinky: 0.0, spread: -0.15, thumbOppose: 0.0 },
  },
  fist: {
    label: 'Punho Fechado',
    pose: { thumb: 0.85, index: 1.28, middle: 1.3, ring: 1.3, pinky: 1.32, spread: -0.15, thumbOppose: 0.72 },
  },
  gripSword: {
    label: 'Pegada Espada',
    pose: { thumb: 0.65, index: 1.02, middle: 1.08, ring: 1.12, pinky: 1.15, spread: -0.08, thumbOppose: 0.68 },
  },
  gripGun: {
    label: 'Pegada Gatilho',
    pose: { thumb: 0.52, index: 0.48, middle: 1.12, ring: 1.15, pinky: 1.18, spread: 0.02, thumbOppose: 0.55 },
  },
  gripCup: {
    label: 'Segurar Objeto',
    pose: { thumb: 0.45, index: 0.68, middle: 0.72, ring: 0.75, pinky: 0.78, spread: 0.12, thumbOppose: 0.65 },
  },
  point: {
    label: 'Apontar',
    pose: { thumb: 0.72, index: -0.05, middle: 1.22, ring: 1.25, pinky: 1.26, spread: 0.0, thumbOppose: 0.6 },
  },
  peace: {
    label: 'Paz / V',
    pose: { thumb: 0.78, index: -0.05, middle: -0.05, ring: 1.22, pinky: 1.25, spread: 0.42, thumbOppose: 0.75 },
  },
  reach: {
    label: 'Expressiva / Garra',
    pose: { thumb: 0.35, index: 0.52, middle: 0.48, ring: 0.58, pinky: 0.64, spread: 0.52, thumbOppose: 0.42 },
  },
};

export function createZeroJoints(): Record<JointId, Vec3> {
  const joints = {} as Record<JointId, Vec3>;
  for (const id of ALL_JOINT_IDS) {
    joints[id] = [0, 0, 0];
  }
  return joints;
}

export function createDefaultGaze(): GazeState {
  return {
    yaw: 0,
    pitch: 0,
    convergence: 1.5,
    eyelidOpen: 1,
    browTilt: 0,
    useTarget: false,
    target: [0, 1.58, 1.8],
  };
}

export function makePose(
  partial: Partial<Record<JointId, Vec3>>,
  options?: {
    hipsOffset?: Vec3;
    handL?: string | HandPose;
    handR?: string | HandPose;
    gaze?: Partial<GazeState>;
  }
): PoseData {
  const joints = createZeroJoints();
  for (const [k, v] of Object.entries(partial)) {
    if (v) joints[k as JointId] = [...v] as Vec3;
  }
  const resolveHand = (h?: string | HandPose): HandPose => {
    if (!h) return { ...HAND_PRESETS.relaxed.pose };
    if (typeof h === 'string') return { ...(HAND_PRESETS[h]?.pose || HAND_PRESETS.relaxed.pose) };
    return { ...h };
  };
  return {
    hipsOffset: options?.hipsOffset ? [...options.hipsOffset] : [0, 0, 0],
    joints,
    handL: resolveHand(options?.handL),
    handR: resolveHand(options?.handR),
    gaze: { ...createDefaultGaze(), ...(options?.gaze || {}) },
  };
}

export interface PosePresetItem {
  id: string;
  name: string;
  category: 'base' | 'action' | 'combat' | 'seated' | 'expressive';
  pose: PoseData;
}

export const POSE_PRESETS: PosePresetItem[] = [
  {
    id: 'contrapposto',
    name: 'Contrapposto Clássico',
    category: 'base',
    pose: makePose(
      {
        hips: [0, -10, -5],
        spineLower: [2, 6, 5],
        spineUpper: [-3, 6, 4],
        neck: [2, -4, -3],
        head: [3, -6, -3],
        clavicleL: [0, 0, -3],
        shoulderL: [6, 8, 13],
        elbowL: [-22, -8, 0],
        wristL: [0, 0, -6],
        clavicleR: [0, 0, 3],
        shoulderR: [-8, -12, -16],
        elbowR: [-32, 12, 0],
        wristR: [4, 0, 8],
        hipL: [-14, 14, 9],
        kneeL: [26, 0, 0],
        ankleL: [14, 4, -4],
        toeL: [-12, 0, 0],
        hipR: [3, -6, -3],
        kneeR: [3, 0, 0],
        ankleR: [-3, -4, 6],
      },
      { gaze: { yaw: 5, pitch: 0 } }
    ),
  },
  {
    id: 'neutral',
    name: 'Em Pé Natural',
    category: 'base',
    pose: makePose({
      shoulderL: [3, 5, 11],
      elbowL: [-14, -5, 0],
      shoulderR: [3, -5, -11],
      elbowR: [-14, 5, 0],
      hipL: [-2, 6, 4],
      kneeL: [4, 0, 0],
      ankleL: [-2, 2, -3],
      hipR: [-2, -6, -4],
      kneeR: [4, 0, 0],
      ankleR: [-2, -2, 3],
    }),
  },
  {
    id: 'a_pose',
    name: 'A-Pose (Anatômica)',
    category: 'base',
    pose: makePose(
      {
        shoulderL: [0, 0, 38],
        shoulderR: [0, 0, -38],
        hipL: [0, 4, 6],
        ankleL: [0, 0, -6],
        hipR: [0, -4, -6],
        ankleR: [0, 0, 6],
      },
      { handL: 'flat', handR: 'flat' }
    ),
  },
  {
    id: 't_pose',
    name: 'T-Pose (Simétrica)',
    category: 'base',
    pose: makePose(
      {
        shoulderL: [0, 0, 88],
        shoulderR: [0, 0, -88],
      },
      { handL: 'flat', handR: 'flat' }
    ),
  },
  {
    id: 'heroic',
    name: 'Postura Heroica',
    category: 'base',
    pose: makePose(
      {
        hips: [-3, -12, 0],
        spineLower: [-4, 6, 0],
        spineUpper: [-8, 8, 0],
        neck: [4, -4, 0],
        head: [4, -8, -3],
        clavicleL: [0, -4, 4],
        shoulderL: [14, -22, 42],
        elbowL: [-82, -25, 0],
        wristL: [12, 20, -18],
        clavicleR: [0, 4, -4],
        shoulderR: [14, 22, -42],
        elbowR: [-82, 25, 0],
        wristR: [12, -20, 18],
        hipL: [-6, 12, 14],
        kneeL: [8, 0, 0],
        ankleL: [-2, 4, -12],
        hipR: [4, -12, -14],
        kneeR: [4, 0, 0],
        ankleR: [-4, -4, 12],
      },
      { handL: 'fist', handR: 'fist', gaze: { browTilt: -0.35 } }
    ),
  },
  {
    id: 'sprint',
    name: 'Corrida Dinâmica',
    category: 'action',
    pose: makePose(
      {
        hips: [22, -8, 4],
        spineLower: [10, 12, -3],
        spineUpper: [8, 14, -3],
        neck: [-14, -8, 0],
        head: [-14, -10, 0],
        shoulderL: [46, 0, 18],
        elbowL: [-98, 0, 0],
        shoulderR: [-62, 0, -14],
        elbowR: [-92, 0, 0],
        hipL: [-72, 4, 4],
        kneeL: [68, 0, 0],
        ankleL: [-12, 0, 0],
        hipR: [42, -4, -4],
        kneeR: [38, 0, 0],
        ankleR: [38, 0, 0],
        toeR: [-28, 0, 0],
      },
      { handL: 'fist', handR: 'fist', gaze: { browTilt: -0.4 } }
    ),
  },
  {
    id: 'action_jump',
    name: 'Salto em Ação',
    category: 'action',
    pose: makePose(
      {
        hips: [14, -18, -8],
        spineLower: [-8, 12, 6],
        spineUpper: [-10, 14, 6],
        neck: [-4, -8, -4],
        head: [-2, -12, -4],
        shoulderL: [-115, 25, 42],
        elbowL: [-38, 0, 0],
        shoulderR: [38, -18, -46],
        elbowR: [-76, 0, 0],
        hipL: [-95, 12, 14],
        kneeL: [112, 0, 0],
        ankleL: [36, 0, 0],
        hipR: [28, -10, -12],
        kneeR: [54, 0, 0],
        ankleR: [42, 0, 0],
      },
      {
        hipsOffset: [0, 0.35, 0],
        handL: 'reach',
        handR: 'fist',
        gaze: { eyelidOpen: 1.12, browTilt: 0.3 },
      }
    ),
  },
  {
    id: 'high_kick',
    name: 'Chute Lateral Alto',
    category: 'combat',
    pose: makePose(
      {
        hips: [6, 35, 26],
        spineLower: [4, -12, 10],
        spineUpper: [6, -16, 8],
        neck: [-4, -14, -18],
        head: [0, -18, -14],
        shoulderL: [-58, -15, 32],
        elbowL: [-95, 0, 0],
        shoulderR: [-42, 15, -48],
        elbowR: [-78, 0, 0],
        hipL: [-18, 22, 8],
        kneeL: [12, 0, 0],
        ankleL: [0, 10, -24],
        hipR: [-105, -24, -44],
        kneeR: [8, 0, 0],
        ankleR: [38, 0, 0],
      },
      { handL: 'fist', handR: 'fist', gaze: { yaw: -8, browTilt: -0.6 } }
    ),
  },
  {
    id: 'boxing_guard',
    name: 'Guarda de Combate',
    category: 'combat',
    pose: makePose(
      {
        hips: [8, -28, 0],
        spineLower: [12, 10, -4],
        spineUpper: [14, 12, -4],
        neck: [-10, 8, 4],
        head: [-4, 12, 4],
        clavicleL: [0, -12, 10],
        shoulderL: [-68, -25, 22],
        elbowL: [-118, -20, 0],
        clavicleR: [0, 14, -10],
        shoulderR: [-78, 18, -18],
        elbowR: [-104, 18, 0],
        hipL: [-28, 12, 14],
        kneeL: [34, 0, 0],
        ankleL: [-8, 6, -10],
        hipR: [18, -18, -14],
        kneeR: [28, 0, 0],
        ankleR: [12, -8, 10],
        toeR: [-18, 0, 0],
      },
      { handL: 'fist', handR: 'fist', gaze: { browTilt: -0.7 } }
    ),
  },
  {
    id: 'sword_slash',
    name: 'Golpe de Espada',
    category: 'combat',
    pose: makePose(
      {
        hips: [14, 24, -4],
        spineLower: [8, -16, 4],
        spineUpper: [6, -22, 6],
        neck: [-8, 16, -4],
        head: [-6, 20, -4],
        clavicleR: [0, 12, -8],
        shoulderR: [-86, -22, -48],
        elbowR: [-36, -15, 0],
        wristR: [12, 0, -18],
        shoulderL: [24, 18, 52],
        elbowL: [-54, 0, 0],
        hipR: [-52, -14, -18],
        kneeR: [62, 0, 0],
        ankleR: [-12, -8, 14],
        hipL: [28, 22, 20],
        kneeL: [18, 0, 0],
        ankleL: [14, 12, -16],
      },
      { handR: 'gripSword', handL: 'reach', gaze: { browTilt: -0.65 } }
    ),
  },
  {
    id: 'gun_aim',
    name: 'Mirar Arma de Fogo',
    category: 'combat',
    pose: makePose(
      {
        hips: [4, 28, 0],
        spineLower: [4, -10, 0],
        spineUpper: [4, -16, 2],
        neck: [-4, 10, 4],
        head: [-2, 14, 5],
        clavicleR: [0, 14, -8],
        shoulderR: [-88, 0, -6],
        elbowR: [-8, 0, 0],
        wristR: [0, 0, 0],
        shoulderL: [8, 12, 24],
        elbowL: [-48, -18, 0],
        hipR: [-18, -10, -14],
        kneeR: [22, 0, 0],
        ankleR: [-4, -4, 12],
        hipL: [12, 18, 14],
        kneeL: [14, 0, 0],
        ankleL: [0, 8, -12],
      },
      { handR: 'gripGun', handL: 'fist', gaze: { browTilt: -0.5 } }
    ),
  },
  {
    id: 'crouch',
    name: 'Agachamento Tático',
    category: 'action',
    pose: makePose(
      {
        hips: [26, -12, 0],
        spineLower: [12, 6, 0],
        spineUpper: [8, 8, 0],
        neck: [-22, -4, 0],
        head: [-18, -6, 0],
        shoulderL: [-42, -10, 32],
        elbowL: [-64, 0, 0],
        shoulderR: [-68, 10, -18],
        elbowR: [-22, 0, 0],
        wristR: [0, 0, 45],
        hipL: [-112, 18, 18],
        kneeL: [118, 0, 0],
        ankleL: [-28, 8, -8],
        hipR: [-86, -14, -14],
        kneeR: [128, 0, 0],
        ankleR: [26, -6, 6],
        toeR: [-48, 0, 0],
      },
      { handL: 'fist', handR: 'open' }
    ),
  },
  {
    id: 'seated_relaxed',
    name: 'Sentado Natural',
    category: 'seated',
    pose: makePose(
      {
        hips: [-6, 0, 0],
        spineLower: [6, 0, 0],
        spineUpper: [4, -4, 0],
        neck: [2, 4, 0],
        head: [2, 6, -3],
        shoulderL: [-24, -18, 16],
        elbowL: [-52, -24, 0],
        wristL: [8, -28, 0],
        shoulderR: [-22, 18, -16],
        elbowR: [-48, 24, 0],
        wristR: [8, 28, 0],
        hipL: [-86, 10, 10],
        kneeL: [88, 0, 0],
        ankleL: [2, 6, 0],
        hipR: [-86, -10, -10],
        kneeR: [94, 0, 0],
        ankleR: [8, -6, 0],
      },
      { handL: 'relaxed', handR: 'relaxed' }
    ),
  },
  {
    id: 'seated_thinker',
    name: 'O Pensador',
    category: 'seated',
    pose: makePose(
      {
        hips: [12, 0, 0],
        spineLower: [22, -4, 0],
        spineUpper: [20, -6, 3],
        neck: [10, 4, -3],
        head: [12, 4, -4],
        clavicleR: [0, 16, -6],
        shoulderR: [-68, 26, 8],
        elbowR: [-116, 18, 0],
        wristR: [18, 0, -28],
        shoulderL: [-42, -22, 14],
        elbowL: [-68, -32, 0],
        hipL: [-98, 8, 10],
        kneeL: [102, 0, 0],
        ankleL: [-4, 4, 0],
        hipR: [-102, -6, -8],
        kneeR: [108, 0, 0],
        ankleR: [2, -4, 0],
      },
      { handR: 'fist', handL: 'relaxed', gaze: { pitch: -10, browTilt: -0.45 } }
    ),
  },
  {
    id: 'kneeling',
    name: 'Ajoelhado Reverente',
    category: 'seated',
    pose: makePose(
      {
        hips: [8, -6, 0],
        spineLower: [6, 4, 0],
        spineUpper: [8, 4, 0],
        neck: [12, 0, 0],
        head: [14, 0, 0],
        shoulderL: [-34, -18, 14],
        elbowL: [-58, -22, 0],
        shoulderR: [-6, 8, -18],
        elbowR: [-28, 12, 0],
        hipL: [-94, 8, 8],
        kneeL: [94, 0, 0],
        ankleL: [-6, 4, 0],
        hipR: [4, -4, -6],
        kneeR: [104, 0, 0],
        ankleR: [46, 0, 0],
        toeR: [-42, 0, 0],
      },
      { handL: 'open', handR: 'fist' }
    ),
  },
  {
    id: 'reaching_out',
    name: 'Estendendo a Mão (Escorço)',
    category: 'expressive',
    pose: makePose(
      {
        hips: [8, -18, -4],
        spineLower: [8, 12, 3],
        spineUpper: [6, 16, 4],
        neck: [-8, -10, -3],
        head: [-6, -14, -4],
        clavicleL: [0, -18, 8],
        shoulderL: [-92, 12, 6],
        elbowL: [-10, 42, 0],
        wristL: [0, 12, 18],
        shoulderR: [26, -12, -28],
        elbowR: [-44, 0, 0],
        hipL: [-28, 8, 10],
        kneeL: [32, 0, 0],
        ankleL: [-6, 4, -6],
        hipR: [18, -12, -10],
        kneeR: [12, 0, 0],
        ankleR: [12, -6, 6],
      },
      { handL: 'reach', handR: 'relaxed', gaze: { eyelidOpen: 1.08, browTilt: 0.35 } }
    ),
  },
  {
    id: 'floating',
    name: 'Flutuando / Gravidade Zero',
    category: 'expressive',
    pose: makePose(
      {
        hips: [-18, 10, 6],
        spineLower: [-12, -6, -4],
        spineUpper: [-14, -6, -4],
        neck: [-12, 4, 0],
        head: [-16, 4, 4],
        shoulderL: [-46, 28, 62],
        elbowL: [-34, 18, 0],
        wristL: [-14, 0, 22],
        shoulderR: [-58, -28, -54],
        elbowR: [-42, -18, 0],
        wristR: [-12, 0, -22],
        hipL: [-36, 12, 12],
        kneeL: [68, 0, 0],
        ankleL: [44, 0, 0],
        hipR: [-12, -8, -10],
        kneeR: [36, 0, 0],
        ankleR: [48, 0, 0],
      },
      {
        hipsOffset: [0, 0.32, 0],
        handL: 'open',
        handR: 'reach',
        gaze: { eyelidOpen: 0.35, browTilt: 0.2 },
      }
    ),
  },
  {
    id: 'dramatic_back_arch',
    name: 'Queda / Recuo Dramático',
    category: 'expressive',
    pose: makePose(
      {
        hips: [-28, -14, 8],
        spineLower: [-16, 8, -4],
        spineUpper: [-18, 8, -4],
        neck: [14, -6, 0],
        head: [16, -8, -6],
        shoulderL: [-96, 22, 48],
        elbowL: [-28, 22, 0],
        shoulderR: [-72, -18, -64],
        elbowR: [-48, -18, 0],
        hipL: [-54, 14, 16],
        kneeL: [72, 0, 0],
        ankleL: [34, 0, 0],
        hipR: [-22, -10, -12],
        kneeR: [58, 0, 0],
        ankleR: [38, 0, 0],
      },
      {
        hipsOffset: [0, 0.25, 0],
        handL: 'reach',
        handR: 'open',
        gaze: { eyelidOpen: 1.15, browTilt: 0.65 },
      }
    ),
  },
];

export function createDefaultBiotype(): BiotypeParams {
  return {
    height: 1.74,
    bodyMass: 0,
    muscleTone: 0.35,
    shoulderWidth: 0.08,
    chestVolume: 0.05,
    bustVolume: 0,
    waistWidth: -0.05,
    abdomenVolume: 0,
    hipWidth: 0,
    gluteVolume: 0.05,
    thighVolume: 0.02,
    calfVolume: 0,
    armThickness: 0.04,
    forearmThickness: 0.02,
    limbLength: 0,
    armLength: 0,
    legLength: 0,
    handSize: 0,
    footSize: 0,
  };
}

export interface BiotypePresetItem {
  id: string;
  name: string;
  subtitle: string;
  biotype: BiotypeParams;
}

export const BIOTYPE_PRESETS: BiotypePresetItem[] = [
  {
    id: 'body_kun',
    name: 'Body-Kun (Atlético)',
    subtitle: 'Proporção clássica 1,78m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.78,
      bodyMass: 0.0,
      muscleTone: 0.55,
      shoulderWidth: 0.28,
      chestVolume: 0.22,
      bustVolume: 0.0,
      waistWidth: -0.18,
      abdomenVolume: -0.08,
      hipWidth: -0.14,
      gluteVolume: 0.05,
      thighVolume: 0.12,
      calfVolume: 0.1,
      armThickness: 0.18,
      forearmThickness: 0.14,
    },
  },
  {
    id: 'body_chan',
    name: 'Body-Chan (Clássico)',
    subtitle: 'Cintura marcada e quadril curvo 1,64m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.64,
      bodyMass: -0.14,
      muscleTone: 0.2,
      shoulderWidth: -0.34,
      chestVolume: -0.12,
      bustVolume: 0.48,
      waistWidth: -0.44,
      abdomenVolume: -0.12,
      hipWidth: 0.34,
      gluteVolume: 0.36,
      thighVolume: 0.14,
      calfVolume: -0.05,
      armThickness: -0.26,
      forearmThickness: -0.26,
      handSize: -0.18,
      footSize: -0.22,
    },
  },
  {
    id: 'neutral_balanced',
    name: 'Neutro Universal',
    subtitle: 'Proporções equilibradas 1,72m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.72,
      shoulderWidth: 0,
      waistWidth: -0.1,
      hipWidth: 0.06,
      bustVolume: 0.12,
    },
  },
  {
    id: 'very_lean',
    name: 'Ectomorfo / Muito Magro',
    subtitle: 'Esguio, ossatura evidente 1,82m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.82,
      bodyMass: -0.82,
      muscleTone: 0.18,
      shoulderWidth: -0.22,
      chestVolume: -0.45,
      waistWidth: -0.52,
      abdomenVolume: -0.38,
      hipWidth: -0.32,
      gluteVolume: -0.35,
      thighVolume: -0.55,
      calfVolume: -0.5,
      armThickness: -0.58,
      forearmThickness: -0.52,
      limbLength: 0.24,
    },
  },
  {
    id: 'muscular_heavy',
    name: 'Musculoso / Forte',
    subtitle: 'Grande volume torácico e braços 1,86m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.86,
      bodyMass: 0.32,
      muscleTone: 0.95,
      shoulderWidth: 0.72,
      chestVolume: 0.75,
      waistWidth: -0.05,
      abdomenVolume: -0.05,
      hipWidth: 0.05,
      gluteVolume: 0.38,
      thighVolume: 0.65,
      calfVolume: 0.52,
      armThickness: 0.78,
      forearmThickness: 0.62,
      handSize: 0.18,
      footSize: 0.18,
    },
  },
  {
    id: 'curvy',
    name: 'Curvilíneo',
    subtitle: 'Quadril e coxas volumosos 1,66m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.66,
      bodyMass: 0.28,
      muscleTone: 0.18,
      shoulderWidth: -0.18,
      chestVolume: 0.18,
      bustVolume: 0.78,
      waistWidth: -0.18,
      abdomenVolume: 0.15,
      hipWidth: 0.78,
      gluteVolume: 0.82,
      thighVolume: 0.68,
      calfVolume: 0.3,
      armThickness: 0.12,
      forearmThickness: 0.02,
      handSize: -0.1,
      footSize: -0.12,
    },
  },
  {
    id: 'endomorph_stocky',
    name: 'Robusto / Endomorfo',
    subtitle: 'Estrutura larga e densa 1,74m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.74,
      bodyMass: 0.68,
      muscleTone: 0.35,
      shoulderWidth: 0.42,
      chestVolume: 0.58,
      waistWidth: 0.58,
      abdomenVolume: 0.68,
      hipWidth: 0.44,
      gluteVolume: 0.45,
      thighVolume: 0.55,
      calfVolume: 0.42,
      armThickness: 0.48,
      forearmThickness: 0.36,
      limbLength: -0.12,
    },
  },
  {
    id: 'plus_size_obese',
    name: 'Corpo Gordo / Obesidade',
    subtitle: 'Alto volume abdominal e corporal 1,72m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.72,
      bodyMass: 1.28,
      muscleTone: 0.08,
      shoulderWidth: 0.25,
      chestVolume: 0.78,
      bustVolume: 0.42,
      waistWidth: 0.98,
      abdomenVolume: 1.25,
      hipWidth: 0.88,
      gluteVolume: 0.85,
      thighVolume: 0.92,
      calfVolume: 0.68,
      armThickness: 0.82,
      forearmThickness: 0.55,
    },
  },
  {
    id: 'plus_size_fem',
    name: 'Plus Size Curvilíneo',
    subtitle: 'Silhueta ampla e macia 1,68m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.68,
      bodyMass: 0.92,
      muscleTone: 0.1,
      shoulderWidth: -0.05,
      chestVolume: 0.52,
      bustVolume: 0.95,
      waistWidth: 0.56,
      abdomenVolume: 0.78,
      hipWidth: 1.02,
      gluteVolume: 0.98,
      thighVolume: 0.95,
      calfVolume: 0.62,
      armThickness: 0.62,
      forearmThickness: 0.38,
      handSize: -0.08,
    },
  },
  {
    id: 'tall_lanky',
    name: 'Alto Longilíneo',
    subtitle: 'Membros compridos 1,98m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.98,
      bodyMass: -0.35,
      muscleTone: 0.38,
      shoulderWidth: 0.12,
      waistWidth: -0.3,
      limbLength: 0.45,
      legLength: 0.2,
      handSize: 0.15,
      footSize: 0.2,
    },
  },
  {
    id: 'petite_compact',
    name: 'Baixo / Compacto',
    subtitle: 'Estrutura baixa 1,48m',
    biotype: {
      ...createDefaultBiotype(),
      height: 1.48,
      bodyMass: -0.05,
      limbLength: -0.22,
      handSize: -0.05,
      footSize: -0.05,
    },
  },
];

export function createDefaultStylized(): StylizedParams {
  return {
    mode: 'realistic',
    headScale: 1.38,
    eyeScale: 1.42,
    neckScale: 0.85,
    torsoLength: 1.02,
    torsoTaper: 0.32,
    limbExaggeration: 1.08,
    handExaggeration: 1.45,
    footExaggeration: 1.4,
    featureRoundness: 0.55,
  };
}

export const STYLIZED_PRESETS: { id: string; name: string; params: Omit<StylizedParams, 'mode'> }[] = [
  {
    id: 'cartoon_classic',
    name: 'Cartoon Expressivo',
    params: {
      headScale: 1.45,
      eyeScale: 1.5,
      neckScale: 0.82,
      torsoLength: 1.0,
      torsoTaper: 0.28,
      limbExaggeration: 1.08,
      handExaggeration: 1.55,
      footExaggeration: 1.5,
      featureRoundness: 0.65,
    },
  },
  {
    id: 'chibi',
    name: 'Chibi / Miniatura',
    params: {
      headScale: 2.05,
      eyeScale: 1.85,
      neckScale: 0.65,
      torsoLength: 0.72,
      torsoTaper: -0.25,
      limbExaggeration: 0.64,
      handExaggeration: 1.42,
      footExaggeration: 1.38,
      featureRoundness: 0.9,
    },
  },
  {
    id: 'comic_hero',
    name: 'Herói Estilizado',
    params: {
      headScale: 0.84,
      eyeScale: 1.05,
      neckScale: 1.25,
      torsoLength: 1.22,
      torsoTaper: 0.85,
      limbExaggeration: 1.12,
      handExaggeration: 1.48,
      footExaggeration: 1.35,
      featureRoundness: 0.25,
    },
  },
  {
    id: 'anime_slender',
    name: 'Anime / Mangá',
    params: {
      headScale: 1.24,
      eyeScale: 1.65,
      neckScale: 0.78,
      torsoLength: 0.92,
      torsoTaper: 0.18,
      limbExaggeration: 1.22,
      handExaggeration: 1.05,
      footExaggeration: 1.08,
      featureRoundness: 0.45,
    },
  },
  {
    id: 'lanky_caricature',
    name: 'Longilíneo Caricato',
    params: {
      headScale: 1.32,
      eyeScale: 1.4,
      neckScale: 1.45,
      torsoLength: 1.38,
      torsoTaper: 0.42,
      limbExaggeration: 1.42,
      handExaggeration: 1.82,
      footExaggeration: 1.88,
      featureRoundness: 0.5,
    },
  },
  {
    id: 'pear_toon',
    name: 'Silhueta Pera',
    params: {
      headScale: 1.3,
      eyeScale: 1.35,
      neckScale: 0.85,
      torsoLength: 1.15,
      torsoTaper: -0.68,
      limbExaggeration: 0.9,
      handExaggeration: 1.35,
      footExaggeration: 1.35,
      featureRoundness: 0.8,
    },
  },
];

export const SKIN_SWATCHES = [
  '#fce5d4',
  '#f5cfb6',
  '#eab896',
  '#dfa27c',
  '#d1926b',
  '#c17e56',
  '#a86844',
  '#8d5334',
  '#6f3f26',
  '#532d1b',
  '#3b1f13',
  '#28150d',
  // Mannequin & fantasy tones
  '#d4d6dc',
  '#b98a6f',
  '#8fa8c8',
  '#8fb89a',
];

export const HAIR_SWATCHES = [
  '#121215',
  '#231b18',
  '#3b271c',
  '#5c3a24',
  '#855534',
  '#b5834a',
  '#dfc088',
  '#f2e5c6',
  '#8f2d1e',
  '#b84a27',
  '#9ca3af',
  '#f1f5f9',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#10b981',
];

export const IRIS_SWATCHES = [
  '#2d1b10',
  '#5b3820',
  '#8b5a2b',
  '#c28b37',
  '#4d7c4f',
  '#2e7d6b',
  '#3b82f6',
  '#60a5fa',
  '#64748b',
  '#8b5cf6',
  '#e11d48',
  '#f59e0b',
];

export const SURFACE_MATERIAL_PRESETS: Record<
  SurfaceMaterialMode,
  { label: string; subtitle: string; roughness: number; metalness: number; sheen: number }
> = {
  skin: {
    label: 'Pele Natural',
    subtitle: 'Suave com leve brilho orgânico',
    roughness: 0.56,
    metalness: 0.0,
    sheen: 0.42,
  },
  mannequin: {
    label: 'Manequim Body-Kun',
    subtitle: 'PVC fosco com juntas e linhas guia',
    roughness: 0.48,
    metalness: 0.04,
    sheen: 0.15,
  },
  clay: {
    label: 'Argila / Clay',
    subtitle: 'Escultura fosca ideal para luz e sombra',
    roughness: 0.86,
    metalness: 0.0,
    sheen: 0.1,
  },
  porcelain: {
    label: 'Porcelana Polida',
    subtitle: 'Reflexos nítidos para estudo especular',
    roughness: 0.16,
    metalness: 0.04,
    sheen: 0.25,
  },
  bronze: {
    label: 'Estátua Metálica',
    subtitle: 'Acabamento metálico escultural',
    roughness: 0.3,
    metalness: 0.88,
    sheen: 0.1,
  },
  toon: {
    label: 'Cel-Shaded / Toon',
    subtitle: 'Blocos de sombra para mangá e HQ',
    roughness: 0.7,
    metalness: 0.0,
    sheen: 0.0,
  },
};

export function createDefaultAppearance(): AppearanceParams {
  return {
    skinColor: '#c98a67',
    hairColor: '#231a16',
    hairSecondaryColor: '#7a4a2b',
    irisColor: '#4e331e',
    browColor: '#231a16',
    lipColor: '#a86252',
    jointColor: '#8d624c',
    materialMode: 'skin',
    roughness: 0.56,
    metalness: 0.0,
    sheen: 0.42,
    showContourLines: true,
    showJointSpheres: true,
    hairVolume: 1.0,
    hairLength: 1.0,
    hairRoughness: 0.65,
  };
}

export function createDefaultIK(): IKState {
  return {
    handL: { enabled: false, target: [0.32, 0.96, 0.12], poleAngle: 0 },
    handR: { enabled: false, target: [-0.32, 0.96, 0.12], poleAngle: 0 },
    footL: { enabled: false, target: [0.12, 0.06, 0.0], poleAngle: 0 },
    footR: { enabled: false, target: [-0.12, 0.06, 0.0], poleAngle: 0 },
  };
}

export function createCharacter(
  id: string,
  name: string,
  template: 'kun' | 'chan' | 'neutral' | 'stylized' = 'kun',
  position: Vec3 = [0, 0, 0]
): CharacterData {
  const biotype =
    template === 'chan'
      ? { ...BIOTYPE_PRESETS[1].biotype }
      : template === 'neutral'
      ? { ...BIOTYPE_PRESETS[2].biotype }
      : { ...BIOTYPE_PRESETS[0].biotype };

  const stylized = createDefaultStylized();
  if (template === 'stylized') {
    stylized.mode = 'stylized';
  }

  const appearance = createDefaultAppearance();
  let hairId = 'low_fade';
  if (template === 'kun') {
    appearance.skinColor = '#c88c68';
    appearance.hairColor = '#211915';
    appearance.irisColor = '#4a311e';
    appearance.showContourLines = true;
    appearance.showJointSpheres = true;
    hairId = 'undercut_swept';
  } else if (template === 'chan') {
    appearance.skinColor = '#9b603e';
    appearance.hairColor = '#1c1412';
    appearance.hairSecondaryColor = '#6e3f24';
    appearance.irisColor = '#3f2617';
    appearance.lipColor = '#844237';
    hairId = 'curly_round_halo';
  } else if (template === 'stylized') {
    appearance.skinColor = '#eab896';
    appearance.hairColor = '#b84a27';
    appearance.hairSecondaryColor = '#f59e0b';
    appearance.irisColor = '#2e7d6b';
    hairId = 'wavy_shag_wolf';
  } else {
    appearance.skinColor = '#d4d6dc';
    appearance.jointColor = '#9da3b0';
    appearance.lipColor = '#b8bcc6';
    appearance.materialMode = 'mannequin';
    appearance.roughness = 0.48;
    appearance.showContourLines = true;
    appearance.showJointSpheres = true;
    hairId = 'bald';
  }

  return {
    id,
    name,
    modelId: 'bodykun',
    visible: true,
    locked: false,
    position: [...position],
    rotation: [0, 0, 0],
    scale: 1,
    biotype,
    stylized,
    appearance,
    hairId,
    clothing: createEmptyClothing(),
    pose: makePose(POSE_PRESETS[0].pose.joints, {
      gaze: POSE_PRESETS[0].pose.gaze,
    }),
    ik: createDefaultIK(),
    autoGround: true,
  };
}

export function fovToFocalLength(fovDeg: number): number {
  // 35mm full-frame vertical sensor height = 24mm
  const rad = (fovDeg * Math.PI) / 180;
  return Math.round(12 / Math.tan(rad / 2));
}

export function focalLengthToFov(mm: number): number {
  const clamped = Math.max(12, Math.min(220, mm));
  const rad = 2 * Math.atan(12 / clamped);
  return Number(((rad * 180) / Math.PI).toFixed(1));
}

export const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  projection: 'perspective',
  fov: 35,
  focalLength: fovToFocalLength(35), // ~38mm natural portrait/figure lens (minimal distortion!)
  dollyZoomLock: true,
  roll: 0,
  aspectFrame: 'free',
  compositionGuide: 'none',
  savedViews: [],
};

export const DEFAULT_EFFECTS: EffectsSettings = {
  toneMapping: 'aces',
  exposure: 1.08,
  contrast: 1.02,
  saturation: 1.0,
  vignette: 0.2,
  dofEnabled: false,
  focusDistance: 2.9,
  aperture: 3.5,
  maxBlur: 0.012,
  motionBlurEnabled: false,
  motionBlurMode: 'directional',
  motionBlurStrength: 0.42,
  motionBlurAngle: 18,
  motionBlurCenter: [0.5, 0.52],
  motionBlurProtectCenter: 0.35,
};
