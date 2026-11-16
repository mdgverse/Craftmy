import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
// GLTFLoader uses browser ProgressEvent only for loader notifications.
globalThis.ProgressEvent ??= class ProgressEvent {};
const file=fs.readFileSync('public/models/bodykun.glb');
const array=file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength);
const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(array,'',resolve,reject));
const model=clone(gltf.scene); let mesh;
model.traverse(o=>{if(o.isSkinnedMesh&&o.name==='upperarms')mesh=o});
assert.ok(mesh,'O modelo precisa ter uma malha de braços com skin');
const bones=mesh.skeleton.bones;
for(const name of ['DEF-spine_1','DEF-upper_armL_1','DEF-forearmL_1','DEF-thighL_1','DEF-shinL_1'])assert.ok(bones.find(b=>b.name===name),`Osso ausente: ${name}`);
model.updateMatrixWorld(true);mesh.skeleton.update();
const point=new THREE.Vector3(), before=[];
for(let i=0;i<mesh.geometry.attributes.position.count;i+=20){mesh.getVertexPosition(i,point);before.push(point.clone())}
bones.find(b=>b.name==='DEF-upper_armL_1').rotateX(.5);
model.updateMatrixWorld(true);mesh.skeleton.update();
let max=0, sample=0;
for(let i=0;i<mesh.geometry.attributes.position.count;i+=20){mesh.getVertexPosition(i,point);max=Math.max(max,point.distanceTo(before[sample++]));}
assert.ok(max>.01,'Rotação do osso não alterou os vértices');
console.log(`GLB válido: ${bones.length} ossos, deformação medida ${max.toFixed(3)} unidades.`);
