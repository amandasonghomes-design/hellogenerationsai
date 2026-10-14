/* The Secret Recipe comic reader */
(function(){
  var root = document.getElementById('comic'); if (!root) return;
  var N = 19, i = 0;
  var img = document.getElementById('panel'), count = document.getElementById('count'),
      prog = document.getElementById('prog'), thumbs = document.getElementById('thumbs'),
      prev = document.getElementById('prev'), next = document.getElementById('next');
  function src(n){ return '/media/comic/p' + (n < 10 ? '0' : '') + n + '.webp'; }
  for (var n = 1; n <= N; n++) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'cthumb'; b.setAttribute('aria-label', '第 ' + n + ' 格');
    b.innerHTML = '<img src="' + src(n) + '" alt="" loading="lazy">'; b.dataset.i = n - 1;
    b.addEventListener('click', function(){ show(+this.dataset.i); });
    thumbs.appendChild(b);
  }
  function fit(){
    if (!img.naturalWidth) return;
    var box = img.parentNode, maxW = Math.min(box.clientWidth - 2 * parseFloat(getComputedStyle(box).paddingLeft || 0), 680),
        maxH = Math.min(window.innerHeight * .5, 420), s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    img.style.width = Math.round(img.naturalWidth * s) + 'px'; img.style.height = Math.round(img.naturalHeight * s) + 'px';
  }
  img.addEventListener('load', fit); window.addEventListener('resize', fit);
  function show(k){
    i = Math.max(0, Math.min(N - 1, k));
    img.classList.remove('turn'); img.src = src(i + 1); img.alt = '漫画第 ' + (i + 1) + ' 格';
    void img.offsetWidth; img.classList.add('turn');
    count.textContent = '第 ' + (i + 1) + ' 格 / 共 ' + N + ' 格';
    prog.value = i + 1; prev.disabled = i === 0; next.disabled = i === N - 1;
    var ts = thumbs.children;
    for (var t = 0; t < ts.length; t++) ts[t].setAttribute('aria-current', t === i ? 'true' : 'false');
    var pre = new Image(); if (i + 2 <= N) pre.src = src(i + 2);
  }
  prev.addEventListener('click', function(){ show(i - 1); });
  next.addEventListener('click', function(){ show(i + 1); });
  document.addEventListener('keydown', function(e){
    if (document.getElementById('stage-panels').hidden) return;
    if (e.key === 'ArrowRight') show(i + 1); else if (e.key === 'ArrowLeft') show(i - 1);
  });
  var sx = 0, book = root.querySelector('.comic-book');
  book.addEventListener('touchstart', function(e){ sx = e.changedTouches[0].clientX; }, {passive:true});
  book.addEventListener('touchend', function(e){ var d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 45) show(i + (d < 0 ? 1 : -1)); }, {passive:true});
  root.querySelectorAll('[data-mode]').forEach(function(t){
    t.addEventListener('click', function(){
      var m = t.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach(function(o){ o.setAttribute('aria-pressed', o === t ? 'true' : 'false'); });
      document.getElementById('stage-panels').hidden = m !== 'panels';
      document.getElementById('stage-whole').hidden = m !== 'whole';
    });
  });
  show(0);
})();
