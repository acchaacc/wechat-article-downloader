---
name: wechat-article-downloader
description: Downloads WeChat Official Account (微信公众号) articles and converts to Markdown with local images. Supports single URL, batch file, search by account name (Sogou), or bulk download all articles from your own account via API. Use when user mentions "download wechat article", "保存公众号文章", "下载公众号", "微信文章转markdown", "备份公众号", or provides mp.weixin.qq.com URLs.
---

# WeChat Article Downloader

Downloads WeChat Official Account articles via Chrome CDP and converts to clean Markdown with locally saved images.

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Detect runtime: if `bun` is available use `bun`, otherwise use `npx -y bun`. Store as `${BUN_X}`
3. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
4. Replace all `${SKILL_DIR}` and `${BUN_X}` in this document with actual values

**Runtime Detection** (one-time per session):
```bash
command -v bun >/dev/null 2>&1 && echo "bun" || echo "npx -y bun"
```

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | CLI entry point — single URL, batch file, search, or account download |

## Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
# Check project-level first
test -f .wechat-article-downloader/EXTEND.md && echo "project"

# Then user-level
test -f "$HOME/.wechat-article-downloader/EXTEND.md" && echo "user"
```

| Path | Location |
|------|----------|
| `.wechat-article-downloader/EXTEND.md` | Project directory |
| `$HOME/.wechat-article-downloader/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | Read, parse, apply settings |
| Not found | Use defaults (no blocking setup required) |

**EXTEND.md Supports**: Default output directory | Image download toggle | Timeout settings | Max scroll steps

See `references/config/preferences-schema.md` for full schema.

## Features

- **Chrome CDP rendering** — Full JavaScript execution, handles lazy-loaded images
- **Four download modes** — Single URL, batch file, search by account name, bulk account download via API
- **Markdown output** — YAML frontmatter (title, author, date, source) + clean body
- **Local images** — Downloads all article images, rewrites URLs to local paths
- **WeChat-specific** — Handles `data-src` lazy loading, `mmbiz.qpic.cn` images, `#js_content` extraction

## Usage

### Single Article

```bash
${BUN_X} ${SKILL_DIR}/scripts/main.ts "https://mp.weixin.qq.com/s/xxxx"
```

### Single Article with Custom Output

```bash
${BUN_X} ${SKILL_DIR}/scripts/main.ts "https://mp.weixin.qq.com/s/xxxx" -o ./articles/
```

### Search by Account Name (via Sogou)

```bash
# Search and download latest articles from a public account
${BUN_X} ${SKILL_DIR}/scripts/main.ts --search "公众号名称" --max 5

# List search results only (no download)
${BUN_X} ${SKILL_DIR}/scripts/main.ts --search "公众号名称" --list
```

### Batch Download from URL List

Create a `urls.txt` file (one URL per line, `#` for comments):

```bash
${BUN_X} ${SKILL_DIR}/scripts/main.ts urls.txt -o ./backup/
```

### Download from Your Own Account (API)

Requires WeChat Official Account API credentials (see Environment Variables):

```bash
# List all articles
${BUN_X} ${SKILL_DIR}/scripts/main.ts --account --list

# Download all
${BUN_X} ${SKILL_DIR}/scripts/main.ts --account -o ./my-articles/

# Download latest 20
${BUN_X} ${SKILL_DIR}/scripts/main.ts --account --max 20
```

## Options

| Option | Description |
|--------|-------------|
| `<url>` | Single WeChat article URL |
| `<batch-file.txt>` | Text file with one URL per line |
| `--search, -s <name>` | Search & download articles from a public account by name |
| `--account` | Download all articles from your own Official Account via API |
| `-o, --output <dir>` | Output directory (default: `./wechat-articles/`) |
| `--no-images` | Skip image download, keep remote URLs |
| `--wait` | Wait mode: log in manually, press Enter to capture |
| `--timeout <ms>` | Page load timeout (default: 30000) |
| `--list` | List articles only, don't download |
| `--max, -n <num>` | Max articles to download (default: all) |

## Download Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| Single URL | Pass a `mp.weixin.qq.com` URL | Download one article via CDP |
| Batch file | Pass a `.txt` file path | Download all URLs in file sequentially |
| Search | `--search "name"` | Find articles via Sogou Weixin Search, then download |
| Account | `--account` flag | List + download all via WeChat Official Platform API |
| Wait | `--wait` flag | Open Chrome, user logs in, press Enter to capture |

## Output Format

YAML frontmatter + Markdown body:

```yaml
---
title: "Article Title"
author: "Author Name"
date: "2024-01-15"
source_url: "https://mp.weixin.qq.com/s/xxxx"
description: "Article digest..."
captured_at: "2024-01-15T12:00:00.000Z"
---
```

## Output Directory

```
wechat-articles/
  <article-slug>.md
  <article-slug>/
    imgs/
      001.jpg
      002.png
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `WECHAT_DL_CHROME_PATH` | Custom Chrome executable path |
| `WECHAT_DL_CHROME_PROFILE_DIR` | Custom Chrome profile directory |
| `WECHAT_APP_ID` | WeChat Official Account App ID (for `--account` mode) |
| `WECHAT_APP_SECRET` | WeChat Official Account App Secret (for `--account` mode) |

**API credentials** can also be set in `.wechat-article-downloader/.env` or `~/.wechat-article-downloader/.env`.

## Troubleshooting

- **Chrome not found** → Install Chrome or set `WECHAT_DL_CHROME_PATH`
- **Timeout** → Increase `--timeout` value
- **Login required** → Use `--wait` mode
- **API errors** → Check `WECHAT_APP_ID` and `WECHAT_APP_SECRET`
- **Images not loading** → Page may need more scroll time; increase timeout
- **Article deleted** → Error: "Article not found or has been deleted"
- **Sogou captcha** → If search returns no results, Sogou may require CAPTCHA verification; try again later

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
