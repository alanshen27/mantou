import type { Root, Content, Heading, Paragraph, List, Code, Blockquote, Html } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { parseMantouFenceMeta } from "./remark-mantou";
import type { MantouDocumentNode } from "./types";

function textFromPhrasing(nodes: Content[] | undefined): string {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type === "text") return n.value;
      if (n.type === "inlineCode") return n.value;
      if ("children" in n && Array.isArray(n.children)) {
        return textFromPhrasing(n.children as Content[]);
      }
      return "";
    })
    .join("");
}

function convertBlock(node: Content): MantouDocumentNode | MantouDocumentNode[] | null {
  switch (node.type) {
    case "heading": {
      const h = node as Heading;
      return {
        kind: "heading",
        depth: h.depth as 1 | 2 | 3 | 4 | 5 | 6,
        text: textFromPhrasing(h.children as Content[]),
      };
    }
    case "paragraph": {
      const p = node as Paragraph;
      return { kind: "paragraph", text: textFromPhrasing(p.children as Content[]) };
    }
    case "list": {
      const list = node as List;
      const items = list.children.map((item) =>
        textFromPhrasing(
          item.children.flatMap((c) =>
            c.type === "paragraph" ? (c.children as Content[]) : []
          )
        )
      );
      return { kind: "list", ordered: list.ordered ?? false, items };
    }
    case "code": {
      const c = node as Code;
      if (c.lang?.split(/\s/)[0] === "mantou") {
        const meta = parseMantouFenceMeta(c.meta);
        return {
          kind: "flow",
          source: c.value,
          title: meta.title,
          layout: meta.layout,
          height: meta.height,
        };
      }
      return {
        kind: "code",
        language: c.lang ?? undefined,
        value: c.value,
      };
    }
    case "blockquote": {
      const b = node as Blockquote;
      const children: MantouDocumentNode[] = [];
      for (const child of b.children) {
        const converted = convertBlock(child);
        if (converted) {
          if (Array.isArray(converted)) children.push(...converted);
          else children.push(converted);
        }
      }
      return { kind: "blockquote", children };
    }
    case "thematicBreak":
      return { kind: "thematicBreak" };
    case "html": {
      const h = node as Html;
      return { kind: "html", value: h.value };
    }
    case "mdxJsxFlowElement": {
      const el = node as MdxJsxFlowElement;
      if (el.name === "Flow") {
        let source = "";
        let title: string | undefined;
        let layout: string | undefined;
        let height: number | undefined;
        for (const attr of el.attributes ?? []) {
          if (attr.type !== "mdxJsxAttribute") continue;
          if (attr.name === "source" && typeof attr.value === "string") {
            source = attr.value;
          }
          if (attr.name === "title" && typeof attr.value === "string") {
            title = attr.value;
          }
          if (attr.name === "layout" && typeof attr.value === "string") {
            layout = attr.value;
          }
          if (attr.name === "height" && typeof attr.value === "number") {
            height = attr.value;
          }
        }
        if (source) {
          return { kind: "flow", source, title, layout, height };
        }
      }
      return null;
    }
    default:
      return null;
  }
}

/** Convert a remark/mdast tree root into Mantou document nodes. */
export function mdastToMantouDocument(tree: Root): MantouDocumentNode[] {
  const nodes: MantouDocumentNode[] = [];
  for (const child of tree.children) {
    const converted = convertBlock(child);
    if (!converted) continue;
    if (Array.isArray(converted)) nodes.push(...converted);
    else nodes.push(converted);
  }
  return nodes;
}
