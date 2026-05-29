"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { run } from "@mdx-js/mdx";
import { mantouMdxComponents } from "@/lib/mantou/document/components";
import { getMdxRunOptions } from "@/lib/mantou/mdx/runtime";

type MDXContentProps = {
  components?: typeof mantouMdxComponents;
};

export function MdxPreview({ source }: { source: string }) {
  const [Content, setContent] = useState<ComponentType<MDXContentProps> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const compile = useCallback(async (mdx: string) => {
    if (!mdx.trim()) {
      setContent(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mdx/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: mdx }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Compile failed");
        setContent(null);
        return;
      }
      const mod = await run(data.code!, getMdxRunOptions());
      setContent(() => mod.default as ComponentType<MDXContentProps>);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => compile(source), 400);
    return () => clearTimeout(t);
  }, [source, compile]);

  if (loading && !Content) {
    return (
      <p className="text-sm text-[#a89b82]">Compiling MDX…</p>
    );
  }

  if (error) {
    return (
      <pre className="rounded-xl border border-[#e7b3aa] bg-[#fbe9e6] p-3 font-mono text-[12px] text-[#b5341f]">
        {error}
      </pre>
    );
  }

  if (!Content) {
    return (
      <p className="text-sm text-[#a89b82]">Write MDX to see a live preview.</p>
    );
  }

  return (
    <div className="prose-mantou text-[15px]">
      <Content components={mantouMdxComponents} />
    </div>
  );
}
