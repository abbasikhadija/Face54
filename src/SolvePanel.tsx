import {useEffect,useRef,useState} from 'react';
import {createSolverClient,type SolveStatus} from './solverClient';
import type {SolveFailure} from './solverProtocol';

const errors:Record<SolveFailure,string>={
 invalid_input:'These colors need another check. Return to editing, then check your cube again.',
 initialization:'The local solver could not prepare. Your colors are safe; try again.',
 solve:'The local solver could not finish. Your colors are safe; try again.',
 verification:'The returned moves did not pass our safety check. Your colors are safe; try again.',
 protocol:'The solver returned an unreadable response. Your colors are safe; try again.',
 worker:'The local solver could not load or stopped unexpectedly. Your colors are safe; try again.',
 timeout:'The solver took too long and was stopped. Your colors are safe; try again.',
};
export function SolvePanel({state,onBegin,demo=false}:{state:string;onBegin:(state:string,solution:string)=>void;demo?:boolean}){
 const [status,setStatus]=useState<SolveStatus>({phase:'preparing'});
 const client=useRef<ReturnType<typeof createSolverClient>|null>(null);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
  const current=createSolverClient(setStatus);client.current=current;current.start(state);
  return ()=>{current.dispose();client.current=null;};
 },[state]);
 useEffect(()=>{if(['ready','error','cancelled'].includes(status.phase))heading.current?.focus();},[status.phase]);
 const busy=status.phase==='preparing'||status.phase==='solving';
 return <section className="solve-panel" aria-label="Local solution" aria-busy={busy}>
  <h2 ref={heading} tabIndex={-1}>{status.phase==='ready'?(status.solution?'Your solution is ready.':'Your cube is already solved.'):status.phase==='cancelled'?'Solving stopped.':status.phase==='error'?'Could not prepare a solution.':'Finding your solution…'}</h2>
  {busy&&<><p role="status">{status.phase==='preparing'?'Preparing the solver on your device. The first run can take a few seconds.':'Finding and checking moves on your device…'}</p><button className="button secondary" type="button" onClick={()=>client.current?.cancel()}>Cancel solving</button></>}
  {status.phase==='error'&&<p role="alert">{errors[status.code]}</p>}
  {status.phase==='cancelled'&&<p role="status">Your colors are unchanged. You can retry or edit a face.</p>}
  {(status.phase==='error'||status.phase==='cancelled')&&<button className="button primary" type="button" onClick={()=>client.current?.start(state)}>Try again</button>}
  {status.phase==='ready'&&<><div role="status"><p>{status.solution?`Verified ${status.solution.trim().split(/\s+/).length} moves against ${demo?'the example cube':'your entered colors'}.`:'No moves are needed for these entered colors.'}</p><p>{demo?'Follow the example one turn at a time.':status.solution?'Hold white on top and green in front. Compare your cube with the starting 3D state before making a turn.':'Compare all six faces with your physical cube to confirm they match.'}</p></div><button className="button primary" type="button" onClick={()=>onBegin(status.state,status.solution)}>{status.solution?(demo?'Start guided demo':'Start guided solving'):'View solved cube'} <span aria-hidden="true">→</span></button></>}
  <p className="quiet-note">Editing or leaving this review discards the solution. Your entered colors stay saved when browser storage is available.</p>
 </section>;
}
