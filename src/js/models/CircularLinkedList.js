/**
 * CNode - 원형 연결 리스트 노드
 */
class CNode {
  constructor(song) {
    this.song = song;
    this.next = null;
  }
}

/**
 * CircularLinkedList - 원형 연결 리스트 기반 플레이리스트
 * tail.next = head 구조, next()가 자동으로 처음으로 순환
 */
class CircularLinkedList {
  constructor() {
    this._tail = null;
    this._size = 0;
    this._current = null;
  }

  /**
   * head 노드 반환 (tail.next)
   * @returns {CNode|null}
   */
  getHead() {
    return this._tail ? this._tail.next : null;
  }

  // ─── 삽입 ───

  insertFirst(song) {
    var node = new CNode(song);
    if (!this._tail) {
      node.next = node;
      this._tail = node;
    } else {
      node.next = this._tail.next;
      this._tail.next = node;
    }
    this._size++;
    return { success: true, song: song, index: 0, steps: 1, complexity: 'O(1)' };
  }

  insertLast(song) {
    var node = new CNode(song);
    if (!this._tail) {
      node.next = node;
      this._tail = node;
    } else {
      node.next = this._tail.next; // new node -> head
      this._tail.next = node;      // old tail -> new node
      this._tail = node;           // new node becomes tail
    }
    this._size++;
    return { success: true, song: song, index: this._size - 1, steps: 1, complexity: 'O(1)' };
  }

  insertAt(index, song) {
    if (index < 0 || index > this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    if (index === 0) {
      return this.insertFirst(song);
    }
    if (index === this._size) {
      return this.insertLast(song);
    }
    var node = new CNode(song);
    var steps = 1;
    var curr = this._tail.next; // head
    for (var i = 0; i < index - 1; i++) {
      curr = curr.next;
      steps++;
    }
    node.next = curr.next;
    curr.next = node;
    this._size++;
    return { success: true, song: song, index: index, steps: steps, complexity: 'O(n)' };
  }

  // ─── 삭제 ───

  deleteFirst() {
    if (!this._tail) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)' };
    }
    var head = this._tail.next;
    var removed = head.song;
    if (this._current === head) {
      this._current = (this._size > 1) ? head.next : null;
    }
    if (this._tail === head) {
      // 유일한 노드
      this._tail = null;
    } else {
      this._tail.next = head.next;
    }
    this._size--;
    return { success: true, song: removed, index: 0, steps: 1, complexity: 'O(1)' };
  }

  deleteLast() {
    if (!this._tail) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var removed = this._tail.song;
    var idx = this._size - 1;
    if (this._current === this._tail) {
      this._current = (this._size > 1) ? this._tail.next : null;
    }
    if (this._tail.next === this._tail) {
      // 유일한 노드
      this._tail = null;
    } else {
      var steps = 1;
      var curr = this._tail.next; // head
      while (curr.next !== this._tail) {
        curr = curr.next;
        steps++;
      }
      curr.next = this._tail.next; // prev of tail -> head
      this._tail = curr;
    }
    this._size--;
    return { success: true, song: removed, index: idx, steps: this._size, complexity: 'O(n)' };
  }

  deleteAt(index) {
    if (index < 0 || index >= this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    if (index === 0) {
      return this.deleteFirst();
    }
    if (index === this._size - 1) {
      return this.deleteLast();
    }
    var steps = 1;
    var curr = this._tail.next; // head
    for (var i = 0; i < index - 1; i++) {
      curr = curr.next;
      steps++;
    }
    var target = curr.next;
    var removed = target.song;
    if (this._current === target) {
      this._current = target.next;
    }
    curr.next = target.next;
    this._size--;
    return { success: true, song: removed, index: index, steps: steps, complexity: 'O(n)' };
  }

  /**
   * deleteCurrent - 현재 재생 중인 곡 삭제
   * 이전 노드를 찾아야 하므로 O(n)
   */
  deleteCurrent() {
    if (!this._current || !this._tail) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var removed = this._current.song;
    var idx = this._indexOf(this._current);

    if (this._size === 1) {
      this._tail = null;
      this._current = null;
      this._size--;
      return { success: true, song: removed, index: idx, steps: 1, complexity: 'O(n)' };
    }

    // prev 노드 탐색
    var steps = 1;
    var prev = this._tail.next; // head
    while (prev.next !== this._current) {
      prev = prev.next;
      steps++;
    }
    var nextNode = this._current.next;
    prev.next = nextNode;
    if (this._current === this._tail) {
      this._tail = prev;
    }
    this._current = nextNode;
    this._size--;
    return { success: true, song: removed, index: idx, steps: steps, complexity: 'O(n)' };
  }

  // ─── 조회 ───

  get(index) {
    if (index < 0 || index >= this._size || !this._tail) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var steps = 1;
    var curr = this._tail.next; // head
    for (var i = 0; i < index; i++) {
      curr = curr.next;
      steps++;
    }
    return { success: true, song: curr.song, index: index, steps: steps, complexity: 'O(n)' };
  }

  search(title) {
    if (!this._tail) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var steps = 0;
    var curr = this._tail.next; // head
    for (var i = 0; i < this._size; i++) {
      steps++;
      if (curr.song.title === title) {
        return { success: true, song: curr.song, index: i, steps: steps, complexity: 'O(n)' };
      }
      curr = curr.next;
    }
    return { success: false, song: null, index: -1, steps: steps, complexity: 'O(n)' };
  }

  // ─── 재생 제어 ───

  play(index) {
    if (index < 0 || index >= this._size || !this._tail) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var steps = 1;
    var curr = this._tail.next; // head
    for (var i = 0; i < index; i++) {
      curr = curr.next;
      steps++;
    }
    this._current = curr;
    return { success: true, song: curr.song, index: index, steps: steps, complexity: 'O(n)' };
  }

  /**
   * next - O(1): _current = _current.next (자동 순환!)
   * @returns {{ success, song, index, steps, complexity, looped }}
   */
  next() {
    if (this._size === 0 || !this._tail) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)', looped: false };
    }
    if (!this._current) {
      this._current = this._tail.next; // head
      return { success: true, song: this._current.song, index: 0, steps: 1, complexity: 'O(1)', looped: false };
    }
    this._current = this._current.next;
    var head = this._tail.next;
    var looped = (this._current === head);
    return { success: true, song: this._current.song, index: this._indexOf(this._current), steps: 1, complexity: 'O(1)', looped: looped };
  }

  /**
   * prev - O(n): head부터 순회하여 이전 노드 탐색
   */
  prev() {
    if (this._size === 0 || !this._current || !this._tail) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)', looped: false };
    }
    var steps = 1;
    var curr = this._tail.next; // head
    while (curr.next !== this._current) {
      curr = curr.next;
      steps++;
    }
    this._current = curr;
    var head = this._tail.next;
    var looped = (this._current === this._tail);
    return { success: true, song: this._current.song, index: this._indexOf(this._current), steps: steps, complexity: 'O(n)', looped: looped };
  }

  current() {
    if (!this._current) {
      return { song: null, index: -1 };
    }
    return { song: this._current.song, index: this._indexOf(this._current) };
  }

  // ─── 유틸리티 ───

  size() {
    return this._size;
  }

  toArray() {
    var result = [];
    if (!this._tail) return result;
    var curr = this._tail.next; // head
    for (var i = 0; i < this._size; i++) {
      result.push(curr.song);
      curr = curr.next;
    }
    return result;
  }

  /**
   * 노드의 인덱스를 반환 (내부 헬퍼)
   * @param {CNode} node
   * @returns {number}
   */
  _indexOf(node) {
    if (!this._tail) return -1;
    var curr = this._tail.next; // head
    for (var i = 0; i < this._size; i++) {
      if (curr === node) return i;
      curr = curr.next;
    }
    return -1;
  }
}
