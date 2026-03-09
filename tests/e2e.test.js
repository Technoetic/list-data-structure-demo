var { chromium } = require('playwright');
var path = require('path');
var assert = require('assert');

(async function() {
  var browser = await chromium.launch({ headless: true });
  var page = await browser.newPage();
  var filePath = 'file:///' + path.resolve(__dirname, '..', 'dist', 'index.html').replace(/\\/g, '/');

  var errors = [];
  page.on('pageerror', function(e) { errors.push(e.message); });

  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Test 1: Page loads without JS errors
  assert.strictEqual(errors.length, 0, 'JS errors on load: ' + errors.join('; '));
  console.log('PASS: No JS errors on load');

  // Test 2: Tab bar exists
  var tabBar = await page.$('#tab-bar');
  assert.ok(tabBar, 'Tab bar should exist');
  console.log('PASS: Tab bar exists');

  // Test 3: All 5 tabs present
  var tabs = await page.$$('#tab-bar .tab');
  assert.strictEqual(tabs.length, 5, 'Should have 5 tabs, got ' + tabs.length);
  console.log('PASS: 5 tabs present');

  // Test 4: Tab switching works
  await page.click('[data-t="sl"]');
  await page.waitForTimeout(200);
  var slPanel = await page.$('#p-sl');
  var display = await slPanel.evaluate(function(el) { return el.style.display; });
  assert.notStrictEqual(display, 'none', 'SL panel should be visible');
  console.log('PASS: Tab switching works');

  // Test 5: Node visualization container exists
  var sv = await page.$('#al-sv');
  assert.ok(sv, 'ArrayList structure view should exist');
  console.log('PASS: Structure view exists');

  // Test 6: Tracklist has songs
  await page.click('[data-t="al"]');
  await page.waitForTimeout(300);
  var tracks = await page.$$('#al-tks .track');
  assert.ok(tracks.length >= 1, 'Should have at least 1 track, got ' + tracks.length);
  console.log('PASS: Tracks rendered (' + tracks.length + ')');

  // Test 7: Compare tab renders
  await page.click('[data-t="cmp"]');
  await page.waitForTimeout(200);
  var cmpPanel = await page.$('#p-cmp');
  assert.ok(cmpPanel, 'Compare panel should exist');
  console.log('PASS: Compare tab renders');

  // Test 8: Player controls exist
  await page.click('[data-t="al"]');
  var playBtn = await page.$('#al-play');
  assert.ok(playBtn, 'Play button should exist');
  console.log('PASS: Player controls exist');

  await browser.close();
  console.log('\nE2E: ALL 8 TESTS PASSED');
})().catch(function(e) {
  console.error('E2E FAILED:', e.message);
  process.exit(1);
});
