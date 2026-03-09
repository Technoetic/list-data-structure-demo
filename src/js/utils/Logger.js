/**
 * Logger - 자료구조 연산 로그 기록기
 */

var Logger = (function () {
  'use strict';

  var MAX_ENTRIES = 50;

  function Logger(containerEl) {
    this._container = containerEl;
    this._entries = [];
  }

  Logger.prototype._escapeHtml = function (str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  Logger.prototype._addEntry = function (level, message) {
    var time = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    this._entries.unshift({ time: time, level: level, message: message });
    if (this._entries.length > MAX_ENTRIES) this._entries.pop();
    this._render();
  };

  Logger.prototype.info = function (message) {
    this._addEntry('info', message);
  };

  Logger.prototype.warn = function (message) {
    this._addEntry('warn', message);
  };

  Logger.prototype.error = function (message) {
    this._addEntry('error', message);
  };

  Logger.prototype.log = function (operation, params, result) {
    var parts = [operation];
    if (params && params.title) parts.push('"' + params.title + '"');
    if (result && result.complexity) parts.push(result.complexity);
    this.info(parts.join(' | '));
  };

  Logger.prototype._render = function () {
    if (!this._container) return;
    var html = '';
    for (var i = 0; i < this._entries.length; i++) {
      var e = this._entries[i];
      var cls = e.level === 'warn' ? ' lg-w' : e.level === 'error' ? ' lg-e' : '';
      html += '<div class="lg-e' + cls + '">[' + e.time + '] ' + this._escapeHtml(e.message) + '</div>';
    }
    this._container.innerHTML = html;
  };

  Logger.prototype.clear = function () {
    this._entries = [];
    this._render();
  };

  return Logger;
})();
