import Cube from 'cubejs';
import {apply,solved} from './cube';
let ready=false;
export function solve(state:string){
 const start=performance.now();
 if(!ready){Cube.initSolver();ready=true;}
 const prepared=performance.now();
 const solution=state===solved?'':Cube.fromString(state).solve();
 const end=performance.now();
 if(apply(state,solution)!==solved) throw Error('Independent verification failed');
 return {solution,initMs:prepared-start,solveMs:end-prepared};
}
