import Link from "next/link";
import { Flow } from "@/components/flow/Flow";
import { AGENT_GRAPH } from "@/lib/mantou";

const FEATURES = [
  {
    title: "MDX-native",
    body: "Drop a <Flow> block into any page. Author diagrams inline, right next to your prose.",
  },
  {
    title: "Reactive styling",
    body: "Node & edge appearance depends on metadata, state, relationships, and selection — recomputed live.",
  },
  {
    title: "Safe expressions",
    body: "A tiny sandboxed language: property access, comparisons, ternaries, any()/all(). No eval, no JS.",
  },
  {
    title: "Interactive runtime",
    body: "Selection, hover, focus, dependency expansion, and automatic relayout — built in.",
  },
];

const CODE = `<Flow title="Agent Dependency Graph">
{\`
node Planner { type: agent  on: true  status: running }
node Researcher { parent: Planner }
Planner -> Researcher

style node {
  background: node.on ? chili : node.parent.on ? bamboo : cream
  pulse: node.status == "running"
}
\`}
</Flow>`;

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#e3d7be]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3a2a20] text-lg">
              🥟
            </span>
            <span className="text-lg font-black tracking-tight text-[#3a2a20]">
              Mantou
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-[#6b5a48]">
            <Link href="/docs/introduction" className="hover:text-[#3a2a20]">
              Docs
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

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e3d7be] bg-white/60 px-3 py-1 text-xs font-semibold text-[#9a3f1a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e2483d]" />
              Reactive diagrams for docs
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-[#3a2a20] sm:text-5xl">
              Documentation with diagrams that{" "}
              <span className="text-[#e2483d]">think</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#6b5a48]">
              Mantou is an MDX documentation system whose <code className="rounded bg-[#efe6d2] px-1.5 py-0.5 font-mono text-sm text-[#9a3f1a]">&lt;Flow&gt;</code>{" "}
              blocks render as stateful, interactive system maps. Style nodes and
              edges with a safe expression language — no arbitrary JavaScript.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/docs/introduction"
                className="rounded-xl bg-[#e2483d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c93a30]"
              >
                Read the docs
              </Link>
              <Link
                href="/docs/playground"
                className="rounded-xl border border-[#d8c7a6] bg-white/60 px-5 py-2.5 text-sm font-semibold text-[#3a2a20] transition hover:bg-white"
              >
                Open playground
              </Link>
            </div>
          </div>

          <Flow title="Agent Dependency Graph" height={400}>
            {AGENT_GRAPH}
          </Flow>
        </section>

        <section className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[#e3d7be] bg-white/60 p-5"
            >
              <h2 className="mb-1.5 text-sm font-bold text-[#3a2a20]">{f.title}</h2>
              <p className="text-[13px] leading-relaxed text-[#6b5a48]">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#3a2a20]">
              Write a diagram like a code block
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#6b5a48]">
              The same Mermaid-like source you&apos;d sketch on a whiteboard, plus
              declarative <code className="rounded bg-[#efe6d2] px-1 font-mono text-sm text-[#9a3f1a]">style</code> rules that react to
              state and reader interaction.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#34251c] bg-[#241812] shadow-sm">
            <div className="border-b border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-[#caa06a]">
              src/content/docs/quick-start.mdx
            </div>
            <pre className="overflow-x-auto px-4 py-4 text-[12.5px] leading-relaxed">
              <code className="font-mono text-[#f3e7d0]">{CODE}</code>
            </pre>
          </div>
        </section>

        <footer className="mt-20 border-t border-[#e3d7be] pt-8 text-center text-sm text-[#a89b82]">
          Built with React Flow + Dagre · steamed fresh 🥟
        </footer>
      </main>
    </div>
  );
}
