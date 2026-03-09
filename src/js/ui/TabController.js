/**
 * TabController - 탭 전환을 관리하는 컨트롤러
 */
class TabController {
  /**
   * @param {HTMLElement} tabBarEl - 탭 바 요소
   */
  constructor(tabBarEl) {
    this._tabBar = tabBarEl;
    this._callbacks = [];
    this._currentTab = null;
    this._bindEvents();
  }

  /**
   * 탭 클릭 이벤트 바인딩
   */
  _bindEvents() {
    var self = this;
    var tabs = this._tabBar.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      (function (tab) {
        tab.addEventListener('click', function () {
          var tabName = tab.getAttribute('data-t');
          if (tabName) {
            self.switchTo(tabName);
          }
        });
      })(tabs[i]);
    }
  }

  /**
   * 지정한 탭으로 전환
   * @param {string} tabName - 탭 이름 (data-t 속성 값)
   */
  switchTo(tabName) {
    var panels = document.querySelectorAll('.pnl');
    for (var i = 0; i < panels.length; i++) {
      panels[i].classList.remove('on');
    }
    var target = document.getElementById('p-' + tabName);
    if (target) {
      target.classList.add('on');
    }
    var tabs = this._tabBar.querySelectorAll('.tab');
    for (var j = 0; j < tabs.length; j++) {
      tabs[j].classList.remove('on');
      if (tabs[j].getAttribute('data-t') === tabName) {
        tabs[j].classList.add('on');
      }
    }
    this._currentTab = tabName;
    for (var k = 0; k < this._callbacks.length; k++) {
      try {
        this._callbacks[k](tabName);
      } catch (e) {
        console.error('TabController callback error:', e);
      }
    }
  }

  /**
   * 탭 전환 시 호출될 콜백 등록
   * @param {function} callback - function(tabName)
   */
  onSwitch(callback) {
    if (typeof callback === 'function') {
      this._callbacks.push(callback);
    }
  }
}
