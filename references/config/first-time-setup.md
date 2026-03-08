# First-Time Setup

## Prerequisites

- **Bun** runtime — [bun.sh](https://bun.sh/) or via `npx -y bun`
- **Google Chrome** or Chromium-based browser

## Quick Start

No special setup is needed for basic usage. Just run with a WeChat article URL:

```bash
bun scripts/main.ts "https://mp.weixin.qq.com/s/xxxx"
```

## Optional Configuration

### Custom Chrome Path

If Chrome is not in a standard location:

```bash
export WECHAT_DL_CHROME_PATH="/path/to/chrome"
```

### WeChat Official Account API (for `--account` mode)

To download all articles from your own Official Account, you need API credentials:

1. Log in to [WeChat Official Platform](https://mp.weixin.qq.com/)
2. Go to **Settings** → **Developer** → **Basic Configuration**
3. Get your `AppID` and `AppSecret`
4. Store them securely:

**Option A**: Environment variables
```bash
export WECHAT_APP_ID=your_app_id
export WECHAT_APP_SECRET=your_app_secret
```

**Option B**: `.env` file (project-level)
```bash
mkdir -p .wechat-article-downloader
cat > .wechat-article-downloader/.env << 'EOF'
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
EOF
```

**Option C**: `.env` file (user-level, shared across projects)
```bash
mkdir -p ~/.wechat-article-downloader
cat > ~/.wechat-article-downloader/.env << 'EOF'
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
EOF
```

> **Security**: Never commit `.env` files to git. The `.gitignore` already excludes `*.env`.

### EXTEND.md Preferences

Create an `EXTEND.md` to customize default behavior:

```bash
mkdir -p ~/.wechat-article-downloader
cat > ~/.wechat-article-downloader/EXTEND.md << 'EOF'
# Preferences

- default_output: ./wechat-articles
- download_images: true
- timeout: 30000
- max_scroll_steps: 15
EOF
```

See `preferences-schema.md` for all available options.
