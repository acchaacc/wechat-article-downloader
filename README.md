# 📰 微信公众号文章下载器

> 一键将微信公众号文章转为干净的 Markdown，图片自动保存到本地。

[English](./README.en.md)

基于 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 技能框架构建 — 可命令行独立运行，也可作为 🤖 AI Agent 技能直接调用。

## ✨ 功能特性

- 🌐 **Chrome CDP 渲染** — 完整 JavaScript 执行，自动处理懒加载图片
- 📦 **四种下载模式** — 单篇 URL / 批量文件 / 按公众号名搜索 / API 全量下载
- 📝 **Markdown 输出** — YAML 元数据（标题、作者、日期、来源）+ 干净正文
- 🖼️ **本地图片** — 自动下载所有文章图片，URL 重写为本地相对路径
- 🔧 **微信深度适配** — 处理 `data-src` 懒加载、`mmbiz.qpic.cn` 图片、`#js_content` 提取
- ⚙️ **灵活配置** — EXTEND.md 偏好设置 / 环境变量 / CLI 参数

## 📋 环境要求

- [Bun](https://bun.sh/) 运行时（或通过 `npx -y bun` 使用 Node.js）
- Google Chrome 或 Chromium 浏览器

## 🚀 快速开始

### 安装依赖

```bash
bun install
```

### 下载单篇文章

```bash
bun scripts/main.ts "https://mp.weixin.qq.com/s/你的文章ID"
```

### 指定输出目录

```bash
bun scripts/main.ts "https://mp.weixin.qq.com/s/xxxx" -o ./articles/
```

### 🔍 按公众号名搜索下载

```bash
# 下载某公众号最近 5 篇文章
bun scripts/main.ts --search "无害加速" --max 5

# 仅列出搜索结果（不下载）
bun scripts/main.ts --search "无害加速" --list
```

### 📑 批量下载

创建 `urls.txt` 文件（每行一个 URL，`#` 开头为注释）：

```bash
bun scripts/main.ts urls.txt -o ./backup/
```

### 🔑 下载自己公众号的所有文章

需要微信公众平台 API 凭据：

```bash
# 设置凭据
export WECHAT_APP_ID=你的AppID
export WECHAT_APP_SECRET=你的AppSecret

# 列出所有文章
bun scripts/main.ts --account --list

# 全量下载
bun scripts/main.ts --account -o ./my-articles/

# 只下载最近 20 篇
bun scripts/main.ts --account --max 20
```

凭据也可以存储在 `.env` 文件中：

```bash
# 项目级
mkdir -p .wechat-article-downloader
echo 'WECHAT_APP_ID=你的AppID' > .wechat-article-downloader/.env
echo 'WECHAT_APP_SECRET=你的AppSecret' >> .wechat-article-downloader/.env

# 或用户级（跨项目共享）
mkdir -p ~/.wechat-article-downloader
# 同上，写入 ~/.wechat-article-downloader/.env
```

## 📖 CLI 选项

| 选项 | 说明 |
|------|------|
| `<url>` | 单篇微信文章 URL |
| `<file.txt>` | 包含 URL 列表的批量文件 |
| `--search, -s <名称>` | 🔍 按公众号名搜索并下载文章 |
| `--account` | 🔑 通过 API 下载自己公众号的文章 |
| `-o, --output <目录>` | 📂 输出目录（默认：`./wechat-articles/`） |
| `--no-images` | 🚫 跳过图片下载，保留远程 URL |
| `--wait` | ⏳ 等待模式：手动登录后按回车继续 |
| `--timeout <毫秒>` | ⏱️ 页面加载超时（默认：30000） |
| `--list` | 📋 仅列出文章，不下载 |
| `--max, -n <数量>` | 🔢 最大下载文章数 |

## 🔄 四种下载模式

| 模式 | 触发方式 | 说明 |
|------|----------|------|
| 📄 **单篇下载** | 传入 `mp.weixin.qq.com` URL | 通过 Chrome CDP 抓取单篇文章 |
| 📑 **批量下载** | 传入 `.txt` 文件路径 | 顺序下载文件中所有 URL |
| 🔍 **搜索下载** | `--search "公众号名"` | 通过搜狗微信搜索查找文章后下载 |
| 🔑 **API 下载** | `--account` | 通过微信公众平台 API 拉取全部文章 |
| ⏳ **等待模式** | `--wait` | 打开 Chrome 手动登录，按回车后捕获 |

## 📂 输出格式

```
wechat-articles/
  📄 文章标题.md               ← Markdown + YAML 元数据
  📁 文章标题/
      📁 imgs/
          🖼️ 001.jpg            ← 本地保存的图片
          🖼️ 002.png
```

每篇文章的 Markdown 格式：

```yaml
---
title: "文章标题"
author: "作者名"
date: "2024-01-15"
source_url: "https://mp.weixin.qq.com/s/xxxx"
description: "文章摘要..."
captured_at: "2024-01-15T12:00:00.000Z"
---

# 文章标题

正文内容...

![](imgs/001.jpg)
```

## 🤖 Claude Code 技能

### 安装

```bash
# 方式一：克隆到技能目录
git clone https://github.com/harmlessacc/wechat-article-downloader ~/.claude/skills/wechat-article-downloader

# 方式二：从已有目录创建符号链接
ln -s /path/to/wechat-article-downloader ~/.claude/skills/wechat-article-downloader
```

### 触发关键词

安装后，在 Claude Code 中直接说：

- 💬 "下载这篇公众号文章 https://mp.weixin.qq.com/s/xxxx"
- 💬 "保存公众号文章到 Markdown"
- 💬 "搜索并下载无害加速最近的文章"
- 💬 "批量下载公众号所有文章"
- 💬 "备份公众号文章"

## ⚙️ 配置

### EXTEND.md 偏好设置

通过 `EXTEND.md` 自定义默认行为（无需修改源码）：

```markdown
# Preferences
- default_output: ./my-wechat-articles
- download_images: true
- timeout: 45000
```

**查找顺序**：`.wechat-article-downloader/EXTEND.md` → `~/.wechat-article-downloader/EXTEND.md`

详见 [偏好设置文档](./references/config/preferences-schema.md)。

### 环境变量

| 变量 | 说明 |
|------|------|
| `WECHAT_DL_CHROME_PATH` | 自定义 Chrome 可执行文件路径 |
| `WECHAT_DL_CHROME_PROFILE_DIR` | 自定义 Chrome 配置目录 |
| `WECHAT_APP_ID` | 微信公众号 App ID（API 模式） |
| `WECHAT_APP_SECRET` | 微信公众号 App Secret（API 模式） |

## 🔧 工作原理

```
URL → 🌐 Chrome CDP 启动 → 📄 导航到文章页 → ⬇️ 滚动触发懒加载
    → 🔍 提取元数据 + 内容 HTML → 🖼️ 下载图片 → 📝 转换 Markdown → 💾 写入文件
```

1. 通过 Chrome DevTools Protocol 启动浏览器
2. 导航到微信文章 URL，等待页面加载
3. 自动滚动页面，触发懒加载图片（`data-src` → `src`）
4. 从 `#js_content` 提取文章内容和元数据
5. 并发下载 `mmbiz.qpic.cn` 图片（带正确 Referer 头）
6. 用 Turndown + 微信专属规则将 HTML 转为 Markdown
7. 生成带 YAML 元数据的 `.md` 文件

## ❓ 故障排除

| 问题 | 解决方案 |
|------|----------|
| 🚫 找不到 Chrome | 安装 Chrome 或设置 `WECHAT_DL_CHROME_PATH` |
| ⏱️ 超时 | 增大 `--timeout` 值 |
| 🔐 需要登录 | 使用 `--wait` 模式手动登录 |
| ❌ API 错误 | 检查 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET` |
| 🖼️ 图片未加载 | 页面可能需要更多滚动时间 |
| 🗑️ 文章已删除 | 文章已被作者移除，无法下载 |
| 🤖 搜狗验证码 | 稍后重试，或直接使用文章 URL |

## 📄 许可证

[MIT](./LICENSE)

---

Made with ❤️ by [Harmless Acceleration](https://github.com/harmlessacc)
