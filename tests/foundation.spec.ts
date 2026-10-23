import {test,expect} from '@playwright/test';
const url='http://127.0.0.1:4173/Face54/';

for(const viewport of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
 test(`${viewport.name}: welcome, preparation and working demo`,async({page},info)=>{
  await page.setViewportSize(viewport);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const workers:string[]=[];page.on('worker',w=>workers.push(w.url()));
  await page.goto(url);
  await expect(page.getByRole('heading',{level:1})).toContainText('Your cube.');
  const canvas=page.getByRole('group',{name:'Interactive 3D cube'});
  await expect(canvas).toBeVisible();
  await expect(page.getByRole('link',{name:'Solve my cube'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Try demo'})).toBeVisible();
  expect(workers).toHaveLength(0);
  const noOverflow=async()=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await noOverflow();
  await page.screenshot({path:`test-results/${info.project.name}-${viewport.name}-welcome.png`,fullPage:true});
  const original=await canvas.screenshot();
  await canvas.focus();await canvas.press('ArrowRight');
  expect((await canvas.screenshot()).equals(original)).toBe(false);
  await page.getByRole('button',{name:'Reset view'}).click();
  expect((await canvas.screenshot()).equals(original)).toBe(true);
  await page.getByRole('link',{name:'Solve my cube'}).click();
  await expect(page.getByRole('heading',{level:1})).toContainText('Get to know');
  await expect(page.getByRole('heading',{level:1})).toBeFocused();
  await expect(page.getByRole('link',{name:'Enter cube colors'})).toBeVisible();
  await noOverflow();
  await page.screenshot({path:`test-results/${info.project.name}-${viewport.name}-prepare.png`,fullPage:true});
  await page.goBack();await expect(page.getByRole('heading',{level:1})).toContainText('Your cube.');
  await page.getByRole('link',{name:'Try demo'}).click();
  await expect(page.getByRole('heading',{name:'Your solution is ready.',exact:true})).toBeVisible({timeout:90000});
  expect(workers).toHaveLength(1);
  await page.getByRole('button',{name:'Start guided demo',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Turn 1 of 22.');
  await page.getByRole('button',{name:'Done — next move',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Turn 2 of 22.');
  await noOverflow();
  await page.screenshot({path:`test-results/${info.project.name}-${viewport.name}-demo.png`,fullPage:true});
  await page.getByRole('button',{name:'Leave demo',exact:false}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Leave demo',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toBeFocused();
  expect(errors).toEqual([]);
 });
}

test('keyboard navigation, reduced motion, drag interaction and resize',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(url);
 await expect(page.getByRole('heading',{level:1})).toContainText('Your cube.');
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Solve my cube'})).toBeFocused();
 expect(await page.getByRole('link',{name:'Solve my cube'}).evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
 expect(await page.getByRole('link',{name:'Solve my cube'}).evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
 const canvas=page.getByRole('group',{name:'Interactive 3D cube'});
 const before=await canvas.screenshot();const box=(await canvas.boundingBox())!;
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.mouse.down();await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2+25,{steps:8});await page.mouse.up();
 expect((await canvas.screenshot()).equals(before)).toBe(false);
 await page.getByRole('button',{name:'Reset view'}).click();expect((await canvas.screenshot()).equals(before)).toBe(true);
 for(const width of [320,768,1024]){
  await page.setViewportSize({width,height:900});
  await expect.poll(async()=>Math.round((await canvas.boundingBox())!.width)).toBe(await page.locator('.cube-canvas').evaluate(el=>el.clientWidth));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 // Leaving during initialization must dispose the demo, without a late UI update.
 await page.getByRole('link',{name:'Try demo'}).click();
 await page.getByRole('link',{name:'Back to welcome'}).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('Your cube.');
 await expect(page.getByRole('slider')).toHaveCount(0);
});

test('WebGL unavailability provides readable recovery guidance',async({page})=>{
 await page.addInitScript(()=>{
  const getContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(kind:string,...args:unknown[]){
   if(kind==='webgl2')return null;
   return (getContext as Function).call(this,kind,...args);
  } as typeof getContext;
 });
 await page.goto(url);
 await expect(page.getByRole('alert')).toContainText('The 3D view needs WebGL2');
 await expect(page.getByRole('link',{name:'Solve my cube'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Reset view'})).toBeDisabled();
});

test('failed worker gives an accessible error and a way back',async({page})=>{
 await page.route('**/solver.worker-*.js',route=>route.abort());
 await page.goto(url+'#demo');
 await expect(page.getByRole('alert')).toContainText('The local solver could not load',{timeout:20000});
 await page.getByRole('link',{name:'Back to welcome'}).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('Your cube.');
});

test('touch drag, native touch reset, and keyboard reset preserve the camera state',async({browser},info)=>{
 // Test native taps before raw CDP dragging; raw injection does not reliably
 // synthesize compatibility clicks for a following gesture in these browsers.
 const context=await browser.newContext({viewport:{width:390,height:1000},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 try{
  const page=await context.newPage();await page.goto(url);
  const canvas=page.getByRole('group',{name:'Interactive 3D cube'});
  const before=await canvas.screenshot({path:`test-results/${info.project.name}-touch-before.png`});
  const reset=page.getByRole('button',{name:'Reset view'});
  await canvas.focus();await canvas.press('ArrowRight');
  expect((await canvas.screenshot()).equals(before)).toBe(false);
  await reset.tap();
  expect((await canvas.screenshot()).equals(before)).toBe(true);
  const box=(await canvas.boundingBox())!;
  const session=await context.newCDPSession(page);
  const x=box.x+box.width/2,y=box.y+box.height/2;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=6;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*10,y:y+i*3}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect((await canvas.screenshot()).equals(before)).toBe(false);
  await reset.focus();await reset.press('Enter');
  expect((await canvas.screenshot({path:`test-results/${info.project.name}-touch-after.png`})).equals(before)).toBe(true);
 }finally{await context.close();}
});
