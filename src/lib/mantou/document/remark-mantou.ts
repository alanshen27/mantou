import { visit } from "unist-util-visit";
import type { Root, Parent } from "mdast";
import type { MdxJsxFlowElement, MdxJsxAttribute } from "mdast-util-mdx-jsx";

export interface MantouFenceMeta {
  title?: string;
  layout?: string;
  height?: number;
}

/** Parse `title="Agent Graph" layout=dagre height=420` from fence info string. */
export function parseMantouFenceMeta(meta?: string | null): MantouFenceMeta {
  if (!meta?.trim()) return {};
  const out: MantouFenceMeta = {};
  const titleMatch = meta.match(/title=(?:"([^"]*)"|'([^']*)'|(\S+))/);
  if (titleMatch) {
    out.title = titleMatch[1] ?? titleMatch[2] ?? titleMatch[3];
  }
  const layoutMatch = meta.match(/layout=(\S+)/);
  if (layoutMatch) out.layout = layoutMatch[1];
  const heightMatch = meta.match(/height=(\d+)/);
  if (heightMatch) out.height = Number(heightMatch[1]);
  return out;
}

function jsxAttr(name: string, value: string): MdxJsxAttribute {
  return {
    type: "mdxJsxAttribute",
    name,
    value,
  };
}

function jsxAttrNumber(name: string, value: number): MdxJsxAttribute {
  return {
    type: "mdxJsxAttribute",
    name,
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: String(value),
      data: {
        estree: {
          type: "Program",
          body: [
            {
              type: "ExpressionStatement",
              expression: { type: "Literal", value, raw: String(value) },
            },
          ],
          sourceType: "module",
        },
      },
    },
  };
}

function mantouCodeToFlow(
  value: string,
  meta?: string | null
): MdxJsxFlowElement {
  const parsed = parseMantouFenceMeta(meta);
  const attributes: MdxJsxAttribute[] = [
    jsxAttr("source", value),
  ];
  if (parsed.title) attributes.push(jsxAttr("title", parsed.title));
  if (parsed.layout) attributes.push(jsxAttr("layout", parsed.layout));
  if (parsed.height != null) attributes.push(jsxAttrNumber("height", parsed.height));

  return {
    type: "mdxJsxFlowElement",
    name: "Flow",
    attributes,
    children: [],
  };
}

/** Remark plugin: ` ```mantou ` fences become `<Flow source="..." />`. */
function remarkMantou() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (index == null || !parent) return;
      const lang = node.lang?.split(/\s/)[0];
      if (lang !== "mantou") return;

      const flow = mantouCodeToFlow(node.value, node.meta);
      (parent as Parent).children[index] = flow;
    });
  };
}

export { remarkMantou };
export default remarkMantou;
