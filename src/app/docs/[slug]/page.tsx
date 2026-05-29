import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DOC_PAGES, getDocPage } from "@/content/docs";

export function generateStaticParams() {
  return DOC_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocPage(slug);
  if (!page) return { title: "Not found — Mantou" };
  return {
    title: `${page.title} — Mantou docs`,
    description: page.description,
  };
}

export default async function DocPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getDocPage(slug);
  if (!page) notFound();

  const index = DOC_PAGES.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? DOC_PAGES[index - 1] : undefined;
  const next = index < DOC_PAGES.length - 1 ? DOC_PAGES[index + 1] : undefined;

  return (
    <article className="mx-auto max-w-3xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#9a3f1a]">
        {page.group}
      </p>
      <h1 className="mb-6 text-4xl font-black tracking-tight text-[#3a2a20]">
        {page.title}
      </h1>

      <div className="text-[15px]">{page.body}</div>

      <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-[#e3d7be] pt-6">
        <div>
          {prev && (
            <Link
              href={`/docs/${prev.slug}`}
              className="block rounded-2xl border border-[#e3d7be] bg-white/60 p-4 transition hover:border-[#d8a24a]"
            >
              <span className="text-xs text-[#a89b82]">← Previous</span>
              <p className="font-semibold text-[#3a2a20]">{prev.title}</p>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link
              href={`/docs/${next.slug}`}
              className="block rounded-2xl border border-[#e3d7be] bg-white/60 p-4 transition hover:border-[#d8a24a]"
            >
              <span className="text-xs text-[#a89b82]">Next →</span>
              <p className="font-semibold text-[#3a2a20]">{next.title}</p>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
