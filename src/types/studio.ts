export type Vec3 = [number, number, number];

export type JointId =
  | 'hips'
  | 'spineLower'
  | 'spineUpper'
  | 'neck'
  | 'head'
  | 'clavicleL'
  | 'shoulderL'
  | 'elbowL'
  | 'wristL'
  | 'clavicleR'
  | 'shoulderR'
  | 'elbowR'
  | 'wristR'
  | 'hipL'
  | 'kneeL'
  | 'ankleL'
  | 'toeL'
  | 'hipR'
  | 'kneeR'
  | 'ankleR'
  | 'toeR';

export type FingerName = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

export interface HandPose {
  thumb: number;   // -0.4 (extended) to 1.2 (curled)
  index: number;   // -0.3 to 1.4
  middle: number;
  ring: number;
  pinky: number;
  spread: number;  // -0.4 (closed together) to 0.7 (wide spread)
  thumbOppose: number; // -0.3 to 1.0 (opposing across palm)
}

export interface GazeState {
  yaw: number;          // -35 to +35 degrees horizontal eye rotation
  pitch: number;        // -25 to +25 degrees vertical eye rotation
  convergence: number;  // 0 to 15 degrees (cross-eye / close focus)
  eyelidOpen: number;   // 0 (closed) to 1.2 (wide open), default 1
  browTilt: number;     // -1 (angry/furrowed) to +1 (surprised/arched)
  useTarget: boolean;   // look toward 3D gaze target
  target: Vec3;         // world-space gaze target
}

export type IKLimbId = 'handL' | 'handR' | 'footL' | 'footR';

export interface IKLimbState {
  enabled: boolean;
  target: Vec3;       // world-space target
  poleAngle: number;  // -180 to +180 swivel angle in degrees
}

export interface IKState {
  handL: IKLimbState;
  handR: IKLimbState;
  footL: IKLimbState;
  footR: IKLimbState;
}

export interface PoseData {
  hipsOffset: Vec3; // Pelvis local offset from character ground root (for crouch/jump/sit)
  joints: Record<JointId, Vec3>; // Euler XYZ in degrees
  handL: HandPose;
  handR: HandPose;
  gaze: GazeState;
}

export interface BiotypeParams {
  height: number;           // 1.30 to 2.20 meters (default 1.74)
  bodyMass: number;         // -1.0 (very lean) to +1.5 (heavy/obese), default 0
  muscleTone: number;       // 0.0 to 1.0, default 0.35
  shoulderWidth: number;    // -1.0 to +1.0, default 0
  chestVolume: number;      // -1.0 to +1.0, default 0
  bustVolume: number;       // 0.0 to 1.2, default 0 (optional bust/pectoral fullness)
  waistWidth: number;       // -1.0 to +1.2, default 0
  abdomenVolume: number;    // -0.6 to +1.5, default 0
  hipWidth: number;         // -1.0 to +1.2, default 0
  gluteVolume: number;      // -0.8 to +1.2, default 0
  thighVolume: number;      // -1.0 to +1.3, default 0
  calfVolume: number;       // -1.0 to +1.2, default 0
  armThickness: number;     // -1.0 to +1.3, default 0
  forearmThickness: number; // -1.0 to +1.2, default 0
  limbLength: number;       // -0.8 to +0.8, default 0 (proportional arms + legs)
  armLength: number;        // -0.6 to +0.6, default 0 (fine-tune arms)
  legLength: number;        // -0.6 to +0.6, default 0 (fine-tune legs)
  handSize: number;         // -0.8 to +1.0, default 0
  footSize: number;         // -0.8 to +1.0, default 0
}

export type BodyStyleMode = 'realistic' | 'stylized';

/**
 * Independent stylized/cartoon parameters. Applied multiplicatively on top of
 * BiotypeParams so all biotype controls continue working identically in both modes.
 */
export interface StylizedParams {
  mode: BodyStyleMode;
  headScale: number;        // 0.6 to 2.4 (default 1.35 in stylized)
  eyeScale: number;         // 0.7 to 2.2 (default 1.4 in stylized)
  neckScale: number;        // 0.5 to 1.8 (default 0.85)
  torsoLength: number;      // 0.6 to 1.7 (default 1.05)
  torsoTaper: number;       // -0.8 (pear) to +1.0 (heroic V-shape), default 0.35
  limbExaggeration: number; // 0.55 (chibi short) to 1.55 (rubber-hose/lanky), default 1.1
  handExaggeration: number; // 0.6 to 2.3 (default 1.45)
  footExaggeration: number; // 0.6 to 2.3 (default 1.4)
  featureRoundness: number; // 0.0 to 1.0 (default 0.5)
}

export type SurfaceMaterialMode =
  | 'skin'
  | 'mannequin'
  | 'clay'
  | 'porcelain'
  | 'bronze'
  | 'toon';

export interface AppearanceParams {
  skinColor: string;
  hairColor: string;
  hairSecondaryColor: string;
  irisColor: string;
  browColor: string;
  lipColor: string;
  jointColor: string;
  materialMode: SurfaceMaterialMode;
  roughness: number;        // 0.05 to 1.0
  metalness: number;        // 0.0 to 1.0
  sheen: number;            // 0.0 to 1.0
  showContourLines: boolean; // Body-Kun cross-contour anatomy guidelines
  showJointSpheres: boolean; // Sculpted mannequin ball-joint rings
  hairVolume: number;       // 0.7 to 1.5
  hairLength: number;       // 0.7 to 1.5
  hairRoughness: number;    // 0.15 to 0.95
}

export type ClothingSlot =
  | 'innerTop'
  | 'outerTop'
  | 'bottom'
  | 'fullBody'
  | 'footwear';

export type AccessoryId =
  | 'belt'
  | 'tie'
  | 'bowtie'
  | 'suspenders'
  | 'socksShort'
  | 'socksLong'
  | 'gloves'
  | 'glovesFingerless'
  | 'scarf'
  | 'choker'
  | 'watch';

export type FabricType =
  | 'cotton'
  | 'denim'
  | 'leather'
  | 'silk'
  | 'wool'
  | 'synthetic';

export interface ClothingSlotConfig {
  itemId: string | null;
  color: string;
  secondaryColor: string;
  fabric: FabricType;
  ease: number; // -0.3 (snugger) to +0.8 (looser/more oversized)
}

export interface AccessoryConfig {
  enabled: boolean;
  color: string;
  secondaryColor: string;
  fabric: FabricType;
}

export interface ClothingState {
  innerTop: ClothingSlotConfig;
  outerTop: ClothingSlotConfig;
  bottom: ClothingSlotConfig;
  fullBody: ClothingSlotConfig;
  footwear: ClothingSlotConfig;
  accessories: Record<AccessoryId, AccessoryConfig>;
}

export interface CharacterData {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  position: Vec3;
  rotation: Vec3; // degrees
  scale: number;
  biotype: BiotypeParams;
  stylized: StylizedParams;
  appearance: AppearanceParams;
  hairId: string;
  clothing: ClothingState;
  pose: PoseData;
  ik: IKState;
  autoGround: boolean;
}

export type PropMaterialPreset =
  | 'steel'
  | 'wood'
  | 'matte'
  | 'plastic'
  | 'gold'
  | 'leather'
  | 'glass'
  | 'stone';

export interface PropAttachment {
  characterId: string;
  hand: 'left' | 'right';
  offsetPos: Vec3;
  offsetRot: Vec3; // degrees
}

export interface PropInstance {
  id: string;
  catalogId: string;
  name: string;
  visible: boolean;
  locked: boolean;
  position: Vec3;
  rotation: Vec3; // degrees
  scale: Vec3;
  color: string;
  secondaryColor: string;
  materialPreset: PropMaterialPreset;
  roughness: number;
  metalness: number;
  attachment: PropAttachment | null;
}

export type StudioLightType = 'directional' | 'spot' | 'point' | 'hemisphere';

export interface StudioLight {
  id: string;
  name: string;
  type: StudioLightType;
  enabled: boolean;
  color: string;
  groundColor: string; // for hemisphere
  intensity: number;
  position: Vec3;
  target: Vec3;
  distance: number;    // 0 = infinite, >0 falloff range
  angle: number;       // degrees, for spot (10 to 85)
  penumbra: number;    // 0 to 1, for spot
  castShadow: boolean;
  shadowSoftness: number; // 0.5 to 8
}

export type CameraProjection = 'perspective' | 'orthographic';

export type AspectFrame =
  | 'free'
  | '1:1'
  | '4:5'
  | '3:4'
  | '16:9'
  | '9:16'
  | '2.39:1';

export type CompositionGuide =
  | 'none'
  | 'thirds'
  | 'golden'
  | 'crosshair'
  | 'diagonals'
  | 'grid';

export interface SavedCameraView {
  id: string;
  name: string;
  position: Vec3;
  target: Vec3;
  fov: number;
  projection: CameraProjection;
  orthoZoom: number;
}

export interface CameraSettings {
  projection: CameraProjection;
  fov: number;              // 10 to 105 degrees
  focalLength: number;      // 14mm to 200mm (35mm full-frame equiv)
  dollyZoomLock: boolean;   // Keep subject size constant when changing FOV/focal length
  roll: number;             // -45 to +45 degrees Dutch angle!
  aspectFrame: AspectFrame;
  compositionGuide: CompositionGuide;
  savedViews: SavedCameraView[];
}

export type ToneMappingMode = 'aces' | 'neutral' | 'reinhard' | 'cineon';

export type MotionBlurMode = 'directional' | 'radial' | 'zoomAction';

export interface EffectsSettings {
  toneMapping: ToneMappingMode;
  exposure: number;         // 0.3 to 2.5 (default 1.08)
  contrast: number;         // 0.7 to 1.5 (default 1.02)
  saturation: number;       // 0.0 (B&W value study!) to 1.6 (default 1.0)
  vignette: number;         // 0.0 to 1.0 (default 0.18)

  dofEnabled: boolean;
  focusDistance: number;    // 0.4 to 15.0 meters
  aperture: number;         // 0.5 to 12.0 (blur strength)
  maxBlur: number;          // 0.002 to 0.035

  motionBlurEnabled: boolean;
  motionBlurMode: MotionBlurMode;
  motionBlurStrength: number; // 0.0 to 1.0
  motionBlurAngle: number;    // 0 to 360 degrees
  motionBlurCenter: [number, number]; // normalized screen center [0..1, 0..1]
  motionBlurProtectCenter: number; // 0 to 1 keeps focal center sharp
}

export type BackdropPreset =
  | 'darkStudio'
  | 'midGray'
  | 'warmPaper'
  | 'lightStudio'
  | 'midnight'
  | 'custom';

export interface EnvironmentSettings {
  backdropPreset: BackdropPreset;
  backgroundColor: string;
  floorVisible: boolean;
  floorColor: string;
  floorRoughness: number;
  floorOpacity: number;
  gridVisible: boolean;
  ambientIBL: number; // 0 to 1.2 subtle environment reflection
}

export interface ReferenceOverlay {
  visible: boolean;
  imageUrl: string | null;
  mode: 'pip' | 'overlay'; // floating card or semi-transparent viewport overlay
  opacity: number;
  scale: number;
  flipX: boolean;
}

export type SelectionTarget =
  | { kind: 'character'; id: string }
  | { kind: 'prop'; id: string }
  | { kind: 'light'; id: string }
  | null;

export type TransformTool = 'select' | 'translate' | 'rotate' | 'scale';

export type InspectorTab =
  | 'pose'
  | 'biotype'
  | 'appearance'
  | 'hair'
  | 'clothing'
  | 'props'
  | 'camera'
  | 'lighting';

export interface CustomSavedPose {
  id: string;
  name: string;
  pose: PoseData;
}

export interface SceneSnapshot {
  characters: CharacterData[];
  props: PropInstance[];
  lights: StudioLight[];
  environment: EnvironmentSettings;
}
