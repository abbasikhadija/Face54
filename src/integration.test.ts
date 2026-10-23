import {describe,it,expect} from 'vitest';
import Cube from 'cubejs';
import {apply,solved,scramble,faces,stickers,serialize} from './cube';
import {makeCube,readCube} from './viewer';
import {solve} from './solver';
describe('Independent geometry and cubejs agreement',()=>{
 it('round-trips every labeled slot and standard centers',()=>{
  const s=stickers(solved); expect(serialize(s)).toBe(solved);
  expect(s.filter((_,i)=>i%9===4).map(s=>s.color)).toEqual([...faces]);
  expect(new Set(s.map(s=>[...s.p,...s.n].join(','))).size).toBe(54);
 });
 for(const f of faces) for(const suffix of ['',"'",'2']) it(`${f}${suffix} matches solver convention`,()=>{
  const alg=f+suffix;expect(apply(solved,alg)).toBe(new Cube().move(alg).asString());
  expect(apply(solved,`${f} ${f} ${f} ${f}`)).toBe(solved);
 });
 it('rejects unsupported notation',()=>expect(()=>apply(solved,'x')).toThrow());
 it('solves solved, one move, fixture and 100 seeded legal scrambles; matches meshes at every step',()=>{
  let seed=540; const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  const algorithms=['','R',scramble,...Array.from({length:100},()=>Array.from({length:20},()=>faces[random()%6]+['',"'",'2'][random()%3]).join(' '))];
  const timings:number[]=[];let initMs=0;
  for(const alg of algorithms){
   let state=apply(solved,alg);const reference=new Cube().move(alg);
   expect(state).toBe(reference.asString());
   const result=solve(state);initMs+=result.initMs;timings.push(result.solveMs);
   const check=()=>{const mesh=makeCube(state);expect(readCube(mesh)).toBe(reference.asString());mesh.children.forEach(c=>{const m=c as any;m.geometry.dispose();m.material.dispose();});};
   check();
   for(const move of result.solution.split(/\s+/).filter(Boolean)){state=apply(state,move);reference.move(move);expect(state).toBe(reference.asString());check();}
   expect(state).toBe(solved);expect(reference.isSolved()).toBe(true);
  }
  console.log(JSON.stringify({cases:algorithms.length,initMs,solveMinMs:Math.min(...timings),solveMaxMs:Math.max(...timings),solveMeanMs:timings.reduce((a,b)=>a+b,0)/timings.length}));
 });
});
