/**
 * NodeRenderer - 자료구조별 노드 시각화 렌더러
 *
 * 각 자료구조(ArrayList, SinglyLinked, DoublyLinked, CircularLinked)에 대해
 * HTML 기반 노드 다이어그램을 렌더링한다.
 *
 * Class-oriented vanilla JS, no ES modules.
 */

// eslint-disable-next-line no-unused-vars
var NodeRenderer = (function () {
  'use strict';

  /**
   * @constructor
   * @param {HTMLElement} containerEl - 노드를 렌더링할 컨테이너 요소
   */
  function NodeRenderer(containerEl) {
    if (!containerEl) {
      throw new Error('NodeRenderer: containerEl is required');
    }
    this._container = containerEl;
  }

  // ---------------------------------------------------------------------------
  // 내부 유틸리티
  // ---------------------------------------------------------------------------

  /**
   * HTML 특수 문자를 이스케이프한다.
   * @param {string} str - 원본 문자열
   * @returns {string} 이스케이프된 문자열
   */
  NodeRenderer.prototype._escapeHtml = function (str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  /**
   * 제목을 최대 4자로 잘라 반환한다.
   * @param {string} title - 원본 제목
   * @returns {string} 잘린 제목
   */
  NodeRenderer.prototype._truncateTitle = function (title) {
    if (!title) return '';
    return title;
  };

  /**
   * 빈 목록 안내 HTML을 반환한다.
   * @returns {string} 빈 목록 HTML
   */
  NodeRenderer.prototype._emptyHtml = function () {
    return '<span style="color:var(--dim)">\uBE48 \uBAA9\uB85D</span>';
  };

  /**
   * 리스트에서 배열과 현재 인덱스를 추출한다.
   * @param {Object} list - toArray(), current() 메서드를 가진 리스트 객체
   * @returns {{ arr: Array, curIdx: number }}
   */
  NodeRenderer.prototype._extractListData = function (list) {
    var arr = list.toArray();
    var cur = list.current();
    var curIdx = cur ? cur.index : -1;
    return { arr: arr, curIdx: curIdx };
  };

  // ---------------------------------------------------------------------------
  // 노드 블록 생성 헬퍼
  // ---------------------------------------------------------------------------

  /**
   * 단일 노드 블록 HTML을 생성한다.
   * @param {string} title   - 곡 제목
   * @param {string} subText - 하위 텍스트 (인덱스 또는 "node")
   * @param {boolean} isCurrent - 현재 재생 중 여부
   * @param {string} [tagClass] - 추가 CSS 클래스 (hd-t, tl-t 등)
   * @returns {string} HTML 문자열
   */
  NodeRenderer.prototype._buildNodeBlock = function (title, subText, isCurrent, tagClass) {
    var cls = isCurrent ? ' cur' : '';
    if (tagClass) {
      cls += ' ' + tagClass;
    }
    var safeTitle = this._escapeHtml(this._truncateTitle(title));
    var safeSub = this._escapeHtml(subText);
    return '<div class="n">' +
      '<div class="nb' + cls + '">' +
      '<span class="vl">' + safeTitle + '</span>' +
      '<span class="su">' + safeSub + '</span>' +
      '</div>' +
      '</div>';
  };

  /**
   * 화살표 HTML을 생성한다.
   * @param {string} symbol - 화살표 문자 (→, ⇄, │, ← 등)
   * @param {boolean} [isActive] - 활성 상태 여부
   * @returns {string} HTML 문자열
   */
  NodeRenderer.prototype._buildArrow = function (symbol, isActive) {
    var cls = isActive ? ' on' : '';
    return '<span class="aw' + cls + '">' + symbol + '</span>';
  };

  /**
   * null 터미널 노드 HTML을 생성한다.
   * @returns {string} HTML 문자열
   */
  NodeRenderer.prototype._buildNull = function () {
    return '<div class="nul">null</div>';
  };

  /**
   * 순환 참조 표시 HTML을 생성한다.
   * @returns {string} HTML 문자열
   */
  NodeRenderer.prototype._buildCircular = function () {
    return '<div class="circ">\u21BA HEAD</div>';
  };

  // ---------------------------------------------------------------------------
  // 공개 렌더링 메서드
  // ---------------------------------------------------------------------------

  /**
   * ArrayList 시각화를 렌더링한다.
   *
   * 배열의 각 요소를 인덱스와 함께 블록으로 표시하고,
   * 요소 사이에 │ 구분자를 넣는다.
   *
   * @param {Object} list - toArray(), current() 메서드를 가진 리스트 객체
   */
  NodeRenderer.prototype.renderArrayList = function (list) {
    var data = this._extractListData(list);
    var arr = data.arr;
    var curIdx = data.curIdx;
    var html = '';

    if (arr.length === 0) {
      this._container.innerHTML = this._emptyHtml();
      return;
    }

    for (var i = 0; i < arr.length; i++) {
      var isCurrent = (i === curIdx);
      html += this._buildNodeBlock(arr[i].title, '[' + i + ']', isCurrent, '');
    }

    this._container.innerHTML = html;
  };

  /**
   * 단방향 연결 리스트 시각화를 렌더링한다.
   *
   * head → node → node → ... → null 형태로 표시한다.
   * 첫 번째 노드에는 HEAD 라벨(.hd-t)을 붙인다.
   *
   * @param {Object} list - toArray(), current() 메서드를 가진 리스트 객체
   */
  NodeRenderer.prototype.renderSinglyLinked = function (list) {
    var data = this._extractListData(list);
    var arr = data.arr;
    var curIdx = data.curIdx;
    var html = '';

    if (arr.length === 0) {
      html += this._buildArrow('\u2192', false);
      html += this._buildNull();
      this._container.innerHTML = html;
      return;
    }

    for (var i = 0; i < arr.length; i++) {
      var isCurrent = (i === curIdx);
      var tag = '';
      if (i === 0) tag += 'hd-t';
      if (i === arr.length - 1) {
        tag += (tag ? ' ' : '') + 'tl-t';
      }
      html += this._buildNodeBlock(arr[i].title, 'node', isCurrent, tag);

      var arrowActive = (i === curIdx);
      if (i < arr.length - 1) {
        html += this._buildArrow('\u2192', arrowActive);
      }
    }

    html += this._buildArrow('\u2192', false);
    html += this._buildNull();

    this._container.innerHTML = html;
  };

  /**
   * 양방향 연결 리스트 시각화를 렌더링한다.
   *
   * null ← head ⇄ node ⇄ ... ⇄ tail → null 형태로 표시한다.
   * 첫 번째 노드에 HEAD(.hd-t), 마지막 노드에 TAIL(.tl-t) 라벨을 붙인다.
   *
   * @param {Object} list - toArray(), current() 메서드를 가진 리스트 객체
   */
  NodeRenderer.prototype.renderDoublyLinked = function (list) {
    var data = this._extractListData(list);
    var arr = data.arr;
    var curIdx = data.curIdx;
    var html = '';

    html += this._buildNull();
    html += this._buildArrow('\u2190', false);

    if (arr.length === 0) {
      this._container.innerHTML = html;
      return;
    }

    for (var i = 0; i < arr.length; i++) {
      var isCurrent = (i === curIdx);
      var tag = '';
      if (i === 0) tag += 'hd-t';
      if (i === arr.length - 1) {
        tag += (tag ? ' ' : '') + 'tl-t';
      }
      html += this._buildNodeBlock(arr[i].title, 'node', isCurrent, tag);

      if (i < arr.length - 1) {
        var arrowActive = (i === curIdx || i + 1 === curIdx);
        html += this._buildArrow('\u27F7', arrowActive);
      }
    }

    html += this._buildArrow('\u2192', false);
    html += this._buildNull();

    this._container.innerHTML = html;
  };

  /**
   * 순환 연결 리스트 시각화를 렌더링한다.
   *
   * node → node → ... → ↩head 형태로 표시한다.
   * 첫 번째 노드에 HEAD(.hd-t), 마지막 노드에 TAIL(.tl-t) 라벨을 붙인다.
   *
   * @param {Object} list - toArray(), current() 메서드를 가진 리스트 객체
   */
  NodeRenderer.prototype.renderCircularLinked = function (list) {
    var data = this._extractListData(list);
    var arr = data.arr;
    var curIdx = data.curIdx;
    var html = '';

    if (arr.length === 0) {
      this._container.innerHTML = this._emptyHtml();
      return;
    }

    for (var i = 0; i < arr.length; i++) {
      var isCurrent = (i === curIdx);
      var tag = '';
      if (i === 0) tag += 'hd-t';
      if (i === arr.length - 1) {
        tag += (tag ? ' ' : '') + 'tl-t';
      }
      html += this._buildNodeBlock(arr[i].title, 'node', isCurrent, tag);

      var arrowActive = (i === curIdx);
      html += this._buildArrow('\u2192', arrowActive);
    }

    html += this._buildCircular();

    this._container.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // 노드 하이라이트 및 초기화
  // ---------------------------------------------------------------------------

  /**
   * 특정 인덱스의 노드에 하이라이트 클래스를 일시적으로 추가한다.
   * 600ms 후 자동으로 제거된다.
   *
   * @param {number} index     - 하이라이트할 노드의 인덱스
   * @param {string} className - 추가할 CSS 클래스명
   */
  NodeRenderer.prototype.highlightNode = function (index, className) {
    var nodes = this._container.querySelectorAll('.nb');
    if (index < 0 || index >= nodes.length) return;

    var targetNode = nodes[index];
    targetNode.classList.add(className);

    setTimeout(function () {
      targetNode.classList.remove(className);
    }, 600);
  };

  /**
   * 컨테이너의 내용을 초기화한다.
   */
  NodeRenderer.prototype.clear = function () {
    this._container.innerHTML = '';
  };

  return NodeRenderer;
})();
