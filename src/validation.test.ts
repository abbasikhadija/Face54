import {describe,it,expect} from 'vitest';
import Cube from 'cubejs';
import {faces,solved,scramble,stickers} from './cube';
import {emptyDraft} from './input';
import {validateCube,edgeSlots,cornerSlots,type ValidationCode} from './validation';

const swapped=(a:number,b:number)=>{const s=[...solved];[s[a],s[b]]=[s[b],s[a]];return s;};
const twisted=()=>{const s=[...solved];[s[8],s[9],s[20]]=[s[20],s[8],s[9]];return s;};
const duplicateCorners=()=>{const s=[...solved];s[9]='F';s[20]='L';s[44]='F';s[24]='R';return s;};
function expectCode(input:unknown,code:ValidationCode){const result=validateCube(input);expect(result.ok).toBe(false);if(!result.ok)expect(result.issues.map(issue=>issue.code)).toContain(code);return result;}
describe('Independent physical validation',()=>{
 it('accepts the solved cube and decodes all piece identities',()=>{
  const result=validateCube([...solved]);expect(result.ok).toBe(true);
  if(result.ok){expect(result.state).toBe(solved);const {center,...cubies}=new Cube().toJSON();expect(result.cubies).toEqual(cubies);}
 });
 it('covers every non-center sticker exactly once in its physical piece',()=>{
  const indices=[...edgeSlots.flat(),...cornerSlots.flat()].sort((a,b)=>a-b);
  expect(indices).toEqual(Array.from({length:54},(_,i)=>i).filter(i=>i%9!==4));
  const geometry=stickers(solved);
  for(const group of [...edgeSlots,...cornerSlots])for(const i of group)expect(geometry[i].p).toEqual(geometry[group[0]].p);
 });
 it('reports incomplete input without claiming impossibility, even with excess colors',()=>{
  const partial=emptyDraft().facelets;for(let i=0;i<15;i++)if(i%9!==4)partial[i]='U';
  const result=expectCode(partial,'incomplete');
  if(!result.ok){expect(result.issues).toHaveLength(1);expect(result.issues[0].facelets.every(i=>partial[i]===null)).toBe(true);}
 });
 it('rejects incorrect slot counts, unknown colors, sparse input and unsupported centers',()=>{
  expectCode([...solved].slice(1),'invalid_counts');expectCode([...solved,'U'],'invalid_counts');
  expectCode('not an array','invalid_counts');expectCode(Array(54),'invalid_piece_identity');
  const s=[...solved];s[0]='purple';expectCode(s,'invalid_piece_identity');
  expectCode(swapped(4,13),'unsupported_scheme');
 });
 it('checks all six color counts while preserving data',()=>{
  const s=[...solved];s[0]='R';const original=[...s];
  const result=expectCode(s,'invalid_counts');expect(s).toEqual(original);
  if(!result.ok){expect(result.issues[0].facelets.every(i=>s[i]==='R'&&i%9!==4)).toBe(true);expect(result.issues[0].facelets).toHaveLength(9);}
 });
 for(const [name,input,code] of [
  ['opposite-colored edge',()=>swapped(10,28),'invalid_piece_identity'],
  ['repeated-color edge',()=>swapped(5,12),'invalid_piece_identity'],
  ['opposite-colored corner',()=>swapped(9,27),'invalid_piece_identity'],
  ['mirrored corner',()=>swapped(9,20),'invalid_piece_identity'],
  ['duplicate/missing edges',()=>swapped(10,25),'duplicate_missing_pieces'],
  ['duplicate/missing corners',duplicateCorners,'duplicate_missing_pieces'],
  ['one flipped edge',()=>swapped(5,10),'invalid_edge_orientation'],
  ['one twisted corner',twisted,'invalid_corner_orientation'],
  ['two swapped edges',()=>swapped(10,19),'invalid_permutation_parity'],
 ] as const)it(`rejects ${name} with balanced counts`,()=>{
  const state=input();for(const face of faces)expect(state.filter(c=>c===face)).toHaveLength(9);
  const result=expectCode(Object.freeze(state),code);
  if(!result.ok){
   if(['invalid_edge_orientation','invalid_corner_orientation','invalid_permutation_parity'].includes(code))expect(result.issues.every(e=>e.facelets.length===0)).toBe(true);
   if(code==='duplicate_missing_pieces'){expect(result.issues[0].missingPieces?.length).toBeGreaterThan(0);expect(result.issues[0].facelets.length).toBeGreaterThan(0);}
  }
 });
 it('allows paired edge flips, cancelling corner twists and matching odd permutations',()=>{
  const flipped=swapped(5,10);[flipped[7],flipped[19]]=[flipped[19],flipped[7]];expect(validateCube(flipped).ok).toBe(true);
  const corners=twisted();[corners[6],corners[18],corners[38]]=[corners[18],corners[38],corners[6]];expect(validateCube(corners).ok).toBe(true);
  // Swap two complete corners and two complete edges: both permutations odd.
  const s=[...solved];const a=cornerSlots[0],b=cornerSlots[1];for(let i=0;i<3;i++)[s[a[i]],s[b[i]]]=[s[b[i]],s[a[i]]];[s[10],s[19]]=[s[19],s[10]];
  expect(validateCube(s).ok).toBe(true);
 });
 it('detects combined global orientation errors without speculative highlights',()=>{
  const s=twisted();[s[5],s[10]]=[s[10],s[5]];
  const result=expectCode(s,'invalid_edge_orientation');
  if(!result.ok){expect(result.issues.map(i=>i.code)).toContain('invalid_corner_orientation');expect(result.issues.flatMap(i=>i.facelets)).toEqual([]);}
 });
 it('rejects an isolated flip at every edge and either isolated twist at every corner',()=>{
  for(const [a,b] of edgeSlots)expectCode(swapped(a,b),'invalid_edge_orientation');
  for(const group of cornerSlots)for(const turns of [1,2]){
   const s=[...solved];group.forEach((index,n)=>{s[group[(n+turns)%3]]=solved[index];});expectCode(s,'invalid_corner_orientation');
  }
 });
 it('rejects every isolated pair swap of edges or corners',()=>{
  for(const groups of [edgeSlots,cornerSlots])for(let a=0;a<groups.length;a++)for(let b=a+1;b<groups.length;b++){
   const s=[...solved];groups[a].forEach((i,n)=>{const j=groups[b][n];[s[i],s[j]]=[s[j],s[i]];});expectCode(s,'invalid_permutation_parity');
  }
 });
 it('demonstrates why cubejs parsing and even facelet round-trip are not validation',()=>{
  for(const input of [swapped(5,10),twisted(),swapped(10,19)]){
   expect(Cube.fromString(input.join('')).asString()).toBe(input.join(''));
   expect(validateCube(input).ok).toBe(false);
  }
 });
 it('returns a structured internal failure on an unexpected reader exception',()=>{
  const broken=new Proxy([],{get(){throw Error('Unexpected reader failure');}});expectCode(broken,'internal_failure');
 });
 it('accepts 1000 deterministic legal scrambles and agrees with upstream cubie decoding',()=>{
  let seed=3054;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  let whiteYellowNeighbors=false;let elapsed=0;
  for(let i=0;i<1000;i++){
   const alg=i===0?scramble:Array.from({length:25},()=>faces[(random()>>>8)%6]+['',"'",'2'][(random()>>>8)%3]).join(' ');
   const cube=new Cube().move(alg),state=cube.asString();
   const start=performance.now(),result=validateCube([...state]);elapsed+=performance.now()-start;
   expect(result.ok,JSON.stringify({i,alg,result,cubies:cube.toJSON()})).toBe(true);if(result.ok){const {center,...cubies}=cube.toJSON();expect(result.cubies).toEqual(cubies);}
   // Adjacent grid cells can legally contain opposite colors. No grid-adjacency rule.
   for(let f=0;f<6;f++)for(let p=0;p<8;p++)if(p%3!==2&&['UD','DU'].includes(state[f*9+p]+state[f*9+p+1]))whiteYellowNeighbors=true;
  }
  expect(whiteYellowNeighbors).toBe(true);
  console.log(JSON.stringify({validationCases:1000,totalValidationMs:elapsed,meanValidationMs:elapsed/1000}));
 });
});
