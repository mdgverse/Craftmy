import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { CharacterData, JointId } from '../types/studio';
import { computeBodyMetrics, buildSculptedHead } from './anatomyProfile';
import { buildHairMesh } from './hairBuilder';

export class Viewport {
  scene = new THREE.Scene(); renderer: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera; ortho: THREE.OrthographicCamera; controls: OrbitControls; root = new THREE.Group(); frame = 0; resize: ResizeObserver; selected = '';
  constructor(public element: HTMLElement, public onSelect: (id:string)=>void) {
    this.scene.background = new THREE.Color('#24272c');
    this.renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true}); this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)); this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.element.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(38,1,.01,100); this.camera.position.set(3,2.15,4.5);
    this.ortho = new THREE.OrthographicCamera(-2,2,2,-2,.01,100); this.ortho.position.copy(this.camera.position);
    this.controls = new OrbitControls(this.camera,this.renderer.domElement); this.controls.target.set(0,1,0); this.controls.enableDamping=true;
    this.scene.add(new THREE.HemisphereLight(0xdceaff,0x333039,2)); const light=new THREE.DirectionalLight(0xffead8,3); light.position.set(3,6,4); light.castShadow=true; light.shadow.mapSize.set(2048,2048); light.shadow.camera.left=-5; light.shadow.camera.right=5; light.shadow.camera.top=5; light.shadow.camera.bottom=-5; this.scene.add(light);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#292c31',roughness:1})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; this.scene.add(floor); const grid=new THREE.GridHelper(20,40,0x55565b,0x3a3c41); grid.position.y=.002; this.scene.add(grid); this.scene.add(this.root);
    this.resize=new ResizeObserver(()=>this.fit()); this.resize.observe(element); this.fit();
    this.renderer.domElement.addEventListener('pointerdown',this.pick); const tick=()=>{this.frame=requestAnimationFrame(tick);this.controls.update();this.renderer.render(this.scene,this.controls.object)}; tick();
  }
  pick=(e:PointerEvent)=>{ if(e.button!==0)return; const rect=this.renderer.domElement.getBoundingClientRect(); const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),this.controls.object); const hits=ray.intersectObjects(this.root.children,true); if(hits.length){let obj:THREE.Object3D|null=hits[0].object;while(obj&&!obj.userData.characterId)obj=obj.parent;if(obj)this.onSelect(obj.userData.characterId)}};
  fit(){const w=this.element.clientWidth,h=this.element.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.ortho.left=-2*w/h;this.ortho.right=2*w/h;this.ortho.top=2;this.ortho.bottom=-2;this.ortho.updateProjectionMatrix()}
  projection(orthographic:boolean){const old=this.controls.object, next=orthographic?this.ortho:this.camera;next.position.copy(old.position);next.quaternion.copy(old.quaternion);this.controls.object=next;this.controls.update()}
  focus(c:CharacterData){this.controls.target.set(c.position[0],c.position[1]+.9,c.position[2]);this.controls.update()}
  update(characters:CharacterData[],selected:string){this.selected=selected; this.root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose(); if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose()}});this.root.clear();characters.filter(c=>c.visible).forEach(c=>this.root.add(this.build(c)))}
  build(c:CharacterData){const m=computeBodyMetrics(c.biotype,c.stylized);const root=new THREE.Group();root.userData.characterId=c.id;root.position.set(...c.position);root.rotation.set(...c.rotation.map(THREE.MathUtils.degToRad) as [number,number,number]);root.scale.setScalar(c.scale);
    const skin=new THREE.MeshStandardMaterial({color:c.appearance.skinColor,roughness:.66,metalness:.02});const dark=new THREE.MeshStandardMaterial({color:c.appearance.jointColor,roughness:.75});
    const sphere=(parent:THREE.Object3D,x:number,y:number,z:number,sx:number,sy:number,sz:number,material=skin)=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh};
    const joint=(parent:THREE.Object3D,id:JointId,x:number,y:number,z:number)=>{const g=new THREE.Group();g.position.set(x,y,z);const r=c.pose.joints[id];g.rotation.set(...r.map(THREE.MathUtils.degToRad) as [number,number,number]);parent.add(g);return g};
    const hips=joint(root,'hips',0,m.pelvisHeight,0); hips.position.add(new THREE.Vector3(...c.pose.hipsOffset)); sphere(hips,0,.035,0,m.pelvisRx,m.hipsSegLen*.75,m.pelvisRz);
    const lower=joint(hips,'spineLower',0,m.hipsSegLen,0);sphere(lower,0,m.spineLowerLen*.4,0,m.waistRx,m.spineLowerLen*.8,m.waistRz);
    const upper=joint(lower,'spineUpper',0,m.spineLowerLen,0);sphere(upper,0,m.spineUpperLen*.35,0,m.chestRx,m.spineUpperLen*.8,m.chestRz);
    const neck=joint(upper,'neck',0,m.spineUpperLen,0);sphere(neck,0,m.neckLength/2,0,m.neckR,m.neckLength*.6,m.neckR);const head=joint(neck,'head',0,m.neckLength,0);const layout=buildSculptedHead(m);for(const geo of [layout.geometry,layout.noseGeometry,layout.earGeometryL,layout.earGeometryR]){const mesh=new THREE.Mesh(geo,skin);mesh.castShadow=true;head.add(mesh)}
    for(const p of [layout.eyePosL,layout.eyePosR]){sphere(head,...p,layout.eyeRadius,layout.eyeRadius,layout.eyeRadius,new THREE.MeshStandardMaterial({color:'#eee9df'}));sphere(head,p[0],p[1],p[2]+layout.eyeRadius*.8,layout.eyeRadius*.48,layout.eyeRadius*.48,layout.eyeRadius*.25,new THREE.MeshStandardMaterial({color:c.appearance.irisColor}))} head.add(buildHairMesh(c.hairId,layout,c.appearance));
    for(const [side,sign] of [['L',1],['R',-1]] as const){const clav=joint(upper,`clavicle${side}`,sign*m.clavicleX,m.clavicleY,0);const shoulder=joint(clav,`shoulder${side}`,sign*m.shoulderOffsetX,0,0);sphere(shoulder,0,0,0,m.upperArmR*1.1,m.upperArmR*1.1,m.upperArmR*1.1,dark);sphere(shoulder,0,-m.upperArmLength*.48,0,m.upperArmR,m.upperArmLength*.52,m.upperArmR);const elbow=joint(shoulder,`elbow${side}`,0,-m.upperArmLength,0);sphere(elbow,0,0,0,m.forearmR,m.forearmR,m.forearmR,dark);sphere(elbow,0,-m.forearmLength*.48,0,m.forearmR,m.forearmLength*.52,m.forearmR);const wrist=joint(elbow,`wrist${side}`,0,-m.forearmLength,0);sphere(wrist,0,-m.handLength*.35,0,m.handWidth*.5,m.handLength*.38,m.handThickness*.5);for(let i=0;i<4;i++)sphere(wrist,(i-1.5)*m.handWidth*.23,-m.handLength*.8,0,m.handWidth*.095,m.handLength*.3,m.handThickness*.27);
      const hip=joint(hips,`hip${side}`,sign*m.hipJointX,0,0);sphere(hip,0,-m.thighLength*.48,0,m.thighR,m.thighLength*.53,m.thighR);const knee=joint(hip,`knee${side}`,0,-m.thighLength,0);sphere(knee,0,0,0,m.calfR,m.calfR,m.calfR,dark);sphere(knee,0,-m.calfLength*.48,0,m.calfR,m.calfLength*.53,m.calfR);const ankle=joint(knee,`ankle${side}`,0,-m.calfLength,0);sphere(ankle,0,-m.footHeight*.2,m.footLength*.25,m.footWidth*.5,m.footHeight*.5,m.footLength*.55);
    }return root;
  }
  dispose(){cancelAnimationFrame(this.frame);this.resize.disconnect();this.renderer.domElement.removeEventListener('pointerdown',this.pick);this.controls.dispose();this.renderer.dispose();this.element.removeChild(this.renderer.domElement)}
}
