import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {stickers,serialize,type Sticker,type V} from './cube';
export const colors:Record<string,string>={U:'#ffffff',R:'#d52b1e',F:'#009b48',D:'#ffd500',L:'#ff5800',B:'#0046ad'};
export function makeCube(state:string){
 const group=new T.Group();
 for(const s of stickers(state)){
  const mesh=new T.Mesh(new T.PlaneGeometry(.9,.9),new T.MeshBasicMaterial({color:colors[s.color]}));
  mesh.position.set(...s.p.map((v,i)=>v+s.n[i]*.51) as V);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(...s.n));
  group.add(mesh);
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
  const color=Object.keys(colors).find(k=>colors[k]===rgb);
  if(!color) throw Error(`Unknown material ${rgb}`);
  return {color,n:n.toArray().map(Math.round) as V,p:p.toArray().map((v,i)=>Math.round(v-n.getComponent(i)*.51)) as V};
 });
 return serialize(items);
}
export function mountViewer(host:HTMLElement,options:{diagnostic?:boolean;descriptionId?:string}={}){
 const diagnostic=options.diagnostic??false;
 const renderer=new T.WebGLRenderer({antialias:true,alpha:!diagnostic,preserveDrawingBuffer:diagnostic});
 renderer.setPixelRatio(diagnostic?1:Math.min(window.devicePixelRatio,2));
 host.appendChild(renderer.domElement);
 const canvas=renderer.domElement;
 canvas.tabIndex=0;
 canvas.setAttribute('role','group');
 canvas.setAttribute('aria-label','Interactive 3D cube');
 if(options.descriptionId)canvas.setAttribute('aria-describedby',options.descriptionId);
 const scene=new T.Scene();
 if(diagnostic)scene.background=new T.Color('#20252b');
 const camera=new T.PerspectiveCamera(40,480/400,.1,100);
 camera.position.set(6,5,7);camera.lookAt(0,0,0);
 // Only orbit the camera: notation and mathematical sticker transforms stay fixed.
 const controls=new OrbitControls(camera,canvas);
 controls.enablePan=false;controls.enableZoom=false;
 controls.enableDamping=false;controls.autoRotate=false;
 controls.rotateSpeed=.65;
 controls.saveState();
 const core=new T.Mesh(new T.BoxGeometry(3,3,3),new T.MeshBasicMaterial({color:'#11151b'}));
 scene.add(core);
 let cube:T.Group|undefined;
 const render=()=>renderer.render(scene,camera);
 controls.addEventListener('change',render);
 const resize=()=>{
  const width=diagnostic?480:Math.max(host.clientWidth,1);
  const height=diagnostic?400:Math.max(host.clientHeight,1);
  renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();
 };
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const onKey=(event:KeyboardEvent)=>{
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
   if(cube){scene.remove(cube);disposeCube();}
   cube=makeCube(state);scene.add(cube);renderer.render(scene,camera);
   return readCube(cube);
  },
  resetView(){controls.reset();render();},
  dispose(){observer.disconnect();canvas.removeEventListener('keydown',onKey);controls.dispose();disposeCube();core.geometry.dispose();core.material.dispose();renderer.dispose();canvas.remove();},
 };
}
