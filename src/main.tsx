import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {apply,solved,scramble} from './cube';
import {mountViewer} from './viewer';
const initial=apply(solved,scramble);
function App(){
 const host=useRef<HTMLDivElement>(null);
 const viewer=useRef<ReturnType<typeof mountViewer>>(null);
 const [result,setResult]=useState<{solution:string;initMs:number;solveMs:number}|null>(null);
 const [error,setError]=useState('');const [step,setStep]=useState(0);const [visual,setVisual]=useState('');
 const moves=result?.solution.split(/\s+/).filter(Boolean)??[];
 const state=apply(initial,moves.slice(0,step).join(' '));
 useEffect(()=>{
  try{viewer.current=mountViewer(host.current!);}catch(e){setError(String(e));}
  const worker=new Worker(new URL('./solver.worker.ts',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>data.ok?setResult(data):setError(data.error);
  worker.onerror=e=>setError(e.message);
  worker.postMessage({state:initial});
  return ()=>{worker.terminate();viewer.current?.dispose();};
 },[]);
 useEffect(()=>{if(viewer.current)setVisual(viewer.current.show(state));},[state]);
 return <main><h1>M0 — Technical feasibility</h1><p>White U · red R · green F · yellow D · orange L · blue B</p>
 <p>Recorded scramble: <code>{scramble}</code></p><div ref={host}/>
 <p role="status">{error||(!result?'Preparing solver in worker…':visual===state?'Solver / mesh agreement verified':'State mismatch')}</p>
 {result&&<><p>Initialization {result.initMs.toFixed(1)} ms; solve {result.solveMs.toFixed(1)} ms</p>
 <p>Solution: <code data-testid="solution">{result.solution}</code></p>
 <label>Seek solution step <input aria-label="Seek solution step" type="range" min="0" max={moves.length} value={step} onChange={e=>setStep(Number(e.target.value))}/></label>
 <p>Step {step}/{moves.length} · {state===solved?'Solved':'Scrambled'}</p></>}
 <details open><summary>Facelets (URFDLB, row-major)</summary><p data-testid="state">{state}</p><p data-testid="visual">{visual}</p></details></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
