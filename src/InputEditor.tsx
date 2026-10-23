import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {faces,type Face} from './cube';
import {colors} from './colors';
import {entryFaces,faceInfo,faceletIndex} from './orientation';
import {clearFace,colorCounts,faceProgress,firstEmpty,hasEntries,paintSticker,type InputDraft} from './input';
import {OrientationGuide} from './OrientationGuide';

type Props={draft:InputDraft;setDraft:Dispatch<SetStateAction<InputDraft>>;notice:string;onReset:()=>void;highlighted?:number[];initialPosition?:number};
export function InputEditor({draft,setDraft,notice,onReset,highlighted=[],initialPosition}:Props){
 const [color,setColor]=useState<Face|null>(null);
 const [active,setActive]=useState(()=>Number.isInteger(initialPosition)?initialPosition!:firstEmpty(draft,draft.face));
 const [guide,setGuide]=useState(true);
 const visited=useRef(new Set<Face>([draft.face]));
 const [confirm,setConfirm]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 const buttons=useRef<(HTMLButtonElement|null)[]>([]);
 const heading=useRef<HTMLHeadingElement>(null);
 const [announcement,setAnnouncement]=useState('');
 const face=draft.face,info=faceInfo[face],index=entryFaces.indexOf(face);
 const counts=colorCounts(draft);
 const filled=draft.facelets.filter(value=>value!==null).length;
 const excess=faces.filter(face=>counts[face]>9);
 useEffect(()=>{
  if(confirm)dialog.current?.showModal();
  else if(dialog.current?.open)dialog.current.close();
 },[confirm]);
 function changeFace(next:Face){
  if(next===face)return;
  const firstVisit=!visited.current.has(next);
  setDraft({...draft,face:next});setActive(firstEmpty(draft,next));
  setGuide(firstVisit);visited.current.add(next);
  setAnnouncement('');
  // Wait for React's commit before focusing the new face heading.
  requestAnimationFrame(()=>firstVisit?document.getElementById('orientation-title')?.focus():heading.current?.focus());
 }
 function showGuide(visible:boolean){
  setGuide(visible);
  requestAnimationFrame(()=>visible?document.getElementById('orientation-title')?.focus():heading.current?.focus());
 }
 function paint(position:number){
  setActive(position);
  if(!color){setAnnouncement('Choose a color first, then paint a sticker.');return;}
  const result=paintSticker(draft,position,color);
  setDraft(result.draft);setActive(result.active);
  setAnnouncement(`${info.color} face, row ${Math.floor(position/3)+1}, column ${position%3+1}: ${faceInfo[color].color}.`);
  buttons.current[result.active]?.focus();
 }
 function selectNeighbor(position:number,key:string){
  const delta=key==='ArrowLeft'?-1:key==='ArrowRight'?1:key==='ArrowUp'?-3:key==='ArrowDown'?3:0;
  if(!delta)return;
  let next=position+delta;
  if(next===4)next+=delta;
  if(next<0||next>8)return;
  setActive(next);buttons.current[next]?.focus();
 }
 function reset(){
  onReset();setColor(null);setActive(0);setGuide(true);visited.current=new Set(['F']);setConfirm(false);setAnnouncement('Started a new cube. Only the centers are filled.');
 }
 return <section className="input-screen" aria-labelledby="page-title">
  <div className="input-top"><div><a className="back-link" href="#prepare"><span aria-hidden="true">←</span> Preparation</a><p className="eyebrow">YOUR CUBE, ONE FACE AT A TIME</p>
   <h1 id="page-title" tabIndex={-1}>Copy the colors.<br/><em>Keep every layer in place.</em></h1></div>
   <div className="actions"><a className="button secondary" href="#review">Review cube <span aria-hidden="true">→</span></a><button className="text-button" type="button" onClick={()=>hasEntries(draft)?setConfirm(true):reset()}>Start new cube</button></div>
  </div>
  <nav className="face-navigation" aria-label="Cube faces">
   {entryFaces.map((f,i)=><button type="button" key={f} aria-current={face===f?'step':undefined} onClick={()=>changeFace(f)}>
    <span className="face-dot" style={{background:colors[f]}} aria-hidden="true"/><span>{i+1}. {faceInfo[f].color}<small>{faceInfo[f].name} · {faceProgress(draft,f)}/9</small></span>
   </button>)}
  </nav>
  {notice&&<p className="storage-notice" role="status">{notice}</p>}
  <div className={`input-layout ${guide?'with-guide':''}`}>
   <div className="entry-panel">
    <div className="face-heading"><div><p className="eyebrow">FACE {index+1} OF 6 · {faceProgress(draft,face)}/9 STICKERS</p><h2 ref={heading} tabIndex={-1}>{info.color} / {info.name}</h2></div><button className="text-button" type="button" onClick={()=>showGuide(!guide)}>{guide?'Hide orientation':'Show orientation'}</button></div>
    <p id="face-landmarks" className="landmark-text">{faceInfo[info.above].color} above · {faceInfo[info.right].color} to your right</p>
    {highlighted.length>0&&<p className="correction-note" id="correction-help">Marked positions are entries to recheck as a group, not a diagnosis of which sticker is wrong. Editing clears the old check.</p>}
    <p id="painting-help" className="entry-help">{color?<>Selected: <strong>{faceInfo[color].color}</strong>. Paint a sticker; the next empty spot will be selected.</>:'Choose a color, then paint a sticker. The center is fixed.'}</p>
    <fieldset className="color-palette"><legend>Sticker color</legend>{faces.map(f=><button key={f} type="button" aria-pressed={color===f} onClick={()=>{setColor(f);setAnnouncement(`${faceInfo[f].color} selected. No sticker changed.`);}}><span className="palette-swatch" aria-hidden="true" style={{background:colors[f]}}/><span>{faceInfo[f].color}</span></button>)}</fieldset>
    <div className="face-editor" role="group" aria-label={`${info.color} ${info.name} face stickers`} aria-describedby="face-landmarks painting-help">
     {Array.from({length:9},(_,position)=>{
      const row=Math.floor(position/3),column=position%3;
      const value=draft.facelets[faceletIndex(face,row,column)];
      const center=position===4;
      const marked=highlighted.includes(faceletIndex(face,row,column));
      return <button key={`${face}-${position}`} type="button" ref={el=>{buttons.current[position]=el;}} disabled={center} data-review-highlighted={marked||undefined} aria-describedby={marked?'correction-help':undefined} className={`sticker ${active===position?'active':''} ${value?'filled':'empty'} ${marked?'review-highlight':''}`} style={value?{background:colors[value],color:['U','D','L','F'].includes(value)?'#10151c':'#ffffff'}:{}}
       aria-label={`${info.color} row ${row+1} column ${column+1}: ${value?faceInfo[value].color:'empty'}${center?', fixed center':''}`}
       aria-pressed={center?undefined:active===position} onFocus={()=>setActive(position)} onClick={()=>paint(position)} onKeyDown={event=>{if(event.key.startsWith('Arrow')){event.preventDefault();selectNeighbor(position,event.key);}}}>
       <span>{center?'Center':value?faceInfo[value].color:'+'}</span>
      </button>;
     })}
    </div>
    <div className="face-tools"><span>{9-faceProgress(draft,face)} empty on this face</span><button className="text-button" type="button" onClick={()=>{setDraft(clearFace(draft));setActive(0);setAnnouncement(`${info.color} face cleared. The center stayed in place.`);}}>Clear face</button></div>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
    <div className="face-actions"><button type="button" className="button secondary" disabled={index===0} onClick={()=>changeFace(entryFaces[index-1])}><span aria-hidden="true">←</span> Previous face</button><button type="button" className="button primary" disabled={index===5} onClick={()=>changeFace(entryFaces[index+1])}>Next face <span aria-hidden="true">→</span></button></div>
    <p className="quiet-note">You can leave a face unfinished and return to it.</p>
   </div>
   {guide&&<OrientationGuide key={face} face={face} onClose={()=>showGuide(false)}/>}
  </div>
  <section className="entry-counts" aria-label="Sticker counts"><div className="counts-heading"><h2>Colors on your cube</h2><p>{filled}/54 filled · {54-filled} empty</p></div>
   <ul>{faces.map(f=><li key={f} className={counts[f]>9?'excess':''}><span className="face-dot" style={{background:colors[f]}} aria-hidden="true"/><span>{faceInfo[f].color}</span><strong>{counts[f]}<span>/9</span></strong></li>)}</ul>
   {excess.length>0&&<p className="count-warning" role="alert">{excess.map(f=>`${faceInfo[f].color} has ${counts[f]} stickers`).join('; ')}. A standard cube has nine of each color. You can correct these entries.</p>}
   {filled===54&&<p className="scope-note" role="status">Every sticker has a color. Physical correctness has not been checked. Open review to check your cube.</p>}
  </section>
  <dialog ref={dialog} className="reset-dialog" aria-labelledby="reset-title" aria-describedby="reset-description" onCancel={()=>setConfirm(false)} onClose={()=>setConfirm(false)}>
   <h2 id="reset-title">Start a new cube?</h2><p id="reset-description">This clears all entered colors, including the saved draft on this device. The six centers will stay fixed.</p><div className="actions"><button className="button secondary" type="button" autoFocus onClick={()=>setConfirm(false)}>Keep editing</button><button className="button primary" type="button" onClick={reset}>Start new cube</button></div>
  </dialog>
 </section>;
}
