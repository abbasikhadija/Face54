import {useEffect,useId,useRef,useState} from 'react';
import {mountViewer} from './viewer';

export function CubeView({state,caption}:{state:string;caption:string}){
 const host=useRef<HTMLDivElement>(null);
 const viewer=useRef<ReturnType<typeof mountViewer>|null>(null);
 const [error,setError]=useState('');
 const hintId=useId();
 useEffect(()=>{
  try{viewer.current=mountViewer(host.current!,{descriptionId:hintId});}
  catch{setError('The 3D view needs WebGL2. Try a current browser with graphics acceleration enabled.');}
  return ()=>{viewer.current?.dispose();viewer.current=null;};
 },[hintId]);
 useEffect(()=>{
  if(!viewer.current)return;
  try{if(viewer.current.show(state)!==state)throw Error('Sticker mismatch');}
  catch{setError('The cube view could not be verified. Reload the page to try again.');}
 },[state]);
 return <figure className="cube-figure">
  <div className="cube-stage"><div ref={host} className="cube-canvas"/>
   {error&&<p className="viewer-error" role="alert">{error}</p>}
  </div>
  <figcaption><span className="cube-caption">{caption}</span>
   <span id={hintId} className="cube-hint">Drag to look around · Arrow keys when focused</span>
   <button type="button" className="text-button reset-view" disabled={!!error} onClick={()=>viewer.current?.resetView()}>Reset view <span aria-hidden="true">↺</span></button>
  </figcaption>
 </figure>;
}
