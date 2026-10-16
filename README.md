# 智启未来研习社网站

静态网站（纯 HTML / CSS / JS），无需构建，可直接部署到 Vercel。

## 文件说明
- `index.html` 首页 · `gallery.html` 作品展览 · `guide.html` Quick Reference Guide
- `data/site.js` 网站名称与投稿邮箱（填写 email 后，投稿按钮才会出现）
- `data/works.js` 作品清单 — 复制一段 `{ ... }` 即可新增作品，可加 image / audio / video / link
- `assets/` 样式与脚本 · `vercel.json` 路径设置（/gallery、/guide 不需 .html）

## 部署到 Vercel（任选一种）
**A. 网页拖拽（最简单）**：登录 vercel.com → Add New → Project，选择 GitHub 导入；
或先把本文件夹上传到一个 GitHub 仓库，再在 Vercel 点 Import。

**B. 命令行**：
```
npm i -g vercel
cd zhiqi
vercel        # 第一次预览
vercel --prod # 正式上线
```
Framework Preset 选 “Other”，Build Command 与 Output Directory 留空即可。

## 本地预览
```
cd zhiqi && npx serve
```
