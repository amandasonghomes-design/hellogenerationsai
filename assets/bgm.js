/* Background music: plays one random track when a visitor first opens the site,
   fades in, plays for ~1 minute, then fades out. A button at the top mutes it. */
(function(){
  var S = window.SITE || {}, tracks = (S.bgm || []).filter(function(t){ return t && t.src; });
  if (!tracks.length) return;
  var PLAY_SECONDS = S.bgmSeconds || 60, FADE_IN = 3000, FADE_OUT = 6000, VOLUME = S.bgmVolume || 0.45;
  function get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} }
  function sget(k){ try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v){ try { sessionStorage.setItem(k, v); } catch (e) {} }

  var audio = new Audio(), muted = get('zq_bgm_muted') === '1', playing = false, failed = false, timer = null, fadeTimer = null, pending = false;
  audio.preload = 'none'; audio.loop = false; audio.volume = 0;
  var track = tracks[Math.floor(Math.random() * tracks.length)];
  audio.src = track.src;
  audio.addEventListener('error', function(){ failed = true; stop(true); if (btn) btn.hidden = true; });

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'bgm-btn';
  function paint(){
    var on = playing && !muted;
    btn.textContent = on ? '🔊' : '🔇';
    btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    var label = muted ? '打开背景音乐' : (playing ? '静音背景音乐' : '播放背景音乐');
    btn.setAttribute('aria-label', label); btn.title = label + (track.title ? '（' + track.title + '）' : '');
  }
  var host = document.querySelector('.site-header .wrap') || document.body;
  host.appendChild(btn); if (host.classList) host.classList.add('has-bgm'); paint();

  function ramp(to, ms, done){
    clearInterval(fadeTimer);
    var from = audio.volume, t0 = Date.now();
    fadeTimer = setInterval(function(){
      var k = Math.min(1, (Date.now() - t0) / ms);
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k >= 1) { clearInterval(fadeTimer); if (done) done(); }
    }, 60);
  }
  function stop(immediate){
    clearTimeout(timer); clearInterval(fadeTimer);
    if (immediate) { audio.pause(); audio.volume = 0; playing = false; paint(); return; }
    ramp(0, FADE_OUT, function(){ audio.pause(); playing = false; paint(); });
  }
  function start(){
    if (muted || failed || playing) return Promise.resolve();
    audio.volume = 0;
    var p = audio.play();
    return Promise.resolve(p).then(function(){
      playing = true; pending = false; paint();
      ramp(VOLUME, FADE_IN);
      clearTimeout(timer);
      timer = setTimeout(function(){ stop(false); }, Math.max(1000, PLAY_SECONDS * 1000 - FADE_OUT));
    }, function(){ playing = false; pending = true; paint(); });
  }
  btn.addEventListener('click', function(){
    muted = !muted; set('zq_bgm_muted', muted ? '1' : '0');
    if (muted) { stop(true); } else { audio.currentTime = 0; start(); }
    paint();
  });

  // Browsers usually block sound until the visitor interacts, so wait for the first touch/click/key.
  function onFirstGesture(){
    ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(function(ev){ window.removeEventListener(ev, onFirstGesture, true); });
    if (!sget('zq_bgm_done') && !muted) { sset('zq_bgm_done', '1'); start(); }
  }
  if (!sget('zq_bgm_done') && !muted) {
    start().then(function(){ if (playing) sset('zq_bgm_done', '1'); else ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(function(ev){ window.addEventListener(ev, onFirstGesture, true); }); });
  }
})();
