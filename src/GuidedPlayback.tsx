import {useCallback,useEffect,useRef,useState} from 'react';
import {CubeView} from './CubeView';
import {advance,createPlayback,describeMove,inverseMove,type PlaybackProgress} from './playback';

export type PlaybackSession={state:string;solution:string;demo:boolean};
export function GuidedPlayback({session,onExit,onNew}:{session:PlaybackSession;onExit:()=>void;onNew:()=>void}){
 const [plan]=useState(()=>createPlayback(session.state,session.solution));
 const [progress,setProgress]=useState<PlaybackProgress>({step:0,undo:false});
 const [preview,setPreview]=useState<{move:string;token:number}|undefined>();
 const [previewing,setPreviewing]=useState(false);
 const [verified,setVerified]=useState(false);
 const [exit,setExit]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null),dialog=useRef<HTMLDialogElement>(null),keep=useRef<HTMLButtonElement>(null);
 const {step,undo}=progress,complete=step===plan.moves.length&&!undo;
 const move=undo?inverseMove(plan.moves[step-1]):plan.moves[step];
 const onVerified=useCallback((ok:boolean)=>setVerified(ok),[]);
 const onPreview=useCallback((ok:boolean)=>{setPreviewing(false);if(!ok)setVerified(false);},[]);
 useEffect(()=>{heading.current?.focus();},[step,undo]);
 useEffect(()=>{if(exit){dialog.current?.showModal();keep.current?.focus();}else dialog.current?.close();},[exit]);
 function action(type:Parameters<typeof advance>[1]){
  if(previewing||!verified)return;
  setPreview(undefined);setProgress(old=>advance(old,type,plan.moves.length));
 }
 function watch(){if(!verified||previewing||!move)return;setPreviewing(true);setPreview({move,token:performance.now()});}
 return <section className="playback-screen" aria-labelledby="playback-title">
  <button className="text-button back-link" type="button" onClick={()=>setExit(true)}>{session.demo?'← Leave demo':'← Return to colors'}</button>
  <p className="eyebrow">{session.demo?'GUIDED DEMO · EXAMPLE CUBE':'YOUR CUBE · ONE TURN AT A TIME'}</p>
  <div className="playback-layout">
   <div className="playback-copy">
    <p className="playback-progress" role="status">{step} of {plan.moves.length} moves confirmed</p>
    <h1 id="playback-title" ref={heading} tabIndex={-1}>{complete?(plan.moves.length?'Every turn complete.':'Your cube is already solved.'):undo?`Undo turn ${step}.`:`Turn ${step+1} of ${plan.moves.length}.`}</h1>
    {complete?<>
     <p className="intro">{session.demo?'Demo solved. Every color is back in place.':plan.moves.length?'The virtual cube is solved. Compare all six faces with your cube to confirm they match.':'No moves are needed for these entered colors. Compare all six faces with your cube.'}</p>
     <p className="quiet-note">{plan.moves.length} moves · {session.demo?'This was an example cube.':'The app cannot detect physical turns.'}</p>
     <button className="button primary" type="button" onClick={onNew}>Solve another cube <span aria-hidden="true">→</span></button>
    </>:<>
     <p className="current-turn"><code aria-label={`Move ${move}`}>{move}</code></p>
     <p className="turn-direction">{describeMove(move)}</p>
     <p className="hold-instruction">Keep white on top and green in front. Looking around the virtual cube changes only your view; the face names stay fixed.</p>
     {undo?<p className="undo-warning" role="alert">Undo the previous physical turn using the instruction above. Progress changes only when you confirm below.</p>:<p className="quiet-note">{session.demo?'Practice with the example cube; a physical cube is not required.':'Make this turn on your physical cube, then confirm.'}</p>}
     <div className="playback-preview"><button className="button secondary" type="button" disabled={previewing||!verified} onClick={watch}>{previewing?'Showing preview…':'Preview this turn'}</button><p role="status">{previewing?'Preview only — progress has not changed.':'Preview resets to your confirmed state. It does not complete a move.'}</p></div>
     <button className="button primary" type="button" disabled={previewing||!verified} onClick={()=>action(undo?'confirmUndo':'confirm')}>{undo?'I undid this turn':'Done — next move'} <span aria-hidden="true">→</span></button>
    </>}
    {step>0&&<div className="playback-undo"><button className="text-button" type="button" disabled={previewing||!verified} onClick={()=>action(undo?'cancelUndo':'requestUndo')}>{undo?'Keep current step':'Previous — undo a turn'}</button></div>}
    <p className="quiet-note playback-persistence">Progress is not saved. If you leave or refresh after moving your physical cube, re-enter its current colors before solving again.</p>
   </div>
   <CubeView state={plan.states[step]} caption={complete?'Solved cube':undo?'Confirmed state · undo the previous turn':'Confirmed state · white up, green front'} preview={preview} onPreview={onPreview} onVerified={onVerified}/>
  </div>
  <dialog ref={dialog} className="reset-dialog" onCancel={e=>{e.preventDefault();setExit(false);}} aria-labelledby="leave-title">
   <h2 id="leave-title">Leave this solution?</h2><p>{session.demo?'Demo progress will be discarded.':'Your entered colors are kept, but progress is discarded. If you have turned your physical cube, re-enter its current colors before checking again.'}</p>
   <div className="actions"><button ref={keep} className="button primary" type="button" onClick={()=>setExit(false)}>Keep solving</button><button className="button secondary" type="button" onClick={onExit}>{session.demo?'Leave demo':'Return to colors'}</button></div>
  </dialog>
 </section>;
}
