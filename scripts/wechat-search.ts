import type { CdpConnection } from "./cdp.js";
import { evaluateScript } from "./cdp.js";

/**
 * Extract WeChat article links from Sogou Weixin search results page.
 * Assumes the page is already loaded at weixin.sogou.com search results.
 */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Extract article links from Sogou search results page (type=2, article search)
const extractArticleLinksScript = `
(function() {
  var links = [];
  var seen = {};

  // Method 1: Sogou article search result items (.news-list structure)
  var items = document.querySelectorAll('.news-list li, .news-box li, ul.news-list > li, .txt-box');
  items.forEach(function(item) {
    var a = item.querySelector('h3 a, a[href*="weixin.qq.com"]');
    if (a) {
      var href = a.href || a.getAttribute('href') || '';
      var title = (a.textContent || '').trim().replace(/\\s+/g, ' ');
      // Try to extract account name from the result item
      var accountEl = item.querySelector('.account, .s-p a, .s-p, .tit-s');
      var account = accountEl ? (accountEl.textContent || '').trim() : '';
      if (href && title && title.length > 2 && !seen[title]) {
        seen[title] = true;
        links.push({ url: href, title: title, account: account });
      }
    }
  });

  // Method 2: Broader fallback - any link containing mp.weixin.qq.com or sogou redirect
  if (links.length === 0) {
    document.querySelectorAll('a[href]').forEach(function(a) {
      var href = a.href || '';
      var title = (a.textContent || '').trim().replace(/\\s+/g, ' ');
      if (title.length > 4 && !seen[title]) {
        if (href.indexOf('mp.weixin.qq.com') !== -1 ||
            href.indexOf('weixin.sogou.com/link') !== -1) {
          seen[title] = true;
          links.push({ url: href, title: title, account: '' });
        }
      }
    });
  }

  // Method 3: Even broader - get all substantial links on the page
  if (links.length === 0) {
    document.querySelectorAll('a[href]').forEach(function(a) {
      var href = a.href || '';
      var title = (a.textContent || '').trim().replace(/\\s+/g, ' ');
      if (title.length > 8 && !seen[title] && href.indexOf('javascript:') === -1 && href.indexOf('#') !== 0) {
        seen[title] = true;
        links.push({ url: href, title: title, account: '' });
      }
    });
  }

  return links;
})()
`;

// Debug: dump page info
const debugPageScript = `
(function() {
  return {
    url: location.href,
    title: document.title,
    linkCount: document.querySelectorAll('a').length,
    bodyLength: (document.body.textContent || '').length,
    hasNewsList: !!document.querySelector('.news-list'),
    hasResults: !!document.querySelector('.results'),
    sampleLinks: Array.from(document.querySelectorAll('a')).slice(0, 10).map(function(a) {
      return { href: (a.href || '').substring(0, 80), text: (a.textContent || '').trim().substring(0, 40) };
    })
  };
})()
`;

export interface SearchResult {
  url: string;
  title: string;
  account?: string;
}

export async function searchAccountArticles(
  cdp: CdpConnection,
  sessionId: string,
  accountName: string,
  maxArticles: number = 5,
  log?: (msg: string) => void,
): Promise<SearchResult[]> {
  // Page should already be loaded at sogou search results
  // First, debug what we see on the page
  const debug = await evaluateScript<{
    url: string; title: string; linkCount: number; bodyLength: number;
    hasNewsList: boolean; hasResults: boolean;
    sampleLinks: Array<{ href: string; text: string }>;
  }>(cdp, sessionId, debugPageScript);

  log?.(`Page: ${debug.url}`);
  log?.(`Title: ${debug.title}`);
  log?.(`Links: ${debug.linkCount}, Body: ${debug.bodyLength} chars`);

  if (debug.bodyLength < 100) {
    log?.(`Page seems empty, waiting more...`);
    await sleep(3_000);
  }

  // Extract article links
  let articles = await evaluateScript<SearchResult[]>(cdp, sessionId, extractArticleLinksScript);

  // Filter out navigation/noise links
  articles = articles.filter(a =>
    a.title.length > 4 &&
    !a.title.includes("搜狗") &&
    !a.title.includes("登录") &&
    !a.title.includes("首页")
  );

  // If account name extracted, prefer articles from the matching account
  const accountMatched = articles.filter(a =>
    a.account && a.account.includes(accountName)
  );

  const finalArticles = accountMatched.length > 0 ? accountMatched : articles;
  const result = finalArticles.slice(0, maxArticles);

  log?.(`Found ${result.length} articles${accountMatched.length > 0 ? ` (matched account: ${accountName})` : ""}.`);

  if (result.length > 0) {
    for (let i = 0; i < result.length; i++) {
      const acctInfo = result[i].account ? ` [${result[i].account}]` : "";
      log?.(`  ${i + 1}. ${result[i].title}${acctInfo}`);
    }
  }

  return result;
}
