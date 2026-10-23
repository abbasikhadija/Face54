import * as T from 'three';
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
export function mountViewer(host:HTMLElement){
 const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(480,400); renderer.setPixelRatio(1);
 host.appendChild(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#20252b');
 const camera=new T.PerspectiveCamera(40,480/400,.1,100);
 camera.position.set(6,5,7);camera.lookAt(0,0,0);
 let cube:T.Group|undefined;
 return {
  show(state:string){
   if(cube){scene.remove(cube);cube.children.forEach(c=>{const m=c as T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>;m.geometry.dispose();m.material.dispose();});}
   cube=makeCube(state);scene.add(cube);renderer.render(scene,camera);
   return readCube(cube);
  },
  dispose(){renderer.dispose();renderer.domElement.remove();},
 };
}
