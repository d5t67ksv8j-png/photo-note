/* Photo Note compatibility diagnostics. This file only reports capabilities;
   it does not alter IndexedDB data or replace existing application logic. */
(function () {
  'use strict';
  var checks = {
    indexedDB: !!window.indexedDB,
    fileInput: !!document.createElement('input').files,
    touch: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
    serviceWorker: ('serviceWorker' in navigator),
    mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    share: !!navigator.share
  };
  window.PhotoNoteCompatibility = {
    checks: checks,
    isSecure: window.isSecureContext === true,
    getReport: function () { return JSON.stringify({ checks: checks, secureContext: this.isSecure }, null, 2); }
  };
  window.addEventListener('load', function () {
    if (!checks.indexedDB) {
      var notice = document.createElement('div');
      notice.setAttribute('role', 'alert');
      notice.textContent = 'このブラウザでは端末内保存（IndexedDB）が利用できません。別の最新ブラウザで開いてください。';
      notice.style.cssText = 'position:fixed;z-index:9999;left:12px;right:12px;bottom:12px;padding:14px;background:#8b2d22;color:#fff;border-radius:12px;font:14px/1.5 sans-serif;';
      document.body.appendChild(notice);
    }
  });
}());
