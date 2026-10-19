// POST /api/tts  { text, voice, rate, pitch }  ->  audio/mpeg
// Uses Microsoft Edge's free neural voices through the "edge-tts-universal" package.
const VOICES = [
  'zh-CN-XiaoxiaoNeural', 'zh-CN-XiaoyiNeural', 'zh-CN-YunxiNeural', 'zh-CN-YunyangNeural',
  'zh-CN-YunjianNeural', 'zh-TW-HsiaoChenNeural', 'zh-TW-YunJheNeural', 'zh-HK-HiuMaanNeural', 'zh-HK-WanLungNeural'
];
const MAX_CHARS = 700;

function pct(n, lo, hi) { n = Math.round(Number(n) || 0); return Math.max(lo, Math.min(hi, n)); }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'POST only' }); }
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const text = String(b.text || '').trim();
    const voice = VOICES.includes(b.voice) ? b.voice : VOICES[0];
    if (!text) return res.status(400).json({ error: 'empty text' });
    if (text.length > MAX_CHARS) return res.status(413).json({ error: 'text too long (max ' + MAX_CHARS + ')' });
    const rate = pct((Number(b.rate) - 1) * 100, -50, 50);
    const hz = pct((Number(b.pitch) - 1) * 50, -30, 30);
    const opts = { rate: (rate >= 0 ? '+' : '') + rate + '%', pitch: (hz >= 0 ? '+' : '') + hz + 'Hz' };
    const mod = await import('edge-tts-universal');
    const tts = new mod.EdgeTTS(text, voice, opts);
    const result = await tts.synthesize();
    const a = result.audio;
    const buf = Buffer.isBuffer(a) ? a : Buffer.from(await a.arrayBuffer());
    if (!buf.length) throw new Error('empty audio');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    console.error('tts failed', e && e.message);
    return res.status(502).json({ error: 'tts failed' });
  }
};
