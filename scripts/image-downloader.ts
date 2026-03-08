import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_USER_AGENT, IMAGE_DOWNLOAD_CONCURRENCY } from "./constants.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveImageExtension(url: string, contentType: string | null): string {
  // Check wx_fmt parameter first (WeChat-specific)
  try {
    const parsed = new URL(url);
    const wxFmt = parsed.searchParams.get("wx_fmt");
    if (wxFmt) {
      if (wxFmt === "jpeg" || wxFmt === "jpg") return "jpg";
      if (wxFmt === "png") return "png";
      if (wxFmt === "gif") return "gif";
      if (wxFmt === "webp") return "webp";
      if (wxFmt === "svg") return "svg";
    }
  } catch {}

  // Fallback to content-type
  const ct = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (ct === "image/jpeg" || ct === "image/jpg") return "jpg";
  if (ct === "image/png") return "png";
  if (ct === "image/gif") return "gif";
  if (ct === "image/webp") return "webp";
  if (ct === "image/svg+xml") return "svg";

  return "jpg";
}

export async function downloadImages(
  imageUrls: string[],
  outputDir: string,
  log?: (msg: string) => void,
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  if (imageUrls.length === 0) return urlMap;

  const imgDir = path.join(outputDir, "imgs");
  await mkdir(imgDir, { recursive: true });

  for (let i = 0; i < imageUrls.length; i += IMAGE_DOWNLOAD_CONCURRENCY) {
    const batch = imageUrls.slice(i, i + IMAGE_DOWNLOAD_CONCURRENCY);
    const results = await Promise.allSettled(batch.map(async (url, batchIdx) => {
      const globalIdx = i + batchIdx + 1;
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": DEFAULT_USER_AGENT,
            "Referer": "https://mp.weixin.qq.com/",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
          log?.(`  Skip image ${globalIdx} (HTTP ${response.status})`);
          return;
        }

        const ext = resolveImageExtension(url, response.headers.get("content-type"));
        const fileName = `${String(globalIdx).padStart(3, "0")}.${ext}`;
        const bytes = Buffer.from(await response.arrayBuffer());
        await writeFile(path.join(imgDir, fileName), bytes);
        urlMap.set(url, `imgs/${fileName}`);
      } catch (err) {
        log?.(`  Failed image ${globalIdx}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }));

    // Small delay between batches
    if (i + IMAGE_DOWNLOAD_CONCURRENCY < imageUrls.length) {
      await sleep(200);
    }
  }

  return urlMap;
}
