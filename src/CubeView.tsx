import {useEffect,useId,useRef,useState} from 'react';
import type {mountViewer} from './viewer';

export function CubeView({state,caption,preview,onPreview,onVerified}:{state:string;caption:string;preview?:{move:string;token:number};onPreview?:(ok:boolean)=>void;onVerified?:(ok:boolean)=>void}){
 const host=useRef<HTMLDivElement>(null);
 const viewer=useRef<ReturnType<typeof mountViewer>|null>(null);
 const [error,setError]=useState('');
 const [ready,setReady]=useState(false);
 const hintId=useId();
 useEffect(()=>{
  let live=true;
  void import('./viewer').then(({mountViewer})=>{
   if(!live)return;
   try{viewer.current=mountViewer(host.current!,{descriptionId:hintId,onError:()=>{setError('The graphics connection was lost. Reload the page, then re-enter your cube’s current colors if you made physical turns.');onVerified?.(false);onPreview?.(false);}});setReady(true);}
   catch{setError('The 3D view needs WebGL2. Try a current browser with graphics acceleration enabled.');onVerified?.(false);}
  }).catch(()=>{if(live){setError('The 3D view could not load. Check your connection and reload the page.');onVerified?.(false);}});
  return ()=>{live=false;viewer.current?.dispose();viewer.current=null;};
 },[hintId]);
 useEffect(()=>{
  if(!viewer.current)return;
  try{if(viewer.current.show(state)!==state)throw Error('Sticker mismatch');onVerified?.(true);}
  catch{setError('The cube view could not be verified. Reload the page to try again.');onVerified?.(false);}
 },[state,onVerified,ready]);
 useEffect(()=>{
  if(!preview||!viewer.current)return;
  // Mobile confirmation controls can be below the fold: bring the actual preview into view.
  host.current?.scrollIntoView({block:'center',behavior:'instant'});
  try{viewer.current.preview(state,preview.move,ok=>{if(!ok){setError('The turn preview could not be verified. Return to colors and try again.');onVerified?.(false);}onPreview?.(ok);});}
  catch{setError('The turn preview could not be verified. Return to colors and try again.');onVerified?.(false);onPreview?.(false);}
  return ()=>viewer.current?.cancelPreview();
 },[state,preview,onPreview,onVerified]);
 return <figure className="cube-figure">
  <div className="cube-stage"><div ref={host} className="cube-canvas"/>
   {error&&<p className="viewer-error" role="alert">{error}</p>}
   {!ready&&!error&&<p className="viewer-loading" role="status">Loading the 3D view…</p>}
  </div>
  <figcaption><span className="cube-caption">{caption}</span>
   <span id={hintId} className="cube-hint">Drag to look around · Arrow keys when focused</span>
   <button type="button" className="text-button reset-view" disabled={!!error||!ready} onClick={()=>viewer.current?.resetView()}>Reset view <span aria-hidden="true">↺</span></button>
  </figcaption>
 </figure>;
}
