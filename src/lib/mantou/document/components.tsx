import type { MDXComponents } from "mdx/types";
import type { ReactNode, AnchorHTMLAttributes, TableHTMLAttributes } from "react";
import Link from "next/link";
import { Flow } from "@/components/flow/Flow";
import { MantouFencePre } from "./mantou-fence";
import {
  Lead,
  H2,
  H3,
  P,
  Ul,
  Ol,
  Li,
  Code,
  CodeBlock,
  Callout,
  Caption,
} from "@/components/docs/primitives";

function MdxLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const className =
    "font-semibold text-[#9a3f1a] underline decoration-[#d8c7a6] underline-offset-2 hover:text-[#3a2a20]";
  if (href?.startsWith("/")) {
    return (
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
}

function InlineCode({ children }: { children?: ReactNode }) {
  return <Code>{children}</Code>;
}

/** Mantou-styled pre/code fence wrapper when not using CodeBlock component. */
function PreWithCode({ children }: { children?: ReactNode }) {
  const child = children as ReactNode;
  if (
    child &&
    typeof child === "object" &&
    "props" in (child as object)
  ) {
    const props = (
      child as { props: { className?: string; children?: string } }
    ).props;
    const className = props.className ?? "";
    if (className.includes("language-mantou")) {
      return <MantouFencePre>{children}</MantouFencePre>;
    }
    if (className.includes("language-")) {
      const lang = className.replace("language-", "").split(" ")[0];
      const code =
        typeof props.children === "string"
          ? props.children
          : String(props.children ?? "");
      return <CodeBlock language={lang} code={code} />;
    }
  }
  return (
    <pre className="my-5 overflow-x-auto rounded-2xl border border-[#34251c] bg-[#241812] p-4 text-[12.5px]">
      {children}
    </pre>
  );
}

function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-5 overflow-x-auto">
      <table
        className="w-full border-collapse text-sm text-[#54463a]"
        {...props}
      />
    </div>
  );
}

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className="border border-[#e3d7be] bg-[#efe6d2] px-3 py-2 text-left font-semibold text-[#3a2a20]"
      {...props}
    />
  );
}

function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className="border border-[#e3d7be] px-3 py-2" {...props} />
  );
}

function H1({ children }: { children?: ReactNode }) {
  return (
    <h1 className="mb-6 text-4xl font-black tracking-tight text-[#3a2a20]">
      {children}
    </h1>
  );
}

function H2Mdx({
  id,
  children,
}: {
  id?: string;
  children?: ReactNode;
}) {
  const slug =
    id ??
    (typeof children === "string"
      ? children
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : undefined);
  if (!slug) {
    return <h2 className="mt-14 mb-4 text-2xl font-bold text-[#3a2a20]">{children}</h2>;
  }
  return <H2 id={slug}>{children}</H2>;
}

function H3Mdx({ id, children }: { id?: string; children?: ReactNode }) {
  return <H3 id={id}>{children}</H3>;
}

function H4({ children }: { children?: ReactNode }) {
  return (
    <h4 className="mt-8 mb-2 text-base font-semibold text-[#3a2a20]">
      {children}
    </h4>
  );
}

function Blockquote({ children }: { children?: ReactNode }) {
  return (
    <blockquote className="my-5 border-l-4 border-[#d8a24a] pl-4 text-[#6b5a48] italic">
      {children}
    </blockquote>
  );
}

function Hr() {
  return <hr className="my-10 border-[#e3d7be]" />;
}

/** Global MDX component map for Mantou docs and preview. */
export const mantouMdxComponents: MDXComponents = {
  Flow,
  Lead,
  H2: H2Mdx,
  H3: H3Mdx,
  P,
  Ul,
  Ol,
  Li,
  Code: InlineCode,
  CodeBlock,
  Callout,
  Caption,
  h1: H1,
  h2: H2Mdx,
  h3: H3Mdx,
  h4: H4,
  p: P,
  ul: Ul,
  ol: Ol,
  li: Li,
  a: MdxLink,
  pre: PreWithCode,
  blockquote: Blockquote,
  hr: Hr,
  table: Table,
  th: Th,
  td: Td,
};

export { Flow, Lead, Callout, Caption, CodeBlock };
