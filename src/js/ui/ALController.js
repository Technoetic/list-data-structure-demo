/**
 * ALController - ArrayList 탭 UI 컨트롤러
 */
class ALController {
  constructor(panelId, list, renderer, logger) {
    this._panel = document.getElementById(panelId);
    this._list = list;
    this._renderer = renderer;
    this._logger = logger;
  }

  init() {
    if (!this._panel) return;
    this._nmInput = document.getElementById('al-nm');
    this._ixInput = document.getElementById('al-idx');
    var self = this;

    document.getElementById('al-add').addEventListener('click', function () { self.handleInsert(); });
    document.getElementById('al-del').addEventListener('click', function () { self.handleDelete(); });
    document.getElementById('al-find').addEventListener('click', function () { self.handleSearch(); });
    document.getElementById('al-shuf').addEventListener('click', function () { self.handleShuffle(); });
    document.getElementById('al-play').addEventListener('click', function () { self.handleToggle(); });
    document.getElementById('al-next').addEventListener('click', function () { self.handleNext(); });
    document.getElementById('al-prev').addEventListener('click', function () { self.handlePrev(); });

    this.refresh();
  }

  handleInsert() {
    var name = this._nmInput ? this._nmInput.value.trim() : '';
    var ix = this._ixInput ? parseInt(this._ixInput.value, 10) : NaN;
    if (!name) { this._logger.warn('곡 이름을 입력하세요'); return; }
    if (isNaN(ix)) ix = this._list.size();
    var song = new Song(name, 'Unknown', 200);
    var result = this._list.insertAt(ix, song);
    if (result.success) {
      this._logger.info('insertAt(' + ix + ', "' + name + '") | ' + result.complexity + ' | ' + result.steps + '개 요소 이동');
    } else {
      this._logger.error('삽입 실패: 유효하지 않은 인덱스 ' + ix);
    }
    this.refresh();
  }

  handleDelete() {
    var ix = this._ixInput ? parseInt(this._ixInput.value, 10) : -1;
    if (isNaN(ix) || ix < 0) { this._logger.warn('삭제할 인덱스를 입력하세요'); return; }
    var result = this._list.deleteAt(ix);
    if (result.success) {
      this._logger.info('deleteAt(' + ix + ') -> "' + result.song.title + '" | ' + result.complexity);
    } else {
      this._logger.error('삭제 실패: 유효하지 않은 인덱스 ' + ix);
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

  handleShuffle() {
    var result = this._list.shuffle();
    this._logger.info('shuffle() | ' + result.steps + '회 교환');
    this.refresh();
  }

  handleToggle() {
    var cur = this._list.current();
    if (!cur.song) {
      if (this._list.size() > 0) this.handlePlay(0);
    }
  }

  handlePlay(index) {
    var result = this._list.play(index);
    if (result.success) {
      this._logger.info('play(' + index + ') -> "' + result.song.title + '"');
    }
    this.refresh();
  }

  handleNext() {
    var result = this._list.next();
    if (result.success) {
      this._logger.info('next() -> "' + result.song.title + '" | ' + result.complexity);
    } else {
      this._logger.warn('next() -> 마지막 곡입니다');
    }
    this.refresh();
  }

  handlePrev() {
    var result = this._list.prev();
    if (result.success) {
      this._logger.info('prev() -> "' + result.song.title + '" | ' + result.complexity);
    } else {
      this._logger.warn('prev() -> 첫 번째 곡입니다');
    }
    this.refresh();
  }

  refresh() {
    this._renderer.renderArrayList(this._list);
    this._renderTracks();
    this._updateNowPlaying();
  }

  _updateNowPlaying() {
    var npEl = document.getElementById('al-np');
    if (!npEl) return;
    var cur = this._list.current();
    npEl.textContent = cur.song ? '▶ ' + cur.song.toString() : '곡을 클릭하거나 ▶ 버튼을 누르세요';
  }

  _renderTracks() {
    var tksEl = document.getElementById('al-tks');
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
    var cntEl = document.getElementById('al-cnt');
    if (cntEl) cntEl.textContent = arr.length + '곡';
  }
}
