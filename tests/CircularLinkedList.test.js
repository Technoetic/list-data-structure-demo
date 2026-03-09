var assert = require('assert');
var vm = require('vm');
var fs = require('fs');
var path = require('path');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'models', 'Song.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'models', 'CircularLinkedList.js'), 'utf8'));

var passed = 0, total = 0;
function test(name, fn) {
  total++;
  try { fn(); passed++; }
  catch (e) { console.error('FAIL:', name, e.message); }
}

var s1 = new Song('A', 'X', 100);
var s2 = new Song('B', 'Y', 200);
var s3 = new Song('C', 'Z', 300);

test('insertFirst', function() {
  var list = new CircularLinkedList();
  var r = list.insertFirst(s1);
  assert.strictEqual(r.success, true);
  assert.strictEqual(list.size(), 1);
  assert.strictEqual(list.getHead().song.title, 'A');
});

test('insertLast', function() {
  var list = new CircularLinkedList();
  list.insertFirst(s1);
  var r = list.insertLast(s2);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.complexity, 'O(1)');
  assert.strictEqual(list.size(), 2);
});

test('insertAt', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s3);
  var r = list.insertAt(1, s2);
  assert.strictEqual(r.success, true);
  assert.strictEqual(list.toArray()[1].title, 'B');
});

test('insertAt invalid', function() {
  var list = new CircularLinkedList();
  assert.strictEqual(list.insertAt(-1, s1).success, false);
});

test('deleteFirst', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.deleteFirst();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'A');
  assert.strictEqual(list.size(), 1);
});

test('deleteLast', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.deleteLast();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'B');
});

test('deleteAt', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.insertLast(s3);
  var r = list.deleteAt(1);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'B');
});

test('deleteCurrent', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.play(0);
  var r = list.deleteCurrent();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'A');
});

test('delete from empty', function() {
  var list = new CircularLinkedList();
  assert.strictEqual(list.deleteFirst().success, false);
});

test('delete single element', function() {
  var list = new CircularLinkedList();
  list.insertFirst(s1);
  list.deleteFirst();
  assert.strictEqual(list.size(), 0);
  assert.strictEqual(list.getHead(), null);
});

test('get', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.get(1);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'B');
});

test('search', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.search('B');
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.index, 1);
});

test('search not found', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  assert.strictEqual(list.search('Z').success, false);
});

test('next wraps around (looped)', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.play(1);
  var r = list.next();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.looped, true);
  assert.strictEqual(r.index, 0);
});

test('prev', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.insertLast(s3);
  list.play(1);
  var r = list.prev();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.complexity, 'O(n)');
});

test('toArray circular', function() {
  var list = new CircularLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.insertLast(s3);
  var arr = list.toArray();
  assert.strictEqual(arr.length, 3);
  assert.strictEqual(arr[0].title, 'A');
  assert.strictEqual(arr[2].title, 'C');
});

console.log('CircularLinkedList: ' + passed + '/' + total + ' passed');
if (passed < total) process.exit(1);
