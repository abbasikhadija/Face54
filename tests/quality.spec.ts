import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {apply,solved} from '../src/cube';
import {draftKey} from '../src/persistence';
const url='http://127.0.0.1:4173/Face54/';
async function accessible(page:Page){
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
}
async function fixture(page:Page){
 await page.addInitScript(({key,state})=>localStorage.setItem(key,JSON.stringify({version:1,face:'F',facelets:[...state]})),{key:draftKey,state:apply(solved,'R')});
 await page.addInitScript(()=>{window.Worker=class{onmessage:((e:any)=>void)|null=null;onerror=null;onmessageerror=null;postMessage(r:any){setTimeout(()=>this.onmessage?.({data:{type:'result',id:r.id,state:r.state,solution:"R'",initMs:0,solveMs:0}}),0);}terminate(){this.onmessage=null;}} as any;});
}
test('automated WCAG checks cover welcome, preparation, input, invalid review and new-cube dialog',async({page})=>{
 await page.goto(url);await expect(page.locator('canvas[data-rendered-state]')).toBeVisible();await accessible(page);
 await page.getByRole('link',{name:'Solve my cube',exact:true}).click();await expect(page.locator('canvas[data-rendered-state]')).toBeVisible();await accessible(page);
 await page.getByRole('link',{name:'Enter cube colors',exact:false}).click();await expect(page.locator('canvas[data-orientation=ready]')).toBeVisible();await accessible(page);
 await page.getByRole('button',{name:'Hide reference',exact:true}).click();
 await page.getByRole('group',{name:'Sticker color',exact:true}).getByRole('button',{name:'Green',exact:true}).click();
 await page.getByRole('group',{name:'Green Front face stickers',exact:true}).getByRole('button',{name:'Green row 1 column 1: empty',exact:true}).click();
 await page.getByRole('button',{name:'Start new cube',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await accessible(page);await page.keyboard.press('Escape');
 await page.getByRole('link',{name:'Review cube',exact:true}).click();await page.getByRole('button',{name:'Check cube',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();await accessible(page);
});
test('automated WCAG checks cover valid review, playback, undo, exit dialog and completion',async({page})=>{
 await fixture(page);await page.goto(url+'#review');await page.getByRole('button',{name:'Check cube',exact:true}).click();await expect(page.getByRole('button',{name:'Start guided solving',exact:true})).toBeVisible();await accessible(page);
 await page.getByRole('button',{name:'Start guided solving',exact:true}).click();await expect(page.getByRole('button',{name:'Done — next move',exact:true})).toBeEnabled();await accessible(page);
 await page.getByRole('button',{name:'Done — next move',exact:true}).click();await expect(page.getByRole('heading',{name:'Every turn complete.',exact:true})).toBeVisible();await accessible(page);
 await page.getByRole('button',{name:'Previous — undo a turn',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();await accessible(page);
 await page.getByRole('button',{name:'Return to colors',exact:false}).click();await expect(page.getByRole('dialog')).toBeVisible();await accessible(page);
});
test('graphics context loss cancels previews and blocks physical confirmation without changing colors',async({page})=>{
 await fixture(page);await page.goto(url+'#review');await page.getByRole('button',{name:'Check cube',exact:true}).click();await page.getByRole('button',{name:'Start guided solving',exact:true}).click();
 const done=page.getByRole('button',{name:'Done — next move',exact:true});await expect(done).toBeEnabled();const before=await page.evaluate(key=>localStorage.getItem(key),draftKey);
 await page.getByRole('button',{name:'Preview this turn',exact:true}).click();await expect(done).toBeDisabled();
 await page.locator('canvas').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 await expect(page.getByRole('alert')).toContainText('graphics connection was lost');await expect(done).toBeDisabled();await expect(page.getByRole('button',{name:'Preview this turn',exact:true})).toBeDisabled();
 await expect(page.getByText('0 of 1 moves confirmed',{exact:true})).toBeVisible();expect(await page.evaluate(key=>localStorage.getItem(key),draftKey)).toBe(before);
});
test('renderer chunk failure keeps input usable and explains recovery',async({page})=>{
 await page.route('**/viewer-*.js',route=>route.abort());await page.goto(url+'#input');
 await expect(page.getByText('The 3D reference is unavailable. Use the center-color landmarks below.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Hide reference',exact:true}).click();await expect(page.getByRole('group',{name:'Green Front face stickers',exact:true})).toBeVisible();
 await page.goto(url);await expect(page.getByRole('alert')).toContainText('could not load');await expect(page.getByRole('link',{name:'Solve my cube',exact:true})).toBeVisible();
});
test('320px reflow, 200% zoom and reduced-motion preview retain usable controls',async({page},info)=>{
 await fixture(page);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:844});await page.goto(url+'#review');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:'Check cube',exact:true}).click();await page.getByRole('button',{name:'Start guided solving',exact:true}).click();await expect(page.getByRole('button',{name:'Done — next move',exact:true})).toBeEnabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await accessible(page);
 await page.getByRole('button',{name:'Preview this turn',exact:true}).click();await expect(page.locator('canvas')).toHaveAttribute('data-preview','ready');await expect(page.getByText('0 of 1 moves confirmed',{exact:true})).toBeVisible();
 await page.screenshot({path:`test-results/${info.project.name}-320-guidance.png`,fullPage:true});
 await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>{document.documentElement.style.zoom='2';});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('button',{name:'Done — next move',exact:true})).toBeEnabled();await accessible(page);
 await page.screenshot({path:`test-results/${info.project.name}-zoom-guidance.png`,fullPage:true});
});
test('production assets use the repository base and ship license notices without external services',async({page,request},info)=>{
 const external:string[]=[];page.on('request',r=>{if(!r.url().startsWith(url)&&!r.url().startsWith('data:'))external.push(r.url());});
 const started=Date.now();await page.goto(url+'#review');await expect(page.getByRole('heading',{name:'Review your cube.',exact:true})).toBeVisible();
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name));expect(resources.some(name=>/\/viewer-.*\.js/.test(name))).toBe(false);
 const notices=await request.get(url+'THIRD_PARTY_NOTICES.txt');expect(notices.status()).toBe(200);for(const name of ['cubejs','react-dom','scheduler','three'])expect(await notices.text()).toContain(name);
 await page.goto(url);await expect(page.locator('canvas[data-rendered-state]')).toBeVisible();expect(external).toEqual([]);
 console.log(JSON.stringify({browser:info.project.name,reviewThenWelcomeMs:Date.now()-started,resources:await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>({name:e.name.split('/').at(-1),bytes:(e as PerformanceResourceTiming).encodedBodySize})))}));
});
