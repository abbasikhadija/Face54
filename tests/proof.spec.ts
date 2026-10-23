import {test,expect} from '@playwright/test';
import {apply,solved,scramble} from '../src/cube';
test('production worker + WebGL + every solution step under subpath',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 console.log('Browser',await page.context().browser()?.version());
 await page.goto('http://127.0.0.1:4173/Face54/?proof=1');
 await expect(page.getByRole('heading')).toHaveText('M0 — Technical feasibility');
 await expect(page.getByRole('status')).toHaveText('Solver / mesh agreement verified',{timeout:90000});
 await expect(page.getByTestId('solution')).not.toBeEmpty();
 const moves=(await page.getByTestId('solution').innerText()).split(' ');
 const slider=page.getByRole('slider');const max=Number(await slider.getAttribute('max'));
 const initial=apply(solved,scramble);expect(initial).not.toBe(solved);
 await expect(page.getByTestId('state')).toHaveText(initial);
 await expect(page.getByTestId('visual')).toHaveText(initial);
 const scrambledPixels=await page.locator('canvas').screenshot();
 await page.screenshot({path:`test-results/${info.project.name}-scrambled.png`});
 for(let i=1;i<=max;i++){
  await slider.fill(String(i));
  const expected=apply(initial,moves.slice(0,i).join(' '));
  await expect(page.getByTestId('state')).toHaveText(expected);
  await expect(page.getByTestId('visual')).toHaveText(expected);
 }
 await expect(page.getByTestId('visual')).toHaveText(solved);
 expect((await page.locator('canvas').screenshot()).equals(scrambledPixels)).toBe(false);
 await page.screenshot({path:`test-results/${info.project.name}-solved.png`});
 console.log(info.project.name,await page.locator('main').innerText());
 expect(errors).toEqual([]);
 await slider.fill('0');await expect(page.getByTestId('visual')).toHaveText(initial);
 expect((await page.locator('canvas').screenshot()).equals(scrambledPixels)).toBe(true);
});
