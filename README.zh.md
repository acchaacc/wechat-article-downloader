# 微信公众号文章下载器

将微信公众号文章下载为干净的 Markdown 格式，图片本地保存。

基于 [Claude Code](https://claude.com/claude-code) Skill 构建——可独立使用 CLI，也可作为 AI 代理调用的技能。

## 功能特性

- **Chrome CDP 渲染** — 完整 JavaScript 执行，处理懒加载图片
- **三种下载模式** — 单篇 URL、批量文件、通过 API 批量下载整个账号文章
- **Markdown 输出** — YAML 元数据（标题、作者、日期、来源）+ 正文
- **图片本地化** — 下载所有文章图片，将 URL 替换为本地路径
- **微信专属适配** — 处理 `data-src` 懒加载、`mmbiz.qpic.cn` 图片、`#js_content` 内容提取

## 快速开始

### 前置条件

- [Bun](https://bun.sh/) 运行时
- Google Chrome 或 Chromium 浏览器

### 安装依赖

```bash
bun install
```

### 下载单篇文章

```bash
bun scripts/main.ts "https://mp.weixin.qq.com/s/文章ID"
```

### 批量下载

创建 `urls.txt` 文件（每行一个 URL）：

```bash
bun scripts/main.ts urls.txt -o ./backup/
```

### 下载自己公众号的所有文章

需要微信公众平台 API 凭证：

```bash
export WECHAT_APP_ID=你的AppID
export WECHAT_APP_SECRET=你的AppSecret

# 列出所有文章
bun scripts/main.ts --account --list

# 全部下载
bun scripts/main.ts --account -o ./我的文章/

# 只下载最新 20 篇
bun scripts/main.ts --account --max 20
```

## CLI 选项

| 选项 | 说明 |
|------|------|
| `<url>` | 单篇文章 URL |
| `<file.txt>` | 包含 URL 的批量文件 |
| `--account` | 通过 API 下载自己公众号的文章 |
| `-o, --output <dir>` | 输出目录（默认：`./wechat-articles/`） |
| `--no-images` | 跳过图片下载 |
| `--wait` | 等待模式：手动登录后按回车继续 |
| `--timeout <ms>` | 页面加载超时（默认：30000） |
| `--list` | 仅列出文章，不下载 |
| `--max, -n <num>` | 最大下载篇数 |

## 输出格式

```
wechat-articles/
  文章标题.md               # Markdown + YAML 元数据
  文章标题/
    imgs/
      001.jpg              # 本地保存的图片
      002.png
```

## 作为 Claude Code Skill 使用

```bash
ln -s /path/to/wechat-article-downloader ~/.claude/skills/wechat-article-downloader
```

然后在 Claude Code 中直接说：

- "下载这篇公众号文章"
- "保存公众号文章到 Markdown"
- "批量下载公众号所有文章"

## 工作原理

1. Chrome CDP 启动浏览器实例
2. 导航到微信文章 URL
3. 滚动页面触发懒加载图片（`data-src` → `src`）
4. 从 `#js_content` 提取元数据和内容 HTML
5. 下载 `mmbiz.qpic.cn` 上的所有图片
6. 用 Turndown 将 HTML 转为 Markdown
7. 写入 `.md` 文件

## 许可证

MIT
