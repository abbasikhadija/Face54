import {apply,solved} from './cube';
import {validateCube} from './validation';

export type SolveRequest={type:'solve';id:number;state:string};
export type SolveFailure='invalid_input'|'initialization'|'solve'|'verification'|'protocol'|'worker'|'timeout';
export type SolveResponse=
 |{type:'progress';id:number;phase:'preparing'|'solving'}
 |{type:'result';id:number;state:string;solution:string;initMs:number;solveMs:number}
 |{type:'error';id:number;code:SolveFailure};
export type SolverEngine={prepare:()=>void;compute:(state:string)=>string};

export function verifySolution(state:string,solution:unknown):solution is string {
 try{return typeof solution==='string'&&apply(state,solution)===solved;}catch{return false;}
}
// Runtime boundary: worker messages are untrusted despite TypeScript types.
export function handleSolve(data:unknown,send:(message:SolveResponse)=>void,engine:SolverEngine){
 const request=data as Partial<SolveRequest>|null;
 const id=request&&typeof request.id==='number'&&Number.isSafeInteger(request.id)&&request.id>0?request.id:0;
 if(!request||request.type!=='solve'||!id||typeof request.state!=='string'){
  send({type:'error',id,code:'protocol'});return;
 }
 const {state}=request;
 const validation=validateCube([...state]);
 if(!validation.ok){send({type:'error',id,code:'invalid_input'});return;}
 // Already solved needs no expensive search tables.
 if(state===solved){send({type:'result',id,state,solution:'',initMs:0,solveMs:0});return;}
 send({type:'progress',id,phase:'preparing'});
 const start=performance.now();
 try{engine.prepare();}catch{send({type:'error',id,code:'initialization'});return;}
 const prepared=performance.now();
 send({type:'progress',id,phase:'solving'});
 let solution:string;
 try{solution=engine.compute(state);}catch{send({type:'error',id,code:'solve'});return;}
 const end=performance.now();
 if(!verifySolution(state,solution)){send({type:'error',id,code:'verification'});return;}
 send({type:'result',id,state,solution,initMs:prepared-start,solveMs:end-prepared});
}
