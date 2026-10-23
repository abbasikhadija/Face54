import {afterEach,describe,expect,it,vi} from 'vitest';
import {apply,faces,solved,scramble} from './cube';
import {prepare,compute} from './solver';
import {handleSolve,verifySolution,type SolveResponse,type SolverEngine} from './solverProtocol';
import {createSolverClient,type SolveStatus,type WorkerPort} from './solverClient';

const state=apply(solved,'R');
function run(data:unknown,engine:SolverEngine={prepare:vi.fn(),compute:()=>"R'"}){
 const messages:SolveResponse[]=[];handleSolve(data,m=>messages.push(m),engine);return messages;
}
describe('worker boundary',()=>{
 it('handles solved input without initializing tables',()=>{
  const engine={prepare:vi.fn(),compute:vi.fn()};
  expect(run({type:'solve',id:1,state:solved},engine)).toEqual([{type:'result',id:1,state:solved,solution:'',initMs:0,solveMs:0}]);
  expect(engine.prepare).not.toHaveBeenCalled();expect(engine.compute).not.toHaveBeenCalled();
 });
 it('rejects malformed requests and impossible states before computation',()=>{
  const engine={prepare:vi.fn(),compute:vi.fn()};
  for(const data of [null,{},'x',{type:'solve',id:-1,state},{type:'solve',id:1.5,state},{type:'other',id:1,state}])expect(run(data,engine).at(-1)).toMatchObject({type:'error',code:'protocol'});
  const flipped=[...solved];[flipped[5],flipped[10]]=[flipped[10],flipped[5]];
  for(const input of ['bad',flipped.join('')])expect(run({type:'solve',id:2,state:input},engine)).toEqual([{type:'error',id:2,code:'invalid_input'}]);
  expect(engine.prepare).not.toHaveBeenCalled();
 });
 it('separates initialization, search and verification failures',()=>{
  for(const [engine,code] of [
   [{prepare:()=>{throw Error();},compute:()=>''},'initialization'],
   [{prepare:()=>{},compute:()=>{throw Error();}},'solve'],
   [{prepare:()=>{},compute:()=>''},'verification'],
   [{prepare:()=>{},compute:()=> 'x'},'verification'],
  ] as const)expect(run({type:'solve',id:3,state},engine).at(-1)).toEqual({type:'error',id:3,code});
 });
 it('validates and independently verifies 103 actual solver requests',()=>{
  let seed=154;const random=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const algorithms=['','R',scramble,...Array.from({length:100},()=>Array.from({length:20},()=>faces[random()%6]+['',"'",'2'][random()%3]).join(' '))];
  const timings:{initMs:number;solveMs:number}[]=[];
  algorithms.forEach((alg,index)=>{
   const input=apply(solved,alg),messages=run({type:'solve',id:index+1,state:input},{prepare,compute}),result=messages.at(-1)!;
   expect(result.type).toBe('result');
   if(result.type==='result'){
    expect(result.id).toBe(index+1);expect(result.state).toBe(input);expect(apply(input,result.solution)).toBe(solved);timings.push(result);
    if(input!==solved)expect(messages.slice(0,2)).toEqual([{type:'progress',id:index+1,phase:'preparing'},{type:'progress',id:index+1,phase:'solving'}]);
   }
  });
  console.log(JSON.stringify({pipelineCases:timings.length,initMs:timings.reduce((s,t)=>s+t.initMs,0),solveMeanMs:timings.reduce((s,t)=>s+t.solveMs,0)/timings.length,solveMaxMs:Math.max(...timings.map(t=>t.solveMs))}));
 },60000);
});

class FakeWorker implements WorkerPort {
 onmessage:WorkerPort['onmessage']=null;onerror:WorkerPort['onerror']=null;onmessageerror:WorkerPort['onmessageerror']=null;
 postMessage=vi.fn();terminate=vi.fn();
 emit(data:unknown){this.onmessage?.call(this as unknown as Worker,new MessageEvent('message',{data}));}
 error(){this.onerror?.call(this as unknown as Worker,new ErrorEvent('error'));}
}
function setup(){
 const workers:FakeWorker[]=[],updates:SolveStatus[]=[];
 const client=createSolverClient(s=>updates.push(s),()=>{const w=new FakeWorker();workers.push(w);return w;},1000);
 const response=(w=workers.at(-1)!,extra:object={})=>({type:'result',id:w.postMessage.mock.calls[0][0].id,state,solution:"R'",initMs:3,solveMs:2,...extra});
 return {client,workers,updates,response};
}
afterEach(()=>vi.useRealTimers());
describe('main-thread lifecycle and independent trust boundary',()=>{
 it('blocks invalid input without a worker',()=>{const s=setup();s.client.start('bad');expect(s.workers).toHaveLength(0);expect(s.updates).toEqual([{phase:'error',code:'invalid_input'}]);});
 it('accepts verified response and releases worker',()=>{
  const s=setup();s.client.start(state);const w=s.workers[0];w.emit({type:'progress',id:s.response().id,phase:'solving'});w.emit(s.response());
  expect(s.updates.map(u=>u.phase)).toEqual(['preparing','solving','ready']);expect(w.terminate).toHaveBeenCalledOnce();
 });
 it('rejects wrong moves, unsupported notation, wrong snapshot and malformed timings',()=>{
  for(const [extra,code] of [[{solution:''},'verification'],[{solution:'x'},'verification'],[{state:solved},'protocol'],[{initMs:-1},'protocol'],[{solveMs:NaN},'protocol'],[{solution:undefined},'verification']] as const){
   const s=setup();s.client.start(state);s.workers[0].emit(s.response(undefined,extra));expect(s.updates.at(-1)).toEqual({phase:'error',code});expect(s.workers[0].terminate).toHaveBeenCalledOnce();
  }
 });
 it('ignores stale IDs and captured late callbacks after replacement or cancellation',()=>{
  const s=setup();s.client.start(state);const first=s.workers[0],late=first.onmessage!,old=s.response(first);
  s.client.start(solved);const second=s.workers[1];late.call(first as unknown as Worker,new MessageEvent('message',{data:old}));second.emit(old);expect(s.updates.at(-1)?.phase).toBe('preparing');
  second.emit(s.response(second,{state:solved,solution:''}));expect(s.updates.at(-1)).toMatchObject({phase:'ready',state:solved});
  s.client.start(state);const third=s.workers[2],afterCancel=third.onmessage!;s.client.cancel();afterCancel.call(third as unknown as Worker,new MessageEvent('message',{data:s.response(third)}));expect(s.updates.at(-1)?.phase).toBe('cancelled');expect(third.terminate).toHaveBeenCalledOnce();
 });
 it('disposal cannot publish later errors or results',()=>{
  const s=setup();s.client.start(state);const w=s.workers[0],late=w.onmessage!,error=w.onerror!;s.client.dispose();late.call(w as unknown as Worker,new MessageEvent('message',{data:s.response()}));error.call(w as unknown as Worker,{} as ErrorEvent);expect(s.updates).toEqual([{phase:'preparing'}]);
 });
 it('recovers from structured failures and runtime crashes using a fresh worker',()=>{
  const s=setup();s.client.start(state);s.workers[0].emit({type:'error',id:s.response().id,code:'initialization'});expect(s.updates.at(-1)).toEqual({phase:'error',code:'initialization'});
  s.client.start(state);s.workers[1].onerror?.call(s.workers[1] as unknown as Worker,{} as ErrorEvent);expect(s.updates.at(-1)).toEqual({phase:'error',code:'worker'});
  s.client.start(state);s.workers[2].emit(s.response());expect(s.updates.at(-1)?.phase).toBe('ready');expect(s.workers).toHaveLength(3);
 });
 it('handles worker creation, posting, decoding and protocol failures',()=>{
  for(const factory of [()=>{throw Error();},()=>{const w=new FakeWorker();w.postMessage.mockImplementation(()=>{throw Error();});return w;}]){
   const updates:SolveStatus[]=[];const client=createSolverClient(s=>updates.push(s),factory);client.start(state);expect(updates.at(-1)).toEqual({phase:'error',code:'worker'});
  }
  for(const data of [null,{}, {type:'result',id:'bad'},{type:'mystery'},{type:'error',code:'unknown'}]){const s=setup();s.client.start(state);s.workers[0].emit(data&&typeof data==='object'?{id:s.response().id,...data}:data);expect(s.updates.at(-1)).toEqual({phase:'error',code:'protocol'});}
  const s=setup();s.client.start(state);s.workers[0].onmessageerror?.call(s.workers[0] as unknown as Worker,{} as MessageEvent);expect(s.updates.at(-1)).toEqual({phase:'error',code:'protocol'});
 });
 it('terminates hung work, permits retry, and cancels timeouts after success',()=>{
  vi.useFakeTimers();const s=setup();s.client.start(state);vi.advanceTimersByTime(1000);expect(s.updates.at(-1)).toEqual({phase:'error',code:'timeout'});expect(s.workers[0].terminate).toHaveBeenCalledOnce();s.client.start(state);s.workers[1].emit(s.response());vi.advanceTimersByTime(1000);expect(s.updates.at(-1)?.phase).toBe('ready');
 });
 it('verification rejects non-string output',()=>expect(verifySolution(state,null)).toBe(false));
});
