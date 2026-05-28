import type { ReactNode } from "react";

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mb-8 text-lg leading-relaxed text-[#6b5a48]">{children}</p>
  );
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="group mt-14 mb-4 scroll-mt-24 text-2xl font-bold tracking-tight text-[#3a2a20]"
    >
      <a href={`#${id}`} className="no-underline">
        {children}
        <span className="ml-2 text-[#d8c7a6] opacity-0 transition group-hover:opacity-100">
          #
        </span>
      </a>
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="mt-10 mb-3 scroll-mt-24 text-lg font-semibold text-[#3a2a20]"
    >
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="my-4 leading-relaxed text-[#54463a]">{children}</p>;
}

export function Ul({ children }: { children: ReactNode }) {
  return (
    <ul className="my-4 list-disc space-y-1.5 pl-6 leading-relaxed text-[#54463a] marker:text-[#d8a24a]">
      {children}
    </ul>
  );
}

export function Ol({ children }: { children: ReactNode }) {
  return (
    <ol className="my-4 list-decimal space-y-1.5 pl-6 leading-relaxed text-[#54463a] marker:text-[#a89b82] marker:font-semibold">
      {children}
    </ol>
  );
}

export function Li({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-[#efe6d2] px-1.5 py-0.5 font-mono text-[0.85em] text-[#9a3f1a]">
      {children}
    </code>
  );
}

const LANG_LABEL: Record<string, string> = {
  mantou: "mantou",
  mdx: "mdx",
  tsx: "tsx",
  ts: "typescript",
  bash: "shell",
};

export function CodeBlock({
  code,
  language = "mantou",
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-[#34251c] bg-[#241812] shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#caa06a]">
          {LANG_LABEL[language] ?? language}
        </span>
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e2483d]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d8a24a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#6fae4a]" />
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-relaxed">
        <code className="font-mono text-[#f3e7d0]">{code.trim()}</code>
      </pre>
    </div>
  );
}

const CALLOUT_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  note: { bg: "bg-[#fbf4e6]", border: "border-[#d8c7a6]", icon: "🥟" },
  tip: { bg: "bg-[#eef6e6]", border: "border-[#bcd99c]", icon: "✺" },
  warning: { bg: "bg-[#fbe9e6]", border: "border-[#e7b3aa]", icon: "▲" },
};

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: "note" | "tip" | "warning";
  title?: string;
  children: ReactNode;
}) {
  const s = CALLOUT_STYLES[type];
  return (
    <div className={`my-5 rounded-2xl border ${s.border} ${s.bg} p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-base leading-6">{s.icon}</span>
        <div className="text-sm leading-relaxed text-[#54463a]">
          {title && <p className="mb-1 font-semibold text-[#3a2a20]">{title}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 mb-6 text-center text-xs text-[#a89b82]">{children}</p>
  );
}
