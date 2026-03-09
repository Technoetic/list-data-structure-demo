var cp = require('child_process');
var path = require('path');

var tests = ['Song.test.js', 'ArrayList.test.js', 'SinglyLinkedList.test.js', 'DoublyLinkedList.test.js', 'CircularLinkedList.test.js'];
var failed = 0;

tests.forEach(function(t) {
  var result = cp.spawnSync('node', [path.join(__dirname, t)], { encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) failed++;
});

console.log('\n' + (failed === 0 ? 'ALL PASSED' : failed + ' suite(s) FAILED'));
process.exit(failed);
