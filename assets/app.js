(function(){
  var S = window.SITE || {};
  // 站点名称
  document.querySelectorAll('[data-site-name]').forEach(function(el){ el.textContent = S.name || '智启研习社'; });
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  // 一键复制 Prompt（兼容手机内置浏览器：先 execCommand，再 Clipboard API，最后选取文字让用户长按复制）
  function legacyCopy(text){
    try {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', '');
      t.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
      document.body.appendChild(t); t.focus(); t.select(); t.setSelectionRange(0, text.length);
      var ok = document.execCommand('copy');
      document.body.removeChild(t);
      return !!ok;
    } catch (e) { return false; }
  }
  function selectNode(node){
    try { var r = document.createRange(); r.selectNodeContents(node); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
  }
  document.querySelectorAll('.copy').forEach(function(btn){
    var orig = btn.textContent;
    function flash(msg){ btn.textContent = msg; setTimeout(function(){ btn.textContent = orig; }, 2200); }
    btn.addEventListener('click', function(){
      var p = btn.parentElement.querySelector('p');
      var text = p.innerText.trim();
      function manual(){ selectNode(p); flash('已选取，请长按→复制'); }
      if (legacyCopy(text)) { flash('已复制 ✓'); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function(){ flash('已复制 ✓'); }, manual);
      } else { manual(); }
    });
  });

  // 作品展览
  var box = document.getElementById('works');
  if (box && window.WORKS) {
    var labels = { song: '歌曲', video: '视频', agent: 'AI Agent', other: '其他' };
    var icons = { song: '🎵', video: '🎬', agent: '🤖', other: '✨' };
    var current = 'all';
    function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
    function safeUrl(u){ return /^(https?:\/\/|\/|\.\/|[\w\-./]+$)/i.test(u || '') ? u : ''; }
    function render(){
      var list = window.WORKS.filter(function(w){ return current === 'all' || w.category === current; });
      if (!list.length) { box.innerHTML = '<div class="empty">这个分类还没有作品，欢迎投稿！</div>'; return; }
      box.innerHTML = list.map(function(w){
        var cat = labels[w.category] ? w.category : 'other';
        var img = safeUrl(w.image);
        var vid = safeUrl(w.video);
        var visual = vid
          ? '<video controls preload="metadata" playsinline' + (img ? ' poster="' + esc(img) + '"' : '') + ' src="' + esc(vid) + '"></video>'
          : (img ? '<img src="' + esc(img) + '" alt="' + esc(w.title) + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : '');
        var thumb = '<div class="thumb ' + cat + '"><span aria-hidden="true">' + icons[cat] + '</span>' + visual +
          '<span class="tag">' + (w.sample ? '示例 · ' : '') + labels[cat] + '</span></div>';
        var media = '';
        if (safeUrl(w.audio)) media += '<audio controls preload="none" src="' + esc(safeUrl(w.audio)) + '"></audio>';
        var link = safeUrl(w.link) ? '<a class="link" href="' + esc(safeUrl(w.link)) + '" target="_blank" rel="noopener">' + esc(w.linkText || '查看作品 →') + '</a>' : '';
        return '<article class="work' + (w.sample ? ' sample' : '') + '">' + thumb +
          '<div class="body"><h3>' + esc(w.title) + '</h3><div class="by">作者：' + esc(w.author) + '</div><p>' + esc(w.desc) + '</p>' + media + link + '</div></article>';
      }).join('');
    }
    document.querySelectorAll('.chip').forEach(function(chip){
      chip.addEventListener('click', function(){
        current = chip.dataset.cat;
        document.querySelectorAll('.chip').forEach(function(c){ c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        render();
      });
    });
    render();
  }

  // 投稿按钮
  var sub = document.getElementById('submit-btn');
  if (sub) {
    if (S.email) { sub.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent(S.subject || '作品投稿'); }
    else { sub.style.display = 'none'; var n = document.getElementById('submit-note'); if (n) n.style.display = 'block'; }
  }
})();

/* visit counter (home page only) — abacus.jasoncameron.dev, fails silently */
(function(){
  var box = document.getElementById('visits'), num = document.getElementById('visit-n');
  if (!box || !num) return;
  var base = 'https://abacus.jasoncameron.dev/', ns = 'zhiqi-generationsai', key = 'home-visits';
  var local = /^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);
  var counted = false, flagOk = true;
  try { counted = !!localStorage.getItem('zq_counted'); } catch (e) { flagOk = false; }
  // count each browser once; local tests and storage-less browsers only read
  var action = (!local && flagOk && !counted) ? 'hit' : 'get';
  var ctl = ('AbortController' in window) ? new AbortController() : null;
  var timer = setTimeout(function(){ if (ctl) ctl.abort(); }, 6000);
  fetch(base + action + '/' + ns + '/' + key, ctl ? { signal: ctl.signal } : {})
    .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(d){
      clearTimeout(timer);
      if (!d || typeof d.value !== 'number') return;
      num.textContent = d.value.toLocaleString('en-US');
      box.hidden = false;
      if (action === 'hit') { try { localStorage.setItem('zq_counted', '1'); } catch (e) {} }
    })
    .catch(function(){ clearTimeout(timer); });
})();
