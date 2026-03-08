import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import type { WeChatArticleMeta } from "./types.js";

function createTurndown(imageUrlMap?: Map<string, string>): TurndownService {
  const turndown = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });

  turndown.use(gfm);

  // Remove noise elements
  turndown.remove(["script", "style", "iframe", "noscript", "template", "svg", "path"]);

  // WeChat image rule: prefer data-src, rewrite to local path if available
  turndown.addRule("wechatImage", {
    filter: "img",
    replacement(_content, node) {
      const el = node as HTMLElement;
      const src = el.getAttribute("data-src") || el.getAttribute("src") || "";
      if (!src || src.startsWith("data:")) return "";
      const alt = el.getAttribute("alt") || "";
      const finalUrl = imageUrlMap?.get(src) || src;
      return `\n\n![${alt}](${finalUrl})\n\n`;
    },
  });

  // Collapse figure elements
  turndown.addRule("collapseFigure", {
    filter: "figure",
    replacement(content) {
      return `\n\n${content.trim()}\n\n`;
    },
  });

  // Drop invisible anchors
  turndown.addRule("dropInvisibleAnchors", {
    filter(node) {
      return node.nodeName === "A" && !(node as Element).textContent?.trim();
    },
    replacement() {
      return "";
    },
  });

  // Handle WeChat mpvoice (audio) elements
  turndown.addRule("wechatAudio", {
    filter(node) {
      return node.nodeName === "MPVOICE" || (node.nodeName === "QQMUSIC");
    },
    replacement(_content, node) {
      const el = node as HTMLElement;
      const name = el.getAttribute("name") || el.getAttribute("voice_encode_fileid") || "audio";
      return `\n\n[Audio: ${name}]\n\n`;
    },
  });

  return turndown;
}

function normalizeMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function wechatHtmlToMarkdown(html: string, imageUrlMap?: Map<string, string>): string {
  if (!html || !html.trim()) return "";

  const turndown = createTurndown(imageUrlMap);
  try {
    const markdown = turndown.turndown(html);
    return normalizeMarkdown(markdown);
  } catch {
    return "";
  }
}

function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");
}

export function formatFrontmatter(meta: WeChatArticleMeta): string {
  const lines = ["---"];
  lines.push(`title: "${escapeYaml(meta.title)}"`);
  if (meta.author) lines.push(`author: "${escapeYaml(meta.author)}"`);
  if (meta.accountName && meta.accountName !== meta.author) {
    lines.push(`account: "${escapeYaml(meta.accountName)}"`);
  }
  if (meta.publishDate) lines.push(`date: "${escapeYaml(meta.publishDate)}"`);
  lines.push(`source_url: "${meta.sourceUrl}"`);
  if (meta.digest) lines.push(`description: "${escapeYaml(meta.digest)}"`);
  if (meta.coverImageUrl) lines.push(`cover_image: "${meta.coverImageUrl}"`);
  lines.push(`captured_at: "${new Date().toISOString()}"`);
  lines.push("---");
  return lines.join("\n");
}

export function createMarkdownDocument(meta: WeChatArticleMeta, markdownBody: string): string {
  const frontmatter = formatFrontmatter(meta);
  const title = meta.title ? `\n\n# ${meta.title}\n\n` : "\n\n";
  return frontmatter + title + markdownBody + "\n";
}
