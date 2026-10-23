import {describe,it,expect} from 'vitest';
import {PerspectiveCamera,Vector3} from 'three';
import Cube from 'cubejs';
import {faces,solved,scramble,stickers,frames,type Face,type V} from './cube';
import {entryFaces,faceletIndex,faceInfo,orientationPose} from './orientation';
import {emptyDraft,paintSticker,clearFace,colorCounts,faceProgress,firstEmpty,hasEntries} from './input';
import {decodeDraft,draftKey,readDraft,saveDraft} from './persistence';
import {makeCube,readCube} from './viewer';

const offsets:Record<Face,number>={U:0,R:9,F:18,D:27,L:36,B:45};
// Independent literal outside-view coordinates, derived from cubejs's published net.
const coordinate:Record<Face,(r:number,c:number)=>V>={
 U:(r,c)=>[c-1,1,r-1],R:(r,c)=>[1,1-r,1-c],F:(r,c)=>[c-1,1-r,1],
 D:(r,c)=>[c-1,-1,1-r],L:(r,c)=>[-1,1-r,c-1],B:(r,c)=>[1-c,1-r,-1],
};
describe('Canonical partial input and face orientation',()=>{
 it('starts with exactly six fixed centers and 48 empty positions',()=>{
  const d=emptyDraft();expect(d.face).toBe('F');expect(hasEntries(d)).toBe(false);
  expect(d.facelets.filter(Boolean)).toEqual([...faces]);
  expect(d.facelets.filter(v=>v===null)).toHaveLength(48);
  expect(colorCounts(d)).toEqual({U:1,R:1,F:1,D:1,L:1,B:1});
 });
 for(const face of entryFaces){
  it(`${face}: all nine grid positions map to canonical indices and physical coordinates`,()=>{
   const positions=stickers(solved);
   for(let r=0;r<3;r++)for(let c=0;c<3;c++){
    const index=faceletIndex(face,r,c);
    expect(index).toBe(offsets[face]+r*3+c);
    expect(positions[index].p).toEqual(coordinate[face](r,c));
    if(r===1&&c===1)continue;
    const draft={...emptyDraft(),face};const painted=paintSticker(draft,r*3+c,'B').draft;
    expect(painted.facelets[index]).toBe('B');
    expect(painted.facelets.filter((v,i)=>v!==draft.facelets[i])).toHaveLength(1);
   }
  });
  it(`${face}: real camera places the declared landmarks above and right without changing meshes`,()=>{
   const pose=orientationPose(face),cam=new PerspectiveCamera(40,1,.1,100);
   cam.position.set(...pose.position);cam.up.set(...pose.up);cam.lookAt(0,0,0);cam.updateMatrixWorld();
   const project=(f:Face)=>new Vector3(...frames[faces.indexOf(f)].n).multiplyScalar(1.51).project(cam);
   const center=project(face);
   expect(project(faceInfo[face].above).y).toBeGreaterThan(center.y);
   expect(project(faceInfo[face].right).x).toBeGreaterThan(center.x);
   const cube=makeCube(new Cube().move(scramble).asString());
   expect(readCube(cube)).toBe(new Cube().move(scramble).asString());
   cube.children.forEach(child=>{const m=child as any;m.geometry.dispose();m.material.dispose();});
  });
 }
 it('maps the eight independently documented cubie corner identities',()=>{
  const corners=[[8,9,20],[6,18,38],[0,36,47],[2,45,11],[29,26,15],[27,44,24],[33,53,42],[35,17,51]];
  const geometry=stickers(solved);
  for(const corner of corners){expect(geometry[corner[0]].p).toEqual(geometry[corner[1]].p);expect(geometry[corner[1]].p).toEqual(geometry[corner[2]].p);}
 });
 it('wraps smart selection within the current face without painting the next sticker',()=>{
  let d=emptyDraft();d=paintSticker(d,0,'R').draft;
  expect(firstEmpty(d,'F')).toBe(1);
  const next=paintSticker(d,8,'U');expect(next.active).toBe(1);
  expect(next.draft.face).toBe('F');expect(next.draft.facelets[19]).toBeNull();
  expect(faceProgress(next.draft,'F')).toBe(3);
 });
 it('overwrites colors, preserves centers, and clears only the current face',()=>{
  let d=paintSticker(emptyDraft(),0,'U').draft;
  d=paintSticker(d,0,'R').draft;expect(colorCounts(d).U).toBe(1);expect(colorCounts(d).R).toBe(2);
  expect(paintSticker(d,4,'B').draft).toBe(d);
  d=paintSticker({...d,face:'R'},2,'B').draft;
  const cleared=clearFace({...d,face:'F'});
  expect(faceProgress(cleared,'F')).toBe(1);expect(faceProgress(cleared,'R')).toBe(2);
  for(const f of faces)expect(cleared.facelets[offsets[f]+4]).toBe(f);
 });
 it('does not auto-advance on completion or paint when no empty slot remains',()=>{
  let d=emptyDraft();for(let i=0;i<9;i++)if(i!==4)d=paintSticker(d,i,'F').draft;
  const result=paintSticker(d,8,'R');expect(result.active).toBe(8);expect(result.draft.face).toBe('F');
  expect(faceProgress(result.draft,'F')).toBe(9);
 });
 it('rejects out-of-grid mapping and invalid editing positions',()=>{
  expect(()=>faceletIndex('F',-1,0)).toThrow();expect(()=>faceletIndex('U',0,3)).toThrow();
  const d=emptyDraft();expect(paintSticker(d,-1,'F').draft).toBe(d);expect(paintSticker(d,9,'F').draft).toBe(d);
 });
});

describe('Versioned local drafts',()=>{
 const port=()=>{
  const values=new Map<string,string>();return {values,getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};
 };
 it('round-trips real legal facelets and edits without requiring physical validity',()=>{
  const storage=port();const real=new Cube().move(scramble).asString().split('') as Face[];
  const draft={face:'D' as Face,facelets:real};expect(saveDraft(draft,()=>storage)).toBe(true);
  expect(readDraft(()=>storage).draft).toEqual(draft);
  expect(Object.keys(JSON.parse(storage.getItem(draftKey)!)).sort()).toEqual(['face','facelets','version']);
  const partial=paintSticker({...emptyDraft(),face:'B'},7,'U').draft;
  expect(saveDraft(partial,()=>storage)).toBe(true);expect(readDraft(()=>storage).draft).toEqual(partial);
  const unbalanced={...partial,facelets:partial.facelets.map((v,i)=>i%9===4?v:'U' as Face)};
  expect(decodeDraft(JSON.stringify({version:1,...unbalanced}))).toEqual(unbalanced);
 });
 it('rejects malformed, obsolete, invalid-center and unsupported saved data',()=>{
  const d=emptyDraft();
  for(const value of [null,[],{}, {version:2,...d},{version:1,...d,face:'X'},{version:1,...d,facelets:[]},
   {version:1,...d,facelets:d.facelets.map((v,i)=>i===22?'U':v)},
   {version:1,...d,facelets:d.facelets.map((v,i)=>i===18?'purple':v)}])expect(decodeDraft(JSON.stringify(value))).toBeNull();
  expect(decodeDraft('{broken')).toBeNull();
  const storage=port();storage.setItem(draftKey,'{broken');
  expect(readDraft(()=>storage).draft).toEqual(emptyDraft());expect(readDraft(()=>storage).notice).toContain('could not be restored');
 });
 it('clears the key when no editable work remains',()=>{
  const storage=port();saveDraft(paintSticker(emptyDraft(),0,'U').draft,()=>storage);
  expect(storage.getItem(draftKey)).not.toBeNull();saveDraft(emptyDraft(),()=>storage);expect(storage.getItem(draftKey)).toBeNull();
 });
 it('handles blocked storage getters, quota errors and blocked deletion',()=>{
  const blocked=()=>{throw Error('SecurityError');};
  expect(readDraft(blocked).notice).toContain('Saving is unavailable');expect(saveDraft(emptyDraft(),blocked)).toBe(false);
  const storage=port();storage.setItem=()=>{throw Error('QuotaExceededError');};
  expect(saveDraft(paintSticker(emptyDraft(),0,'U').draft,()=>storage)).toBe(false);
  storage.removeItem=()=>{throw Error('SecurityError');};expect(saveDraft(emptyDraft(),()=>storage)).toBe(false);
 });
});
