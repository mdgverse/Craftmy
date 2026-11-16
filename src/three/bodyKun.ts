import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { CharacterData, JointId } from '../types/studio';

// This export includes BodyKun only. Rigify's Blender-only controls and constraints
// are not evaluated by glTF; we rotate the skin's deform bones directly.
const BONE_MAP: Partial<Record<JointId,string>> = {
  hips:'DEF-spine_1', spineLower:'DEF-spine001_1', spineUpper:'DEF-spine003_1', neck:'DEF-spine004_1', head:'DEF-spine006_1',
  clavicleL:'DEF-shoulderL_1', clavicleR:'DEF-shoulderR_1',
  shoulderL:'DEF-upper_armL_1', shoulderR:'DEF-upper_armR_1', elbowL:'DEF-forearmL_1', elbowR:'DEF-forearmR_1',
  wristL:'DEF-handL_1', wristR:'DEF-handR_1', hipL:'DEF-thighL_1', hipR:'DEF-thighR_1',
  kneeL:'DEF-shinL_1', kneeR:'DEF-shinR_1', ankleL:'DEF-footL_1', ankleR:'DEF-footR_1',
};
let source:THREE.Group|undefined;
let pending:Promise<void>|undefined;
export function loadBodyKun():Promise<void> {
  if(source)return Promise.resolve();
  if(!pending)pending=new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/bodykun.glb`).then(g=>{source=g.scene}).catch(error=>{pending=undefined;throw error});
  return pending;
}
export function bodyKunReady(){return !!source}
export function makeBodyKun(character:CharacterData):THREE.Group {
  if(!source)throw new Error('Modelo ainda não carregado');
  const model=clone(source) as THREE.Group;
  // Geometry and materials are per-instance because the viewport disposes rebuilt characters.
  let skeleton:THREE.Skeleton|undefined;
  model.traverse(o=>{if(o instanceof THREE.SkinnedMesh){skeleton ||= o.skeleton;o.geometry=o.geometry.clone();o.material=new THREE.MeshStandardMaterial({color:character.appearance.skinColor,roughness:character.appearance.roughness,metalness:character.appearance.metalness});o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
  if(!skeleton)throw new Error('O modelo não contém uma armadura utilizável.');
  const bones=(skeleton as THREE.Skeleton).bones;const find=(name:string)=>bones.find(b=>b.name===name);
  const bounds=new THREE.Box3().setFromObject(model);const height=bounds.max.y-bounds.min.y;
  if(!Number.isFinite(height)||height<=0)throw new Error('Dimensões inválidas no modelo.');
  const wrapper=new THREE.Group();wrapper.add(model);const scale=character.biotype.height/height;model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale;model.position.add(new THREE.Vector3(...character.pose.hipsOffset));
  wrapper.updateMatrixWorld(true);
  // Convert rotations expressed in Craftmy's character axes into each bone's
  // parent space, retaining the exported bind orientation.
  for(const [id,name] of Object.entries(BONE_MAP) as [JointId,string][]) {
    const bone=find(name);if(!bone||!bone.parent)continue;
    const [x,y,z]=character.pose.joints[id];if(!x&&!y&&!z)continue;
    wrapper.updateMatrixWorld(true);
    const parentQ=bone.parent.getWorldQuaternion(new THREE.Quaternion());
    const rootQ=wrapper.getWorldQuaternion(new THREE.Quaternion());
    const parentInRoot=rootQ.invert().multiply(parentQ);
    const delta=new THREE.Quaternion().setFromEuler(new THREE.Euler(...[x,y,z].map(THREE.MathUtils.degToRad) as [number,number,number],'XYZ'));
    const localDelta=parentInRoot.clone().invert().multiply(delta).multiply(parentInRoot);
    bone.quaternion.premultiply(localDelta).normalize();
  }
  return wrapper;
}
