/**
 * SLController - SinglyLinkedList 탭 UI 컨트롤러
 */
class SLController {
  constructor(panelId, list, renderer, logger) {
    this._panel = document.getElementById(panelId);
    this._list = list;
    this._renderer = renderer;
    this._logger = logger;
  }

  init() {
    if (!this._panel) return;
    this._nmInput = document.getElementById('sl-nm');
    var self = this;

    document.getElementById('sl-addF').addEventListener('click', function () { self.insertFront(); });
    document.getElementById('sl-addL').addEventListener('click', function () { self.insertBack(); });
    document.getElementById('sl-delF').addEventListener('click', function () { self.deleteFront(); });
    document.getElementById('sl-find').addEventListener('click', function () { self.handleSearch(); });
    document.getElementById('sl-play').addEventListener('click', function () { self.handleToggle(); });
    document.getElementById('sl-next').addEventListener('click', function () { self.handleNext(); });
    document.getElementById('sl-prev').addEventListener('click', function () { self.handlePrev(); });

    this.refresh();
  }

  insertFront() {
    var name = this._nmInput ? this._nmInput.value.trim() : '';
    if (!name) { this._logger.warn('곡 이름을 입력하세요'); return; }
    var song = new Song(name, 'Unknown', 200);
    var result = this._list.insertFirst(song);
    if (result.success) {
      this._logger.info('insertFirst("' + name + '") | ' + result.complexity + ' | ' + result.steps + '단계');
    }
    this.refresh();
  }

  insertBack() {
    var name = this._nmInput ? this._nmInput.value.trim() : '';
    if (!name) { this._logger.warn('곡 이름을 입력하세요'); return; }
    var song = new Song(name, 'Unknown', 200);
    var result = this._list.insertLast(song);
    if (result.success) {
      this._logger.info('insertLast("' + name + '") | ' + result.complexity + ' | ' + result.steps + '단계');
    }
    this.refresh();
  }

  deleteFront() {
    var result = this._list.deleteFirst();
    if (result.success) {
      this._logger.info('deleteFirst() -> "' + result.song.title + '" | ' + result.complexity);
    } else {
      this._logger.warn('삭제 실패: 리스트가 비어 있습니다');
    }
    this.refresh();
  }

  handleSearch() {
    var name = this._nmInput ? this._nmInput.value.trim() : '';
    if (!name) { this._logger.warn('검색할 곡 이름을 입력하세요'); return; }
    var result = this._list.search(name);
    if (result.success) {
      this._logger.info('search("' + name + '") -> 인덱스 ' + result.index + ' | ' + result.steps + '단계');
      this._renderer.highlightNode(result.index, 'hl');
    } else {
      this._logger.warn('search("' + name + '") -> 못 찾음 | ' + result.steps + '단계');
    }
  }

  handleToggle() {
    var cur = this._list.current();
    if (!cur.song && this._list.size() > 0) this.handlePlay(0);
  }

  handlePlay(index) {
    var result = this._list.play(index);
    if (result.success) {
      this._logger.info('play(' + index + ') -> "' + result.song.title + '" | O(n) | ' + result.steps + '단계');
    }
    this.refresh();
  }

  handleNext() {
    var result = this._list.next();
    if (result.success) {
      this._logger.info('next() -> "' + result.song.title + '" | O(1)');
    } else {
      this._logger.warn('next() -> 마지막 곡입니다');
    }
    this.refresh();
  }

  handlePrev() {
    var result = this._list.prev();
    if (result.success) {
      this._logger.info('prev() -> "' + result.song.title + '" | O(n) | ' + result.steps + '단계 (head부터 순회)');
    } else {
      this._logger.warn('prev() -> 첫 번째 곡입니다');
    }
    this.refresh();
  }

  refresh() {
    this._renderer.renderSinglyLinked(this._list);
    this._renderTracks();
    this._updateNowPlaying();
  }

  _updateNowPlaying() {
    var npEl = document.getElementById('sl-np');
    if (!npEl) return;
    var cur = this._list.current();
    npEl.textContent = cur.song ? '▶ ' + cur.song.toString() : '곡을 클릭하거나 ▶ 버튼을 누르세요';
  }

  _renderTracks() {
    var tksEl = document.getElementById('sl-tks');
    if (!tksEl) return;
    var arr = this._list.toArray();
    var cur = this._list.current();
    var html = '';
    var self = this;
    for (var i = 0; i < arr.length; i++) {
      var active = (cur.index === i) ? ' on' : '';
      html += '<div class="track' + active + '" data-ix="' + i + '">' +
        '<span class="tn">' + (i + 1) + '</span>' +
        '<span class="tt">' + arr[i].toString() + '</span></div>';
    }
    tksEl.innerHTML = html;
    var tracks = tksEl.querySelectorAll('.track');
    for (var j = 0; j < tracks.length; j++) {
      (function (idx) {
        tracks[idx].addEventListener('click', function () { self.handlePlay(idx); });
      })(j);
    }
    var cntEl = document.getElementById('sl-cnt');
    if (cntEl) cntEl.textContent = arr.length + '곡';
  }
}
