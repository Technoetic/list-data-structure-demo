/**
 * DNode - 이중 연결 리스트 노드
 */
class DNode {
  constructor(song) {
    this.song = song;
    this.prev = null;
    this.next = null;
  }
}

/**
 * DoublyLinkedList - 이중 연결 리스트 기반 플레이리스트
 * head/tail 삽입/삭제 O(1), prev() O(1) - 단일 연결 리스트 대비 핵심 장점
 */
class DoublyLinkedList {
  constructor() {
    this._head = null;
    this._tail = null;
    this._size = 0;
    this._current = null;
  }

  // ─── 삽입 ───

  insertFirst(song) {
    var node = new DNode(song);
    if (!this._head) {
      this._head = node;
      this._tail = node;
    } else {
      node.next = this._head;
      this._head.prev = node;
      this._head = node;
    }
    this._size++;
    return { success: true, song: song, index: 0, steps: 1, complexity: 'O(1)' };
  }

  insertLast(song) {
    var node = new DNode(song);
    if (!this._tail) {
      this._head = node;
      this._tail = node;
    } else {
      node.prev = this._tail;
      this._tail.next = node;
      this._tail = node;
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
    var node = new DNode(song);
    var steps = 1;
    var curr;
    // 가까운 쪽에서 탐색
    if (index <= this._size / 2) {
      curr = this._head;
      for (var i = 0; i < index; i++) {
        curr = curr.next;
        steps++;
      }
    } else {
      curr = this._tail;
      for (var i = this._size - 1; i > index; i--) {
        curr = curr.prev;
        steps++;
      }
    }
    node.next = curr;
    node.prev = curr.prev;
    curr.prev.next = node;
    curr.prev = node;
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
    if (this._head === this._tail) {
      this._head = null;
      this._tail = null;
    } else {
      this._head = this._head.next;
      this._head.prev = null;
    }
    this._size--;
    return { success: true, song: removed, index: 0, steps: 1, complexity: 'O(1)' };
  }

  deleteLast() {
    if (!this._tail) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)' };
    }
    var removed = this._tail.song;
    var idx = this._size - 1;
    if (this._current === this._tail) {
      this._current = this._tail.prev;
    }
    if (this._head === this._tail) {
      this._head = null;
      this._tail = null;
    } else {
      this._tail = this._tail.prev;
      this._tail.next = null;
    }
    this._size--;
    return { success: true, song: removed, index: idx, steps: 1, complexity: 'O(1)' };
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
    var curr;
    if (index <= this._size / 2) {
      curr = this._head;
      for (var i = 0; i < index; i++) {
        curr = curr.next;
        steps++;
      }
    } else {
      curr = this._tail;
      for (var i = this._size - 1; i > index; i--) {
        curr = curr.prev;
        steps++;
      }
    }
    var removed = curr.song;
    if (this._current === curr) {
      this._current = curr.next || curr.prev;
    }
    curr.prev.next = curr.next;
    curr.next.prev = curr.prev;
    this._size--;
    return { success: true, song: removed, index: index, steps: steps, complexity: 'O(n)' };
  }

  /**
   * deleteCurrent - 현재 재생 중인 곡 삭제 O(1)
   * 이중 연결 리스트의 핵심 장점: prev/next 포인터로 즉시 삭제
   */
  deleteCurrent() {
    if (!this._current) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)' };
    }
    var removed = this._current.song;
    var idx = this._indexOf(this._current);
    var nextCurrent = this._current.next || this._current.prev;

    if (this._current === this._head && this._current === this._tail) {
      this._head = null;
      this._tail = null;
    } else if (this._current === this._head) {
      this._head = this._current.next;
      this._head.prev = null;
    } else if (this._current === this._tail) {
      this._tail = this._current.prev;
      this._tail.next = null;
    } else {
      this._current.prev.next = this._current.next;
      this._current.next.prev = this._current.prev;
    }
    this._current = nextCurrent;
    this._size--;
    return { success: true, song: removed, index: idx, steps: 1, complexity: 'O(1)' };
  }

  // ─── 조회 ───

  get(index) {
    if (index < 0 || index >= this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var steps = 1;
    var curr;
    if (index <= this._size / 2) {
      curr = this._head;
      for (var i = 0; i < index; i++) {
        curr = curr.next;
        steps++;
      }
    } else {
      curr = this._tail;
      for (var i = this._size - 1; i > index; i--) {
        curr = curr.prev;
        steps++;
      }
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
    var curr;
    if (index <= this._size / 2) {
      curr = this._head;
      for (var i = 0; i < index; i++) {
        curr = curr.next;
        steps++;
      }
    } else {
      curr = this._tail;
      for (var i = this._size - 1; i > index; i--) {
        curr = curr.prev;
        steps++;
      }
    }
    this._current = curr;
    return { success: true, song: curr.song, index: index, steps: steps, complexity: 'O(n)' };
  }

  /**
   * next - O(1) via .next 포인터
   */
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

  /**
   * prev - O(1) via .prev 포인터 (단일 연결 리스트와의 핵심 차이!)
   */
  prev() {
    if (this._size === 0 || !this._current || !this._current.prev) {
      return { success: false, song: null, index: this._current ? 0 : -1, steps: this._current ? 1 : 0, complexity: 'O(1)' };
    }
    this._current = this._current.prev;
    return { success: true, song: this._current.song, index: this._indexOf(this._current), steps: 1, complexity: 'O(1)' };
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
   * @param {DNode} node
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
