import type { CdpConnection } from "./cdp.js";
import { evaluateScript } from "./cdp.js";
import type { WeChatArticleMeta, WeChatExtractionResult } from "./types.js";

const wechatExtractScript = `
(function() {
  var contentEl = document.querySelector('#js_content');

  // Materialize lazy images: WeChat uses data-src instead of src
  if (contentEl) {
    contentEl.querySelectorAll('img[data-src]').forEach(function(img) {
      if (!img.src || img.src === '' || img.src.startsWith('data:')) {
        img.src = img.getAttribute('data-src');
      }
    });
  }

  function getText(selector) {
    var el = document.querySelector(selector);
    return el ? el.textContent.trim() : '';
  }

  function getMeta(prop) {
    var el = document.querySelector('meta[property="' + prop + '"]')
          || document.querySelector('meta[name="' + prop + '"]');
    return el ? (el.getAttribute('content') || '').trim() : '';
  }

  var title = getText('#activity-name') || getMeta('og:title') || document.title || '';
  var author = getText('#js_name') || getMeta('author') || '';
  var publishTime = getText('#publish_time') || '';
  var digest = getMeta('og:description') || getMeta('description') || '';
  var coverUrl = getMeta('og:image') || '';

  // Collect image URLs
  var imageUrls = [];
  var seen = {};
  if (contentEl) {
    contentEl.querySelectorAll('img').forEach(function(img) {
      var url = img.getAttribute('data-src') || img.src || '';
      if (url && !url.startsWith('data:') && !seen[url]) {
        seen[url] = true;
        imageUrls.push(url);
      }
    });
  }

  // Clean content HTML
  if (contentEl) {
    contentEl.querySelectorAll('script, style, noscript').forEach(function(el) { el.remove(); });
    // Remove tracking pixels and invisible images
    contentEl.querySelectorAll('img[style*="visibility: hidden"], img[style*="display: none"], img[width="0"], img[height="0"]').forEach(function(el) { el.remove(); });
  }

  return {
    title: title,
    author: author,
    publishTime: publishTime,
    digest: digest,
    coverUrl: coverUrl,
    contentHtml: contentEl ? contentEl.innerHTML : '',
    imageUrls: imageUrls
  };
})()
`;

const materializeLazyImagesScript = `
(function() {
  var contentEl = document.querySelector('#js_content');
  if (contentEl) {
    contentEl.querySelectorAll('img[data-src]').forEach(function(img) {
      if (!img.src || img.src === '' || img.src.startsWith('data:')) {
        img.src = img.getAttribute('data-src');
      }
    });
  }
})()
`;

interface RawExtraction {
  title: string;
  author: string;
  publishTime: string;
  digest: string;
  coverUrl: string;
  contentHtml: string;
  imageUrls: string[];
}

export async function materializeLazyImages(cdp: CdpConnection, sessionId: string): Promise<void> {
  await evaluateScript<void>(cdp, sessionId, materializeLazyImagesScript);
}

export async function extractWeChatArticle(
  cdp: CdpConnection,
  sessionId: string,
  sourceUrl: string,
  timeoutMs: number = 30_000
): Promise<WeChatExtractionResult> {
  // Second pass: materialize any remaining lazy images after scroll
  await materializeLazyImages(cdp, sessionId);

  const raw = await evaluateScript<RawExtraction>(cdp, sessionId, wechatExtractScript, timeoutMs);

  if (!raw.contentHtml && !raw.title) {
    throw new Error("Article not found or has been deleted. No content at #js_content.");
  }

  return {
    meta: {
      title: raw.title,
      author: raw.author,
      accountName: raw.author,
      publishDate: raw.publishTime,
      sourceUrl,
      digest: raw.digest,
      coverImageUrl: raw.coverUrl || undefined,
    },
    contentHtml: raw.contentHtml,
    imageUrls: raw.imageUrls,
  };
}
