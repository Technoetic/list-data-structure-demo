var assert = require('assert');
var vm = require('vm');
var fs = require('fs');
var path = require('path');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'models', 'Song.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'models', 'DoublyLinkedList.js'), 'utf8'));

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
  var list = new DoublyLinkedList();
  var r = list.insertFirst(s1);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.complexity, 'O(1)');
});

test('insertLast', function() {
  var list = new DoublyLinkedList();
  list.insertFirst(s1);
  var r = list.insertLast(s2);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.complexity, 'O(1)');
  assert.strictEqual(r.index, 1);
});

test('insertAt middle', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.insertLast(s3);
  var r = list.insertAt(1, s2);
  assert.strictEqual(r.success, true);
  assert.strictEqual(list.toArray()[1], s2);
});

test('insertAt invalid', function() {
  var list = new DoublyLinkedList();
  assert.strictEqual(list.insertAt(-1, s1).success, false);
});

test('deleteFirst', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.deleteFirst();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'A');
  assert.strictEqual(r.complexity, 'O(1)');
});

test('deleteLast', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.deleteLast();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'B');
  assert.strictEqual(r.complexity, 'O(1)');
});

test('deleteAt middle', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.insertLast(s3);
  var r = list.deleteAt(1);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'B');
});

test('deleteCurrent', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.play(0);
  var r = list.deleteCurrent();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'A');
  assert.strictEqual(r.complexity, 'O(1)');
  assert.strictEqual(list.size(), 1);
});

test('delete from empty', function() {
  var list = new DoublyLinkedList();
  assert.strictEqual(list.deleteFirst().success, false);
  assert.strictEqual(list.deleteLast().success, false);
});

test('get with bidirectional search', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.insertLast(s3);
  var r = list.get(2);
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.song.title, 'C');
});

test('search', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  var r = list.search('B');
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.index, 1);
});

test('play next prev O(1)', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  list.insertLast(s3);
  list.play(1);
  var r = list.prev();
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.complexity, 'O(1)');
  r = list.next();
  assert.strictEqual(r.success, true);
});

test('prev at head', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.play(0);
  var r = list.prev();
  assert.strictEqual(r.success, false);
});

test('toArray', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.insertLast(s2);
  assert.strictEqual(list.toArray().length, 2);
});

test('current', function() {
  var list = new DoublyLinkedList();
  list.insertLast(s1);
  list.play(0);
  var c = list.current();
  assert.strictEqual(c.song.title, 'A');
});

console.log('DoublyLinkedList: ' + passed + '/' + total + ' passed');
if (passed < total) process.exit(1);
