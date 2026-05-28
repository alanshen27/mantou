import Link from "next/link";
import { Sidebar, type SidebarGroup } from "@/components/docs/Sidebar";
import { DOC_GROUPS } from "@/content/docs";

const groups: SidebarGroup[] = [
  ...DOC_GROUPS.map((g) => ({
    group: g.group,
    links: g.pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      href: `/docs/${p.slug}`,
    })),
  })),
  {
    group: "Try it",
    links: [{ slug: "playground", title: "Playground", href: "/docs/playground" }],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[#e3d7be] bg-[#f6efe1]/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3a2a20] text-lg">
              🥟
            </span>
            <span className="text-base font-black tracking-tight text-[#3a2a20]">
              Mantou
            </span>
            <span className="rounded-full bg-[#efe6d2] px-2 py-0.5 text-[10px] font-bold text-[#9a3f1a]">
              docs
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-[#6b5a48]">
            <Link href="/docs/introduction" className="hover:text-[#3a2a20]">
              Guide
            </Link>
            <Link href="/docs/playground" className="hover:text-[#3a2a20]">
              Playground
            </Link>
            <a
              href="https://github.com/alanshen27/mantou"
              className="rounded-lg bg-[#3a2a20] px-3 py-1.5 text-xs font-semibold text-[#fbf4e6] transition hover:bg-[#54463a]"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-8 px-4 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-2">
            <Sidebar groups={groups} />
          </div>
        </aside>
        <main className="min-w-0 flex-1 py-10">{children}</main>
      </div>
    </div>
  );
}
