# 微信公众号文章下载器

> 将微信公众号文章下载为干净的 Markdown 格式，图片保存到本地。

[English](./README.md)

基于 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 技能框架 — 支持命令行独立运行，也可作为 AI Agent 技能调用。

## 功能特性

- **Chrome CDP 渲染** — 完整 JavaScript 执行，处理懒加载图片
- **四种下载模式** — 单篇 URL、批量文件、按公众号名搜索、API 批量下载
- **Markdown 输出** — YAML 元数据（标题、作者、日期、来源）+ 正文
- **本地图片** — 下载所有文章图片，URL 自动重写为本地路径
- **微信适配** — 处理 `data-src` 懒加载、`mmbiz.qpic.cn` 图片、`#js_content` 内容提取
- **可配置** — EXTEND.md 偏好设置、环境变量、CLI 选项

## 环境要求

- [Bun](https://bun.sh/) 运行时（或通过 `npx -y bun` 使用 Node.js）
- Google Chrome 或 Chromium 浏览器

## 快速开始

### 安装依赖

```bash
bun install
```

### 下载单篇文章

```bash
bun scripts/main.ts "https://mp.weixin.qq.com/s/你的文章ID"
```

### 指定输出目录并下载图片

```bash
bun scripts/main.ts "https://mp.weixin.qq.com/s/xxxx" -o ./articles/
```

### 按公众号名搜索下载

```bash
# 下载某公众号最近 5 篇文章
bun scripts/main.ts --search "公众号名称" --max 5

# 仅列出文章（不下载）
bun scripts/main.ts --search "公众号名称" --list
```

### 批量下载

创建 `urls.txt` 文件：

```text
# 每行一个 URL，# 开头为注释
https://mp.weixin.qq.com/s/article1
https://mp.weixin.qq.com/s/article2
https://mp.weixin.qq.com/s/article3
```

```bash
bun scripts/main.ts urls.txt -o ./backup/
```

### 下载自己公众号的所有文章

需要微信公众平台 API 凭据：

```bash
# 设置凭据
export WECHAT_APP_ID=你的AppID
export WECHAT_APP_SECRET=你的AppSecret

# 列出所有文章
bun scripts/main.ts --account --list

# 下载所有文章
bun scripts/main.ts --account -o ./my-articles/

# 下载最近 20 篇
bun scripts/main.ts --account --max 20
```

也可以将凭据存储在 `.wechat-article-downloader/.env` 文件中：

```env
WECHAT_APP_ID=你的AppID
WECHAT_APP_SECRET=你的AppSecret
```

## CLI 选项

| 选项 | 说明 |
|------|------|
| `<url>` | 单篇微信文章 URL |
| `<file.txt>` | 包含 URL 列表的批量文件 |
| `--search, -s <名称>` | 按公众号名搜索并下载文章 |
| `--account` | 通过 API 下载自己公众号的文章 |
| `-o, --output <目录>` | 输出目录（默认：`./wechat-articles/`） |
| `--no-images` | 跳过图片下载，保留远程 URL |
| `--wait` | 等待模式：手动登录后按回车继续 |
| `--timeout <毫秒>` | 页面加载超时（默认：30000） |
| `--list` | 仅列出文章，不下载 |
| `--max, -n <数量>` | 最大下载文章数 |

## 下载模式

| 模式 | 触发方式 | 行为 |
|------|----------|------|
| **单篇 URL** | 传入 `mp.weixin.qq.com` URL | 通过 CDP 下载一篇文章 |
| **批量文件** | 传入 `.txt` 文件路径 | 按顺序下载文件中所有 URL |
| **搜索** | `--search "名称"` | 通过搜狗微信搜索查找文章并下载 |
| **账号** | `--account` 标志 | 通过微信公众平台 API 列出并下载所有文章 |
| **等待** | `--wait` 标志 | 打开 Chrome，用户手动登录后按回车捕获 |

## 输出格式

```
wechat-articles/
  文章标题.md               # 带 YAML 元数据的 Markdown
  文章标题/
    imgs/
      001.jpg              # 下载的图片
      002.png
```

每个 `.md` 文件包含：

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

文章内容...

![](imgs/001.jpg)
```

## Claude Code 技能使用

### 安装为技能

```bash
# 克隆到技能目录
git clone https://github.com/harmlessacc/wechat-article-downloader ~/.claude/skills/wechat-article-downloader

# 或从现有克隆创建符号链接
ln -s /path/to/wechat-article-downloader ~/.claude/skills/wechat-article-downloader
```

### 触发关键词

在 Claude Code 中说：

- "下载这篇公众号文章 https://mp.weixin.qq.com/s/xxxx"
- "保存公众号文章到 Markdown"
- "批量下载公众号所有文章"
- "搜索并下载时见谈最近的文章"
- "备份公众号文章"

## 配置

### EXTEND.md 偏好设置

通过 `EXTEND.md` 自定义默认行为：

```markdown
# Preferences
- default_output: ./my-wechat-articles
- download_images: true
- timeout: 45000
```

**查找顺序**：`.wechat-article-downloader/EXTEND.md` → `~/.wechat-article-downloader/EXTEND.md`

### 环境变量

| 变量 | 说明 |
|------|------|
| `WECHAT_DL_CHROME_PATH` | 自定义 Chrome 可执行文件路径 |
| `WECHAT_DL_CHROME_PROFILE_DIR` | 自定义 Chrome 配置目录 |
| `WECHAT_APP_ID` | 微信公众号 App ID |
| `WECHAT_APP_SECRET` | 微信公众号 App Secret |

## 工作原理

1. **Chrome CDP** 通过 DevTools Protocol 启动 Chrome 实例
2. **导航** 到微信文章 URL
3. **滚动** 页面触发懒加载图片（`data-src` → `src`）
4. **提取** 元数据（标题、作者、日期）和 `#js_content` 中的内容 HTML
5. **下载** 所有 `mmbiz.qpic.cn` 图片（带正确的 Referer 头）
6. **转换** HTML 为 Markdown（使用 Turndown + 微信专属规则）
7. **写入** 带 YAML 元数据的 `.md` 文件和本地图片引用

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| 找不到 Chrome | 安装 Chrome 或设置 `WECHAT_DL_CHROME_PATH` |
| 超时 | 增大 `--timeout` 值 |
| 需要登录 | 使用 `--wait` 模式 |
| API 错误 | 检查 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET` |
| 图片未加载 | 页面可能需要更多滚动时间 |
| 文章已删除 | 文章已被作者删除 |
| 搜狗验证码 | 稍后重试或使用直接 URL |

## 许可证

[MIT](./LICENSE)
