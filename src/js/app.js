/**
 * App - 음악 플레이리스트 데모 애플리케이션 진입점
 */
class App {
  constructor() {
    this._defaultSongs = [
      new Song('Dynamite', 'BTS', 199),
      new Song('Blinding Lights', 'The Weeknd', 200),
      new Song('Shape of You', 'Ed Sheeran', 234),
      new Song('\uBD04\uB0A0', 'BTS', 274),
      new Song('Butter', 'BTS', 165)
    ];
    this._controllers = {};
  }

  /**
   * 앱 초기화: 자료구조 생성, UI 컨트롤러 바인딩
   */
  init() {
    // 4가지 자료구조 생성 및 기본 곡 추가
    var alList = new ArrayList();
    var slList = new SinglyLinkedList();
    var dlList = new DoublyLinkedList();
    var clList = new CircularLinkedList();

    this._populateList(alList);
    this._populateList(slList);
    this._populateList(dlList);
    this._populateList(clList);

    // 탭 컨트롤러
    var tabBarEl = document.getElementById('tab-bar');
    var tabCtrl = new TabController(tabBarEl);

    // ArrayList 컨트롤러
    var alRenderer = new NodeRenderer(document.getElementById('al-sv'));
    var alLogger = new Logger(document.getElementById('al-lg'));
    var alCtrl = new ALController('p-al', alList, alRenderer, alLogger);
    alCtrl.init();

    // SinglyLinkedList 컨트롤러
    var slRenderer = new NodeRenderer(document.getElementById('sl-sv'));
    var slLogger = new Logger(document.getElementById('sl-lg'));
    var slCtrl = new SLController('p-sl', slList, slRenderer, slLogger);
    slCtrl.init();

    // DoublyLinkedList 컨트롤러
    var dlRenderer = new NodeRenderer(document.getElementById('dl-sv'));
    var dlLogger = new Logger(document.getElementById('dl-lg'));
    var dlCtrl = new DLController('p-dl', dlList, dlRenderer, dlLogger);
    dlCtrl.init();

    // CircularLinkedList 컨트롤러
    var clRenderer = new NodeRenderer(document.getElementById('cl-sv'));
    var clLogger = new Logger(document.getElementById('cl-lg'));
    var clCtrl = new CLController('p-cl', clList, clRenderer, clLogger);
    clCtrl.init();

    // CompareView
    var comparePanel = document.getElementById('p-cmp');
    var compareView = new CompareView(comparePanel);
    compareView.init();

    // 컨트롤러 맵 저장
    this._controllers = {
      al: alCtrl,
      sl: slCtrl,
      dl: dlCtrl,
      cl: clCtrl
    };

    // 탭 전환 시 해당 컨트롤러 새로고침
    var self = this;
    tabCtrl.onSwitch(function (tabName) {
      if (self._controllers[tabName]) {
        self._controllers[tabName].refresh();
      }
    });

    // 초기 탭 활성화 및 새로고침
    tabCtrl.switchTo('al');
  }

  /**
   * 리스트에 기본 곡 5개 추가
   * @param {object} list - insertLast 또는 insertBack 메서드를 가진 리스트
   */
  _populateList(list) {
    for (var i = 0; i < this._defaultSongs.length; i++) {
      var song = this._defaultSongs[i];
      if (typeof list.insertLast === 'function') {
        list.insertLast(song);
      } else if (typeof list.insertBack === 'function') {
        list.insertBack(song);
      }
    }
  }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', function () {
  new App().init();
});
