import {test,expect,type Page} from '@playwright/test';
import {apply,solved,scramble} from '../src/cube';
import {draftKey} from '../src/persistence';
const url='http://127.0.0.1:4173/Face54/';
async function seed(page:Page,state:string){
 await page.addInitScript(({key,state})=>{if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify({version:1,face:'F',facelets:[...state]}));},{key:draftKey,state});
}
const snapshot=(page:Page)=>page.evaluate(key=>localStorage.getItem(key),draftKey);
async function check(page:Page){await page.goto(url+'#review');await page.getByRole('button',{name:'Check cube',exact:true}).click();}
async function observe(page:Page){
 await page.addInitScript(()=>{
  const Native=window.Worker;
  (window as any).solverMessages=[];(window as any).solverRequests=[];(window as any).terminated=0;
  window.Worker=class extends Native{
   constructor(url:string|URL,options?:WorkerOptions){super(url,options);this.addEventListener('message',e=>(window as any).solverMessages.push(e.data));}
   postMessage(data:any){(window as any).solverRequests.push(data);super.postMessage(data);}
   terminate(){(window as any).terminated++;super.terminate();}
  };
 });
}
for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
 test(`${viewport.name}: real worker verifies entered scramble, stays responsive and preserves draft`,async({page},info)=>{
  await page.setViewportSize(viewport);await observe(page);const input=apply(solved,scramble);await seed(page,input);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'#review');const before=await snapshot(page);
  await page.getByRole('button',{name:'Check cube',exact:true}).click();
  // Main-thread evaluation and controls remain responsive while cold worker computes.
  await expect(page.getByRole('button',{name:'Cancel solving',exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>({width:innerWidth,hash:location.hash}))).toEqual({width:viewport.width,hash:'#review'});
  await expect(page.getByRole('heading',{name:'Your solution is ready.',exact:true})).toBeVisible({timeout:90000});
  const messages=await page.evaluate(()=>(window as any).solverMessages);
  const result=messages.find((m:any)=>m.type==='result');expect(result.state).toBe(input);expect(apply(input,result.solution)).toBe(solved);
  expect(messages.filter((m:any)=>m.type==='progress').map((m:any)=>m.phase)).toEqual(['preparing','solving']);
  expect(await page.evaluate(()=>(window as any).terminated)).toBe(1);expect(await snapshot(page)).toBe(before);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  console.log(JSON.stringify({browser:info.project.name,viewport:viewport.name,initMs:result.initMs,solveMs:result.solveMs}));
  await page.screenshot({path:`test-results/${info.project.name}-${viewport.name}-solution-ready.png`,fullPage:true});
  await page.getByRole('button',{name:'Edit Green face',exact:true}).click();await page.getByRole('button',{name:'Hide reference',exact:true}).click();
  await page.getByRole('group',{name:'Sticker color',exact:true}).getByRole('button',{name:'White',exact:true}).click();
  const grid=page.getByRole('group',{name:'Green Front face stickers',exact:true});
  // Pick a non-white editable slot so the stored revision actually changes.
  const position=Array.from(input.slice(18,27)).findIndex((v,i)=>i!==4&&v!=='U');
  await grid.getByRole('button',{name:new RegExp(`^Green row ${Math.floor(position/3)+1} column ${position%3+1}:`)}).click();
  expect(await snapshot(page)).not.toBe(before);
  await page.getByRole('link',{name:'Review cube',exact:true}).click();await expect(page.getByRole('heading',{name:'Your solution is ready.',exact:true})).toHaveCount(0);
  await page.reload();await expect(page.getByRole('region',{name:'Local solution',exact:true})).toHaveCount(0);expect(errors).toEqual([]);
 });
}
test('already solved input returns zero moves without preparation',async({page})=>{
 await observe(page);await seed(page,solved);await check(page);
 await expect(page.getByRole('heading',{name:'Your cube is already solved.',exact:true})).toBeFocused();
 const messages=await page.evaluate(()=>(window as any).solverMessages);expect(messages).toEqual([expect.objectContaining({type:'result',state:solved,solution:'',initMs:0,solveMs:0})]);
});
test('production worker rejects malformed and impossible input, then recovers on a legal request',async({page})=>{
 await seed(page,solved);let workerUrl='';page.on('worker',worker=>{workerUrl=worker.url();});await check(page);
 await expect(page.getByRole('heading',{name:'Your cube is already solved.',exact:true})).toBeVisible();
 const flipped=[...solved];[flipped[5],flipped[10]]=[flipped[10],flipped[5]];
 const results=await page.evaluate(async({url,invalid,state})=>{
  const worker=new Worker(url,{type:'module'});
  try{
   async function request(data:unknown){return new Promise<any>((resolve,reject)=>{
    worker.onerror=()=>reject(Error('Worker failed'));worker.onmessage=({data})=>{if(data.type!=='progress')resolve(data);};worker.postMessage(data);
   });}
   return [await request({state}),await request({type:'solve',id:1,state:invalid}),await request({type:'solve',id:2,state})];
  }finally{worker.terminate();}
 },{url:workerUrl,invalid:flipped.join(''),state:apply(solved,'R')});
 expect(results[0]).toEqual({type:'error',id:0,code:'protocol'});expect(results[1]).toEqual({type:'error',id:1,code:'invalid_input'});
 expect(results[2].type).toBe('result');expect(apply(results[2].state,results[2].solution)).toBe(solved);
});
test('cancel terminates cold work; keyboard retry uses a fresh worker',async({page})=>{
 await observe(page);await seed(page,apply(solved,scramble));await check(page);
 const before=await snapshot(page);const cancel=page.getByRole('button',{name:'Cancel solving',exact:true});await cancel.focus();await cancel.press('Enter');
 await expect(page.getByRole('heading',{name:'Solving stopped.',exact:true})).toBeFocused();expect(await page.evaluate(()=>(window as any).terminated)).toBe(1);
 const retry=page.getByRole('button',{name:'Try again',exact:true});await retry.focus();await retry.press('Enter');
 await expect(page.getByRole('heading',{name:'Your solution is ready.',exact:true})).toBeVisible({timeout:90000});
 const requests=await page.evaluate(()=>(window as any).solverRequests);expect(requests).toHaveLength(2);expect(requests[0].id).not.toBe(requests[1].id);expect(await snapshot(page)).toBe(before);
});
test('failed worker load preserves colors and retry recovers',async({page})=>{
 await seed(page,apply(solved,'R'));await page.route('**/solver.worker-*.js',route=>route.abort());await check(page);const before=await snapshot(page);
 await expect(page.getByRole('alert')).toContainText('could not load');expect(await snapshot(page)).toBe(before);
 await page.unroute('**/solver.worker-*.js');await page.getByRole('button',{name:'Try again',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Your solution is ready.',exact:true})).toBeVisible({timeout:90000});expect(await snapshot(page)).toBe(before);
});
test('leaving during computation terminates and returning cannot display old solution',async({page})=>{
 await observe(page);await seed(page,apply(solved,scramble));await check(page);
 await page.getByRole('link',{name:'Back to colors',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).terminated)).toBe(1);
 await page.getByRole('link',{name:'Review cube',exact:true}).click();await expect(page.getByRole('region',{name:'Local solution',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Check cube',exact:true})).toBeVisible();
});

// Deterministic transport fault exercises the UI's independent response verification.
test('incorrect worker output is never presented; retry can recover',async({page})=>{
 await seed(page,apply(solved,'R'));
 await page.addInitScript(()=>{
  let count=0;
  window.Worker=class {
   onmessage:((e:any)=>void)|null=null;onerror=null;onmessageerror=null;
   postMessage(request:any){const solution=++count===1?'':"R'";setTimeout(()=>this.onmessage?.({data:{type:'result',id:request.id,state:request.state,solution,initMs:0,solveMs:0}}),0);}
   terminate(){this.onmessage=null;}
  } as any;
 });
 await check(page);const before=await snapshot(page);await expect(page.getByRole('alert')).toContainText('did not pass our safety check');
 await expect(page.getByRole('heading',{name:'Your solution is ready.',exact:true})).toHaveCount(0);expect(await snapshot(page)).toBe(before);
 await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(page.getByRole('heading',{name:'Your solution is ready.',exact:true})).toBeVisible();
});
