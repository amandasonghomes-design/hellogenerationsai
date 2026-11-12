/* 真实尺寸尺子：0–4 cm。浏览器无法知道屏幕的物理大小，所以第一次使用要用银行卡校准一次。 */
(function () {
  if (window.__ruler) return; window.__ruler = 1;
  var KEY = 'ruler-cal-v1', LEN_MM = 40;
  var REFS = [['信用卡／银行卡 短边（53.98 mm）', 53.98], ['信用卡／银行卡 长边（85.60 mm）', 85.6], ['美国 25 分硬币（24.26 mm）', 24.26], ['美国 1 分硬币（19.05 mm）', 19.05]];
  var st = { on: false, vert: false, x: 24, y: 120 };
  function dpr() { return window.devicePixelRatio || 1; }
  function loadCal() { try { var c = JSON.parse(localStorage.getItem(KEY)); if (c && c.ppmDev > 0) return c; } catch (e) {} return null; }
  function ppm() { var c = loadCal(); return c ? c.ppmDev / dpr() : 96 / 25.4; }   // CSS px per mm (browser zoom changes dpr, so this follows the zoom)
  function saveCal(cssPpm) { try { localStorage.setItem(KEY, JSON.stringify({ ppmDev: cssPpm * dpr() })); } catch (e) {} }

  var css = document.createElement('style');
  css.textContent = '.rl-tab{position:fixed;left:0;top:42%;z-index:55;border:0;border-radius:0 12px 12px 0;background:linear-gradient(135deg,#3F82D9,#7F6FE0);color:#fff;font:700 13px system-ui,sans-serif;padding:10px 8px 10px 6px;cursor:pointer;box-shadow:0 4px 14px rgba(63,90,170,.3);writing-mode:vertical-rl;letter-spacing:.15em}' +
    '.rl-tab[aria-pressed=true]{background:#27345E}' +
    '.rl{position:fixed;z-index:56;touch-action:none;user-select:none;-webkit-user-select:none;background:#FFF8D6;border:1px solid #C9A800;box-shadow:0 6px 18px rgba(0,0,0,.25);border-radius:4px;font:12px system-ui,sans-serif;color:#27345E}' +
    '.rl svg{display:block;cursor:grab}.rl .bar{display:flex;gap:4px;padding:3px;background:#27345E}' +
    '.rl .bar button{flex:1;min-width:0;border:0;border-radius:4px;background:#fff;color:#27345E;font:700 12px system-ui,sans-serif;padding:5px 4px;cursor:pointer;white-space:nowrap}' +
    '.rl.v{display:flex}.rl.v .bar{flex-direction:column}.rl .warn{position:absolute;left:2px;bottom:-18px;background:#C42B2B;color:#fff;font:700 11px system-ui,sans-serif;padding:1px 6px;border-radius:4px;white-space:nowrap}' +
    '.rl-cal{position:fixed;inset:0;z-index:70;background:rgba(20,30,60,.55);display:grid;place-items:center;padding:14px;font-family:system-ui,sans-serif}' +
    '.rl-cal>div{background:#fff;color:#27345E;border-radius:18px;padding:18px;width:min(460px,100%);box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
    '.rl-cal h3{margin:0 0 6px;font-size:19px}.rl-cal p{margin:6px 0;font-size:14px;line-height:1.6;color:#4a5680}' +
    '.rl-cal select{width:100%;font:15px system-ui,sans-serif;padding:8px;border:1px solid #b9c8ee;border-radius:10px;margin:6px 0}' +
    '.rl-cal .ref{height:26px;background:repeating-linear-gradient(90deg,#FF9F43 0 6px,#FFB872 6px 12px);border-radius:5px;margin:12px auto 6px;max-width:100%}' +
    '.rl-cal input[type=range]{width:100%;accent-color:#3F82D9}' +
    '.rl-cal .row{display:flex;gap:8px;margin-top:12px}.rl-cal .row button{flex:1;border:0;border-radius:12px;padding:11px;font:700 15px system-ui,sans-serif;cursor:pointer;background:#EAF2FF;color:#27345E}' +
    '.rl-cal .row button.go{background:linear-gradient(135deg,#3F82D9,#7F6FE0);color:#fff}' +
    '.rl-cal .fine{display:flex;gap:8px;justify-content:center;margin:2px 0}.rl-cal .fine button{width:46px;height:36px;border:1px solid #b9c8ee;background:#fff;border-radius:10px;font:700 18px system-ui,sans-serif;cursor:pointer}';
  document.head.appendChild(css);

  var tab = document.createElement('button'); tab.className = 'rl-tab'; tab.type = 'button'; tab.setAttribute('aria-pressed', 'false'); tab.setAttribute('aria-label', '显示或隐藏尺子'); tab.textContent = '📏 尺子';
  document.body.appendChild(tab);
  var box = null;

  function svg(w, h, vert) {
    var p = ppm(), len = LEN_MM * p, pad = 8, s = '', i;
    var W = vert ? h : w;  // helper for readability
    var total = len + pad * 2, thick = 54;
    var a = [];
    for (i = 0; i <= LEN_MM; i++) {
      var pos = pad + i * p, big = i % 10 === 0, mid = i % 5 === 0, L = big ? 26 : mid ? 18 : 11;
      a.push(vert ? '<line x1="0" y1="' + pos + '" x2="' + L + '" y2="' + pos + '" stroke="#27345E" stroke-width="' + (big ? 1.6 : 1) + '"/>' : '<line x1="' + pos + '" y1="0" x2="' + pos + '" y2="' + L + '" stroke="#27345E" stroke-width="' + (big ? 1.6 : 1) + '"/>');
      if (big) a.push(vert ? '<text x="30" y="' + (pos + 4) + '" font-size="13" font-weight="700" fill="#27345E">' + (i / 10) + '</text>' : '<text x="' + (pos + (i === 0 ? 3 : -3)) + '" y="42" text-anchor="' + (i === 0 ? 'start' : 'middle') + '" font-size="13" font-weight="700" fill="#27345E">' + (i / 10) + '</text>');
    }
    a.push(vert ? '<text x="30" y="' + (total - 4) + '" font-size="11" fill="#6a76a0">cm</text>' : '<text x="' + (total - 20) + '" y="' + (thick - 4) + '" font-size="11" fill="#6a76a0">cm</text>');
    return vert ? '<svg width="' + thick + '" height="' + total + '" viewBox="0 0 ' + thick + ' ' + total + '">' + a.join('') + '</svg>' : '<svg width="' + total + '" height="' + thick + '" viewBox="0 0 ' + total + ' ' + thick + '">' + a.join('') + '</svg>';
  }

  function render() {
    if (box) { box.remove(); box = null; }
    tab.setAttribute('aria-pressed', String(st.on));
    if (!st.on) return;
    box = document.createElement('div'); box.className = 'rl' + (st.vert ? ' v' : '');
    box.innerHTML = svg(0, 0, st.vert) + '<div class="bar"><button data-a="rot">转向</button><button data-a="cal">校准</button><button data-a="x">隐藏</button></div>' + (loadCal() ? '' : '<span class="warn">未校准，长度不准</span>');
    box.style.left = st.x + 'px'; box.style.top = st.y + 'px';
    document.body.appendChild(box);
    clamp();
    box.querySelector('.bar').addEventListener('click', function (e) { var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (a === 'rot') { st.vert = !st.vert; render(); } else if (a === 'cal') calibrate(); else if (a === 'x') { st.on = false; render(); } });
    var sv = box.querySelector('svg'), sx, sy, ox, oy, drag = false;
    sv.addEventListener('pointerdown', function (e) { drag = true; sx = e.clientX; sy = e.clientY; ox = st.x; oy = st.y; sv.setPointerCapture(e.pointerId); });
    sv.addEventListener('pointermove', function (e) { if (!drag) return; st.x = ox + e.clientX - sx; st.y = oy + e.clientY - sy; clamp(); });
    sv.addEventListener('pointerup', function () { drag = false; });
  }
  function clamp() {
    if (!box) return; var r = box.getBoundingClientRect();
    st.x = Math.max(0, Math.min(window.innerWidth - r.width, st.x)); st.y = Math.max(0, Math.min(window.innerHeight - r.height - 20, st.y));
    box.style.left = st.x + 'px'; box.style.top = st.y + 'px';
  }

  function calibrate() {
    var o = document.createElement('div'); o.className = 'rl-cal';
    var maxPx = Math.floor(window.innerWidth - 60), p0 = ppm();
    var def = window.innerWidth < 600 ? 0 : 1;
    o.innerHTML = '<div role="dialog" aria-label="校准尺子"><h3>📏 校准尺子（只需一次）</h3><p>浏览器不知道你的屏幕有多大，所以要用一件大小固定的东西来对一下。把它<b>平贴在屏幕上</b>，拖动滑块，让橙色条和它一样宽。</p>' +
      '<select id="rl-ref">' + REFS.map(function (r, i) { return '<option value="' + r[1] + '"' + (i === def ? ' selected' : '') + '>' + r[0] + '</option>'; }).join('') + '</select>' +
      '<div class="ref" id="rl-bar"></div><input type="range" id="rl-rng" min="40" max="' + maxPx + '" step="0.5" aria-label="橙色条宽度"><div class="fine"><button type="button" data-d="-1" aria-label="缩小">−</button><button type="button" data-d="1" aria-label="放大">+</button></div>' +
      '<p id="rl-info" style="text-align:center;font-size:13px"></p><p style="font-size:12px">手机建议选“短边”（手机屏幕比银行卡长边窄）。校准后如果改变了浏览器缩放，尺子会自动跟着调整。</p>' +
      '<div class="row"><button type="button" data-a="cancel">取消</button><button type="button" data-a="reset">恢复默认</button><button type="button" class="go" data-a="ok">完成</button></div></div>';
    document.body.appendChild(o);
    var sel = o.querySelector('#rl-ref'), bar = o.querySelector('#rl-bar'), rng = o.querySelector('#rl-rng'), info = o.querySelector('#rl-info');
    function setBar(px) { px = Math.max(40, Math.min(maxPx, px)); rng.value = px; bar.style.width = px + 'px'; info.textContent = '橙色条 = ' + sel.value + ' mm  →  1 cm ≈ ' + (px / parseFloat(sel.value) * 10).toFixed(1) + ' 像素'; }
    function fit() { var mm = parseFloat(sel.value), px = mm * p0; if (px > maxPx) px = maxPx; setBar(px); }
    sel.addEventListener('change', fit); rng.addEventListener('input', function () { setBar(parseFloat(rng.value)); });
    o.querySelectorAll('.fine button').forEach(function (b) { b.addEventListener('click', function () { setBar(parseFloat(rng.value) + parseFloat(b.getAttribute('data-d')) * 0.5); }); });
    fit();
    o.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a');
      if (e.target === o || a === 'cancel') { o.remove(); }
      else if (a === 'reset') { try { localStorage.removeItem(KEY); } catch (er) {} o.remove(); render(); }
      else if (a === 'ok') { var px = parseFloat(rng.value), mm = parseFloat(sel.value); if (px / mm < 1.5) { info.textContent = '尺寸太小，请再对一对。'; return; } saveCal(px / mm); o.remove(); render(); }
    });
  }

  tab.addEventListener('click', function () { st.on = !st.on; render(); if (st.on && !loadCal()) calibrate(); });
  window.addEventListener('resize', function () { if (st.on) render(); });
})();
