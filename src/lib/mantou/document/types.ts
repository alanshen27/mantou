/** Document-level AST nodes (prose + Mantou blocks), distinct from graph nodes. */

export type MantouDocumentNode =
  | MantouHeadingNode
  | MantouParagraphNode
  | MantouListNode
  | MantouCodeNode
  | MantouFlowNode
  | MantouCalloutNode
  | MantouBlockquoteNode
  | MantouThematicBreakNode
  | MantouHtmlNode;

export interface MantouHeadingNode {
  kind: "heading";
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
  text: string;
}

export interface MantouParagraphNode {
  kind: "paragraph";
  text: string;
}

export interface MantouListNode {
  kind: "list";
  ordered: boolean;
  items: string[];
}

export interface MantouCodeNode {
  kind: "code";
  language?: string;
  value: string;
}

export interface MantouFlowNode {
  kind: "flow";
  source: string;
  title?: string;
  layout?: string;
  height?: number;
}

export interface MantouCalloutNode {
  kind: "callout";
  type?: "note" | "tip" | "warning";
  title?: string;
  children: MantouDocumentNode[];
}

export interface MantouBlockquoteNode {
  kind: "blockquote";
  children: MantouDocumentNode[];
}

export interface MantouThematicBreakNode {
  kind: "thematicBreak";
}

export interface MantouHtmlNode {
  kind: "html";
  value: string;
}
