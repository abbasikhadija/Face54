import {useRef,useState} from 'react';
import {faces,type Face} from './cube';
import {colorCounts,type InputDraft} from './input';
import {faceInfo} from './orientation';
import {colors} from './viewer';
import {validateCube,type ValidationResult} from './validation';
import {SolvePanel} from './SolvePanel';

type Props={draft:InputDraft;notice:string;onEdit:(face:Face,indices:number[])=>void};
const colorLetters:Record<Face,string>={U:'W',R:'R',F:'G',D:'Y',L:'O',B:'B'};
export function Review({draft,notice,onEdit}:Props){
 const [checked,setChecked]=useState<{key:string;result:ValidationResult}|null>(null);
 const summary=useRef<HTMLDivElement>(null);
 const key=JSON.stringify(draft.facelets);
 const result=checked?.key===key?checked.result:null;
 const affected=new Set(result&&!result.ok?result.issues.flatMap(issue=>issue.facelets):[]);
 const missing=draft.facelets.flatMap((color,i)=>color===null?[i]:[]);
 const counts=colorCounts(draft);
 function check(){setChecked({key,result:validateCube(draft.facelets)});requestAnimationFrame(()=>summary.current?.focus());}
 return <section className="review-screen" aria-labelledby="page-title">
  <a className="back-link" href="#input"><span aria-hidden="true">←</span> Back to colors</a>
  <p className="eyebrow">ONE LAST LOOK AT YOUR COLORS</p>
  <h1 id="page-title" tabIndex={-1}>Review your cube.</h1>
  <p className="review-intro">This net shows each face as viewed from outside. Compare it with your cube; use Edit to correct a face.</p>
  <p className="review-progress">{54-missing.length}/54 stickers filled · {missing.length} empty</p>
  {notice&&<p className="storage-notice" role="status">{notice}</p>}
  <div className="review-net" role="group" aria-label="Unfolded cube">
   {faces.map((face,f)=>{
    const info=faceInfo[face],offset=f*9;
    const indices=[...affected].filter(i=>Math.floor(i/9)===f);
    const empty=missing.filter(i=>Math.floor(i/9)===f);
    return <section className={`review-face net-${face}`} key={face} aria-label={`${info.color} ${info.name} review face`}>
     <h2>{info.color}<span>{info.name}</span></h2>
     <div className="review-face-grid">{Array.from({length:9},(_,position)=>{
      const index=offset+position,value=draft.facelets[index];
      return <span role="img" key={index} data-facelet={index} data-highlighted={affected.has(index)||undefined} className={`review-sticker ${value?'':'missing'} ${affected.has(index)?'flagged':''}`} style={value?{background:colors[value],color:['U','D','L','F'].includes(value)?'#10151c':'#ffffff'}:{}} aria-label={`${info.name} row ${Math.floor(position/3)+1} column ${position%3+1}: ${value?faceInfo[value].color:'empty'}${affected.has(index)?', recheck this group':''}`}><span aria-hidden="true">{value?colorLetters[value]:'?'}</span></span>;
     })}</div>
     <button type="button" className="text-button" aria-label={`Edit ${info.color} face`} onClick={()=>onEdit(face,indices.length?indices:empty)}>Edit <span aria-hidden="true">↗</span></button>
    </section>;
   })}
  </div>
  <section className="entry-counts review-counts" aria-label="Review color counts"><h2>Colors on your cube</h2>
   <ul>{faces.map(face=><li key={face}><span className="face-dot" aria-hidden="true" style={{background:colors[face]}}/><span>{faceInfo[face].color}</span><strong>{counts[face]}<span>/9</span></strong></li>)}</ul>
  </section>
  {!(result?.ok)&&<div className="review-check"><button className="button primary" type="button" onClick={check}>Check cube <span aria-hidden="true">→</span></button><p className="quiet-note">Checking never changes or erases your colors. Valid colors continue to local solving.</p></div>}
  {result&&<div ref={summary} tabIndex={-1} className={`validation-summary ${result.ok?'valid':'invalid'}`} aria-label="Cube check result">
   {result.ok?<><div role="status"><h2>Your cube is physically possible.</h2><p>The entered colors describe a standard cube that can be solved by normal turns.</p></div><SolvePanel key={result.state} state={result.state}/></>:<div role="alert"><h2>{result.issues[0].code==='incomplete'?'Some colors are still missing.':'Recheck your colors.'}</h2>
    <ul>{result.issues.map((issue,i)=><li key={i} data-error-code={issue.code}>{issue.message}</li>)}</ul>
    {affected.size>0?<p>Outlined positions show missing entries or groups to recheck. They do not identify a particular mistaken sticker. Use Edit beside a face to return to those entries.</p>:<p>No individual sticker can be identified from this check. Use Edit beside each face to compare your entries with the cube.</p>}
   </div>}
  </div>}
 </section>;
}
