export interface DocMeta {
  slug: string;
  title: string;
  group: string;
  description: string;
}

export const DOC_META: DocMeta[] = [
  {
    slug: "introduction",
    title: "Introduction",
    group: "Getting started",
    description: "Mantou is reactive diagrams for your docs.",
  },
  {
    slug: "quick-start",
    title: "Quick start",
    group: "Getting started",
    description: "Embed your first reactive diagram in MDX.",
  },
  {
    slug: "graph-syntax",
    title: "Graph syntax",
    group: "Authoring",
    description: "Nodes, edges, metadata, and groups.",
  },
  {
    slug: "reactive-styling",
    title: "Reactive styling",
    group: "Authoring",
    description: "style node / style edge blocks and theme tokens.",
  },
  {
    slug: "expression-language",
    title: "Expression language",
    group: "Reference",
    description: "The tiny, safe expression subset.",
  },
  {
    slug: "relationships",
    title: "Relationships",
    group: "Reference",
    description: "Parent, children, ancestors, descendants, neighbors.",
  },
  {
    slug: "interaction",
    title: "Interaction",
    group: "Reference",
    description: "Selection, active, dimmed, hover, focus.",
  },
  {
    slug: "dependency-expansion",
    title: "Dependency expansion",
    group: "Runtime",
    description: "Read a scoped package.json and grow the graph.",
  },
  {
    slug: "safety",
    title: "Safety model",
    group: "Runtime",
    description: "How Mantou stays sandboxed.",
  },
  {
    slug: "language",
    title: "Mantou language",
    group: "Reference",
    description: "Full MDX-native language reference.",
  },
];
