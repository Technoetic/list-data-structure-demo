var assert = require('assert');
var vm = require('vm');
var fs = require('fs');
var path = require('path');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'models', 'Song.js'), 'utf8'));

// Test 1: constructor
var s = new Song('Dynamite', 'BTS', 199);
assert.strictEqual(s.title, 'Dynamite');
assert.strictEqual(s.artist, 'BTS');
assert.strictEqual(s.duration, 199);

// Test 2: equals - same title
var s2 = new Song('Dynamite', 'Other', 100);
assert.strictEqual(s.equals(s2), true);

// Test 3: equals - different title
var s3 = new Song('Butter', 'BTS', 165);
assert.strictEqual(s.equals(s3), false);

// Test 4: equals - null (returns falsy)
assert.ok(!s.equals(null));

// Test 5: toString
assert.strictEqual(s.toString(), 'Dynamite - BTS');

console.log('Song: 5/5 passed');
