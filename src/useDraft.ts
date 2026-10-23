import {useEffect,useRef,useState} from 'react';
import {emptyDraft} from './input';
import {readDraft,saveDraft} from './persistence';

export function useDraft(){
 const [loaded]=useState(()=>readDraft());
 const [draft,setDraft]=useState(loaded.draft);
 const [notice,setNotice]=useState(loaded.notice);
 const initial=useRef(true);
 useEffect(()=>{
  if(initial.current){initial.current=false;return;}
  if(!saveDraft(draft))setNotice('Saving is unavailable in this browser. Keep this page open to preserve your colors.');
 },[draft]);
 return {draft,setDraft,notice,reset(){setDraft(emptyDraft());setNotice('');}};
}
