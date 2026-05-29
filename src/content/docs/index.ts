import type { ComponentType } from "react";
import { DOC_META, type DocMeta } from "./_meta";

import Introduction from "./introduction.mdx";
import QuickStart from "./quick-start.mdx";
import GraphSyntax from "./graph-syntax.mdx";
import ReactiveStyling from "./reactive-styling.mdx";
import ExpressionLanguage from "./expression-language.mdx";
import Relationships from "./relationships.mdx";
import Interaction from "./interaction.mdx";
import DependencyExpansion from "./dependency-expansion.mdx";
import Safety from "./safety.mdx";
import Language from "./language.mdx";

const COMPONENTS: Record<string, ComponentType> = {
  introduction: Introduction,
  "quick-start": QuickStart,
  "graph-syntax": GraphSyntax,
  "reactive-styling": ReactiveStyling,
  "expression-language": ExpressionLanguage,
  relationships: Relationships,
  interaction: Interaction,
  "dependency-expansion": DependencyExpansion,
  safety: Safety,
  language: Language,
};

export interface DocPage extends DocMeta {
  Component: ComponentType;
}

export const DOC_PAGES: DocPage[] = DOC_META.map((meta) => ({
  ...meta,
  Component: COMPONENTS[meta.slug],
}));

export function getDocPage(slug: string): DocPage | undefined {
  return DOC_PAGES.find((p) => p.slug === slug);
}

export const DOC_GROUPS: { group: string; pages: DocPage[] }[] = (() => {
  const order = ["Getting started", "Authoring", "Reference", "Runtime"];
  const byGroup = new Map<string, DocPage[]>();
  for (const page of DOC_PAGES) {
    const list = byGroup.get(page.group) ?? [];
    list.push(page);
    byGroup.set(page.group, list);
  }
  return order
    .filter((g) => byGroup.has(g))
    .map((group) => ({ group, pages: byGroup.get(group)! }));
})();

export { DOC_META };
