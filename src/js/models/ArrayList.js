/**
 * ArrayList - 배열 기반 플레이리스트 구현
 * O(1) 인덱스 접근, splice 기반 삽입/삭제
 */
class ArrayList {
  constructor() {
    this._data = [];
    this._size = 0;
    this._currentIndex = -1;
  }

  // ─── 삽입 ───

  insertAt(index, song) {
    if (index < 0 || index > this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var steps = this._size - index; // 뒤로 밀린 요소 수
    this._data.splice(index, 0, song);
    this._size++;
    if (this._currentIndex >= index && this._currentIndex >= 0) {
      this._currentIndex++;
    }
    return { success: true, song: song, index: index, steps: steps, complexity: 'O(n)' };
  }

  insertFirst(song) {
    return this.insertAt(0, song);
  }

  insertLast(song) {
    var steps = 0; // 끝에 추가하므로 이동 없음
    this._data.push(song);
    this._size++;
    return { success: true, song: song, index: this._size - 1, steps: steps, complexity: 'O(1)' };
  }

  // ─── 삭제 ───

  deleteAt(index) {
    if (index < 0 || index >= this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(n)' };
    }
    var steps = this._size - 1 - index; // 앞으로 당긴 요소 수
    var removed = this._data.splice(index, 1)[0];
    this._size--;
    if (this._size === 0) {
      this._currentIndex = -1;
    } else if (this._currentIndex === index) {
      if (this._currentIndex >= this._size) {
        this._currentIndex = this._size - 1;
      }
    } else if (this._currentIndex > index) {
      this._currentIndex--;
    }
    return { success: true, song: removed, index: index, steps: steps, complexity: 'O(n)' };
  }

  deleteFirst() {
    return this.deleteAt(0);
  }

  deleteLast() {
    return this.deleteAt(this._size - 1);
  }

  // ─── 조회 ───

  get(index) {
    if (index < 0 || index >= this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)' };
    }
    return { success: true, song: this._data[index], index: index, steps: 1, complexity: 'O(1)' };
  }

  search(title) {
    var steps = 0;
    for (var i = 0; i < this._size; i++) {
      steps++;
      if (this._data[i].title === title) {
        return { success: true, song: this._data[i], index: i, steps: steps, complexity: 'O(n)' };
      }
    }
    return { success: false, song: null, index: -1, steps: steps, complexity: 'O(n)' };
  }

  // ─── 재생 제어 ───

  play(index) {
    if (index < 0 || index >= this._size) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)' };
    }
    this._currentIndex = index;
    return { success: true, song: this._data[index], index: index, steps: 1, complexity: 'O(1)' };
  }

  next() {
    if (this._size === 0) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)' };
    }
    if (this._currentIndex < 0) {
      this._currentIndex = 0;
    } else if (this._currentIndex < this._size - 1) {
      this._currentIndex++;
    } else {
      return { success: false, song: null, index: this._currentIndex, steps: 1, complexity: 'O(1)' };
    }
    return { success: true, song: this._data[this._currentIndex], index: this._currentIndex, steps: 1, complexity: 'O(1)' };
  }

  prev() {
    if (this._size === 0) {
      return { success: false, song: null, index: -1, steps: 0, complexity: 'O(1)' };
    }
    if (this._currentIndex <= 0) {
      return { success: false, song: null, index: this._currentIndex, steps: 1, complexity: 'O(1)' };
    }
    this._currentIndex--;
    return { success: true, song: this._data[this._currentIndex], index: this._currentIndex, steps: 1, complexity: 'O(1)' };
  }

  current() {
    if (this._currentIndex < 0 || this._currentIndex >= this._size) {
      return { song: null, index: -1 };
    }
    return { song: this._data[this._currentIndex], index: this._currentIndex };
  }

  // ─── 유틸리티 ───

  size() {
    return this._size;
  }

  toArray() {
    var result = [];
    for (var i = 0; i < this._size; i++) {
      result.push(this._data[i]);
    }
    return result;
  }

  shuffle() {
    var steps = 0;
    for (var i = this._size - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = this._data[i];
      this._data[i] = this._data[j];
      this._data[j] = temp;
      steps++;
    }
    this._currentIndex = -1;
    return { success: true, song: null, index: -1, steps: steps, complexity: 'O(n)' };
  }
}
