import * as THREE from 'three';
import type { Pose, Results, NormalizedLandmark } from '@mediapipe/pose';
import type { PoseData, JointId, Vec3 } from '../types/studio';

type PoseConstructor = new (config: {locateFile:(file:string)=>string})=>Pose;
let loading:Promise<PoseConstructor>|undefined;
function loadPose():Promise<PoseConstructor> {
  if (!loading) loading = new Promise<PoseConstructor>((resolve,reject)=>{
    const existing=(window as unknown as {Pose?:PoseConstructor}).Pose;
    if(existing){resolve(existing);return}
    const script=document.createElement('script');script.src=`${import.meta.env.BASE_URL}mediapipe/pose/pose.js`;script.async=true;
    script.onload=()=>{const ctor=(window as unknown as {Pose?:PoseConstructor}).Pose;ctor?resolve(ctor):reject(new Error('O módulo de estimativa não foi carregado.'))};
    script.onerror=()=>reject(new Error('Não foi possível carregar o modelo local de pose.'));document.head.appendChild(script);
  }).catch(err=>{loading=undefined;throw err});
  return loading!;
}
export async function estimatePose(file:File, previous:PoseData):Promise<{pose:PoseData;warnings:string[]}> {
  if(!file.type.startsWith('image/'))throw new Error('Selecione um arquivo de imagem válido.');
  const url=URL.createObjectURL(file);let model:Pose|undefined;
  try {
    const image=new Image(); image.src=url; await image.decode();
    const Constructor=await loadPose();model=new Constructor({locateFile:file=>`${import.meta.env.BASE_URL}mediapipe/pose/${file}`});
    model.setOptions({modelComplexity:1,smoothLandmarks:false,enableSegmentation:false,minDetectionConfidence:.5});
    let result:Results|undefined; model.onResults(r=>{result=r});await model.send({image});
    if(!result || !(result as Results).poseWorldLandmarks?.length || !(result as Results).poseLandmarks?.length)throw new Error('Nenhuma pessoa foi identificada. Experimente uma imagem de corpo inteiro e boa iluminação.');
    const r=result as Results;return retarget(r.poseWorldLandmarks,r.poseLandmarks,previous);
  } finally { if(model)await model.close();URL.revokeObjectURL(url) }
}
/** MediaPipe's camera-space landmarks are an estimate, not recovered ground truth. */
export function retarget(world:NormalizedLandmark[], image:NormalizedLandmark[], previous:PoseData):{pose:PoseData;warnings:string[]} {
  const pose=structuredClone(previous);const warnings:string[]=[];
  const good=(...ids:number[])=>ids.every(i=>world[i] && image[i] && (image[i].visibility??1)>.45 && [world[i].x,world[i].y,world[i].z].every(Number.isFinite));
  const p=(i:number)=>new THREE.Vector3(world[i].x,-world[i].y,-world[i].z);
  const angle=(q:THREE.Quaternion):Vec3=>{const e=new THREE.Euler().setFromQuaternion(q,'XYZ');return [e.x,e.y,e.z].map(THREE.MathUtils.radToDeg) as Vec3};
  let torso=new THREE.Quaternion();
  if(good(11,12,23,24)) {
    const x=p(11).sub(p(12)).normalize();const up=p(11).add(p(12)).sub(p(23)).sub(p(24)).normalize();const z=new THREE.Vector3().crossVectors(x,up).normalize();const y=new THREE.Vector3().crossVectors(z,x).normalize();
    if(z.lengthSq()>.1){torso.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));pose.joints.hips=angle(torso);pose.joints.spineLower=[0,0,0];pose.joints.spineUpper=[0,0,0]}
  } else warnings.push('Tronco pouco visível: orientação anterior preservada.');
  const down=new THREE.Vector3(0,-1,0);
  const limb=(a:number,b:number,c:number,upper:JointId,mid:JointId,label:string)=>{
    if(!good(a,b,c)){warnings.push(`${label}: pontos pouco visíveis; pose anterior preservada.`);return}
    const d1=p(b).sub(p(a)),d2=p(c).sub(p(b));if(d1.lengthSq()<1e-8||d2.lengthSq()<1e-8){warnings.push(`${label}: pontos insuficientes.`);return}
    const upperQ=new THREE.Quaternion().setFromUnitVectors(down,d1.normalize().applyQuaternion(torso.clone().invert()));
    const lowerLocal=d2.normalize().applyQuaternion(torso.clone().multiply(upperQ).invert());
    const midQ=new THREE.Quaternion().setFromUnitVectors(down,lowerLocal);
    pose.joints[upper]=angle(upperQ);pose.joints[mid]=angle(midQ);
  };
  limb(11,13,15,'shoulderL','elbowL','Braço esquerdo');limb(12,14,16,'shoulderR','elbowR','Braço direito');limb(23,25,27,'hipL','kneeL','Perna esquerda');limb(24,26,28,'hipR','kneeR','Perna direita');
  pose.joints.clavicleL=[0,0,0];pose.joints.clavicleR=[0,0,0];
  return {pose,warnings};
}
