# Mantou language specification

Mantou is a layered, MDX-native documentation language: GFM prose, document components,
`mantou` fenced diagrams, a graph DSL, and a sandboxed expression language for reactive styles.

## File formats

| Extension | Role |
| --------- | ---- |
| `.mdx` | Primary authoring format (Markdown + JSX) |
| `.mantou` | Alias extension — same compiler pipeline as `.mdx` |
| `.md` | Optional plain Markdown with GFM |

Configure Next.js `pageExtensions` to include `md`, `mdx`, and `mantou`. Use `@next/mdx` with
`remark-gfm` and the `remarkMantou` plugin.

## Layer 1 — Prose (GFM)

Via `remark-gfm`:

- Tables, strikethrough, task lists, autolinks
- Headings, lists, blockquotes, thematic breaks

Typography is applied through `mdx-components.tsx` / `mantouMdxComponents`.

## Layer 2 — Document nodes (MDX)

Custom MDX components (document node engine in `src/lib/mantou/document/`):

| Component | Purpose |
| --------- | ------- |
| `Flow` | Interactive reactive diagram |
| `Lead` | Intro paragraph |
| `Callout` | Note / tip / warning |
| `Caption` | Diagram caption |
| `CodeBlock` | Display-only code fence |

```mdx
import { Flow, Callout } from "mantou/react";
```

## Layer 3 — `mantou` fences

Fences with language `mantou` compile to `<Flow />`:

````md
```mantou title="Agent Graph" layout=dagre height=420
node Planner { type: agent on: true }
Planner -> Researcher
```
````

Meta: `title="..."`, `layout=dagre|tree`, `height=NNN`.

## Layer 4 — Graph DSL

Inside `<Flow>` or `mantou` fences:

```
node Id { key: value }
A -> B
A -> B : label
edge A -> B { active: true }
style node { background: node.on ? chili : cream }
style edge { color: edge.active ? chili : bamboo }
group G { members: A, B collapsed: true }
on expand Id { add dependencies from "package.json" depth 1 }
```

Reserved node keys: `type`, `parent`, `group`, `label` (structure); `on`, `status` (state); other keys → `data`.

## Layer 5 — Expression language

Used only in `style` rule values:

- Literals, comparisons, `&&` `||` `!`, ternary
- Property access: `node.on`, `node.parent.on`, `edge.from.status`
- Theme barewords: `chili`, `cream`, `bamboo`, …
- `node.children.any(on)`, `node.descendants.all(status == "ok")`

**Disallowed:** `eval`, arbitrary calls, assignment, loops, imports, globals, prototype access.

## Package exports

| Path | Exports |
| ---- | ------- |
| `mantou` | `parseMantouGraph`, `compileExpression`, `compileMantouMdx`, samples, … |
| `mantou/react` | `Flow`, `DiagramProvider`, document components |
| `mantou/mdx` | `mantouMdxComponents`, `remarkMantou`, `compileMantouMdx` |

## Security

- Expressions: custom lexer/parser/evaluator, blocked dangerous property names.
- Expansion: only `package.json` under project root, manual trigger only.
- MDX playground preview: server compile with allowlisted components (v1).

## Reference implementation

This repository: `src/lib/mantou/`, `src/content/docs/*.mdx`, `src/mdx-components.tsx`.
