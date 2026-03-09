var assert = require('assert');
var vm = require('vm');
var fs = require('fs');
var path = require('path');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'models', 'Song.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'models', 'ArrayList.js'), 'utf8'));

var passed = 0;
var total = 0;

function test(name, fn) {
  total++;
  try { fn(); passed++; }
  catch (e) { console.error('FAIL:', name, e.message); }
}

var s1 = new Song('A', 'X', 100);
var s2 = new Song('B', 'Y', 200);
var s3 = new Song('C', 'Z', 300);

// insertFirst
test('insertFirst', function() {
  var list = new ArrayList();
  var r = list.insertFirst(s1);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.index, 0);
  assert.strictEqual(list.size(), 1);
});

// insertLast
test('insertLast', function() {
  var list = new ArrayList();
  list.insertFirst(s1);
  var r = list.insertLast(s2);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.index, 1);
  assert.strictEqual(r.complexity, 'O(1)');
});

// insertAt
test('insertAt middle', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.insertLast(s3);
  var r = list.insertAt(1, s2);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.index, 1);
  assert.strictEqual(list.toArray()[1], s2);
});

// insertAt invalid
test('insertAt invalid', function() {
  var list = new ArrayList();
  var r = list.insertAt(-1, s1);
  assert.strictEqual(r.success, false);
  r = list.insertAt(5, s1);
  assert.strictEqual(r.success, false);
});

// deleteFirst
test('deleteFirst', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.deleteFirst();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song, s1);
  assert.strictEqual(list.size(), 1);
});

// deleteLast
test('deleteLast', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.deleteLast();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song, s2);
});

// deleteAt
test('deleteAt middle', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.insertLast(s3);
  var r = list.deleteAt(1);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song, s2);
  assert.strictEqual(list.size(), 2);
});

// delete from empty
test('delete from empty', function() {
  var list = new ArrayList();
  var r = list.deleteFirst();
  assert.strictEqual(r.success, false);
});

// get
test('get valid', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.get(1);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song, s2);
  assert.strictEqual(r.complexity, 'O(1)');
});

// get invalid
test('get invalid', function() {
  var list = new ArrayList();
  var r = list.get(0);
  assert.strictEqual(r.success, false);
});

// search found
test('search found', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.search('B');
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.index, 1);
  assert.strictEqual(r.steps, 2);
});

// search not found
test('search not found', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  var r = list.search('Z');
  assert.strictEqual(r.success, false);
});

// play/next/prev
test('play next prev', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.insertLast(s3);
  var r = list.play(0);
  assert.strictEqual(r.success, true);
  r = list.next();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.index, 1);
  r = list.prev();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.index, 0);
});

// next at end
test('next at end', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.play(0);
  var r = list.next();
  assert.strictEqual(r.success, false);
});

// shuffle
test('shuffle', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.insertLast(s3);
  var r = list.shuffle();
  assert.strictEqual(r.success, true);
  assert.strictEqual(list.size(), 3);
});

// toArray
test('toArray', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.insertLast(s2);
  var arr = list.toArray();
  assert.strictEqual(arr.length, 2);
  assert.strictEqual(arr[0], s1);
});

// current
test('current', function() {
  var list = new ArrayList();
  list.insertLast(s1);
  list.play(0);
  var c = list.current();
  assert.strictEqual(c.song, s1);
  assert.strictEqual(c.index, 0);
});

console.log('ArrayList: ' + passed + '/' + total + ' passed');
if (passed < total) process.exit(1);
