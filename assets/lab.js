(function () {
  var $ = function (id) { return document.getElementById(id); };
  var data = null, COLORS = ['#3F82D9', '#7F6FE0', '#2E9F8A'];
  function f3(x) { return x.toFixed(3); }
  function tone(v) { return v >= 0.8 ? 'good' : v >= 0.65 ? 'mid' : 'bad'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clampSize(v) { v = parseInt(v, 10); if (!(v > 0)) v = 400; return Math.max(50, Math.min(3000, v)); }
  function clampOv(v) { v = parseInt(v, 10); if (!(v >= 0)) v = 20; return Math.max(0, Math.min(50, v)); }

  function setMetric(id, v) { var el = $(id); el.className = 'metric ' + tone(v); el.querySelector('.v').textContent = f3(v); }

  function barChart(items, opts) {   // items: [{label, value}]
    var W = 520, H = 280, L = 40, R = 10, T = 14, B = 46, pw = W - L - R, ph = H - T - B, n = items.length, gap = pw / n, bw = Math.min(54, gap * 0.6);
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.title) + '">';
    for (var i = 0; i <= 5; i++) { var y = T + ph - ph * i / 5; s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + (i / 5).toFixed(1) + '</text>'; }
    items.forEach(function (it, k) {
      var h = ph * it.value, x = L + gap * k + (gap - bw) / 2, y = T + ph - h;
      s += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + h + '" rx="5" fill="' + (it.color || COLORS[0]) + '"/>' +
           '<text class="val" x="' + (x + bw / 2) + '" y="' + (y - 5) + '" text-anchor="middle">' + it.value.toFixed(2) + '</text>' +
           '<text x="' + (x + bw / 2) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + esc(it.label) + '</text>';
    });
    return s + '</svg>';
  }
  function groupChart(metrics, runs) {  // metrics: [{label,key}], runs: results
    var W = 560, H = 300, L = 40, R = 10, T = 16, B = 40, pw = W - L - R, ph = H - T - B, gap = pw / metrics.length, bw = Math.min(30, gap / (runs.length + 1));
    var s = '<div class="legend">' + runs.map(function (r, i) { return '<span><i style="background:' + COLORS[i] + '"></i>' + r.size + ' 字</span>'; }).join('') + '</div>';
    s += '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="各指标随 chunk 大小变化">';
    for (var i = 0; i <= 5; i++) { var y = T + ph - ph * i / 5; s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + (i / 5).toFixed(1) + '</text>'; }
    metrics.forEach(function (m, k) {
      var gx = L + gap * k + (gap - bw * runs.length) / 2;
      runs.forEach(function (r, j) {
        var v = r[m.key], h = ph * v, x = gx + bw * j, y = T + ph - h;
        s += '<rect x="' + x + '" y="' + y + '" width="' + (bw - 3) + '" height="' + h + '" rx="3" fill="' + COLORS[j] + '"/><text class="val" x="' + (x + (bw - 3) / 2) + '" y="' + (y - 4) + '" text-anchor="middle" style="font-size:10px">' + v.toFixed(2).replace(/^0/, '') + '</text>';
      });
      s += '<text x="' + (L + gap * k + gap / 2) + '" y="' + (H - B + 20) + '" text-anchor="middle">' + m.label + '</text>';
    });
    return s + '</svg>';
  }

  function runOne() {
    var size = clampSize($('size').value), ov = clampOv($('ov').value); $('size').value = size; $('sizeRange').value = Math.max(100, Math.min(1500, size)); $('ov').value = ov;
    var btn = $('run'); btn.disabled = true;
    setTimeout(function () {
      var r = LabEngine.evaluate(data, size, ov);
      $('out').hidden = false;
      setMetric('mMrr', r.mrr); setMetric('mNdcg', r.ndcg); setMetric('mH1', r.hit1); setMetric('mH3', r.hit3);
      $('done').textContent = '✓ Evaluation Complete: ' + r.n + ' tests · ' + r.chunks + ' chunks（平均 ' + r.avgLen + ' 字）';
      var cats = Object.keys(r.cats).map(function (k) { return { label: k, value: r.cats[k].mrr, color: COLORS[0] }; });
      $('chart').innerHTML = barChart(cats, { title: 'Average MRR by Category' });
      $('missSum').textContent = '没进前三名的问题（' + r.misses.length + ' / ' + r.n + '）';
      $('missBody').innerHTML = r.misses.length ? '<table>' + r.misses.map(function (m) { return '<tr><td>' + esc(m.q) + '</td><td>' + (m.rank ? '正确答案排第 ' + m.rank : '前 ' + r.chunks + ' 名都没有') + '</td></tr>'; }).join('') + '</table>' : '<p>全部问题的正确答案都在前三名。</p>';
      btn.disabled = false;
    }, 20);
  }

  function runCompare() {
    var ov = clampOv($('ov').value), sizes = Array.prototype.map.call(document.querySelectorAll('.cmp'), function (e) { var v = clampSize(e.value); e.value = v; return v; });
    var btn = $('cmpRun'); btn.disabled = true;
    setTimeout(function () {
      var runs = sizes.map(function (s) { return LabEngine.evaluate(data, s, ov); });
      $('cmpOut').hidden = false;
      var M = [{ label: 'Hit@1', key: 'hit1' }, { label: 'Hit@3', key: 'hit3' }, { label: 'Hit@5', key: 'hit5' }, { label: 'MRR', key: 'mrr' }, { label: 'nDCG@10', key: 'ndcg' }];
      $('cmpChart').innerHTML = groupChart(M, runs);
      var rows = [{ label: 'Chunk 大小（字）', f: function (r) { return r.size; } }, { label: 'Chunk 数量', f: function (r) { return r.chunks; } }, { label: '平均长度（字）', f: function (r) { return r.avgLen; } }];
      var h = '<thead><tr><th></th>' + runs.map(function (r) { return '<th>' + r.size + '</th>'; }).join('') + '</tr></thead><tbody>';
      rows.slice(1).forEach(function (row) { h += '<tr><td>' + row.label + '</td>' + runs.map(function (r) { return '<td>' + row.f(r) + '</td>'; }).join('') + '</tr>'; });
      M.forEach(function (m) {
        var best = Math.max.apply(null, runs.map(function (r) { return r[m.key]; }));
        h += '<tr><td>' + m.label + '</td>' + runs.map(function (r) { return '<td' + (r[m.key] === best && best > 0 && runs.filter(function (x) { return x[m.key] === best; }).length < runs.length ? ' class="best"' : '') + '>' + f3(r[m.key]) + '</td>'; }).join('') + '</tr>';
      });
      $('cmpTable').innerHTML = h + '</tbody>';
      var bm = runs.reduce(function (a, r) { return r.mrr > a.mrr ? r : a; }, runs[0]), worst = runs.reduce(function (a, r) { return r.mrr < a.mrr ? r : a; }, runs[0]);
      $('cmpRead').textContent = bm.mrr === worst.mrr ? '三种大小的 MRR 完全一样，说明这份资料对 chunk 大小不敏感。'
        : 'MRR 最高的是 ' + bm.size + ' 字（' + f3(bm.mrr) + '），最低的是 ' + worst.size + ' 字（' + f3(worst.mrr) + '），相差 ' + f3(bm.mrr - worst.mrr) + '。绿色数字是每一行表现最好的大小。';
      btn.disabled = false;
    }, 20);
  }

  $('sizeRange').addEventListener('input', function () { $('size').value = this.value; });
  $('size').addEventListener('input', function () { var v = parseInt(this.value, 10); if (v >= 100 && v <= 1500) $('sizeRange').value = v; });
  $('run').addEventListener('click', runOne);
  $('cmpRun').addEventListener('click', runCompare);
  ['size', 'ov'].forEach(function (id) { $(id).addEventListener('keydown', function (e) { if (e.key === 'Enter') runOne(); }); });

  fetch('/data/lab-data.json').then(function (r) { return r.json(); }).then(function (d) { data = d; runOne(); runCompare(); })
    .catch(function () { $('run').textContent = '数据加载失败，请刷新页面'; $('run').disabled = true; $('cmpRun').disabled = true; });
})();
