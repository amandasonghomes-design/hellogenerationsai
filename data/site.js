// 网站基本设置 — 在这里改名称、联系方式
window.SITE = {
  name: "智启研习社",
  tagline: "AI 公益论坛 · 作品展览 · Quick Reference Guide",
  // 作品投稿用的邮箱。留空则只显示提示文字；填写后“投稿”按钮会打开邮件。
  email: "amandasonghomes@gmail.com",
  // 邮件主题
  subject: "智启研习社作品投稿",
  // 背景音乐：打开网站后随机播放下面的一首，约 1 分钟后慢慢淡出；顶部按钮可静音。
  // src 要填音频文件地址（.mp3），可以把文件放进 media/ 文件夹再写 "/media/xxx.mp3"。
  bgmSeconds: 60,
  bgm: [
    { title: "天国近了", src: "https://cdn1.suno.ai/eccf7009-2b64-4f4b-aeed-f7f4d1e3db05.mp3" },
    { title: "若你归来", src: "https://cdn1.suno.ai/af3544b8-27c9-4a8a-8cba-8061c4f35b74.mp3" }
  ]
};
