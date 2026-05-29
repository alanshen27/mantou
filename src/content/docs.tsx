import type { ReactNode } from "react";
import Link from "next/link";
import { Flow } from "@/components/flow/Flow";
import {
  CodeBlock,
  Callout,
  Caption,
  Code,
  H2,
  Lead,
  Li,
  Ol,
  P,
  Ul,
} from "@/components/docs/primitives";
import { AGENT_GRAPH, SERVICE_GRAPH, ANCESTRY_GRAPH } from "@/lib/mantou";

export interface DocPage {
  slug: string;
  title: string;
  group: string;
  description: string;
  body: ReactNode;
}

const QUICKSTART_MDX = `import { Flow } from "mantou";

# Architecture

Here is our agent topology:

<Flow title="Agent Dependency Graph">
{\`
node Planner { type: agent  on: true  status: running }
node Researcher { type: subagent  parent: Planner }
Planner -> Researcher

style node {
  background: node.on ? chili : node.parent.on ? bamboo : cream
}
\`}
</Flow>`;

const SMALL_GRAPH = `node Planner {
  type: agent
  on: true
  status: running
}

node Researcher {
  type: subagent
  parent: Planner
  on: false
}

Planner -> Researcher

style node {
  background: node.on ? chili : node.parent.on ? bamboo : cream
  border: node.selected ? chili : border
  pulse: node.status == "running"
}`;

export const DOC_PAGES: DocPage[] = [
  {
    slug: "introduction",
    title: "Introduction",
    group: "Getting started",
    description: "Mantou is reactive diagrams for your docs.",
    body: (
      <>
        <Lead>
          Mantou is an MDX documentation system with one superpower: diagrams
          that think. Drop a <Code>&lt;Flow&gt;</Code> block into any page and it
          renders as a stateful, interactive system map — not a static image.
        </Lead>

        <P>
          Authors write diagrams in a small Mermaid-like syntax. Node and edge
          appearance is driven by a safe expression language that can read
          metadata, runtime state, graph relationships, and the reader&apos;s own
          selection — all recomputed live, with no arbitrary JavaScript ever
          executed.
        </P>

        <Flow title="Agent Dependency Graph" height={420}>
          {AGENT_GRAPH}
        </Flow>
        <Caption>
          Click a node. Connected nodes light up, the rest dim. Toggle a
          node&apos;s power in the panel and watch children react via{" "}
          <Code>node.parent.on</Code>.
        </Caption>

        <H2 id="why">Why Mantou?</H2>
        <Ul>
          <Li>
            <b>Diagrams as data.</b> Every <Code>&lt;Flow&gt;</Code> parses into a
            graph AST, a relationship index, runtime state, and reactive style
            rules.
          </Li>
          <Li>
            <b>Reactive styling.</b> Appearance depends on{" "}
            <Code>node.on</Code>, <Code>node.parent.selected</Code>,{" "}
            <Code>node.children.any(on)</Code>, and more.
          </Li>
          <Li>
            <b>Safe by construction.</b> A tiny expression language — no{" "}
            <Code>eval</Code>, no globals, no filesystem beyond a scoped{" "}
            <Code>package.json</Code> read.
          </Li>
          <Li>
            <b>Interactive.</b> Selection, hover, focus, dependency expansion, and
            live relayout, built in.
          </Li>
        </Ul>

        <Callout type="note" title="Not Mermaid">
          Mantou uses React Flow for rendering instead of producing a flat image,
          so diagrams stay interactive and reactive inside your documentation.
        </Callout>
      </>
    ),
  },
  {
    slug: "quick-start",
    title: "Quick start",
    group: "Getting started",
    description: "Embed your first reactive diagram in MDX.",
    body: (
      <>
        <Lead>
          A <Code>&lt;Flow&gt;</Code> takes a diagram source string as its child.
          Author it inside MDX exactly like a fenced code block.
        </Lead>

        <H2 id="install">1. Import the component</H2>
        <CodeBlock language="mdx" code={QUICKSTART_MDX} />

        <H2 id="anatomy">2. Anatomy of a diagram</H2>
        <P>
          A source has three kinds of statements: <b>node</b> declarations,{" "}
          <b>edges</b>, and <b>style</b> blocks.
        </P>
        <CodeBlock code={SMALL_GRAPH} />

        <P>That renders to a live diagram:</P>
        <Flow title="Hello, Mantou" height={340}>
          {SMALL_GRAPH}
        </Flow>

        <Callout type="tip" title="Edit and watch">
          Head to the <Link className="font-semibold text-[#9a3f1a] underline" href="/docs/playground">Playground</Link>{" "}
          to edit diagram source and see styles recompute on every keystroke.
        </Callout>
      </>
    ),
  },
  {
    slug: "graph-syntax",
    title: "Graph syntax",
    group: "Authoring",
    description: "Nodes, edges, metadata, and groups.",
    body: (
      <>
        <Lead>
          The diagram source is line-oriented. Declare nodes with metadata, then
          connect them with arrows.
        </Lead>

        <H2 id="nodes">Nodes</H2>
        <P>
          Node metadata supports booleans, strings, and numbers. Reserved keys
          (<Code>type</Code>, <Code>parent</Code>, <Code>group</Code>,{" "}
          <Code>label</Code>) map to node fields; <Code>on</Code> and{" "}
          <Code>status</Code> become runtime state; everything else lands on{" "}
          <Code>node.data</Code>.
        </P>
        <CodeBlock
          code={`node Gateway {
  type: service
  on: true
  status: running
  cost: 0.21
}`}
        />
        <P>These become accessible in expressions as:</P>
        <Ul>
          <Li><Code>node.type</Code> → <Code>&quot;service&quot;</Code></Li>
          <Li><Code>node.on</Code> → <Code>true</Code></Li>
          <Li><Code>node.status</Code> → <Code>&quot;running&quot;</Code></Li>
          <Li><Code>node.data.cost</Code> → <Code>0.21</Code></Li>
        </Ul>

        <H2 id="edges">Edges</H2>
        <P>
          Connect nodes with <Code>-&gt;</Code>. Add a label after a colon, or use
          an <Code>edge</Code> block to attach metadata.
        </P>
        <CodeBlock
          code={`Gateway -> Auth
Gateway -> Orders : sync

edge Orders -> Postgres {
  active: true
}`}
        />

        <H2 id="parent">Parent / child</H2>
        <P>
          Set <Code>parent:</Code> explicitly on a node. This powers relationship
          accessors like <Code>node.parent.on</Code> and{" "}
          <Code>node.ancestors</Code>.
        </P>
        <CodeBlock
          code={`node Researcher {
  type: subagent
  parent: Planner
  on: false
}`}
        />

        <Flow title="Service Mesh" height={460}>
          {SERVICE_GRAPH}
        </Flow>
        <Caption>
          Databases render with a distinct shape; the degraded service is flagged
          in <Code>danger</Code>.
        </Caption>
      </>
    ),
  },
  {
    slug: "reactive-styling",
    title: "Reactive styling",
    group: "Authoring",
    description: "style node / style edge blocks and theme tokens.",
    body: (
      <>
        <Lead>
          A <Code>style</Code> block maps a visual property to an expression. The
          expression is re-evaluated whenever state, selection, or structure
          changes.
        </Lead>

        <H2 id="node-style">Node styles</H2>
        <CodeBlock
          code={`style node {
  background: node.on ? chili : node.parent.on ? bamboo : cream
  border: node.selected ? chili : border
  opacity: node.hidden ? 0 : node.dimmed ? 0.25 : 1
  pulse: node.status == "running"
  shape: node.type == "database" ? database : rounded
}`}
        />
        <P>
          Supported node properties: <Code>background</Code>, <Code>border</Code>,{" "}
          <Code>text</Code>, <Code>opacity</Code>, <Code>pulse</Code>,{" "}
          <Code>icon</Code>, and <Code>shape</Code> (one of{" "}
          <Code>rounded</Code>, <Code>circle</Code>, <Code>database</Code>,{" "}
          <Code>diamond</Code>).
        </P>

        <H2 id="edge-style">Edge styles</H2>
        <CodeBlock
          code={`style edge {
  color: edge.active ? chili : bamboo
  width: edge.active ? 3 : 1
  opacity: edge.dimmed ? 0.2 : 1
}`}
        />

        <H2 id="tokens">Theme tokens</H2>
        <P>
          Colors are written as bare theme tokens that resolve to the Mantou
          palette: <Code>chili</Code>, <Code>cream</Code>, <Code>scallion</Code>,{" "}
          <Code>bamboo</Code>, <Code>soy</Code>, <Code>danger</Code>,{" "}
          <Code>border</Code>, <Code>muted</Code>. Raw CSS colors work too.
        </P>

        <Callout type="tip" title="Live recompute">
          In the diagram below, set a node&apos;s status to <Code>running</Code> in
          the panel — <Code>pulse</Code> turns on instantly because the style rule
          re-runs.
        </Callout>
        <Flow title="Reactive styles" height={400}>
          {AGENT_GRAPH}
        </Flow>
      </>
    ),
  },
  {
    slug: "expression-language",
    title: "Expression language",
    group: "Reference",
    description: "The tiny, safe expression subset.",
    body: (
      <>
        <Lead>
          Mantou ships a minimal expression language. It is powerful enough for
          conditional styling and intentionally too small to do anything unsafe.
        </Lead>

        <H2 id="allowed">Allowed</H2>
        <Ul>
          <Li>Property access: <Code>node.on</Code>, <Code>node.parent.on</Code>, <Code>edge.from.status</Code></Li>
          <Li>Comparisons: <Code>==</Code> <Code>!=</Code> <Code>&gt;</Code> <Code>&lt;</Code> <Code>&gt;=</Code> <Code>&lt;=</Code></Li>
          <Li>Booleans: <Code>&amp;&amp;</Code> <Code>||</Code> <Code>!</Code></Li>
          <Li>Ternary: <Code>condition ? a : b</Code></Li>
          <Li>Literals: strings, numbers, booleans</Li>
          <Li>Theme tokens: <Code>chili</Code>, <Code>cream</Code>, …</Li>
          <Li>Array helpers: <Code>any(...)</Code> and <Code>all(...)</Code></Li>
        </Ul>

        <H2 id="examples">Examples</H2>
        <CodeBlock
          code={`node.on ? chili : cream
node.parent.on ? bamboo : cream
node.status == "running" ? chili : scallion
node.selected ? chili : node.parent.selected ? bamboo : cream
node.children.any(on) ? scallion : cream
node.descendants.any(status == "failed") ? danger : cream
edge.from.on && edge.to.on ? chili : bamboo`}
        />

        <H2 id="helpers">Array helpers</H2>
        <P>
          <Code>any</Code> and <Code>all</Code> take a predicate evaluated against
          each element, where the element&apos;s fields are in scope. So{" "}
          <Code>node.children.any(on)</Code> is true when any child has{" "}
          <Code>on: true</Code>.
        </P>

        <Callout type="warning" title="Disallowed">
          No arbitrary JavaScript, function definitions, imports, loops,
          assignment, mutation, network or filesystem access, <Code>eval</Code>,
          or access to <Code>window</Code>, <Code>document</Code>,{" "}
          <Code>process</Code>, prototypes, or globals.
        </Callout>
      </>
    ),
  },
  {
    slug: "relationships",
    title: "Relationships",
    group: "Reference",
    description: "Parent, children, ancestors, descendants, neighbors.",
    body: (
      <>
        <Lead>
          After parsing, Mantou builds a relationship index so expressions can
          walk the graph cheaply.
        </Lead>

        <H2 id="accessors">Accessors</H2>
        <Ul>
          <Li><Code>node.parent</Code> — the explicit parent reference</Li>
          <Li><Code>node.children</Code> — direct children</Li>
          <Li><Code>node.ancestors</Code> — parent chain to the root</Li>
          <Li><Code>node.descendants</Code> — everything beneath</Li>
          <Li><Code>node.neighbors</Code> — nodes connected by an edge</Li>
          <Li><Code>node.incoming</Code> / <Code>node.outgoing</Code> — edges</Li>
        </Ul>

        <H2 id="example">Deep styling</H2>
        <CodeBlock
          code={`style node {
  background: node.selected ? chili
    : node.ancestors.any(selected) ? bamboo
    : node.descendants.any(status == "failed") ? danger
    : cream
  border: node.parent.selected ? scallion : border
}`}
        />
        <P>
          Select <b>Root</b> or <b>Backend</b> below — descendants tint via{" "}
          <Code>ancestors.any(selected)</Code>, and any branch containing a failed
          node turns <Code>danger</Code>.
        </P>
        <Flow title="Org / Dependency Tree" height={520}>
          {ANCESTRY_GRAPH}
        </Flow>
      </>
    ),
  },
  {
    slug: "interaction",
    title: "Interaction",
    group: "Reference",
    description: "Selection, active, dimmed, hover, focus.",
    body: (
      <>
        <Lead>
          Reader interaction feeds straight back into the style expressions
          through view state.
        </Lead>

        <H2 id="selection">Selecting a node</H2>
        <Ol>
          <Li>The node is marked <Code>node.selected</Code>.</Li>
          <Li>Directly connected nodes become <Code>node.active</Code>.</Li>
          <Li>Unrelated nodes become <Code>node.dimmed</Code>.</Li>
          <Li>Connected edges become <Code>edge.active</Code>.</Li>
          <Li>The detail panel opens.</Li>
        </Ol>

        <P>
          These flags are just fields in the expression context, so styling reacts
          automatically:
        </P>
        <CodeBlock
          code={`style node {
  opacity: node.dimmed ? 0.35 : 1
  border: node.selected ? chili : node.parent.selected ? scallion : border
}
style edge {
  color: edge.active ? chili : bamboo
  width: edge.active ? 3 : 1
}`}
        />

        <Flow title="Click around" height={420}>
          {SERVICE_GRAPH}
        </Flow>
      </>
    ),
  },
  {
    slug: "dependency-expansion",
    title: "Dependency expansion",
    group: "Runtime",
    description: "Read a scoped package.json and grow the graph.",
    body: (
      <>
        <Lead>
          Diagrams can grow at runtime. The <Code>on expand</Code> binding adds a
          button that safely reads a <Code>package.json</Code> and adds dependency
          nodes.
        </Lead>

        <H2 id="syntax">Syntax</H2>
        <CodeBlock
          code={`on expand WebApp {
  add dependencies from "package.json" depth 1
}`}
        />

        <H2 id="behavior">Behavior</H2>
        <Ol>
          <Li>An <b>Expand</b> button appears in the node detail panel.</Li>
          <Li>On click, the runtime reads the <Code>package.json</Code> — inside the project directory only.</Li>
          <Li>It parses <Code>dependencies</Code> and <Code>devDependencies</Code>.</Li>
          <Li>Dependency nodes and edges are added, then the graph relayouts.</Li>
        </Ol>

        <Callout type="warning" title="Scoped & manual">
          Expansion never happens automatically, and the path is resolved strictly
          within the project directory — traversal and absolute paths are rejected.
        </Callout>

        <P>
          Select <b>WebApp</b> below and click <b>Expand dependencies</b>:
        </P>
        <Flow title="Live expansion" height={520}>
          {ANCESTRY_GRAPH}
        </Flow>
      </>
    ),
  },
  {
    slug: "safety",
    title: "Safety model",
    group: "Runtime",
    description: "How Mantou stays sandboxed.",
    body: (
      <>
        <Lead>
          Mantou treats diagram source as untrusted. The expression evaluator and
          the expansion endpoint are both deliberately constrained.
        </Lead>

        <H2 id="expressions">Expression sandbox</H2>
        <Ul>
          <Li>Hand-written lexer + recursive-descent parser — no <Code>Function</Code> or <Code>eval</Code>.</Li>
          <Li>Member access only reads own properties of plain objects.</Li>
          <Li><Code>__proto__</Code>, <Code>constructor</Code>, <Code>prototype</Code>, <Code>call</Code>, <Code>apply</Code>, <Code>bind</Code> are blocked.</Li>
          <Li>No assignment, loops, function calls (beyond <Code>any</Code>/<Code>all</Code>), or imports.</Li>
        </Ul>

        <H2 id="filesystem">Filesystem</H2>
        <Ul>
          <Li>Only files named <Code>package.json</Code> can be read.</Li>
          <Li>Absolute paths are rejected.</Li>
          <Li>Paths that resolve outside the project directory are rejected.</Li>
          <Li>No network access of any kind.</Li>
        </Ul>

        <Callout type="note" title="Defense in depth">
          Even if a diagram author writes a hostile expression, the worst outcome
          is a style that fails to evaluate — surfaced as an error, never executed.
        </Callout>
      </>
    ),
  },
];

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
