import { readFile } from "node:fs/promises";
import type { ArticleOutput } from "./types.js";

export interface BatchResult {
  succeeded: ArticleOutput[];
  failed: Array<{ url: string; error: string }>;
}

export async function parseBatchFile(filePath: string): Promise<string[]> {
  const content = await readFile(filePath, "utf-8");
  return content
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#") && line.startsWith("http"));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function processBatch(
  urls: string[],
  processOne: (url: string, index: number) => Promise<ArticleOutput>,
  options: { delayMs: number; log?: (msg: string) => void }
): Promise<BatchResult> {
  const succeeded: ArticleOutput[] = [];
  const failed: Array<{ url: string; error: string }> = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    options.log?.(`\n[${i + 1}/${urls.length}] ${url}`);
    try {
      const result = await processOne(url, i);
      succeeded.push(result);
      options.log?.(`  OK: ${result.meta.title} (${result.imageCount} images)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failed.push({ url, error: msg });
      options.log?.(`  FAILED: ${msg}`);
    }
    if (i < urls.length - 1) {
      await sleep(options.delayMs);
    }
  }

  return { succeeded, failed };
}
