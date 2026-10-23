import {prepare,compute} from './solver';
import {handleSolve} from './solverProtocol';
self.onmessage=({data})=>{
 handleSolve(data,message=>self.postMessage(message),{prepare,compute});
};
