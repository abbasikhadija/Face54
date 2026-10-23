import {validateCube} from './validation';
import {verifySolution,type SolveFailure,type SolveRequest,type SolveResponse} from './solverProtocol';

export type SolveStatus=
 |{phase:'preparing'|'solving'|'cancelled'}
 |{phase:'error';code:SolveFailure}
 |{phase:'ready';state:string;solution:string;initMs:number;solveMs:number};
export type WorkerPort=Pick<Worker,'terminate'|'onmessage'|'onerror'|'onmessageerror'>&{postMessage:(message:SolveRequest)=>void};
export const createSolverWorker=():WorkerPort=>new Worker(new URL('./solver.worker.ts',import.meta.url),{type:'module'});
let nextId=0;

// One active request. Cancellation terminates synchronous cubejs work and drops callbacks.
export function createSolverClient(notify:(status:SolveStatus)=>void,factory:()=>WorkerPort=createSolverWorker,timeoutMs=60000){
 let active:{id:number;state:string;worker:WorkerPort;timer:ReturnType<typeof setTimeout>|null}|null=null;
 function clear(){
  const old=active;active=null;
  if(old){if(old.timer!==null)clearTimeout(old.timer);old.worker.onmessage=null;old.worker.onerror=null;old.worker.onmessageerror=null;old.worker.terminate();}
 }
 function fail(code:SolveFailure){clear();notify({phase:'error',code});}
 return {
  start(state:string){
   clear();
   if(!validateCube([...state]).ok){notify({phase:'error',code:'invalid_input'});return;}
   const id=++nextId;
   notify({phase:'preparing'});
   try{
    const worker=factory();
    const request={id,state,worker,timer:null as ReturnType<typeof setTimeout>|null};active=request;
    request.timer=setTimeout(()=>{if(active===request)fail('timeout');},timeoutMs);
    worker.onmessage=({data})=>{
     if(active!==request)return;
     const message=data as Partial<SolveResponse>|null;
     if(!message||typeof message!=='object'){fail('protocol');return;}
     if(message.id!==id){if(Number.isSafeInteger(message.id))return;fail('protocol');return;}
     if(message.type==='progress'&&(message.phase==='preparing'||message.phase==='solving')){notify({phase:message.phase});return;}
     if(message.type==='error'&&['invalid_input','initialization','solve','verification','protocol'].includes(message.code!)){fail(message.code!);return;}
     if(message.type!=='result'||message.state!==state||typeof message.initMs!=='number'||!Number.isFinite(message.initMs)||message.initMs<0||typeof message.solveMs!=='number'||!Number.isFinite(message.solveMs)||message.solveMs<0){fail('protocol');return;}
     if(!verifySolution(state,message.solution)){fail('verification');return;}
     clear();notify({phase:'ready',state,solution:message.solution,initMs:message.initMs,solveMs:message.solveMs});
    };
    worker.onerror=()=>{if(active===request)fail('worker');};
    worker.onmessageerror=()=>{if(active===request)fail('protocol');};
    worker.postMessage({type:'solve',id,state});
   }catch{fail('worker');}
  },
  cancel(){clear();notify({phase:'cancelled'});},
  dispose:clear,
 };
}
