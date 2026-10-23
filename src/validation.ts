import {faces} from './cube';

// Kociemba/cubejs cubie order and outside-view URFDLB facelet positions.
// Tables verified against cubejs 1.3.2 lib/cube.js; no solver/parser is used here.
export const edgeSlots=[[5,10],[7,19],[3,37],[1,46],[32,16],[28,25],[30,43],[34,52],[23,12],[21,41],[50,39],[48,14]] as const;
export const cornerSlots=[[8,9,20],[6,18,38],[0,36,47],[2,45,11],[29,26,15],[27,44,24],[33,53,42],[35,17,51]] as const;
const edgeNames=['UR','UF','UL','UB','DR','DF','DL','DB','FR','FL','BL','BR'];
const cornerNames=['URF','UFL','ULB','UBR','DFR','DLF','DBL','DRB'];
export type ValidationCode='incomplete'|'invalid_counts'|'invalid_piece_identity'|'duplicate_missing_pieces'|'invalid_edge_orientation'|'invalid_corner_orientation'|'invalid_permutation_parity'|'unsupported_scheme'|'internal_failure';
export type ValidationIssue={code:ValidationCode;message:string;facelets:number[];kind?:'edge'|'corner';pieces?:string[];missingPieces?:string[]};
export type Cubies={ep:number[];eo:number[];cp:number[];co:number[]};
export type ValidationResult={ok:true;state:string;cubies:Cubies}|{ok:false;issues:ValidationIssue[]};
const fail=(...issues:ValidationIssue[]):ValidationResult=>({ok:false,issues});
const issue=(code:ValidationCode,message:string,facelets:number[]=[]):ValidationIssue=>({code,message,facelets});
function parity(permutation:number[]):number {
 let inversions=0;
 for(let i=0;i<permutation.length;i++)for(let j=i+1;j<permutation.length;j++)if(permutation[i]>permutation[j])inversions++;
 return inversions%2;
}
function validate(facelets:unknown):ValidationResult {
 if(!Array.isArray(facelets)||facelets.length!==54)return fail(issue('invalid_counts','The entry must contain exactly 54 sticker positions. Keep your colors and reload the page if this persists.'));
 const unknownColors=Array.from({length:54},(_,i)=>i).filter(i=>facelets[i]!==null&&!faces.includes(facelets[i]));
 if(unknownColors.length)return fail(issue('invalid_piece_identity','Some sticker colors are not recognized. Recheck these entries.',unknownColors));
 const missing=facelets.flatMap((color,i)=>color===null?[i]:[]);
 if(missing.length)return fail(issue('incomplete',`Fill the ${missing.length} empty sticker${missing.length===1?'':'s'} before checking physical correctness.`,missing));
 const centers=faces.flatMap((face,i)=>facelets[i*9+4]!==face?[i*9+4]:[]);
 if(centers.length)return fail(issue('unsupported_scheme','This tool supports the standard scheme: white up, red right, green front, yellow down, orange left and blue back. Check your cube’s center colors.',centers));
 const counts=faces.map(color=>facelets.filter(value=>value===color).length);
 if(counts.some(count=>count!==9)){
  const excess=faces.filter((_,i)=>counts[i]>9);
  return fail(issue('invalid_counts','A standard cube has nine stickers of each color. Recheck the color counts and highlighted entries; the counts cannot identify exactly which sticker to change.',facelets.flatMap((value,i)=>i%9!==4&&excess.includes(value)?[i]:[])));
 }
 const state=facelets.join('');
 function decode(slots:readonly (readonly number[])[],names:string[],kind:'edge'|'corner'){
  const permutation:number[]=[],orientation:number[]=[],errors:ValidationIssue[]=[];
  slots.forEach((indices,position)=>{
   let found=false;
   for(let piece=0;piece<names.length&&!found;piece++)for(let ori=0;ori<indices.length&&!found;ori++){
    if([...names[piece]].every((color,n)=>state[indices[(n+ori)%indices.length]]===color)){
     permutation.push(piece);orientation.push(ori);found=true;
    }
   }
   if(!found)errors.push({...issue('invalid_piece_identity',`These ${kind} stickers do not form a possible piece in the standard color scheme. Recheck the whole highlighted group, including its order.`,[...indices]),kind,pieces:[names[position]]});
  });
  return {permutation,orientation,errors};
 }
 const edges=decode(edgeSlots,edgeNames,'edge'),corners=decode(cornerSlots,cornerNames,'corner');
 if(edges.errors.length||corners.errors.length)return fail(...edges.errors,...corners.errors);
 function duplicates(permutation:number[],slots:readonly (readonly number[])[],names:string[],kind:'edge'|'corner'):ValidationIssue[]{
  const repeated=names.flatMap((_,i)=>permutation.filter(piece=>piece===i).length>1?[i]:[]);
  if(!repeated.length)return [];
  return [{...issue('duplicate_missing_pieces',`Some ${kind} pieces are repeated and others are missing. Recheck all highlighted groups; the check cannot tell which repeated entry is the mistaken one.`,permutation.flatMap((piece,i)=>repeated.includes(piece)?[...slots[i]]:[])),kind,pieces:repeated.map(i=>names[i]),missingPieces:names.filter((_,i)=>!permutation.includes(i))}];
 }
 const repeated=[...duplicates(edges.permutation,edgeSlots,edgeNames,'edge'),...duplicates(corners.permutation,cornerSlots,cornerNames,'corner')];
 if(repeated.length)return fail(...repeated);
 const errors:ValidationIssue[]=[];
 // These are global constraints. They cannot locate the mistaken stickers.
 if(edges.orientation.reduce((a,b)=>a+b,0)%2)errors.push(issue('invalid_edge_orientation','The edge orientations do not describe a cube reachable by normal turns. Recheck the entered colors and how each face was held. This check cannot locate the mistaken stickers.'));
 if(corners.orientation.reduce((a,b)=>a+b,0)%3)errors.push(issue('invalid_corner_orientation','The corner orientations do not describe a cube reachable by normal turns. Recheck the entered colors and face orientation. This check cannot locate the mistaken stickers.'));
 if(parity(edges.permutation)!==parity(corners.permutation))errors.push(issue('invalid_permutation_parity','The arrangement of edge and corner pieces cannot be reached by normal turns. Recheck all six faces. This check cannot locate the mistaken stickers.'));
 if(errors.length)return fail(...errors);
 return {ok:true,state,cubies:{ep:edges.permutation,eo:edges.orientation,cp:corners.permutation,co:corners.orientation}};
}
export function validateCube(facelets:unknown):ValidationResult {
 try{return validate(facelets);}
 catch{return fail(issue('internal_failure','The cube could not be checked. Your entries have been kept. Reload the page and try again.'));}
}
