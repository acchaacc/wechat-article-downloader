# Changelog

## 0.2.0 - 2026-03-08

### Features
- Add `--search` mode: find and download articles from any public account via Sogou Weixin Search
- Add bilingual documentation (README.md + README.zh.md)
- Add `references/` directory with configuration docs and preferences schema
- Add CHANGELOG.md / CHANGELOG.zh.md

### Refactor
- Remove `baoyu-skills` dependency — fully standalone skill
- Update SKILL.md to follow baoyu-skills conventions (`${SKILL_DIR}`, `${BUN_X}`, EXTEND.md pattern)
- Improve .gitignore with comprehensive patterns
- Update config path: `.baoyu-skills/` → `.wechat-article-downloader/`

### Fixes
- Fix `--account` flag not being parsed in CLI args
- Fix CDP session error when using search mode (launch Chrome with target URL directly)

## 0.1.0 - 2026-03-07

### Features
- Initial release
- Single article download via Chrome CDP
- Batch download from URL list file
- Account-wide download via WeChat Official Platform API
- WeChat-specific extraction: `#js_content`, `data-src` lazy images, metadata
- Local image download with URL rewriting to relative paths
- YAML frontmatter generation (title, author, date, source_url, description)
- HTML to Markdown conversion with Turndown + GFM plugin
- WeChat-specific Turndown rules (data-src preference, mpvoice/audio handling)
- Wait mode for login-required articles
- Cross-platform Chrome detection (macOS, Windows, Linux)
