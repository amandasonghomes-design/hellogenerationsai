(function () {
  if (window.__hp) return; window.__hp = 1;
  var KITTY = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 26 12 6l16 11z" fill="#F6B26B"/><path d="M54 26 52 6 36 17z" fill="#F6B26B"/><path d="M14 20l.8-8 7 5z" fill="#FFB7D5"/><path d="M50 20l-.8-8-7 5z" fill="#FFB7D5"/><ellipse cx="32" cy="37" rx="23" ry="20" fill="#FFD9A8"/><path d="M32 17c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5z" fill="#F6B26B" opacity=".55"/><ellipse cx="22" cy="36" rx="3.6" ry="4.4" fill="#27345E"/><ellipse cx="42" cy="36" rx="3.6" ry="4.4" fill="#27345E"/><circle cx="23.2" cy="34.4" r="1.4" fill="#fff"/><circle cx="43.2" cy="34.4" r="1.4" fill="#fff"/><ellipse cx="15" cy="44" rx="4.5" ry="3" fill="#FFB7D5" opacity=".7"/><ellipse cx="49" cy="44" rx="4.5" ry="3" fill="#FFB7D5" opacity=".7"/><path d="M29.5 42h5l-2.5 3z" fill="#E0657F"/><path d="M32 45v2.5M32 47.5c-1.6 1.8-4 1.8-5.4 0M32 47.5c1.6 1.8 4 1.8 5.4 0" stroke="#27345E" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M6 40l9 2M6 46l9-1M58 40l-9 2M58 46l-9-1" stroke="#27345E" stroke-width="1.2" stroke-linecap="round" opacity=".6"/><path d="M24 57l8 4 8-4-8-2z" fill="#3F82D9"/></svg>';
  var TOPICS = [
    { k: /suno|歌曲|音乐|作曲|写歌|歌词|赞美|唱/i, t: '想做 AI 歌曲？Quick Guide 里有用 Suno 做歌的五步流程，AI 歌曲页可以听大家的作品，也欢迎你投稿～', l: [['Suno 五步', '/guide#song'], ['AI 歌曲', '/songs']] },
    { k: /视频|影片|短片|剪辑|动画|muse|runway|可灵|sora/i, t: '做 AI 视频：先写脚本、再生成画面、最后剪辑，Quick Guide 里有五步流程。AI 视频页有社员的作品和教学视频。', l: [['视频五步', '/guide#video'], ['AI 视频', '/videos']] },
    { k: /网站|网页|上线|github|vercel|域名|部署|做站/i, t: '不会写程序也能做网站：用 AI 写页面，放到 GitHub，再用 Vercel 免费上线。步骤都写在“AI 做网站”页里。', l: [['AI 做网站', '/website']] },
    { k: /prompt|提示词|指令|怎么问|怎么写.*ai/i, t: '好的 Prompt 要说清楚：你是谁／要做什么／给谁看／格式与限制。Quick Guide 的 Prompt 部分有公式，西部牛仔小猫页有一份完整的视频提示词范例。', l: [['Prompt 公式', '/guide#prompt'], ['提示词范例', '/cat-prompt']] },
    { k: /生成式|generative|llm|大模型|大语言|chatgpt|claude|什么是 ?ai|ai 是什么/i, t: '生成式 AI 是能“生成”文字、图片、歌曲、视频的 AI；大语言模型（LLM）是其中会读写文字的那一种，ChatGPT、Claude 都是。Quick Guide 开头用四个关键词（生成式 AI、LLM、Prompt、AI Agent）做了简单介绍。', l: [['四个关键词', '/guide#intro']] },
    { k: /agent|智能体|代理/i, t: 'AI Agent 不只是聊天，它能自己拆步骤、调用工具去完成任务。Quick Guide 里有简单的说明。', l: [['AI Agent', '/guide#agent']] },
    { k: /创业|赚钱|副业|opc|一人公司|接案/i, t: '创业不一定要会写程序：找一个真实的小问题，用 AI 做出原型去验证。OPC（一人公司）和五个方向都在 AI 创业页。', l: [['AI 创业', '/startup']] },
    { k: /游戏|赛马|画马|doodle|derby/i, t: '来玩 Doodle Derby！在画板上画一匹马，然后看它和对手赛跑。', l: [['AI 游戏', '/game']] },
    { k: /实验室|rag|检索|chunk|评测|mrr|ndcg/i, t: 'AI 实验室里可以自己选 chunk 大小，看检索评测的 MRR、nDCG、Hit@k 怎么变化。', l: [['AI 实验室', '/lab']] },
    { k: /投稿|提交|展示.*作品|发布.*作品/i, t: '欢迎投稿！作品展览和各分类页面最下面有“我要投稿”，提供作品名称、作者、简短说明和文件或链接即可。', l: [['作品展览', '/gallery']] },
    { k: /语音|朗读|读出来|文字转语音|tts/i, t: '文字转语音页可以把中文文字读出来。', l: [['文字转语音', '/voice']] },
    { k: /安全|隐私|版权|会不会泄露|可靠|幻觉|胡说/i, t: '用 AI 要小心：不要输入个人隐私和密码，重要信息要自己核对，作品的版权与署名也要留意。Quick Guide 里有“安全与注意事项”。', l: [['安全须知', '/guide#safe']] }
  ];
  var CHIPS = ['怎么用 Suno 做歌？', '怎么做 AI 视频？', '不会写程序能做网站吗？', '好的 Prompt 怎么写？', '什么是生成式 AI？'];
  var SRC = { forum_deck: ['AI 公益论坛讲座', '/'], llm_basics: ['大模型基础', '/guide'], website_steps: ['AI 做网站', '/website'], website_guide: ['AI 做网站', '/website'], github_guide: ['AI 做网站', '/website'] };

  var btn = document.createElement('button'); btn.className = 'hp-btn'; btn.type = 'button'; btn.setAttribute('aria-label', '打开 AI 小助手'); btn.innerHTML = KITTY;
  var tip = document.createElement('div'); tip.className = 'hp-tip'; tip.textContent = '有问题？问问小喵 🐾';
  var panel = document.createElement('div'); panel.className = 'hp-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'AI 小助手');
  panel.innerHTML = '<div class="hp-head"><span class="av">' + KITTY + '</span><div><b>AI 小助手 · 小喵</b><small>帮你找到本站的教程和资料</small></div><button class="hp-x" type="button" aria-label="关闭">×</button></div><div class="hp-log" aria-live="polite"></div><div class="hp-chips"></div><form class="hp-form"><input type="text" placeholder="输入你的问题…" aria-label="输入问题" autocomplete="off" maxlength="200"><button type="submit">发送</button></form>';
  document.body.appendChild(tip); document.body.appendChild(btn); document.body.appendChild(panel);
  try { if (sessionStorage.getItem('hp-tip')) tip.hidden = true; } catch (e) {}
  var log = panel.querySelector('.hp-log'), chips = panel.querySelector('.hp-chips'), input = panel.querySelector('input');
  var data = null, search = null, loading = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function add(cls, html) { var d = document.createElement('div'); d.className = 'hp-m ' + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function links(ls) { return '<div class="hp-links">' + ls.map(function (l) { return '<a href="' + l[1] + '">' + esc(l[0]) + ' →</a>'; }).join('') + '</div>'; }
  function tidy(t) { return t.replace(/^#+\s*/gm, '').replace(/[*_`>]/g, '').replace(/\s+/g, ' ').trim(); }

  function load() {
    if (loading) return loading;
    loading = Promise.all([
      new Promise(function (res) { if (window.LabEngine) return res(); var s = document.createElement('script'); s.src = '/assets/lab-engine.js'; s.onload = res; s.onerror = res; document.head.appendChild(s); }),
      fetch('/data/lab-data.json').then(function (r) { return r.json(); })
    ]).then(function (r) { data = r[1]; if (window.LabEngine) search = LabEngine.makeSearcher(data, 400, 20); }).catch(function () {});
    return loading;
  }

  function answer(q) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].k.test(q)) return add('bot', esc(TOPICS[i].t) + links(TOPICS[i].l));
    var thinking = add('bot', '让小喵翻翻资料…');
    load().then(function () {
      var hits = search ? search(q, 2) : [];
      if (!hits.length || hits[0].score < 0.12) {
        thinking.innerHTML = '喵～这个问题我在本站资料里没找到。可以换个说法，或者试试下面的话题：' + links([['Quick Guide', '/guide'], ['AI 做网站', '/website'], ['作品展览', '/gallery']]);
        return;
      }
      var h = hits[0], src = SRC[h.chunk.source] || ['本站资料', '/'], txt = tidy(h.chunk.text);
      thinking.innerHTML = '我在“' + esc(src[0]) + '”里找到这段相关内容：<div class="hp-src">' + esc(txt.length > 170 ? txt.slice(0, 170) + '…' : txt) + '</div><small style="color:#5A678F">这是自动检索的结果，可能不完全对题。</small>' + links([[src[0], src[1]]]);
      log.scrollTop = log.scrollHeight;
    });
  }

  function send(q) { q = q.trim(); if (!q) return; add('me', esc(q)); input.value = ''; answer(q); }

  function open() {
    panel.hidden = false; tip.hidden = true; try { sessionStorage.setItem('hp-tip', '1'); } catch (e) {}
    if (!log.children.length) {
      add('bot', '你好，我是小喵 🐱 我可以带你找到本站的教程：AI 歌曲、AI 视频、做网站、Prompt、创业…你想了解什么？');
      CHIPS.forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.onclick = function () { send(c); }; chips.appendChild(b); });
    }
    load(); setTimeout(function () { input.focus(); }, 50);
  }
  function close() { panel.hidden = true; btn.focus(); }
  btn.addEventListener('click', function () { panel.hidden ? open() : close(); });
  panel.querySelector('.hp-x').addEventListener('click', close);
  panel.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
})();
