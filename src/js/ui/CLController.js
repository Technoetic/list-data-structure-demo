/**
 * CLController - CircularLinkedList 탭 UI 컨트롤러
 */
class CLController {
  constructor(panelId, list, renderer, logger) {
    this._panel = document.getElementById(panelId);
    this._list = list;
    this._renderer = renderer;
    this._logger = logger;
    this._autoInterval = null;
    this._autoPlaying = false;
  }

  init() {
    if (!this._panel) return;
    this._nmInput = document.getElementById('cl-nm');
    var self = this;

    document.getElementById('cl-add').addEventListener('click', function () { self.insert(); });
    document.getElementById('cl-delC').addEventListener('click', function () { self.deleteCurrent(); });
    document.getElementById('cl-find').addEventListener('click', function () { self.handleSearch(); });
    document.getElementById('cl-play').addEventListener('click', function () { self.handleToggle(); });
    document.getElementById('cl-next').addEventListener('click', function () { self.handleNext(); });
    document.getElementById('cl-prev').addEventListener('click', function () { self.handlePrev(); });
    document.getElementById('cl-auto').addEventListener('click', function () { self.autoToggle(); });

    this.refresh();
  }

  insert() {
    var name = this._nmInput ? this._nmInput.value.trim() : '';
    if (!name) { this._logger.warn('곡 이름을 입력하세요'); return; }
    var song = new Song(name, 'Unknown', 200);
    var result = this._list.insertLast(song);
    if (result.success) {
      this._logger.info('insertLast("' + name + '") | ' + result.complexity);
    }
    this.refresh();
  }

  deleteCurrent() {
    var result = this._list.deleteCurrent();
    if (result.success) {
      this._logger.info('deleteCurrent() -> "' + result.song.title + '" | ' + result.complexity);
    } else {
      this._logger.warn('삭제 실패: 현재 재생 중인 곡이 없습니다');
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
      this._logger.info('play(' + index + ') -> "' + result.song.title + '"');
    }
    this.refresh();
  }

  handleNext() {
    var result = this._list.next();
    if (result.success) {
      var msg = 'next() -> "' + result.song.title + '" | O(1)';
      if (result.looped) msg += ' | 🔁 처음으로 순환!';
      this._logger.info(msg);
    } else {
      this._logger.warn('next() -> 리스트가 비어 있습니다');
    }
    this.refresh();
  }

  handlePrev() {
    var result = this._list.prev();
    if (result.success) {
      var msg = 'prev() -> "' + result.song.title + '" | O(n) | ' + result.steps + '단계';
      if (result.looped) msg += ' | 🔁 끝으로 순환!';
      this._logger.info(msg);
    } else {
      this._logger.warn('prev() -> 리스트가 비어 있습니다');
    }
    this.refresh();
  }

  autoToggle() {
    var self = this;
    var btnEl = document.getElementById('cl-auto');
    if (this._autoPlaying) {
      clearInterval(this._autoInterval);
      this._autoInterval = null;
      this._autoPlaying = false;
      if (btnEl) btnEl.classList.remove('on');
      this._logger.info('자동 반복 재생 중지');
    } else {
      if (this._list.size() === 0) {
        this._logger.warn('리스트가 비어 자동 재생 불가');
        return;
      }
      var cur = this._list.current();
      if (!cur.song) this._list.play(0);
      this._autoPlaying = true;
      if (btnEl) btnEl.classList.add('on');
      this._logger.info('🔁 자동 반복 재생 시작');
      this._autoInterval = setInterval(function () { self.handleNext(); }, 2000);
    }
  }

  refresh() {
    this._renderer.renderCircularLinked(this._list);
    this._renderTracks();
    this._updateNowPlaying();
  }

  _updateNowPlaying() {
    var npEl = document.getElementById('cl-np');
    if (!npEl) return;
    var cur = this._list.current();
    npEl.textContent = cur.song ? '▶ ' + cur.song.toString() : '곡을 클릭하거나 ▶ 버튼을 누르세요';
  }

  _renderTracks() {
    var tksEl = document.getElementById('cl-tks');
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
    var cntEl = document.getElementById('cl-cnt');
    if (cntEl) cntEl.textContent = arr.length + '곡';
  }
}
