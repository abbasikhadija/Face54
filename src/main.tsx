import {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {apply,solved,scramble} from './cube';
import {CubeView} from './CubeView';
import Proof from './Proof';
import './styles.css';

const initial=apply(solved,scramble);
type Screen='welcome'|'prepare'|'demo';
function currentScreen():Screen {
 return location.hash==='#prepare'?'prepare':location.hash==='#demo'?'demo':'welcome';
}
function CubeMark(){return <svg viewBox="0 0 28 30" fill="none" aria-hidden="true"><path d="m14 2 12 7v13l-12 7-12-7V9L14 2Z M2 9l12 7 12-7M14 16v13M8 5.5l12 7v13M20 5.5l-12 7v13M2 15.5l12 7 12-7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>;}
function Arrow(){return <span aria-hidden="true">↗</span>;}

function Welcome(){return <section className="hero" aria-labelledby="page-title">
 <div className="hero-copy"><p className="eyebrow"><span/> ONE CUBE. ONE TURN AT A TIME.</p>
  <h1 id="page-title" tabIndex={-1}>Your cube.<br/><em>A clear way<br className="desktop-break"/> forward.</em></h1>
  <p className="intro">A little guidance for all those mixed-up colors. Enter your cube, then follow each turn at your own pace.</p>
  <div className="actions"><a className="button primary" href="#prepare">Solve my cube <Arrow/></a><a className="button secondary" href="#demo">Try demo <span aria-hidden="true">→</span></a></div>
  <p className="quiet-note">No experience needed. Just a standard 3×3 cube.</p>
 </div>
 <CubeView state={initial} caption="A familiar puzzle. A fresh perspective."/>
 </section>;}

function Prepare(){return <section className="hero prepare" aria-labelledby="page-title">
 <div className="hero-copy"><a className="back-link" href="#">← Back to welcome</a><p className="eyebrow">BEFORE THE FIRST TURN</p>
  <h1 id="page-title" tabIndex={-1}>Get to know<br/><em>your cube.</em></h1>
  <ol className="prepare-steps">
   <li><div><h2>Start with the centers</h2><p>Each center stays in place. Its color tells you which face you’re looking at.</p></div></li>
   <li><div><h2>White up. Green toward you.</h2><p>Hold the white center on top and the green center facing you. This is your starting view.</p></div></li>
   <li><div><h2>Look around, without turning layers</h2><p>Rotate the whole cube to inspect it. Keep the individual layers in place while entering colors.</p></div></li>
  </ol>
  <p className="scope-note">Face-by-face color entry is coming in the next development milestone. You can explore the working demo now.</p>
  <a className="button primary" href="#demo">Try demo <Arrow/></a>
 </div><CubeView state={solved} caption="Starting view · white above, green in front"/>
 </section>;}

function Demo(){
 const [result,setResult]=useState<{solution:string}|null>(null);
 const [error,setError]=useState(false);
 const [step,setStep]=useState(0);
 useEffect(()=>{
  let worker:Worker|undefined;
  try{
   worker=new Worker(new URL('./solver.worker.ts',import.meta.url),{type:'module'});
   worker.onmessage=({data})=>{if(data.ok)setResult(data);else setError(true);};
   worker.onerror=()=>setError(true);
   worker.postMessage({state:initial});
  }catch{setError(true);}
  return ()=>worker?.terminate();
 },[]);
 const moves=result?.solution.split(/\s+/).filter(Boolean)??[];
 const state=apply(initial,moves.slice(0,step).join(' '));
 return <section className="hero demo" aria-labelledby="page-title">
  <div className="hero-copy"><a className="back-link" href="#">← Back to welcome</a><p className="eyebrow">TAKE A LOOK AROUND</p>
   <h1 id="page-title" tabIndex={-1}>A scrambled cube.<br/><em>A way through.</em></h1>
   <p className="intro">Explore a real solution to this example cube. Move the slider to see how each turn changes it.</p>
   <div className="demo-controls">
    <p className="demo-status" role="status">{error?'The demo could not load. Return to welcome and try again.':!result?'Finding a solution…':step===moves.length?'Demo solved. Every color is back in place.':`Solution ready · ${moves.length} moves`}</p>
    {result&&!error&&<>
     <div className="range-label"><label htmlFor="demo-position">Explore the solution</label><span>{step} / {moves.length}</span></div>
     <input id="demo-position" type="range" min={0} max={moves.length} value={step} aria-valuetext={step===0?'Starting scramble':`After move ${step} of ${moves.length}: ${moves[step-1]}`} onChange={e=>setStep(Number(e.target.value))}/>
     <p className="move-label">{step===0?'Starting scramble':<>Last turn <code>{moves[step-1]}</code></>}</p>
     <div className="actions"><button type="button" className="button primary" onClick={()=>setStep(step===moves.length?0:moves.length)}>{step===moves.length?'Reset demo':'Show solved cube'} <span aria-hidden="true">→</span></button></div>
     <p className="quiet-note">This is an example cube. Your own cube will have a different solution.</p>
    </>}
   </div>
  </div><CubeView state={state} caption={step===moves.length&&result?'Demo cube · solved':'Demo cube · explore from any angle'}/>
 </section>;
}

function App(){
 const [screen,setScreen]=useState<Screen>(currentScreen);
 const firstRender=useRef(true);
 useEffect(()=>{const navigate=()=>setScreen(currentScreen());window.addEventListener('hashchange',navigate);return ()=>window.removeEventListener('hashchange',navigate);},[]);
 useEffect(()=>{
  document.title=screen==='welcome'?'Cube Solver — One turn at a time':`${screen==='prepare'?'Prepare your cube':'Try the demo'} — Cube Solver`;
  if(!firstRender.current||location.hash)document.getElementById('page-title')?.focus();
  firstRender.current=false;
 },[screen]);
 return <div className="app-shell">
  <a href="#main" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();}}>Skip to content</a>
  <header className="site-header"><a href="#" className="wordmark" aria-label="Cube Solver home"><CubeMark/><span>Cube Solver<span className="wordmark-dot">.</span></span></a><span className="header-note">A little clarity, one turn at a time.</span></header>
  <main id="main" tabIndex={-1}>{screen==='welcome'?<Welcome/>:screen==='prepare'?<Prepare/>:<Demo/>}</main>
  <footer className="site-footer"><span>Made for the cube in your hands.</span><span><span className="local-dot" aria-hidden="true"/> Solving stays on your device.</span></footer>
 </div>;
}
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).get('proof')==='1'?<Proof/>:<App/>);
