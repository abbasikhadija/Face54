import {solve} from './solver';
self.onmessage=({data}:{data:{state:string}})=>{
 try {self.postMessage({ok:true,...solve(data.state)});}
 catch(e){self.postMessage({ok:false,error:String(e)});}
};
