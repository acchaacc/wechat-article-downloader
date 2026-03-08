export interface WeChatArticleMeta {
  title: string;
  author: string;
  accountName: string;
  publishDate: string;
  sourceUrl: string;
  digest: string;
  coverImageUrl?: string;
}

export interface WeChatExtractionResult {
  meta: WeChatArticleMeta;
  contentHtml: string;
  imageUrls: string[];
}

export interface ArticleOutput {
  markdownPath: string;
  imageDir: string | null;
  imageCount: number;
  meta: WeChatArticleMeta;
}

export interface BatchResult {
  succeeded: ArticleOutput[];
  failed: Array<{ url: string; error: string }>;
}
