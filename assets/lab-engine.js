/* RAG retrieval evaluation engine (runs in the browser or in Node).
   Same method as zhiqi-rag/rag/chunk_experiment.py: char n-gram (1-3, "char_wb") TF-IDF + cosine similarity. */
(function (root) {
  function cp(s) { return Array.from(s); }

  // ---- chunking: slide decks stay one chunk per slide; web guides are cut into windows ----
  function buildChunks(docs, size, overlap) {
    var out = [], step = Math.max(1, size - overlap);
    docs.forEach(function (d) {
      if (d.slides) {
        d.slides.forEach(function (s) { out.push({ source: d.source, span: [s.n, s.n], text: s.text }); });
      } else {
        var t = cp(d.text), i = 0;
        while (i < t.length) {
          var w = t.slice(i, i + size);
          if (w.length > 40) out.push({ source: d.source, span: [i, i + w.length], text: w.join('') });
          i += step;
        }
      }
    });
    return out;
  }

  // ---- TF-IDF over character n-grams, mirrors sklearn TfidfVectorizer(analyzer="char_wb", ngram_range=(1,3), sublinear_tf=True)
  function ngrams(text) {
    var out = [], words = text.toLowerCase().replace(/\s\s+/g, ' ').split(/\s+/).filter(Boolean);
    words.forEach(function (w0) {
      var w = cp(' ' + w0 + ' '), L = w.length;
      for (var n = 1; n <= 3; n++) {
        var off = 0; out.push(w.slice(off, off + n).join(''));
        while (off + n < L) { off++; out.push(w.slice(off, off + n).join('')); }
      }
    });
    return out;
  }
  function counts(text) { var m = Object.create(null); ngrams(text).forEach(function (g) { m[g] = (m[g] || 0) + 1; }); return m; }

  function Index(chunks) {
    var n = chunks.length, df = Object.create(null), tfs = chunks.map(function (c) { return counts(c.text); });
    tfs.forEach(function (tf) { for (var g in tf) df[g] = (df[g] || 0) + 1; });
    this.idf = Object.create(null);
    for (var g in df) this.idf[g] = Math.log((1 + n) / (1 + df[g])) + 1;
    this.vecs = tfs.map(this.vec.bind(this));
  }
  Index.prototype.vec = function (tf) {
    var v = Object.create(null), norm = 0;
    for (var g in tf) { if (this.idf[g] === undefined) continue; var x = (1 + Math.log(tf[g])) * this.idf[g]; v[g] = x; norm += x * x; }
    norm = Math.sqrt(norm) || 1; for (var k in v) v[k] /= norm; return v;
  };
  Index.prototype.rank = function (q) {
    var qv = this.vec(counts(q)), sc = this.vecs.map(function (dv) { var s = 0; for (var g in qv) { if (dv[g]) s += qv[g] * dv[g]; } return s; });
    return sc.map(function (s, i) { return i; }).sort(function (a, b) { return sc[b] - sc[a] || a - b; });
  };

  function overlaps(c, g) { return c.source === g.source && c.span[0] <= g.span[1] && g.span[0] <= c.span[1]; }

  // ---- evaluate one chunk size ----
  function evaluate(data, size, overlapPct) {
    var overlap = Math.round(size * overlapPct / 100), chunks = buildChunks(data.docs, size, overlap), idx = new Index(chunks);
    var n = data.questions.length, h1 = 0, h3 = 0, h5 = 0, rr = 0, nd = 0, cats = {}, misses = [];
    data.questions.forEach(function (row) {
      var order = idx.rank(row.q), rel = order.map(function (ci) { return row.gold.some(function (g) { return overlaps(chunks[ci], g); }); });
      var pos = rel.indexOf(true); if (pos < 0) pos = Infinity;
      var rrq = pos === Infinity ? 0 : 1 / (pos + 1), dcg = 0, nrel = 0;
      rel.forEach(function (x) { if (x) nrel++; });
      for (var k = 0; k < Math.min(10, rel.length); k++) if (rel[k]) dcg += 1 / Math.log2(k + 2);
      var idcg = 0; for (var j = 0; j < Math.min(nrel, 10); j++) idcg += 1 / Math.log2(j + 2);
      var ndq = idcg ? dcg / idcg : 0;
      h1 += pos < 1; h3 += pos < 3; h5 += pos < 5; rr += rrq; nd += ndq;
      var c = cats[row.category] || (cats[row.category] = { n: 0, mrr: 0, hit1: 0 }); c.n++; c.mrr += rrq; c.hit1 += pos < 1;
      if (pos >= 3) misses.push({ q: row.q, rank: pos === Infinity ? null : pos + 1, got: chunks[order[0]].text.slice(0, 60) });
    });
    var total = chunks.reduce(function (a, c) { return a + cp(c.text).length; }, 0);
    Object.keys(cats).forEach(function (k) { cats[k].mrr /= cats[k].n; cats[k].hit1 /= cats[k].n; });
    return { size: size, overlap: overlap, chunks: chunks.length, avgLen: Math.round(total / chunks.length), n: n,
             hit1: h1 / n, hit3: h3 / n, hit5: h5 / n, mrr: rr / n, ndcg: nd / n, cats: cats, misses: misses };
  }

  // ---- search: top-k chunks with cosine scores (used by the site's AI helper) ----
  function makeSearcher(data, size, overlapPct) {
    var chunks = buildChunks(data.docs, size, Math.round(size * overlapPct / 100)), idx = new Index(chunks);
    return function (q, k) {
      var qv = idx.vec(counts(q)), sc = idx.vecs.map(function (dv) { var s = 0; for (var g in qv) { if (dv[g]) s += qv[g] * dv[g]; } return s; });
      return sc.map(function (s, i) { return i; }).sort(function (a, b) { return sc[b] - sc[a] || a - b; }).slice(0, k || 3).map(function (i) { return { chunk: chunks[i], score: sc[i] }; });
    };
  }

  var api = { buildChunks: buildChunks, evaluate: evaluate, makeSearcher: makeSearcher };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LabEngine = api;
})(typeof window !== 'undefined' ? window : this);
