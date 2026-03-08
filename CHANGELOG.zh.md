# 更新日志

## 0.2.0 - 2026-03-08

### 新功能
- 新增 `--search` 模式：通过搜狗微信搜索按公众号名查找并下载文章
- 新增中英双语文档（README.md + README.zh.md）
- 新增 `references/` 目录，包含配置文档和偏好设置模式
- 新增 CHANGELOG.md / CHANGELOG.zh.md

### 重构
- 移除 `baoyu-skills` 依赖 — 完全独立运行
- 更新 SKILL.md 遵循 baoyu-skills 规范（`${SKILL_DIR}`、`${BUN_X}`、EXTEND.md 模式）
- 改进 .gitignore
- 更新配置路径：`.baoyu-skills/` → `.wechat-article-downloader/`

### 修复
- 修复 `--account` 标志未被正确解析的问题
- 修复搜索模式下 CDP 会话错误（改为直接以目标 URL 启动 Chrome）

## 0.1.0 - 2026-03-07

### 新功能
- 首次发布
- 通过 Chrome CDP 下载单篇文章
- 从 URL 列表文件批量下载
- 通过微信公众平台 API 下载整个账号文章
- 微信专属提取：`#js_content`、`data-src` 懒加载图片、元数据
- 本地图片下载，URL 自动重写为相对路径
- YAML 元数据生成（标题、作者、日期、来源 URL、摘要）
- HTML 转 Markdown（Turndown + GFM 插件）
- 微信专属 Turndown 规则（data-src 优先、mpvoice/audio 处理）
- 等待模式（用于需要登录的文章）
- 跨平台 Chrome 检测（macOS、Windows、Linux）
