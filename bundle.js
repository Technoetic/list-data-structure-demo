/**
 * Simple HTML bundler: inlines CSS and JS into a single dist/index.html
 * Usage: node bundle.js
 */
var fs = require('fs');
var path = require('path');

var srcDir = path.join(__dirname, 'src');
var distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

var html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');

// Inline CSS: replace <link rel="stylesheet" href="css/..."> with <style>content</style>
html = html.replace(/<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/g, function(match, href) {
  var cssPath = path.join(srcDir, href);
  if (fs.existsSync(cssPath)) {
    var css = fs.readFileSync(cssPath, 'utf8');
    return '<style>\n' + css + '\n</style>';
  }
  console.warn('CSS not found:', cssPath);
  return match;
});

// Inline JS: replace <script src="js/..."></script> with <script>content</script>
html = html.replace(/<script\s+src="([^"]+)"\s*><\/script>/g, function(match, src) {
  var jsPath = path.join(srcDir, src);
  if (fs.existsSync(jsPath)) {
    var js = fs.readFileSync(jsPath, 'utf8');
    return '<script>\n' + js + '\n</script>';
  }
  console.warn('JS not found:', jsPath);
  return match;
});

var outPath = path.join(distDir, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');

var size = fs.statSync(outPath).size;
console.log('Bundle created: dist/index.html (' + Math.round(size / 1024) + ' KB)');
