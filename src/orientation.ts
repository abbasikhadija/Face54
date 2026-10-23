import {faces,frames,type Face,type V} from './cube';

export const entryFaces:Face[]=['F','R','B','L','U','D'];
export const faceInfo:Record<Face,{name:string;color:string;above:Face;right:Face;instruction:string}>={
 F:{name:'Front',color:'Green',above:'U',right:'R',instruction:'Keep the green center facing you, with white above and red to your right.'},
 R:{name:'Right',color:'Red',above:'U',right:'B',instruction:'Rotate the whole cube to your left until red faces you. Keep white above and blue to your right.'},
 B:{name:'Back',color:'Blue',above:'U',right:'L',instruction:'Rotate the whole cube half a turn until blue faces you. Keep white above and orange to your right.'},
 L:{name:'Left',color:'Orange',above:'U',right:'F',instruction:'Rotate the whole cube to your right until orange faces you. Keep white above and green to your right.'},
 U:{name:'Up',color:'White',above:'B',right:'R',instruction:'Tilt the whole cube toward you to look at white. Keep blue above and red to your right.'},
 D:{name:'Down',color:'Yellow',above:'F',right:'R',instruction:'Tilt the whole cube away from you to look at yellow. Keep green above and red to your right.'},
};

// The grid is viewed from outside, left-to-right / top-to-bottom, as in cubejs.
export function faceletIndex(face:Face,row:number,column:number):number {
 if(!faces.includes(face)||!Number.isInteger(row)||!Number.isInteger(column)||row<0||row>2||column<0||column>2)throw Error('Invalid face grid position');
 return faces.indexOf(face)*9+row*3+column;
}
export function orientationPose(face:Face):{position:V;up:V}{
 const f=frames[faces.indexOf(face)];
 return {position:f.n.map((n,i)=>n*8+f.up[i]*4+f.right[i]*5) as V,up:[...f.up]};
}
