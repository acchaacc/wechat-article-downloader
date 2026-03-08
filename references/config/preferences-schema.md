# EXTEND.md Preferences Schema

## Overview

EXTEND.md allows users to customize default behavior without modifying the skill source.

**Lookup order**:
1. `.wechat-article-downloader/EXTEND.md` (project directory)
2. `~/.wechat-article-downloader/EXTEND.md` (user home)

CLI arguments always override EXTEND.md settings.

## Available Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `default_output` | string | `./wechat-articles` | Default output directory |
| `download_images` | boolean | `true` | Download images locally (`false` keeps remote URLs) |
| `timeout` | number | `30000` | Page load timeout in milliseconds |
| `max_scroll_steps` | number | `15` | Max scroll steps for lazy image loading |
| `scroll_wait_ms` | number | `800` | Wait time between scroll steps |
| `batch_delay_ms` | number | `2000` | Delay between articles in batch mode |
| `image_concurrency` | number | `3` | Max parallel image downloads |

## Example EXTEND.md

```markdown
# Preferences

- default_output: ./my-wechat-articles
- download_images: true
- timeout: 45000
- max_scroll_steps: 20
```

## Notes

- Keys are case-insensitive
- Boolean values: `true`/`false`, `yes`/`no`
- Lines starting with `#` are comments
- Unknown keys are silently ignored
