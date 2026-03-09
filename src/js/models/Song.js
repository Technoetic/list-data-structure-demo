/**
 * Song - 플레이리스트의 곡을 나타내는 모델 클래스
 */
class Song {
  /**
   * @param {string} title - 곡 제목
   * @param {string} artist - 아티스트
   * @param {number} duration - 재생 시간(초)
   */
  constructor(title, artist, duration) {
    this.title = title;
    this.artist = artist;
    this.duration = duration;
  }

  /**
   * 다른 Song과 제목 기준으로 동일한지 비교
   * @param {Song} other
   * @returns {boolean}
   */
  equals(other) {
    return other && this.title === other.title;
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.title + ' - ' + this.artist;
  }
}
