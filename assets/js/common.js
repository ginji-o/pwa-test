"use strict";

// HTMLエスケープ
function escapeHtml(str){
  if (!str) return;
  return str.replace(/[<>&"'`]/g, (match) => {
    return {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#x60;'
    }[match];
  });
}
