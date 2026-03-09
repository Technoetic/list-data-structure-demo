/**
 * SNode - 단일 연결 리스트 노드
 */
class SNode {
  constructor(song) {
    this.song = song;
    this.next = null;
  }
}

/**
 * SinglyLinkedList - 단일 연결 리스트 기반 플레이리스트
 * head 삽입/삭제 O(1), tail/임의 위치 O(n)
 */
class SinglyLinkedList {
  constructor() {
    this._head = null;
    this._size = 0;
    this._current = null;
  }

  // ─── 삽입 ───

  insertFirst(song) {
    var node = new SNode(song);
    node.next = this._head;
    this._head = node;
    this._size++;
    return { success: true, song: song, index: 0, steps: 1, complexity: 'O(1)' };
  }

  insertLast(song) {
    var node = new SNode(song);
    if (!this._head) {
      this._head = node;
      this._size++;
      return { success: true, song: song, index: 0, steps: 1, complexity: 'O(n)' };
    }
    var steps = 1;
    var curr = this._head;
    while (curr.next) {
      curr = curr.next;
      steps++;
    }
    curr.next = node;
    this._size++;
    return { success: true, song: song, index: this._size - 1, steps: steps, complexity: 'O(n)' };
  }

  insertAt(index, song) {
    if (index < 0 || index > this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    if (index === 0) {
      return this.insertFirst(song);
    }
    var node = new SNode(song);
    var steps = 1;
    var curr = this._head;
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
    if (!this._head) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)' };
    }
    var removed = this._head.song;
    if (this._current === this._head) {
      this._current = this._head.next;
    }
    this._head = this._head.next;
    this._size--;
    return { success: true, song: removed, index: 0, steps: 1, complexity: 'O(1)' };
  }

  deleteLast() {
    if (!this._head) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    if (!this._head.next) {
      var removed = this._head.song;
      if (this._current === this._head) {
        this._current = null;
      }
      this._head = null;
      this._size--;
      return { success: true, song: removed, index: 0, steps: 1, complexity: 'O(n)' };
    }
    var steps = 1;
    var curr = this._head;
    while (curr.next.next) {
      curr = curr.next;
      steps++;
    }
    var removed = curr.next.song;
    if (this._current === curr.next) {
      this._current = curr;
    }
    curr.next = null;
    this._size--;
    return { success: true, song: removed, index: this._size, steps: steps, complexity: 'O(n)' };
  }

  deleteAt(index) {
    if (index < 0 || index >= this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    if (index === 0) {
      return this.deleteFirst();
    }
    var steps = 1;
    var curr = this._head;
    for (var i = 0; i < index - 1; i++) {
      curr = curr.next;
      steps++;
    }
    var removed = curr.next.song;
    if (this._current === curr.next) {
      this._current = curr.next.next || curr;
    }
    curr.next = curr.next.next;
    this._size--;
    return { success: true, song: removed, index: index, steps: steps, complexity: 'O(n)' };
  }

  // ─── 조회 ───

  get(index) {
    if (index < 0 || index >= this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var steps = 1;
    var curr = this._head;
    for (var i = 0; i < index; i++) {
      curr = curr.next;
      steps++;
    }
    return { success: true, song: curr.song, index: index, steps: steps, complexity: 'O(n)' };
  }

  search(title) {
    var steps = 0;
    var curr = this._head;
    var index = 0;
    while (curr) {
      steps++;
      if (curr.song.title === title) {
        return { success: true, song: curr.song, index: index, steps: steps, complexity: 'O(n)' };
      }
      curr = curr.next;
      index++;
    }
    return { success: false, song: null, index: -1, steps: steps, complexity: 'O(n)' };
  }

  // ─── 재생 제어 ───

  play(index) {
    if (index < 0 || index >= this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var steps = 1;
    var curr = this._head;
    for (var i = 0; i < index; i++) {
      curr = curr.next;
      steps++;
    }
    this._current = curr;
    return { success: true, song: curr.song, index: index, steps: steps, complexity: 'O(n)' };
  }

  next() {
    if (this._size === 0) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)' };
    }
    if (!this._current) {
      this._current = this._head;
      return { success: true, song: this._current.song, index: 0, steps: 1, complexity: 'O(1)' };
    }
    if (!this._current.next) {
      return { success: false, song: null, index: this._indexOf(this._current), steps: 1, complexity: 'O(1)' };
    }
    this._current = this._current.next;
    return { success: true, song: this._current.song, index: this._indexOf(this._current), steps: 1, complexity: 'O(1)' };
  }

  prev() {
    if (this._size === 0 || !this._current || this._current === this._head) {
      return { success: false, song: null, index: this._current ? 0 : -1, steps: this._current ? 1 : 0, complexity: 'O(n)' };
    }
    var steps = 1;
    var curr = this._head;
    while (curr.next !== this._current) {
      curr = curr.next;
      steps++;
    }
    this._current = curr;
    return { success: true, song: curr.song, index: this._indexOf(curr), steps: steps, complexity: 'O(n)' };
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
    var curr = this._head;
    while (curr) {
      result.push(curr.song);
      curr = curr.next;
    }
    return result;
  }

  /**
   * 노드의 인덱스를 반환 (내부 헬퍼)
   * @param {SNode} node
   * @returns {number}
   */
  _indexOf(node) {
    var idx = 0;
    var curr = this._head;
    while (curr) {
      if (curr === node) return idx;
      curr = curr.next;
      idx++;
    }
    return -1;
  }
}
