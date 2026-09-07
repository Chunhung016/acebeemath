const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const {pathToFileURL}=require('url');
const path=require('path');
const fs=require('fs');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:950},reducedMotion:'reduce'});
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.locator('#startButton').click();
  for(const theme of [0,1,2,3,4,5,6,7,8,9,10,11]){
   await page.evaluate(theme=>{
    state.theme=THEMES[theme];state.q={a:3,b:6,op:'×',answer:18};state.tokens=createTokens(state.q);state.initial=state.tokens.map(t=>({...t}));state.history=[];state.solved=false;setBackground(state.theme);renderQuestion();
    let id=0;[1,3,6].forEach((n,g)=>{for(let j=0;j<n;j++)moveToken(id++,'g'+g);});
   },theme);
   assert.deepEqual(await page.evaluate(()=>counts()),[1,3,6]);
   for(let g=0;g<3;g++)assert.equal(await page.locator(`#extract${g} [data-token]`).count(),[1,3,6][g]);
   assert.equal(await page.locator('#activity [data-token]').count(),18);
   const hitTest=await page.evaluate(()=>[...document.querySelectorAll('.container-contents [data-token]')].every(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-token]')===el;}));
   assert.ok(hitTest,'Every placed object is visible and directly draggable, theme '+theme);
   if([0,1,2,7].includes(theme)){await page.waitForFunction(()=>[...document.images].every(i=>i.complete));await page.locator('#groups').screenshot({path:path.join(__dirname,`results/visible-${theme}.png`)});}
  }
  console.log('PASS All 12 containers show exactly 1, 3, and 6 individually draggable objects without overlap.');
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{state.theme=THEMES[2];renderQuestion();});
  await page.screenshot({path:path.join(__dirname,'results/visible-flowers-phone.png'),fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log('PASS Visible flowers layout fits a 390px phone.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
