/* 首页“精选”：按顺序显示，第一个是本周主推。每个 url 必须允许被网页嵌入（iframe）。想换主推，改顺序或内容即可。 */
window.FEATURES = [
  {
    week: "本周主推 · 机器人项目",
    title: "Tiny Robot Watch 小机器人手表",
    blurb: "自己动手做的圆形智能手表，也是机器人的脸和挂坠：六个小应用、机器人眼睛、像素游戏，外壳是 3D 打印的。下面这块屏幕跑的就是手表里真正的程序，点一点、玩一玩。",
    tags: ["机器人", "3D 打印", "ESP32", "可以玩"],
    url: "/apps/tiny-robot-watch.html",
    open: "/robot-watch",
    openText: "看完整页面（含 3D 外壳） →",
    poster: "/media/robot-watch-poster.webp",
    height: 640
  },
  {
    week: "也推荐 · 儿童学中文",
    title: "小猫学中文 Little Cat Chinese",
    blurb: "每天学一个汉字和一个句子，可以听发音、听妈妈的声音、录自己的声音。孩子在这里就能直接试一下。",
    tags: ["儿童", "学中文", "可录音"],
    url: "https://kimichan.vercel.app",
    openText: "打开完整网站 ↗",
    poster: "/media/kitty/wave.webp",
    height: 600
  }
];
