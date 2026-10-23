import {describe,expect,it} from 'vitest';
import Cube from 'cubejs';
import {apply,faces,solved,scramble} from './cube';
import {advance,createPlayback,describeMove,inverseMove} from './playback';
import {layerPreview,makeCube,makeCore,readCube} from './viewer';
import type * as T from 'three';
function dispose(group:T.Group){group.children.forEach(c=>{const m=c as T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>;m.geometry.dispose();m.material.dispose();});}
describe('confirmed playback and instructions',()=>{
 it('handles zero moves and rejects invalid input, notation or an unrelated solution',()=>{
  expect(createPlayback(solved,'')).toEqual({initial:solved,moves:[],states:[solved]});
  expect(()=>createPlayback('bad','')).toThrow();expect(()=>createPlayback(solved,'x')).toThrow();expect(()=>createPlayback(apply(solved,'R'),'U')).toThrow();
 });
 for(const face of faces)for(const suffix of ['',"'",'2'])it(`describes and reverses ${face}${suffix} with an outside-face viewpoint`,()=>{
  const move=face+suffix,description=describeMove(move);
  expect(apply(apply(solved,move),inverseMove(move))).toBe(solved);
  expect(description).toContain('looking directly at that face from outside');
  expect(description).toContain(suffix==='2'?'180°':suffix==="'"?'counterclockwise':'clockwise');
  expect(description).toContain(({U:'white-center top',R:'red-center right',F:'green-center front',D:'yellow-center bottom',L:'orange-center left',B:'blue-center back'})[face]);
 });
 it('only explicit confirmation advances; undo requires its own confirmation and respects boundaries',()=>{
  let p={step:0,undo:false};expect(advance(p,'confirmUndo',2)).toBe(p);expect(advance(p,'requestUndo',2)).toBe(p);
  p=advance(p,'confirm',2);expect(p).toEqual({step:1,undo:false});
  p=advance(p,'requestUndo',2);expect(p).toEqual({step:1,undo:true});expect(advance(p,'confirm',2)).toBe(p);
  expect(advance(p,'cancelUndo',2)).toEqual({step:1,undo:false});p=advance(p,'confirmUndo',2);expect(p).toEqual({step:0,undo:false});
  p=advance(advance(p,'confirm',2),'confirm',2);expect(p.step).toBe(2);expect(advance(p,'confirm',2)).toBe(p);
  expect(advance(advance(p,'requestUndo',2),'confirmUndo',2)).toEqual({step:1,undo:false});
 });
 it('100 deterministic legal plans match independent cubies at every forward and reverse boundary',()=>{
  let seed=554;const random=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  for(let n=0;n<100;n++){
   const alg=Array.from({length:20},()=>faces[random()%6]+['',"'",'2'][random()%3]);
   const initial=new Cube().move(alg.join(' ')).asString(),solution=[...alg].reverse().map(inverseMove).join(' '),plan=createPlayback(initial,solution);
   const cube=Cube.fromString(initial);let p={step:0,undo:false};
   for(const move of plan.moves){cube.move(move);p=advance(p,'confirm',plan.moves.length);expect(plan.states[p.step]).toBe(cube.asString());}
   expect(plan.states[p.step]).toBe(solved);
   while(p.step){cube.move(inverseMove(plan.moves[p.step-1]));p=advance(advance(p,'requestUndo',plan.moves.length),'confirmUndo',plan.moves.length);expect(plan.states[p.step]).toBe(cube.asString());}
   expect(plan.states[0]).toBe(initial);
  }
 });
});
describe('actual mesh layer preview',()=>{
 for(const face of faces)for(const suffix of ['',"'",'2'])it(`${face}${suffix} rotates the correct layer and returns exactly to confirmed state`,()=>{
  for(const state of [solved,apply(solved,scramble)]){
   const mesh=makeCube(state),before=mesh.children.map(c=>c.position.clone()),rotate=layerPreview(mesh,state,face+suffix);
   rotate(.5);expect(mesh.children.filter((c,i)=>!c.position.equals(before[i])).length).toBeGreaterThan(0);
   rotate(1);const expected=new Cube().move(state===solved?'':scramble).move(face+suffix).asString();expect(readCube(mesh)).toBe(expected);
   rotate(0);expect(readCube(mesh)).toBe(state);dispose(mesh);
  }
 });
 it('repeated previews restore all transforms without accumulating state drift',()=>{
  const state=apply(solved,scramble),mesh=makeCube(state);
  for(let n=0;n<100;n++){const turn=layerPreview(mesh,state,faces[n%6]+['',"'",'2'][n%3]);turn(.3);turn(1);turn(0);expect(readCube(mesh)).toBe(state);}
  expect(()=>layerPreview(mesh,state,'x')).toThrow();dispose(mesh);
 });
 it('rotates exactly nine body pieces with the sticker layer and restores their transforms',()=>{
  for(const face of faces){
   const mesh=makeCube(solved),body=makeCore(),before=body.children.map(c=>({position:c.position.clone(),rotation:c.quaternion.clone()}));
   const turn=layerPreview(mesh,solved,face,body);turn(.5);
   expect(body.children.filter((c,i)=>!c.quaternion.equals(before[i].rotation)).length).toBe(9);
   turn(1);expect(readCube(mesh)).toBe(apply(solved,face));turn(0);
   body.children.forEach((c,i)=>{expect(c.position.equals(before[i].position)).toBe(true);expect(c.quaternion.equals(before[i].rotation)).toBe(true);});dispose(mesh);dispose(body);
  }
 });
});
