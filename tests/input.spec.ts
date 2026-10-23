import {test,expect,type Page} from '@playwright/test';
import Cube from 'cubejs';
import {solved,scramble,faces,type Face} from '../src/cube';
import {entryFaces,faceInfo} from '../src/orientation';
import {draftKey} from '../src/persistence';
const url='http://127.0.0.1:4173/Face54/';
test.use({actionTimeout:10000});
const palette=(page:Page)=>page.getByRole('group',{name:'Sticker color',exact:true});
const grid=(page:Page,face:Face)=>page.getByRole('group',{name:`${faceInfo[face].color} ${faceInfo[face].name} face stickers`,exact:true});
const slot=(page:Page,face:Face,r:number,c:number)=>grid(page,face).getByRole('button',{name:new RegExp(`^${faceInfo[face].color} row ${r} column ${c}:`)});
const nav=(page:Page,face:Face)=>page.getByRole('navigation',{name:'Cube faces'}).getByRole('button',{name:new RegExp(`^${entryFaces.indexOf(face)+1}\\. ${faceInfo[face].color}`)});
async function hideGuide(page:Page){const hide=page.getByRole('button',{name:'Hide reference',exact:true});if(await hide.count())await hide.click();}
async function stored(page:Page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)??'null'),draftKey);}

for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
 test(`${viewport.name}: input corrections, incomplete navigation, counts and reload`,async({page},info)=>{
  await page.setViewportSize(viewport);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const workers:string[]=[];page.on('worker',worker=>workers.push(worker.url()));
  await page.goto(url+'#prepare');await page.getByRole('link',{name:'Enter cube colors'}).click();
  await expect(page.getByRole('heading',{level:1})).toContainText('Copy the colors.');
  await expect(page.locator('canvas[data-orientation=ready]')).toHaveAttribute('data-reference-state',solved);
  await page.screenshot({path:`test-results/${info.project.name}-${viewport.name}-input-guide.png`,fullPage:true});
  await hideGuide(page);
  const counts=page.getByRole('region',{name:'Sticker counts'});
  await expect(counts).toContainText('6/54 filled · 48 empty');
  await expect(slot(page,'F',2,2)).toBeDisabled();
  await palette(page).getByRole('button',{name:'Green',exact:true}).click();
  await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: empty');
  await slot(page,'F',1,1).click();
  await expect(slot(page,'F',1,2)).toHaveAttribute('aria-pressed','true');
  await expect(slot(page,'F',1,2)).toHaveAccessibleName('Green row 1 column 2: empty');
  await palette(page).getByRole('button',{name:'Red',exact:true}).click();
  await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: Green');
  await slot(page,'F',1,1).click();await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: Red');
  await page.getByRole('button',{name:'Next face',exact:true}).click();
  await expect(page.getByRole('complementary',{name:'Face orientation guide'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Red facing you',exact:true})).toBeFocused();
  await expect(page.getByRole('heading',{name:'Red facing you',exact:true})).toBeInViewport();
  await hideGuide(page);await slot(page,'R',3,3).click();
  await page.getByRole('button',{name:'Previous face',exact:true}).click();
  await expect(page.getByRole('complementary',{name:'Face orientation guide'})).toHaveCount(0);
  await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: Red');
  await page.getByRole('button',{name:'Clear face',exact:true}).click();
  await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: empty');
  await nav(page,'R').click();await expect(slot(page,'R',3,3)).toHaveAccessibleName('Red row 3 column 3: Red');
  await expect.poll(async()=> (await stored(page))?.facelets[17]).toBe('R');
  await page.reload();await expect(slot(page,'R',3,3)).toHaveAccessibleName('Red row 3 column 3: Red');
  await expect(page.getByRole('status')).toContainText('unfinished cube has been restored');
  await hideGuide(page);
  await page.screenshot({path:`test-results/${info.project.name}-${viewport.name}-input-editor.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);expect(workers).toHaveLength(0);
 });
}

test('all 48 editable slots reproduce the legal M0 fixture exactly, without solving it',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const state=new Cube().move(scramble).asString();
 const workers:string[]=[];page.on('worker',w=>workers.push(w.url()));
 await page.goto(url+'#input');
 for(const face of entryFaces){
  await nav(page,face).click();await hideGuide(page);
  for(let position=0;position<9;position++){
   const r=Math.floor(position/3)+1,c=position%3+1;
   if(position===4){await expect(slot(page,face,r,c)).toBeDisabled();continue;}
   const value=state[faces.indexOf(face)*9+position] as Face;
   await palette(page).getByRole('button',{name:faceInfo[value].color,exact:true}).click();
   await slot(page,face,r,c).click();
  }
  await expect(nav(page,face)).toHaveAttribute('aria-current','step');
 }
 await expect(page.getByRole('region',{name:'Sticker counts'})).toContainText('54/54 filled · 0 empty');
 await expect(page.getByRole('status')).toContainText('Physical correctness has not been checked');
 await expect.poll(async()=> (await stored(page))?.facelets.join('')).toBe(state);
 expect(workers).toHaveLength(0);
 await page.reload();
 await expect(page.getByRole('region',{name:'Sticker counts'})).toContainText('54/54 filled');
 await expect.poll(async()=> (await stored(page))?.facelets.join('')).toBe(state);
});

test('orientation for every face preserves all 54 reference stickers and can reopen',async({page})=>{
 await page.goto(url+'#input');
 for(const face of entryFaces){
  await nav(page,face).click();
  const guide=page.getByRole('complementary',{name:'Face orientation guide'});
  await expect(guide.getByRole('img',{name:'Whole-cube orientation reference'})).toHaveAttribute('data-face',face);
  await expect(guide.getByRole('img')).toHaveAttribute('data-orientation','ready');
  await expect(guide.getByRole('img')).toHaveAttribute('data-reference-state',solved);
  await expect(guide).toContainText(`${faceInfo[face].color} facing you`);
  await expect(guide).toContainText(`Above your grid${faceInfo[faceInfo[face].above].color}`);
  await expect(guide).toContainText(`To your right${faceInfo[faceInfo[face].right].color}`);
 }
 await hideGuide(page);await page.getByRole('button',{name:'Show orientation',exact:true}).click();
 await expect(page.locator('canvas[data-orientation=ready]')).toHaveAttribute('data-reference-state',solved);
 await expect(page.getByRole('region',{name:'Sticker counts'})).toContainText('6/54 filled');
});

test('keyboard editing and reduced-motion guidance',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url+'#input');
 await expect(page.locator('canvas[data-orientation=ready]')).toHaveAttribute('data-reference-state',solved);
 expect(await page.locator('.orientation-stage').evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
 await hideGuide(page);
 await slot(page,'F',1,1).focus();await slot(page,'F',1,1).press('Enter');
 await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: empty');
 const white=palette(page).getByRole('button',{name:'White',exact:true});await white.focus();await white.press('Enter');
 await slot(page,'F',1,1).focus();await slot(page,'F',1,1).press('Space');
 await expect(slot(page,'F',1,2)).toBeFocused();
 await slot(page,'F',1,2).press('ArrowDown');await expect(slot(page,'F',3,2)).toBeFocused();
 await slot(page,'F',3,2).press('Enter');
 await expect(slot(page,'F',3,2)).toHaveAccessibleName('Green row 3 column 2: White');
 await expect(slot(page,'F',2,2)).toHaveAccessibleName('Green row 2 column 2: Green, fixed center');
 await expect.poll(async()=> (await stored(page))?.facelets[25]).toBe('U');
 await page.getByRole('link',{name:'Preparation',exact:true}).click();
 await page.getByRole('link',{name:'Enter cube colors'}).click();
 await expect(slot(page,'F',3,2)).toHaveAccessibleName('Green row 3 column 2: White');
});

test('excess colors warn without erasing incomplete input; starting new requires confirmation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url+'#input');await hideGuide(page);
 await palette(page).getByRole('button',{name:'White',exact:true}).click();
 for(let i=0;i<9;i++)if(i!==4)await slot(page,'F',Math.floor(i/3)+1,i%3+1).click();
 await nav(page,'R').click();await hideGuide(page);await slot(page,'R',1,1).click();
 await expect(page.getByRole('alert')).toContainText('White has 10 stickers');
 await expect(page.getByRole('region',{name:'Sticker counts'})).toContainText('15/54 filled · 39 empty');
 await page.getByRole('button',{name:'Start new cube',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Start a new cube?'});await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('button',{name:'Keep editing'})).toBeFocused();
 await dialog.press('Escape');await expect(dialog).not.toBeVisible();
 await expect(slot(page,'R',1,1)).toHaveAccessibleName('Red row 1 column 1: White');
 await page.getByRole('button',{name:'Start new cube',exact:true}).click();
 await dialog.getByRole('button',{name:'Start new cube',exact:true}).click();
 await expect(page.getByRole('region',{name:'Sticker counts'})).toContainText('6/54 filled · 48 empty');
 await expect.poll(()=>page.evaluate(key=>localStorage.getItem(key),draftKey)).toBeNull();
});

test('rejects malformed saved input and keeps editing available',async({page})=>{
 await page.addInitScript(key=>localStorage.setItem(key,'{"version":99,"facelets":[]}'),draftKey);
 await page.goto(url+'#input');await expect(page.getByRole('status')).toContainText('could not be restored');
 await expect(page.getByRole('region',{name:'Sticker counts'})).toContainText('6/54 filled · 48 empty');
 await hideGuide(page);await palette(page).getByRole('button',{name:'Blue',exact:true}).click();await slot(page,'F',1,1).click();
 await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: Blue');
});

test('blocked storage getter and quota failure preserve in-memory edits',async({browser})=>{
 for(const mode of ['getter','write']){
  const context=await browser.newContext();
  try{
   await context.addInitScript(mode=>{
    if(mode==='getter')Object.defineProperty(window,'localStorage',{get(){throw Error('SecurityError');}});
    else Storage.prototype.setItem=function(){throw Error('QuotaExceededError');};
   },mode);
   const page=await context.newPage();await page.goto(url+'#input');await hideGuide(page);
   await palette(page).getByRole('button',{name:'Yellow',exact:true}).click();await slot(page,'F',1,1).click();
   await expect(page.getByRole('status')).toContainText('Saving is unavailable');
   await nav(page,'R').click();await nav(page,'F').click();
   await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: Yellow');
  }finally{await context.close();}
 }
});

test('touch palette and stickers preserve the smart selection rule',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url+'#input');
  await page.getByRole('button',{name:'Hide reference',exact:true}).tap();
  await palette(page).getByRole('button',{name:'Orange',exact:true}).tap();
  await expect(palette(page).getByRole('button',{name:'Orange',exact:true})).toHaveAttribute('aria-pressed','true');
  await slot(page,'F',1,1).tap();
  await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: Orange');
  await expect(slot(page,'F',1,2)).toHaveAttribute('aria-pressed','true');
  await expect(slot(page,'F',1,2)).toHaveAccessibleName('Green row 1 column 2: empty');
  await expect.poll(async()=> (await stored(page))?.facelets[18]).toBe('L');
 }finally{await context.close();}
});

test('text landmarks and editing remain available without WebGL2',async({page})=>{
 await page.addInitScript(()=>{
  const getContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(kind:string,...args:unknown[]){
   if(kind==='webgl2')return null;
   return (getContext as Function).call(this,kind,...args);
  } as typeof getContext;
 });
 await page.goto(url+'#input');
 await expect(page.getByRole('status')).toContainText('Use the center-color landmarks');
 await expect(page.getByRole('complementary',{name:'Face orientation guide'})).toContainText('Above your gridWhite');
 await hideGuide(page);
 await palette(page).getByRole('button',{name:'Green',exact:true}).click();await slot(page,'F',1,1).click();
 await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: Green');
 await expect.poll(async()=> (await stored(page))?.facelets[18]).toBe('F');
});
