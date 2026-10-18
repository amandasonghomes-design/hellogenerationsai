(function(){
  var S = window.SITE || {};
  // 站点名称
  document.querySelectorAll('[data-site-name]').forEach(function(el){ el.textContent = S.name || '智启未来研习社'; });
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
    var songsBox = document.getElementById('songs');
    function shortAuthor(a){ return String(a || '').replace(/[（(][^）)]*[）)]/g, '').trim(); }
    function songRow(w){
      var img = safeUrl(w.image), url = safeUrl(w.link);
      var thumb = '<span class="song-thumb" aria-hidden="true">🎵' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + '</span>';
      var text = '<span class="song-text"><b>' + esc(w.title) + '</b><i>' + esc(shortAuthor(w.author)) + '</i></span>';
      return url ? '<a class="song-row" href="' + esc(url) + '" target="_blank" rel="noopener" title="' + esc(w.title + ' · ' + w.author) + '">' + thumb + text + '<span class="song-go" aria-hidden="true">↗</span></a>'
                 : '<div class="song-row">' + thumb + text + '</div>';
    }
    function cardHtml(w){
      var cat = labels[w.category] ? w.category : 'other';
      var img = safeUrl(w.image);
      var vid = safeUrl(w.video);
      var yt = /^[\w-]{11}$/.test(w.youtube || '') ? w.youtube : '';
      var visual = yt
        ? '<iframe src="https://www.youtube-nocookie.com/embed/' + yt + '" title="' + esc(w.title) + '" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
        : vid
        ? '<video controls preload="metadata" playsinline' + (img ? ' poster="' + esc(img) + '"' : '') + ' src="' + esc(vid) + '"></video>'
        : (img ? '<img src="' + esc(img) + '" alt="' + esc(w.title) + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : '');
      var thumb = '<div class="thumb ' + cat + '"><span aria-hidden="true">' + icons[cat] + '</span>' + visual +
        '<span class="tag">' + (w.sample ? '示例 · ' : '') + labels[cat] + '</span></div>';
      var media = '';
      if (safeUrl(w.audio)) media += '<audio controls preload="none" src="' + esc(safeUrl(w.audio)) + '"></audio>';
      var link = safeUrl(w.link) ? '<a class="link" href="' + esc(safeUrl(w.link)) + '" target="_blank" rel="noopener">' + esc(w.linkText || '查看作品 →') + '</a>' : '';
      return '<article class="work' + (w.sample ? ' sample' : '') + '">' + thumb +
        '<div class="body"><h3>' + esc(w.title) + '</h3><div class="by">作者：' + esc(w.author) + '</div><p>' + esc(w.desc) + '</p>' + media + link + '</div></article>';
    }
    function render(){
      var only = document.body.getAttribute('data-only');
      var list = window.WORKS.filter(function(w){ if (only) return only === 'song' ? (w.category === 'song' || w.also === 'song') : (w.category === only && w.also !== 'song'); return current === 'all' || w.category === current; });
      var songs = list.filter(function(w){ return w.category === 'song'; });
      var cards = list.filter(function(w){ return w.category !== 'song'; });
      if (!list.length) { box.hidden = false; box.className = ''; box.innerHTML = '<div class="empty">这个分类还没有作品，欢迎投稿！</div>'; if (songsBox) songsBox.innerHTML = ''; return; }
      box.className = 'grid g3'; box.hidden = false;
      var parts = cards.map(cardHtml);
      if (songs.length) parts.splice(Math.min(only === 'song' ? 1 : 5, parts.length), 0,
        '<section class="song-block"><h2 class="song-head">🎵 歌曲 <span>' + songs.length + ' 首</span></h2><div class="song-list">' + songs.map(songRow).join('') + '</div></section>');
      box.innerHTML = parts.join('');
      if (songsBox) songsBox.innerHTML = '';
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
  var base = 'https://abacus.jasoncameron.dev/', ns = 'zhiqi-hellogenerationsai', key = 'home-visits';
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

/* sci-fi space band: stars, meteors and a little comet (decorative) */
(function(){
  var bands = document.querySelectorAll('.hero, .page-head');
  if (!bands.length) return;
  var meteors = [
    ['8%','88%','13s','0s','140px'], ['58%','84%','15s','9s','90px'],
    ['44%','72%','16s','11s','120px']
  ].map(function(m){ return '<i class="meteor" style="--t:'+m[0]+';--l:'+m[1]+';--dur:'+m[2]+';--delay:'+m[3]+';--len:'+m[4]+'"></i>'; }).join('');
  var comet = '<div class="comet" style="--t:14%;--l:92%;--dur:30s;--delay:2s"><svg viewBox="0 0 40 40" aria-hidden="true">' +
    '' +
    '<polygon points="20.00,4.50 24.70,15.03 36.17,16.25 27.61,23.97 29.99,35.25 20.00,29.50 10.01,35.25 12.39,23.97 3.83,16.25 15.30,15.03" fill="#FFC21F" stroke="#FFC21F" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle cx="16" cy="20.5" r="1.8" fill="#5A3E1B"/><circle cx="24" cy="20.5" r="1.8" fill="#5A3E1B"/>' +
    '<path d="M16.8 25 Q20 28.2 23.2 25" stroke="#5A3E1B" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<circle cx="13.2" cy="24.2" r="2" fill="#FF9F7A" opacity=".55"/><circle cx="26.8" cy="24.2" r="2" fill="#FF9F7A" opacity=".55"/></svg>' +
    '<span class="tail"></span></div>';
  for (var i = 0; i < bands.length; i++) {
    var d = document.createElement('div');
    d.className = 'space'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<i class="stars s1"></i><i class="stars s2"></i>' + meteors + comet;
    bands[i].insertBefore(d, bands[i].firstChild);
  }
})();

/* occasional soft blinking of individual stars (decorative) */
(function(){
  var spaces = document.querySelectorAll('.space');
  for (var s = 0; s < spaces.length; s++) {
    var html = '';
    for (var i = 0; i < 32; i++) {
      var size = (Math.random() < .3 ? 3 : 2);
      html += '<i class="tw" style="left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*100).toFixed(1)+'%;width:'+size+'px;height:'+size+'px;--d:'+(5+Math.random()*9).toFixed(1)+'s;--w:-'+(Math.random()*14).toFixed(1)+'s"></i>';
    }
    var wrap = document.createElement('div'); wrap.className = 'tw-wrap'; wrap.innerHTML = html;
    spaces[s].appendChild(wrap);
  }
})();
