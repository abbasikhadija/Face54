import {apply,solved,type Face} from './cube';
import {validateCube} from './validation';

export type PlaybackPlan={initial:string;moves:string[];states:string[]};
export function createPlayback(initial:string,solution:string):PlaybackPlan {
 if(!validateCube([...initial]).ok)throw Error('Invalid starting cube');
 const moves=solution.trim().split(/\s+/).filter(Boolean),states=[initial];
 for(const move of moves)states.push(apply(states.at(-1)!,move));
 if(states.at(-1)!==solved)throw Error('Solution does not solve this cube');
 return {initial,moves,states};
}
export function inverseMove(move:string){
 if(!/^[URFDLB](2|')?$/.test(move))throw Error('Unsupported turn');
 return move.endsWith('2')?move:move.endsWith("'")?move[0]:move+"'";
}
export type PlaybackProgress={step:number;undo:boolean};
export type PlaybackAction='confirm'|'requestUndo'|'cancelUndo'|'confirmUndo';
export function advance(progress:PlaybackProgress,action:PlaybackAction,total:number):PlaybackProgress {
 const {step,undo}=progress;
 if(action==='requestUndo'&&step>0)return {step,undo:true};
 if(action==='cancelUndo')return {step,undo:false};
 if(action==='confirmUndo'&&undo&&step>0)return {step:step-1,undo:false};
 if(action==='confirm'&&!undo&&step<total)return {step:step+1,undo:false};
 return progress;
}
const faceNames:Record<Face,string>={U:'white-center top',R:'red-center right',F:'green-center front',D:'yellow-center bottom',L:'orange-center left',B:'blue-center back'};
export function describeMove(move:string){
 if(!/^[URFDLB](2|')?$/.test(move))throw Error('Unsupported turn');
 const name=faceNames[move[0] as Face];
 return `Turn only the ${name} layer ${move.endsWith('2')?'half a turn (180°)':move.endsWith("'")?'a quarter turn counterclockwise':'a quarter turn clockwise'}, as if looking directly at that face from outside the cube.`;
}
