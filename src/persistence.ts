import {faces,type Face} from './cube';
import {emptyDraft,hasEntries,type InputDraft} from './input';
import {faceletIndex} from './orientation';

export const draftKey='face54.draft';
type StoragePort=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export function decodeDraft(raw:string):InputDraft|null {
 try{
  const value=JSON.parse(raw);
  if(!value||value.version!==1||!faces.includes(value.face)||!Array.isArray(value.facelets)||value.facelets.length!==54)return null;
  if(!value.facelets.every((color:unknown)=>color===null||faces.includes(color as Face)))return null;
  if(!faces.every(face=>value.facelets[faceletIndex(face,1,1)]===face))return null;
  return {face:value.face,facelets:[...value.facelets]};
 }catch{return null;}
}
export function readDraft(storage:()=>StoragePort=()=>window.localStorage):{draft:InputDraft;notice:string}{
 try{
  const raw=storage().getItem(draftKey);
  if(raw===null)return {draft:emptyDraft(),notice:''};
  const draft=decodeDraft(raw);
  return draft?{draft,notice:'Your unfinished cube has been restored.'}:{draft:emptyDraft(),notice:'Saved colors could not be restored. You can enter them again.'};
 }catch{return {draft:emptyDraft(),notice:'Saving is unavailable in this browser. Keep this page open to preserve your colors.'};}
}
export function saveDraft(draft:InputDraft,storage:()=>StoragePort=()=>window.localStorage):boolean {
 try{
  if(hasEntries(draft))storage().setItem(draftKey,JSON.stringify({version:1,face:draft.face,facelets:draft.facelets}));
  else storage().removeItem(draftKey);
  return true;
 }catch{return false;}
}
