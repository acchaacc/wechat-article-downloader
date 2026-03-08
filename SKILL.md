---
name: wechat-article-downloader
description: >
  Downloads WeChat Official Account (微信公众号) articles and converts to
  Markdown with local images. Supports single URL, batch file, search by
  account name via Sogou, or bulk download via WeChat API. Use when user
  mentions "download wechat article", "保存公众号文章", "下载公众号",
  "微信文章转markdown", "备份公众号", or provides mp.weixin.qq.com URLs.
license: MIT
compatibility: >
  Requires Bun runtime (or Node.js with npx -y bun fallback) and
  Google Chrome or Chromium browser.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - AskUserQuestion
metadata:
  author: acchaacc
  version: "0.2.0"
---

# WeChat Article Downloader

Downloads WeChat Official Account articles via Chrome CDP and converts to clean Markdown with locally saved images.

## Script Directory

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Detect runtime: if `bun` is available use `bun`, otherwise use `npx -y bun`. Store as `${BUN_X}`
3. Script path = `${SKILL_DIR}/scripts/main.ts`

**Runtime Detection** (one-time per session):
```bash
command -v bun >/dev/null 2>&1 && echo "bun" || echo "npx -y bun"
```

Run `${BUN_X} ${SKILL_DIR}/scripts/main.ts --help` for full CLI options.

## Preferences (EXTEND.md)

Check for user preferences (priority order):

```bash
test -f .wechat-article-downloader/EXTEND.md && echo "project"
test -f "$HOME/.wechat-article-downloader/EXTEND.md" && echo "user"
```

| Result | Action |
|--------|--------|
| Found | Read, parse, apply settings |
| Not found | Use defaults |

See `references/config/preferences-schema.md` for full schema.

## Usage

### Single Article

```bash
${BUN_X} ${SKILL_DIR}/scripts/main.ts "https://mp.weixin.qq.com/s/xxxx"
```

### Custom Output Directory

```bash
${BUN_X} ${SKILL_DIR}/scripts/main.ts "https://mp.weixin.qq.com/s/xxxx" -o ./articles/
```

### Search by Account Name (via Sogou)

```bash
${BUN_X} ${SKILL_DIR}/scripts/main.ts --search "公众号名称" --max 5
${BUN_X} ${SKILL_DIR}/scripts/main.ts --search "公众号名称" --list
```

### Batch Download from URL List

```bash
${BUN_X} ${SKILL_DIR}/scripts/main.ts urls.txt -o ./backup/
```

### Download from Own Account (API)

Requires WeChat Official Account API credentials (see Environment Variables):

```bash
${BUN_X} ${SKILL_DIR}/scripts/main.ts --account --list
${BUN_X} ${SKILL_DIR}/scripts/main.ts --account -o ./my-articles/
${BUN_X} ${SKILL_DIR}/scripts/main.ts --account --max 20
```

## Download Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| Single URL | Pass a `mp.weixin.qq.com` URL | Download one article via CDP |
| Batch file | Pass a `.txt` file path | Download all URLs sequentially |
| Search | `--search "name"` | Find articles via Sogou, then download |
| Account | `--account` flag | List + download all via WeChat API |
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

## Environment Variables

| Variable | Description |
|----------|-------------|
| `WECHAT_DL_CHROME_PATH` | Custom Chrome executable path |
| `WECHAT_DL_CHROME_PROFILE_DIR` | Custom Chrome profile directory |
| `WECHAT_APP_ID` | WeChat Official Account App ID (for `--account` mode) |
| `WECHAT_APP_SECRET` | WeChat Official Account App Secret (for `--account` mode) |

API credentials can also be set in `.wechat-article-downloader/.env` or `~/.wechat-article-downloader/.env`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Chrome not found | Install Chrome or set `WECHAT_DL_CHROME_PATH` |
| Timeout | Increase `--timeout` value |
| Login required | Use `--wait` mode |
| API errors | Check `WECHAT_APP_ID` and `WECHAT_APP_SECRET` |
| Images not loading | Page may need more scroll time; increase timeout |
| Sogou captcha | Try again later or use direct article URL |
