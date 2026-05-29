import { parseMantouFenceMeta } from "./remark-mantou";

/** Extract diagram source strings from raw MDX/markdown (playground sync). */
export function extractMantouDiagramSources(source: string): string[] {
  const results: string[] = [];

  const fenceRe = /```mantou([^\n]*)\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(source)) !== null) {
    const body = m[2].trim();
    if (body) results.push(body);
  }

  const flowSourceRe = /<Flow[^>]*\ssource=\{?`([^`]+)`\}?/g;
  while ((m = flowSourceRe.exec(source)) !== null) {
    results.push(m[1].trim());
  }

  const flowChildRe = /<Flow[^>]*>\s*\{?`([\s\S]*?)`\}?\s*<\/Flow>/g;
  while ((m = flowChildRe.exec(source)) !== null) {
    results.push(m[1].trim());
  }

  return results;
}

/** First diagram source in a document, or undefined. */
export function firstMantouDiagramSource(source: string): string | undefined {
  return extractMantouDiagramSources(source)[0];
}

export { parseMantouFenceMeta };
