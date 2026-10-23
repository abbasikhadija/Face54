import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {apply,solved,scramble,type Face} from './cube';
import {CubeView} from './CubeView';
import {InputEditor} from './InputEditor';
import {useDraft} from './useDraft';
import {Review} from './Review';
import {SolvePanel} from './SolvePanel';
import {GuidedPlayback,type PlaybackSession} from './GuidedPlayback';
import './styles.css';

const initial=apply(solved,scramble);
const Proof=lazy(()=>import('./Proof'));
type Screen='welcome'|'prepare'|'demo'|'input'|'review'|'play';
function currentScreen():Screen {
 return location.hash==='#play'?'play':location.hash==='#prepare'?'prepare':location.hash==='#demo'?'demo':location.hash==='#input'?'input':location.hash==='#review'?'review':'welcome';
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
 <div className="hero-copy"><a className="back-link" href="#welcome">← Back to welcome</a><p className="eyebrow">BEFORE THE FIRST TURN</p>
  <h1 id="page-title" tabIndex={-1}>Get to know<br/><em>your cube.</em></h1>
  <ol className="prepare-steps">
   <li><div><h2>Start with the centers</h2><p>Each center stays in place. Its color tells you which face you’re looking at.</p></div></li>
   <li><div><h2>White up. Green toward you.</h2><p>Hold the white center on top and the green center facing you. This is your starting view.</p></div></li>
   <li><div><h2>Look around, without turning layers</h2><p>Rotate the whole cube to inspect it. Keep the individual layers in place while entering colors.</p></div></li>
  </ol>
  <p className="scope-note">Keep this starting hold in mind. We’ll show you how to inspect each face as you enter its colors.</p>
  <a className="button primary" href="#input">Enter cube colors <Arrow/></a>
 </div><CubeView state={solved} caption="Starting view · white above, green in front"/>
 </section>;}

function Demo({onBegin}:{onBegin:(state:string,solution:string)=>void}){
 return <section className="hero demo" aria-labelledby="page-title">
  <div className="hero-copy"><a className="back-link" href="#welcome">← Back to welcome</a><p className="eyebrow">TRY ONE TURN AT A TIME</p>
   <h1 id="page-title" tabIndex={-1}>A scrambled cube.<br/><em>A way through.</em></h1>
   <p className="intro">Try the complete guided journey with this example cube. Every turn stays under your control.</p>
   <SolvePanel state={initial} demo onBegin={onBegin}/>
  </div><CubeView state={initial} caption="Example cube · white above, green in front"/>
 </section>;
}
function App(){
 const [screen,setScreen]=useState<Screen>(currentScreen);
 const input=useDraft();
 const [session,setSession]=useState<PlaybackSession|null>(null);
 function begin(state:string,solution:string,demo=false){setSession({state,solution,demo});location.hash='#play';}
 function leave(){const demo=session?.demo;setSession(null);location.hash=demo?'#':'#input';}
 function newCube(){if(!session?.demo)input.reset();setSession(null);location.hash='#prepare';}
 const [correction,setCorrection]=useState<{face:Face;indices:number[];key:string}|null>(null);
 const highlighted=correction?.key===JSON.stringify(input.draft.facelets)?correction:null;
 const correctionPosition=highlighted?.face===input.draft.face&&highlighted.indices.length>0?highlighted.indices[0]%9:undefined;
 function editFace(face:Face,indices:number[]){
  input.setDraft({...input.draft,face});setCorrection({face,indices,key:JSON.stringify(input.draft.facelets)});location.hash='#input';
 }
 const firstRender=useRef(true);
 useEffect(()=>{const navigate=()=>{const next=currentScreen();if(next!=='play')setSession(null);setScreen(next);};window.addEventListener('hashchange',navigate);return ()=>window.removeEventListener('hashchange',navigate);},[]);
 useEffect(()=>{
  document.title=screen==='welcome'?'Cube Solver — One turn at a time':`${screen==='prepare'?'Prepare your cube':screen==='input'?'Enter cube colors':screen==='review'?'Review your cube':screen==='play'?'Follow each turn':'Try the demo'} — Cube Solver`;
  if(!firstRender.current||location.hash)document.getElementById('page-title')?.focus();
  firstRender.current=false;
 },[screen]);
 return <div className="app-shell">
  <a href="#main" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();}}>Skip to content</a>
  <header className="site-header"><a href="#welcome" className="wordmark" aria-label="Cube Solver home"><CubeMark/><span>Cube Solver<span className="wordmark-dot">.</span></span></a><span className="header-note">A little clarity, one turn at a time.</span></header>
  <main id="main" tabIndex={-1}>{screen==='welcome'?<Welcome/>:screen==='prepare'?<Prepare/>:screen==='input'?<InputEditor draft={input.draft} setDraft={input.setDraft} notice={input.notice} onReset={input.reset} highlighted={highlighted?.indices} initialPosition={correctionPosition}/>:screen==='review'?<Review draft={input.draft} notice={input.notice} onEdit={editFace} onBegin={(state,solution)=>begin(state,solution)}/>:screen==='play'?(session?<GuidedPlayback session={session} onExit={leave} onNew={newCube}/>:<section className="input-screen"><h1 id="page-title" tabIndex={-1}>Recheck your current cube.</h1><p>Solution progress is not saved. If you turned your physical cube, re-enter its current colors before checking again.</p><a className="button primary" href="#input">Return to colors</a></section>):<Demo onBegin={(state,solution)=>begin(state,solution,true)}/>}</main>
  <footer className="site-footer"><span>Made for the cube in your hands.</span><span><span className="local-dot" aria-hidden="true"/> Solving stays on your device.</span></footer>
 </div>;
}
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).get('proof')==='1'?<Suspense fallback={<p role="status">Loading the technical proof…</p>}><Proof/></Suspense>:<App/>);
