var { chromium } = require('playwright');
var path = require('path');

(async function() {
  var browser = await chromium.launch({ headless: true });
  var page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  var filePath = 'file:///' + path.resolve(__dirname, 'dist', 'index.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(__dirname, 'screenshot-al.png'), fullPage: true });

  await page.click('[data-t="sl"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'screenshot-sl.png'), fullPage: true });

  await page.click('[data-t="dl"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'screenshot-dl.png'), fullPage: true });

  await page.click('[data-t="cl"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'screenshot-cl.png'), fullPage: true });

  await page.click('[data-t="cmp"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'screenshot-cmp.png'), fullPage: true });

  await browser.close();
  console.log('Screenshots saved');
})();
