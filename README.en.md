# 📰 WeChat Article Downloader

> Download WeChat Official Account (微信公众号) articles to clean Markdown with locally saved images.

[中文](./README.md)

Built as a [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill — works standalone via CLI or as a 🤖 AI Agent skill.

## ✨ Features

- 🌐 **Chrome CDP rendering** — Full JavaScript execution, handles lazy-loaded images
- 📦 **Four download modes** — Single URL / batch file / search by account name / bulk API download
- 📝 **Markdown output** — YAML frontmatter (title, author, date, source) + clean body
- 🖼️ **Local images** — Downloads all article images, rewrites URLs to local paths
- 🔧 **WeChat-specific** — Handles `data-src` lazy loading, `mmbiz.qpic.cn` images, `#js_content` extraction
- ⚙️ **Configurable** — EXTEND.md preferences, environment variables, CLI options

## 📋 Prerequisites

- [Bun](https://bun.sh/) runtime (or Node.js with `npx -y bun`)
- Google Chrome or Chromium

## 🚀 Quick Start

### Install dependencies

```bash
bun install
```

### Download a single article

```bash
bun scripts/main.ts "https://mp.weixin.qq.com/s/YOUR_ARTICLE_ID"
```

### Download with custom output directory

```bash
bun scripts/main.ts "https://mp.weixin.qq.com/s/xxxx" -o ./articles/
```

### 🔍 Search and download by account name

```bash
# Download latest 5 articles from an account
bun scripts/main.ts --search "公众号名称" --max 5

# List articles only (no download)
bun scripts/main.ts --search "公众号名称" --list
```

### 📑 Batch download from URL list

Create a `urls.txt` file (one URL per line, `#` for comments):

```bash
bun scripts/main.ts urls.txt -o ./backup/
```

### 🔑 Download all articles from your own account

Requires WeChat Official Account API credentials:

```bash
# Set credentials
export WECHAT_APP_ID=your_app_id
export WECHAT_APP_SECRET=your_app_secret

# List all articles
bun scripts/main.ts --account --list

# Download all
bun scripts/main.ts --account -o ./my-articles/

# Download latest 20
bun scripts/main.ts --account --max 20
```

Or store credentials in `.wechat-article-downloader/.env`:

```env
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
```

## 📖 CLI Options

| Option | Description |
|--------|-------------|
| `<url>` | Single WeChat article URL |
| `<file.txt>` | Batch file with URLs |
| `--search, -s <name>` | 🔍 Search & download articles by account name |
| `--account` | 🔑 Download from your own Official Account via API |
| `-o, --output <dir>` | 📂 Output directory (default: `./wechat-articles/`) |
| `--no-images` | 🚫 Skip image download, keep remote URLs |
| `--wait` | ⏳ Wait mode: log in manually, press Enter to capture |
| `--timeout <ms>` | ⏱️ Page load timeout (default: 30000) |
| `--list` | 📋 List articles only, don't download |
| `--max, -n <num>` | 🔢 Max articles to download |

## 🔄 Download Modes

| Mode | Trigger | Description |
|------|---------|-------------|
| 📄 **Single URL** | Pass a `mp.weixin.qq.com` URL | Download one article via CDP |
| 📑 **Batch file** | Pass a `.txt` file path | Download all URLs in file sequentially |
| 🔍 **Search** | `--search "name"` | Find articles via Sogou Weixin Search, then download |
| 🔑 **Account** | `--account` flag | List + download all via WeChat Official Platform API |
| ⏳ **Wait** | `--wait` flag | Open Chrome, user logs in, press Enter |

## 📂 Output Format

```
wechat-articles/
  📄 article-title.md          ← Markdown with YAML frontmatter
  📁 article-title/
      📁 imgs/
          🖼️ 001.jpg            ← Downloaded images
          🖼️ 002.png
```

Each `.md` file includes:

```yaml
---
title: "Article Title"
author: "Author Name"
date: "2024-01-15"
source_url: "https://mp.weixin.qq.com/s/xxxx"
description: "Article summary..."
captured_at: "2024-01-15T12:00:00.000Z"
---

# Article Title

Article content in Markdown...

![](imgs/001.jpg)
```

## 🤖 Claude Code Skill

### Install

```bash
# Clone to your skills directory
git clone https://github.com/harmlessacc/wechat-article-downloader ~/.claude/skills/wechat-article-downloader

# Or symlink from an existing clone
ln -s /path/to/wechat-article-downloader ~/.claude/skills/wechat-article-downloader
```

### Trigger keywords

In Claude Code, say:

- 💬 "下载这篇公众号文章 https://mp.weixin.qq.com/s/xxxx"
- 💬 "保存公众号文章到 Markdown"
- 💬 "搜索并下载无害加速最近的文章"
- 💬 "Download this WeChat article"
- 💬 "Batch download all articles from an account"

## ⚙️ Configuration

### EXTEND.md Preferences

Customize defaults via `EXTEND.md` (no source code changes needed):

```markdown
# Preferences
- default_output: ./my-wechat-articles
- download_images: true
- timeout: 45000
```

**Lookup order**: `.wechat-article-downloader/EXTEND.md` → `~/.wechat-article-downloader/EXTEND.md`

See [preferences schema](./references/config/preferences-schema.md) for all options.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `WECHAT_DL_CHROME_PATH` | Custom Chrome executable path |
| `WECHAT_DL_CHROME_PROFILE_DIR` | Custom Chrome profile directory |
| `WECHAT_APP_ID` | WeChat Official Account App ID |
| `WECHAT_APP_SECRET` | WeChat Official Account App Secret |

## 🔧 How It Works

```
URL → 🌐 Chrome CDP → 📄 Navigate → ⬇️ Scroll (lazy load)
    → 🔍 Extract metadata + HTML → 🖼️ Download images → 📝 Convert to Markdown → 💾 Write file
```

1. Launch Chrome via DevTools Protocol
2. Navigate to the WeChat article URL
3. Auto-scroll to trigger lazy image loading (`data-src` → `src`)
4. Extract content and metadata from `#js_content`
5. Download images from `mmbiz.qpic.cn` with proper Referer headers
6. Convert HTML to Markdown using Turndown with WeChat-specific rules
7. Write `.md` file with YAML frontmatter and local image references

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| 🚫 Chrome not found | Install Chrome or set `WECHAT_DL_CHROME_PATH` |
| ⏱️ Timeout | Increase `--timeout` value |
| 🔐 Login required | Use `--wait` mode |
| ❌ API errors | Check `WECHAT_APP_ID` and `WECHAT_APP_SECRET` |
| 🖼️ Images not loading | Page may need more scroll time |
| 🗑️ Article deleted | The article has been removed by the author |
| 🤖 Sogou captcha | Try again later or use direct URLs |

## 📄 License

[MIT](./LICENSE)

---

Made with ❤️ by [Harmless Acceleration](https://github.com/harmlessacc)
