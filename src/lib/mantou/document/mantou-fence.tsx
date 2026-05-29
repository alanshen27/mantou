import type { ReactNode } from "react";
import { Flow } from "@/components/flow/Flow";
import { parseMantouFenceMeta } from "./remark-mantou";
import type { LayoutKind } from "../layout";

type CodeChild = {
  props?: {
    className?: string;
    children?: string;
    metastring?: string;
  };
};

/** Render a `language-mantou` code block as `<Flow />` (Turbopack-safe). */
export function MantouFencePre({ children }: { children?: ReactNode }) {
  const child = children as CodeChild | null;
  const props = child?.props;
  const className = props?.className ?? "";

  if (className.includes("language-mantou")) {
    const code =
      typeof props?.children === "string"
        ? props.children
        : String(props?.children ?? "");
    const meta = parseMantouFenceMeta(props?.metastring);
    const layout = meta.layout as LayoutKind | undefined;
    return (
      <Flow
        source={code.trim()}
        title={meta.title}
        layout={layout ?? "dagre"}
        height={meta.height ?? 480}
      />
    );
  }

  return (
    <pre className="my-5 overflow-x-auto rounded-2xl border border-[#34251c] bg-[#241812] p-4 text-[12.5px]">
      {children}
    </pre>
  );
}
