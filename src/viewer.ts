import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {stickers,serialize,apply,faces,frames,dot,type Sticker,type V,type Face} from './cube';
import {orientationPose} from './orientation';
import {colors} from './colors';
export {colors} from './colors';
export function makeCube(state:string){
 const group=new T.Group();
 for(const s of stickers(state)){
  const mesh=new T.Mesh(new T.PlaneGeometry(.9,.9),new T.MeshBasicMaterial({color:colors[s.color as Face]}));
  mesh.position.set(...s.p.map((v,i)=>v+s.n[i]*.51) as V);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(...s.n));
  group.add(mesh);
 }
 return group;
}
export function makeCore(){
 const group=new T.Group(),geometry=new T.BoxGeometry(.98,.98,.98),material=new T.MeshBasicMaterial({color:'#11151b'});
 for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
  const piece=new T.Mesh(geometry,material);piece.position.set(x,y,z);group.add(piece);
 }
 return group;
}
// Read actual mesh transforms/material colors, rather than returning cached input.
export function readCube(group:T.Group){
 group.updateMatrixWorld(true);
 const items:Sticker[]=group.children.map(child=>{
  const mesh=child as T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>;
  const n=new T.Vector3(0,0,1).applyQuaternion(mesh.getWorldQuaternion(new T.Quaternion()));
  const p=mesh.getWorldPosition(new T.Vector3());
  const rgb='#'+mesh.material.color.getHexString();
  const color=faces.find(k=>colors[k]===rgb);
  if(!color) throw Error(`Unknown material ${rgb}`);
  return {color,n:n.toArray().map(Math.round) as V,p:p.toArray().map((v,i)=>Math.round(v-n.getComponent(i)*.51)) as V};
 });
 return serialize(items);
}
// Absolute transforms from the confirmed state; camera orientation is irrelevant.
export function layerPreview(group:T.Group,state:string,move:string,body?:T.Group){
 if(!/^[URFDLB](2|')?$/.test(move))throw Error('Unsupported turn');
 const n=frames[faces.indexOf(move[0] as Face)].n;
 const selected=stickers(state).flatMap((s,i)=>dot(s.p,n)===1?[group.children[i]]:[]);
 if(body)selected.push(...body.children.filter(piece=>Math.abs(piece.position.dot(new T.Vector3(...n))-1)<.001));
 const originals=selected.map(mesh=>({mesh,position:mesh.position.clone(),rotation:mesh.quaternion.clone()}));
 const angle=(move.endsWith('2')?2:move.endsWith("'")?-1:1)*-Math.PI/2;
 return (progress:number)=>{
  const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(...n),angle*progress);
  for(const {mesh,position,rotation} of originals){mesh.position.copy(position).applyQuaternion(q);mesh.quaternion.copy(q).multiply(rotation);}
  group.updateMatrixWorld(true);
 };
}
export function mountViewer(host:HTMLElement,options:{diagnostic?:boolean;descriptionId?:string;interactive?:boolean;onError?:()=>void}={}){
 const diagnostic=options.diagnostic??false;
 const interactive=options.interactive??true;
 const renderer=new T.WebGLRenderer({antialias:true,alpha:!diagnostic,preserveDrawingBuffer:diagnostic});
 renderer.setPixelRatio(diagnostic?1:Math.min(window.devicePixelRatio,2));
 host.appendChild(renderer.domElement);
 const canvas=renderer.domElement;
 canvas.tabIndex=interactive?0:-1;
 canvas.setAttribute('role',interactive?'group':'img');
 canvas.setAttribute('aria-label',interactive?'Interactive 3D cube':'Whole-cube orientation reference');
 if(options.descriptionId)canvas.setAttribute('aria-describedby',options.descriptionId);
 const scene=new T.Scene();
 if(diagnostic)scene.background=new T.Color('#20252b');
 const camera=new T.PerspectiveCamera(40,480/400,.1,100);
 camera.position.set(6,5,7);camera.lookAt(0,0,0);
 // Only orbit the camera: notation and mathematical sticker transforms stay fixed.
 const controls=new OrbitControls(camera,canvas);
 controls.enablePan=false;controls.enableZoom=false;
 controls.enableDamping=false;controls.autoRotate=false;
 controls.enabled=interactive;
 controls.rotateSpeed=.65;
 controls.saveState();
 // Individual bodies turn with their stickers, avoiding floating planes or a static slab.
 const core=makeCore();
 scene.add(core);
 let cube:T.Group|undefined;
 let animation=0;
 let previewTimer:ReturnType<typeof setTimeout>|undefined;
 let restorePreview:(()=>void)|undefined;
 function cancelPreview(){cancelAnimationFrame(animation);clearTimeout(previewTimer);restorePreview?.();restorePreview=undefined;}
 let failed=false;
 const render=()=>{if(!failed)renderer.render(scene,camera);};
 const onContextLost=(event:Event)=>{event.preventDefault();failed=true;cancelPreview();options.onError?.();};
 canvas.addEventListener('webglcontextlost',onContextLost);
 controls.addEventListener('change',render);
 const resize=()=>{
  const width=diagnostic?480:Math.max(host.clientWidth,1);
  const height=diagnostic?400:Math.max(host.clientHeight,1);
  renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();
 };
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const onKey=(event:KeyboardEvent)=>{
  if(!interactive)return;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();
  const spherical=new T.Spherical().setFromVector3(camera.position);
  if(event.key==='ArrowLeft')spherical.theta-=.2;
  if(event.key==='ArrowRight')spherical.theta+=.2;
  if(event.key==='ArrowUp')spherical.phi-=.2;
  if(event.key==='ArrowDown')spherical.phi+=.2;
  spherical.makeSafe();camera.position.setFromSpherical(spherical);controls.update();render();
 };
 canvas.addEventListener('keydown',onKey);
 const disposeCube=()=>cube?.children.forEach(c=>{const m=c as T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>;m.geometry.dispose();m.material.dispose();});
 return {
  show(state:string){
   if(failed)throw Error('Graphics context lost');
   cancelPreview();
   if(cube){scene.remove(cube);disposeCube();}
   cube=makeCube(state);scene.add(cube);renderer.render(scene,camera);
   const actual=readCube(cube);canvas.dataset.renderedState=actual;return actual;
  },
  preview(state:string,move:string,onSettled:(ok:boolean)=>void){
   if(failed)throw Error('Graphics context lost');
   cancelPreview();
   if(!cube||readCube(cube)!==state)throw Error('Preview starting state mismatch');
   const rotate=layerPreview(cube,state,move,core),expected=apply(state,move);
   restorePreview=()=>{rotate(0);render();};
   canvas.dataset.preview='moving';
   const start=performance.now(),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const tick=(now:number)=>{
    const t=reduced?1:Math.min((now-start)/700,1);rotate(t*t*(3-2*t));render();
    if(t<1){animation=requestAnimationFrame(tick);return;}
    let ok=false;
    try{const actual=readCube(cube!);canvas.dataset.previewEndState=actual;ok=actual===expected;}catch{/* Never confirm an unverified endpoint. */}
    previewTimer=setTimeout(()=>{
     cancelPreview();
     try{ok=ok&&readCube(cube!)===state;}catch{ok=false;}
     canvas.dataset.preview=ok?'ready':'failed';onSettled(ok);
    },reduced?600:400);
   };
   animation=requestAnimationFrame(tick);
  },
  cancelPreview,
  resetView(){controls.reset();render();},
  orientFace(face:Face,onSettled:(referenceState:string)=>void){
   cancelAnimationFrame(animation);
   canvas.dataset.face=face;canvas.dataset.orientation='moving';
   const pose=orientationPose(face);
   const startPosition=camera.position.clone(),startRotation=camera.quaternion.clone();
   const target=new T.PerspectiveCamera();
   target.position.set(...pose.position);target.up.set(...pose.up);target.lookAt(0,0,0);
   const rotation=new T.Quaternion().setFromUnitVectors(startPosition.clone().normalize(),target.position.clone().normalize());
   const start=performance.now();
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const tick=(now:number)=>{
    const progress=reduced?1:Math.min((now-start)/1000,1);
    const t=progress*progress*(3-2*progress);
    camera.position.copy(startPosition).applyQuaternion(new T.Quaternion().slerp(rotation,t)).setLength(T.MathUtils.lerp(startPosition.length(),target.position.length(),t));
    camera.quaternion.copy(startRotation).slerp(target.quaternion,t);render();
    if(progress<1)animation=requestAnimationFrame(tick);
    else {camera.up.copy(target.up);canvas.dataset.orientation='ready';const referenceState=cube?readCube(cube):'';canvas.dataset.referenceState=referenceState;onSettled(referenceState);}
   };
   animation=requestAnimationFrame(tick);
  },
  dispose(){cancelPreview();observer.disconnect();canvas.removeEventListener('keydown',onKey);canvas.removeEventListener('webglcontextlost',onContextLost);controls.dispose();disposeCube();const body=core.children[0] as T.Mesh<T.BoxGeometry,T.MeshBasicMaterial>;body.geometry.dispose();body.material.dispose();renderer.dispose();canvas.remove();},
 };
}
