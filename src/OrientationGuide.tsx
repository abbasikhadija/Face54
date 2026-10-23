import {useEffect,useRef,useState} from 'react';
import {solved,type Face} from './cube';
import {faceInfo} from './orientation';
import {mountViewer} from './viewer';

export function OrientationGuide({face,onClose}:{face:Face;onClose:()=>void}){
 const host=useRef<HTMLDivElement>(null);
 const [settled,setSettled]=useState(false);
 const [error,setError]=useState(false);
 const info=faceInfo[face];
 useEffect(()=>{
  setSettled(false);setError(false);
  let viewer:ReturnType<typeof mountViewer>|undefined;
  try{
   viewer=mountViewer(host.current!,{interactive:false});
   if(viewer.show(solved)!==solved)throw Error('Reference state mismatch');
   viewer.orientFace(face,referenceState=>{if(referenceState!==solved)setError(true);setSettled(true);});
  }catch{setError(true);setSettled(true);}
  return ()=>viewer?.dispose();
 },[face]);
 return <aside className={`orientation-guide ${settled?'settled':''}`} aria-label="Face orientation guide">
  <div><p className="eyebrow">HOLD YOUR CUBE LIKE THIS</p><h2 id="orientation-title" tabIndex={-1}>{info.color} facing you</h2></div>
  <p>Start with white up and green in front. {info.instruction}</p>
  <div className="orientation-stage"><div ref={host} className="cube-canvas"/></div>
  {error?<p className="guide-fallback" role="status">The 3D reference is unavailable. Use the center-color landmarks below.</p>:<p className="quiet-note">Reference cube · only the whole view rotates</p>}
  <dl className="guide-landmarks"><div><dt>Above your grid</dt><dd>{faceInfo[info.above].color}</dd></div><div><dt>To your right</dt><dd>{faceInfo[info.right].color}</dd></div></dl>
  <p className="guide-warning">Keep each layer in place. Copy the face exactly as you see it.</p>
  <button className="button secondary" type="button" onClick={onClose}>Hide reference <span aria-hidden="true">↗</span></button>
 </aside>;
}
