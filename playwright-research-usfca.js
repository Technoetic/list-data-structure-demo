const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://www.cs.usfca.edu/~galles/visualization/Algorithms.html');
  await page.waitForTimeout(3000);

  fs.mkdirSync('.claude/screenshots', {recursive:true});
  await page.screenshot({path:'.claude/screenshots/research-usfca.png', fullPage:true});

  const content = await page.evaluate(() => document.body.innerText.substring(0,3000));
  fs.writeFileSync('.claude/research-raw-usfca.txt', content, 'utf8');

  await browser.close();
  console.log('Done');
})().catch(e => console.error('FAIL:', e.message));
