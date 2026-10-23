import {test,expect,type Page} from '@playwright/test';
import {apply,faces,solved,scramble} from '../src/cube';
import {inverseMove} from '../src/playback';
import {draftKey} from '../src/persistence';
const url='http://127.0.0.1:4173/Face54/';
const cube=(page:Page)=>page.getByRole('group',{name:'Interactive 3D cube'});
const done=(page:Page)=>page.getByRole('button',{name:'Done — next move',exact:true});
async function seed(page:Page,state:string,solution?:string){
 await page.addInitScript(({key,state})=>{if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify({version:1,face:'F',facelets:[...state]}));},{key:draftKey,state});
 if(solution!==undefined)await page.addInitScript(solution=>{
  window.Worker=class {
   onmessage:((event:any)=>void)|null=null;onerror=null;onmessageerror=null;
   postMessage(request:any){setTimeout(()=>this.onmessage?.({data:{type:'result',id:request.id,state:request.state,solution,initMs:0,solveMs:0}}),0);}
   terminate(){this.onmessage=null;}
  } as any;
 },solution);
}
async function start(page:Page){
 await page.goto(url+'#review');await page.getByRole('button',{name:'Check cube',exact:true}).click();
 await page.getByRole('button',{name:'Start guided solving',exact:true}).click();await expect(done(page)).toBeEnabled();
}
for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
 test(`${viewport.name}: real demo follows every confirmed move to completion`,async({page},info)=>{
  await page.setViewportSize(viewport);await page.goto(url+'#demo');await page.getByRole('button',{name:'Start guided demo',exact:true}).click({timeout:90000});
  let state=apply(solved,scramble);await expect(cube(page)).toHaveAttribute('data-rendered-state',state);
  await expect(page.getByRole('slider')).toHaveCount(0);await expect(page.getByRole('button',{name:'Show solved cube'})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Turn 1 of 22.',exact:true})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/${info.project.name}-${viewport.name}-guided.png`,fullPage:true});
  for(let i=0;i<22;i++){
   const move=await page.locator('.current-turn code').innerText();state=apply(state,move);await done(page).click();
   await expect(cube(page)).toHaveAttribute('data-rendered-state',state);
   await expect(page.getByText(`${i+1} of 22 moves confirmed`,{exact:true})).toBeVisible();
  }
  expect(state).toBe(solved);await expect(page.getByRole('heading',{name:'Every turn complete.',exact:true})).toBeFocused();
  await expect(page.getByText('Demo solved. Every color is back in place.',{exact:true})).toBeVisible();
  await page.screenshot({path:`test-results/${info.project.name}-${viewport.name}-complete.png`,fullPage:true});
  await page.getByRole('button',{name:'Previous — undo a turn',exact:true}).click();
  await expect(cube(page)).toHaveAttribute('data-rendered-state',solved);await expect(page.getByRole('alert')).toContainText('Undo the previous physical turn');
  await page.getByRole('button',{name:'I undid this turn',exact:true}).click();await expect(page.getByText('21 of 22 moves confirmed',{exact:true})).toBeVisible();
  await done(page).click();await page.getByRole('button',{name:'Solve another cube',exact:true}).click();await expect(page.getByRole('link',{name:'Enter cube colors'})).toBeVisible();
 });
}
test('all 18 animated previews agree with canonical endpoints, restore state, and never confirm a turn',async({page},info)=>{
 const moves=faces.flatMap(f=>['',"'",'2'].map(s=>f+s));
 const initial=apply(solved,[...moves].reverse().map(inverseMove).join(' '));await seed(page,initial,moves.join(' '));await start(page);
 let state=initial;
 for(let i=0;i<moves.length;i++){
  await page.getByRole('button',{name:'Preview this turn',exact:true}).click();await expect(done(page)).toBeDisabled();
  if(i===0){await page.waitForTimeout(250);await page.screenshot({path:`test-results/${info.project.name}-turn-preview.png`,fullPage:true});}
  await expect(page.getByText(`${i} of 18 moves confirmed`,{exact:true})).toBeVisible();
  await expect(cube(page)).toHaveAttribute('data-preview','ready');
  await expect(cube(page)).toHaveAttribute('data-preview-end-state',apply(state,moves[i]));
  await expect(cube(page)).toHaveAttribute('data-rendered-state',state);
  await expect(page.locator('.current-turn code')).toHaveText(moves[i]);await expect(done(page)).toBeEnabled();
  state=apply(state,moves[i]);await done(page).click();await expect(cube(page)).toHaveAttribute('data-rendered-state',state);
 }
 expect(state).toBe(solved);
});
test('camera inspection/reset, repeated reduced-motion preview and explicit undo preserve synchronization',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const state=apply(solved,'R U F');await seed(page,state,"F' U' R'");await start(page);
 const initial=await cube(page).screenshot();await cube(page).focus();await cube(page).press('ArrowRight');expect((await cube(page).screenshot()).equals(initial)).toBe(false);
 await expect(page.locator('.current-turn code')).toHaveText("F'");await expect(cube(page)).toHaveAttribute('data-rendered-state',state);
 await page.getByRole('button',{name:'Reset view',exact:false}).click();expect((await cube(page).screenshot()).equals(initial)).toBe(true);
 for(let i=0;i<2;i++){await page.getByRole('button',{name:'Preview this turn',exact:true}).click();await expect(cube(page)).toHaveAttribute('data-preview','ready');await expect(page.getByText('0 of 3 moves confirmed',{exact:true})).toBeVisible();}
 await done(page).focus();await done(page).press('Enter');const after=apply(state,"F'");await expect(cube(page)).toHaveAttribute('data-rendered-state',after);
 await page.getByRole('button',{name:'Previous — undo a turn',exact:true}).click();await expect(page.getByRole('heading',{name:'Undo turn 1.',exact:true})).toBeFocused();
 await expect(cube(page)).toHaveAttribute('data-rendered-state',after);await expect(page.locator('.current-turn code')).toHaveText('F');
 await page.getByRole('button',{name:'Keep current step',exact:true}).click();await expect(page.getByText('1 of 3 moves confirmed',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Previous — undo a turn',exact:true}).click();await page.getByRole('button',{name:'Preview this turn',exact:true}).click();await expect(cube(page)).toHaveAttribute('data-preview','ready');
 await expect(cube(page)).toHaveAttribute('data-preview-end-state',state);await expect(page.getByText('1 of 3 moves confirmed',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'I undid this turn',exact:true}).click();await expect(cube(page)).toHaveAttribute('data-rendered-state',state);await expect(page.getByRole('button',{name:'Previous — undo a turn',exact:true})).toHaveCount(0);
});
test('leaving/reloading never restores physical progress or modifies saved colors',async({page})=>{
 const state=apply(solved,'R U');await seed(page,state,"U' R'");await start(page);const before=await page.evaluate(key=>localStorage.getItem(key),draftKey);
 await done(page).click();await page.getByRole('button',{name:'Return to colors',exact:false}).click();
 await expect(page.getByRole('dialog')).toContainText('re-enter its current colors');await expect(page.getByRole('button',{name:'Keep solving',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(page.getByText('1 of 2 moves confirmed',{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'Recheck your current cube.',exact:true})).toBeVisible();await expect(done(page)).toHaveCount(0);
 expect(await page.evaluate(key=>localStorage.getItem(key),draftKey)).toBe(before);
 await page.getByRole('link',{name:'Return to colors',exact:true}).click();await page.getByRole('link',{name:'Review cube',exact:true}).click();await expect(page.getByRole('button',{name:'Check cube',exact:true})).toBeVisible();
});
test('zero-move completion and solve another clear only the completed real draft',async({page})=>{
 await seed(page,solved);await page.goto(url+'#review');await page.getByRole('button',{name:'Check cube',exact:true}).click();await page.getByRole('button',{name:'View solved cube',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Your cube is already solved.',exact:true})).toBeVisible();await expect(cube(page)).toHaveAttribute('data-rendered-state',solved);await expect(done(page)).toHaveCount(0);
 await page.getByRole('button',{name:'Solve another cube',exact:true}).click();expect(await page.evaluate(key=>localStorage.getItem(key),draftKey)).toBe(null);
});
test('unavailable WebGL blocks physical move confirmation and keeps exit available',async({page})=>{
 await seed(page,apply(solved,'R'),"R'");await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind:string,...args:unknown[]){return kind==='webgl2'?null:(original as Function).call(this,kind,...args);} as typeof original;});
 await page.goto(url+'#review');await page.getByRole('button',{name:'Check cube',exact:true}).click();await page.getByRole('button',{name:'Start guided solving',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('WebGL2');await expect(done(page)).toBeDisabled();await expect(page.getByRole('button',{name:'Preview this turn',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Return to colors',exact:false}).click();await page.getByRole('dialog').getByRole('button',{name:'Return to colors',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toContainText('Copy the colors');
});
test('mobile native touch brings the preview into view and confirms exactly one move',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});const state=apply(solved,'R');await seed(page,state,"R'");await start(page);
  await page.getByRole('button',{name:'Preview this turn',exact:true}).tap();await expect(cube(page)).toBeInViewport();await expect(cube(page)).toHaveAttribute('data-preview','ready');
  await expect(page.getByText('0 of 1 moves confirmed',{exact:true})).toBeVisible();await expect(cube(page)).toHaveAttribute('data-rendered-state',state);
  await done(page).tap();await expect(page.getByRole('heading',{name:'Every turn complete.',exact:true})).toBeVisible();await expect(cube(page)).toHaveAttribute('data-rendered-state',solved);
 }finally{await context.close();}
});
