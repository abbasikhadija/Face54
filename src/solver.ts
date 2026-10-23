import Cube from 'cubejs';
import {apply,solved} from './cube';
let ready=false;
export function prepare(){if(!ready){Cube.initSolver();ready=true;}}
export function compute(state:string){return Cube.fromString(state).solve();}
export function solve(state:string){
 const start=performance.now();
 if(state!==solved)prepare();
 const prepared=performance.now();
 const solution=state===solved?'':compute(state);
 const end=performance.now();
 if(apply(state,solution)!==solved) throw Error('Independent verification failed');
 return {solution,initMs:prepared-start,solveMs:end-prepared};
}
