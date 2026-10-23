import {faces,type Face} from './cube';
import {entryFaces,faceletIndex} from './orientation';

// Partial colors share canonical URFDLB indices, but are never a solver state.
export type InputDraft={facelets:(Face|null)[];face:Face};
export function emptyDraft():InputDraft {
 const facelets:(Face|null)[]=Array(54).fill(null);
 for(const face of faces)facelets[faceletIndex(face,1,1)]=face;
 return {facelets,face:entryFaces[0]};
}
export const hasEntries=(draft:InputDraft)=>draft.facelets.some((color,i)=>i%9!==4&&color!==null);
export const faceProgress=(draft:InputDraft,face:Face)=>draft.facelets.slice(faces.indexOf(face)*9,faces.indexOf(face)*9+9).filter(color=>color!==null).length;
export const colorCounts=(draft:InputDraft)=>Object.fromEntries(faces.map(face=>[face,draft.facelets.filter(color=>color===face).length])) as Record<Face,number>;
export function firstEmpty(draft:InputDraft,face:Face):number {
 const offset=faces.indexOf(face)*9;
 const found=draft.facelets.slice(offset,offset+9).findIndex(color=>color===null);
 return found<0?0:found;
}
export function paintSticker(draft:InputDraft,position:number,color:Face):{draft:InputDraft;active:number}{
 if(!Number.isInteger(position)||position<0||position>8||position===4||!faces.includes(color))return {draft,active:position};
 const index=faceletIndex(draft.face,Math.floor(position/3),position%3);
 const facelets=[...draft.facelets];facelets[index]=color;
 // Search cyclically on this face only. Selecting never paints the next slot.
 const offset=index-position;
 let active=position;
 for(let n=1;n<=9;n++){
  const candidate=(position+n)%9;
  if(facelets[offset+candidate]===null){active=candidate;break;}
 }
 return {draft:{...draft,facelets},active};
}
export function clearFace(draft:InputDraft):InputDraft {
 const facelets=[...draft.facelets],offset=faces.indexOf(draft.face)*9;
 for(let i=0;i<9;i++)if(i!==4)facelets[offset+i]=null;
 return {...draft,facelets};
}
