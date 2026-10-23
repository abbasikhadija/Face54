import {test,expect,type Page} from '@playwright/test';
import {faces,solved,scramble,type Face} from '../src/cube';
import Cube from 'cubejs';
import {faceInfo} from '../src/orientation';
import {draftKey} from '../src/persistence';
const url='http://127.0.0.1:4173/Face54/';
test.use({actionTimeout:10000});
async function seed(page:Page,state:string){
 await page.addInitScript(({key,state})=>{if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify({version:1,face:'F',facelets:[...state]}));},{key:draftKey,state});
}
const snapshot=(page:Page)=>page.evaluate(key=>localStorage.getItem(key),draftKey);
const swap=(a:number,b:number)=>{const s=[...solved];[s[a],s[b]]=[s[b],s[a]];return s.join('');};
const slot=(page:Page,face:Face,r:number,c:number)=>page.getByRole('group',{name:`${faceInfo[face].color} ${faceInfo[face].name} face stickers`,exact:true}).getByRole('button',{name:new RegExp(`^${faceInfo[face].color} row ${r} column ${c}:`)});
async function hideGuide(page:Page){await page.getByRole('button',{name:'Hide reference',exact:true}).click();}
async function paint(page:Page,face:Face,r:number,c:number,color:Face){
 await hideGuide(page);await page.getByRole('group',{name:'Sticker color',exact:true}).getByRole('button',{name:faceInfo[color].color,exact:true}).click();await slot(page,face,r,c).click();
}

for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
 test(`${viewport.name}: review exact net and start local solving only after validation`,async({page},info)=>{
  await page.setViewportSize(viewport);
  const state=new Cube().move(scramble).asString();await seed(page,state);
  const workers:string[]=[];page.on('worker',w=>workers.push(w.url()));
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'#input');await page.getByRole('link',{name:'Review cube',exact:true}).click();
  const tiles=page.getByRole('group',{name:'Unfolded cube'}).getByRole('img');await expect(tiles).toHaveCount(54);
  for(let i=0;i<54;i++){
   const tile=page.locator(`[data-facelet="${i}"]`);await expect(tile).toHaveAccessibleName(`${faceInfo[faces[Math.floor(i/9)]].name} row ${Math.floor(i%9/3)+1} column ${i%3+1}: ${faceInfo[state[i] as Face].color}`);
  }
  await expect(page.getByText('54/54 stickers filled · 0 empty',{exact:true})).toBeVisible();
  expect(workers).toHaveLength(0);
  const before=await snapshot(page);await page.getByRole('button',{name:'Check cube',exact:true}).click();
  await expect(page.getByRole('status').filter({hasText:'physically possible'})).toBeVisible();
  expect(await snapshot(page)).toBe(before);
  await expect(page.getByRole('heading',{name:'Your solution is ready.',exact:true})).toBeVisible({timeout:90000});expect(workers).toHaveLength(1);
  await expect(page.getByRole('heading',{name:'Your solution is ready.',exact:true})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/${info.project.name}-${viewport.name}-review-valid.png`,fullPage:true});
  expect(errors).toEqual([]);
 });
}

test('incomplete review highlights missing entries and keeps corrections through reload',async({page})=>{
 await page.goto(url+'#review');await page.getByRole('button',{name:'Check cube',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Fill the 48 empty stickers');
 await expect(page.locator('[data-highlighted=true]')).toHaveCount(48);
 await page.getByRole('button',{name:'Edit Green face',exact:true}).click();await expect(slot(page,'F',1,1)).toHaveAttribute('aria-pressed','true');
 await expect(slot(page,'F',1,1)).toHaveAttribute('data-review-highlighted','true');
 await paint(page,'F',1,1,'B');await expect(page.locator('[data-review-highlighted=true]')).toHaveCount(0);
 await page.getByRole('link',{name:'Review cube',exact:true}).click();await expect(page.locator('.validation-summary')).toHaveCount(0);
 await page.getByRole('button',{name:'Check cube',exact:true}).click();await expect(page.getByRole('alert')).toContainText('47 empty stickers');
 await page.reload();await expect(page.locator('.validation-summary')).toHaveCount(0);
 expect(JSON.parse((await snapshot(page))!).facelets[18]).toBe('B');
});

for(const [name,state,code,highlights] of [
 ['invalid edge identity',swap(10,28),'invalid_piece_identity',true],
 ['mirrored corner',swap(9,20),'invalid_piece_identity',true],
 ['duplicate pieces',swap(10,25),'duplicate_missing_pieces',true],
 ['single flipped edge',swap(5,10),'invalid_edge_orientation',false],
 ['single twisted corner',(()=>{const s=[...solved];[s[8],s[9],s[20]]=[s[20],s[8],s[9]];return s.join('');})(),'invalid_corner_orientation',false],
 ['permutation parity',swap(10,19),'invalid_permutation_parity',false],
] as const){
 test(`rejects ${name} while preserving data and honest highlight scope`,async({page},info)=>{
  await seed(page,state);await page.goto(url+'#review');const before=await snapshot(page);
  await page.getByRole('button',{name:'Check cube',exact:true}).click();
  await expect(page.getByRole('alert').locator(`[data-error-code="${code}"]`)).toBeVisible();expect(await snapshot(page)).toBe(before);
  if(highlights){expect(await page.locator('[data-highlighted=true]').count()).toBeGreaterThan(0);await expect(page.getByRole('alert')).toContainText('do not identify a particular mistaken sticker');}
  else{await expect(page.locator('[data-highlighted=true]')).toHaveCount(0);await expect(page.getByRole('alert')).toContainText('No individual sticker');}
  if(name==='single flipped edge')await page.screenshot({path:`test-results/${info.project.name}-review-parity-error.png`,fullPage:true});
 });
}

test('wrong counts link to groups, never silently repair or erase entries',async({page})=>{
 const s=[...solved];s[18]='U';await seed(page,s.join(''));await page.goto(url+'#review');const before=await snapshot(page);
 await page.getByRole('button',{name:'Check cube',exact:true}).click();
 await expect(page.locator('[data-error-code=invalid_counts]')).toBeVisible();await expect(page.locator('[data-highlighted=true]')).toHaveCount(9);
 expect(await snapshot(page)).toBe(before);
 await page.getByRole('button',{name:'Edit Green face',exact:true}).click();await expect(slot(page,'F',1,1)).toHaveAttribute('data-review-highlighted','true');
 await paint(page,'F',1,1,'F');await page.getByRole('link',{name:'Review cube',exact:true}).click();
 await page.getByRole('button',{name:'Check cube',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'physically possible'})).toBeVisible();
});

test('global error correction requires rechecking and never carries an old success forward',async({page})=>{
 await seed(page,swap(5,10));await page.goto(url+'#review');await page.getByRole('button',{name:'Check cube',exact:true}).click();
 await page.getByRole('button',{name:'Edit White face',exact:true}).click();await paint(page,'U',2,3,'U');
 await page.getByRole('link',{name:'Review cube',exact:true}).click();await expect(page.locator('.validation-summary')).toHaveCount(0);
 await page.getByRole('button',{name:'Edit Red face',exact:true}).click();await paint(page,'R',1,2,'R');
 await page.getByRole('link',{name:'Review cube',exact:true}).click();await page.getByRole('button',{name:'Check cube',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'physically possible'})).toBeVisible();
 await page.getByRole('button',{name:'Edit Green face',exact:true}).click();await paint(page,'F',1,1,'U');
 await page.getByRole('link',{name:'Review cube',exact:true}).click();await expect(page.locator('.validation-summary')).toHaveCount(0);
 await page.getByRole('button',{name:'Check cube',exact:true}).click();await expect(page.locator('[data-error-code=invalid_counts]')).toBeVisible();
});

test('review and correction work with keyboard and native emulated touch',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url+'#review');
  const check=page.getByRole('button',{name:'Check cube',exact:true});await check.focus();await check.press('Enter');
  await expect(page.getByRole('alert')).toContainText('48 empty');
  await page.getByRole('button',{name:'Edit Green face',exact:true}).tap();
  await page.getByRole('button',{name:'Hide reference',exact:true}).tap();
  await page.getByRole('group',{name:'Sticker color',exact:true}).getByRole('button',{name:'Green',exact:true}).tap();await slot(page,'F',1,1).tap();
  await expect(slot(page,'F',1,1)).toHaveAccessibleName('Green row 1 column 1: Green');
  await page.getByRole('link',{name:'Review cube',exact:true}).tap();await page.getByRole('button',{name:'Check cube',exact:true}).tap();await expect(page.getByRole('alert')).toContainText('47 empty');
 }finally{await context.close();}
});
