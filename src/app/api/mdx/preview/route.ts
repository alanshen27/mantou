import { compileMantouMdx } from "@/lib/mantou/mdx/compile";

const MAX_SOURCE_LENGTH = 64_000;

/** Reject explicit ESM imports in playground preview (allowlisted components only). */
function assertNoImports(source: string): void {
  if (/^\s*import\s+/m.test(source)) {
    throw new Error(
      "Imports are not allowed in playground preview. Use global MDX components (Flow, Callout, …)."
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { source?: string };
    const source = body.source?.trim() ?? "";
    if (!source) {
      return Response.json({ error: "Missing source" }, { status: 400 });
    }
    if (source.length > MAX_SOURCE_LENGTH) {
      return Response.json({ error: "Source too large" }, { status: 400 });
    }
    assertNoImports(source);
    const code = await compileMantouMdx(source);
    return Response.json({ code });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Compile failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
