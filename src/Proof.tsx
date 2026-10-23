import React,{useEffect,useRef,useState} from 'react';
import {apply,solved,scramble} from './cube';
import {mountViewer} from './viewer';
import {createSolverClient} from './solverClient';
const initial=apply(solved,scramble);
export default function Proof(){
 const host=useRef<HTMLDivElement>(null);
 const viewer=useRef<ReturnType<typeof mountViewer>>(null);
 const [result,setResult]=useState<{solution:string;initMs:number;solveMs:number}|null>(null);
 const [error,setError]=useState('');const [step,setStep]=useState(0);const [visual,setVisual]=useState('');
 const moves=result?.solution.split(/\s+/).filter(Boolean)??[];
 const state=apply(initial,moves.slice(0,step).join(' '));
 useEffect(()=>{
  try{viewer.current=mountViewer(host.current!,{diagnostic:true});}catch(e){setError(String(e));}
  const client=createSolverClient(status=>{
   if(status.phase==='ready')setResult(status);
   else if(status.phase==='error')setError(`Solver failed: ${status.code}`);
  });
  client.start(initial);
  return ()=>{client.dispose();viewer.current?.dispose();};
 },[]);
 useEffect(()=>{if(viewer.current)setVisual(viewer.current.show(state));},[state]);
 return <main className="proof"><h1>M0 — Technical feasibility</h1><p>White U · red R · green F · yellow D · orange L · blue B</p>
 <p>Recorded scramble: <code>{scramble}</code></p><div ref={host}/>
 <p role="status">{error||(!result?'Preparing solver in worker…':visual===state?'Solver / mesh agreement verified':'State mismatch')}</p>
 {result&&<><p>Initialization {result.initMs.toFixed(1)} ms; solve {result.solveMs.toFixed(1)} ms</p>
 <p>Solution: <code data-testid="solution">{result.solution}</code></p>
 <label>Seek solution step <input aria-label="Seek solution step" type="range" min="0" max={moves.length} value={step} onChange={e=>setStep(Number(e.target.value))}/></label>
 <p>Step {step}/{moves.length} · {state===solved?'Solved':'Scrambled'}</p></>}
 <details open><summary>Facelets (URFDLB, row-major)</summary><p data-testid="state">{state}</p><p data-testid="visual">{visual}</p></details></main>;
}
