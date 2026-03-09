const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Visit a specific visualization page (Linked List)
  await page.goto('https://www.cs.usfca.edu/~galles/visualization/StackLL.html');
  await page.waitForTimeout(3000);

  await page.screenshot({path:'.claude/screenshots/research-usfca-stackll.png', fullPage:true});

  const content = await page.evaluate(() => document.body.innerText.substring(0,3000));
  fs.writeFileSync('.claude/research-raw-usfca-stackll.txt', content, 'utf8');

  // Also visit the Queue visualization
  await page.goto('https://www.cs.usfca.edu/~galles/visualization/QueueLL.html');
  await page.waitForTimeout(3000);

  await page.screenshot({path:'.claude/screenshots/research-usfca-queuell.png', fullPage:true});

  const content2 = await page.evaluate(() => document.body.innerText.substring(0,3000));
  fs.writeFileSync('.claude/research-raw-usfca-queuell.txt', content2, 'utf8');

  await browser.close();
  console.log('Done');
})().catch(e => console.error('FAIL:', e.message));
