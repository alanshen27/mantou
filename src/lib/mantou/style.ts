import { compileExpression, Bareword } from "./expression";
import { resolveColor } from "./theme";
import type { ReactiveContexts } from "./context";
import type {
  MantouEdgeStyle,
  MantouGraph,
  MantouNodeShape,
  MantouNodeStyle,
} from "./types";

const SHAPES: ReadonlySet<string> = new Set([
  "rounded",
  "circle",
  "database",
  "diamond",
]);

export interface StyleError {
  target: "node" | "edge";
  id: string;
  property: string;
  message: string;
}

export interface EvaluatedStyles {
  nodeStyles: Map<string, MantouNodeStyle>;
  edgeStyles: Map<string, MantouEdgeStyle>;
  errors: StyleError[];
}

function unwrap(value: unknown): unknown {
  return value instanceof Bareword ? value.name : value;
}

function toNumber(value: unknown): number | undefined {
  const v = unwrap(value);
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toBool(value: unknown): boolean {
  return Boolean(unwrap(value));
}

function toShape(value: unknown): MantouNodeShape | undefined {
  const v = unwrap(value);
  return typeof v === "string" && SHAPES.has(v) ? (v as MantouNodeShape) : undefined;
}

function applyNodeProperty(
  style: MantouNodeStyle,
  property: string,
  value: unknown,
  theme: ReactiveContexts["theme"]
): void {
  switch (property) {
    case "background":
      style.background = resolveColor(unwrap(value), theme);
      break;
    case "border":
      style.border = resolveColor(unwrap(value), theme);
      break;
    case "text":
      style.text = resolveColor(unwrap(value), theme);
      break;
    case "opacity":
      style.opacity = toNumber(value);
      break;
    case "pulse":
      style.pulse = toBool(value);
      break;
    case "icon": {
      const v = unwrap(value);
      style.icon = v == null ? undefined : String(v);
      break;
    }
    case "shape":
      style.shape = toShape(value);
      break;
  }
}

function applyEdgeProperty(
  style: MantouEdgeStyle,
  property: string,
  value: unknown,
  theme: ReactiveContexts["theme"]
): void {
  switch (property) {
    case "color":
      style.color = resolveColor(unwrap(value), theme);
      break;
    case "width":
      style.width = toNumber(value);
      break;
    case "opacity":
      style.opacity = toNumber(value);
      break;
    case "dashed":
      style.dashed = toBool(value);
      break;
  }
}

export function evaluateStyles(
  graph: MantouGraph,
  contexts: ReactiveContexts
): EvaluatedStyles {
  const nodeStyles = new Map<string, MantouNodeStyle>();
  const edgeStyles = new Map<string, MantouEdgeStyle>();
  const errors: StyleError[] = [];

  const nodeRules = graph.styleRules.filter((r) => r.target === "node");
  const edgeRules = graph.styleRules.filter((r) => r.target === "edge");

  for (const node of graph.nodes) {
    const ctx = contexts.nodeContexts.get(node.id);
    if (!ctx) continue;
    const style: MantouNodeStyle = {};
    const scope = { node: ctx, view: contexts.view, theme: contexts.theme };
    for (const rule of nodeRules) {
      try {
        const value = compileExpression(rule.source).evaluate(scope);
        applyNodeProperty(style, rule.property, value, contexts.theme);
      } catch (err) {
        errors.push({
          target: "node",
          id: node.id,
          property: rule.property,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
    // explicit node.style overrides computed values
    nodeStyles.set(node.id, { ...style, ...node.style });
  }

  for (const edge of graph.edges) {
    const ctx = contexts.edgeContexts.get(edge.id);
    if (!ctx) continue;
    const style: MantouEdgeStyle = {};
    const scope = { edge: ctx, view: contexts.view, theme: contexts.theme };
    for (const rule of edgeRules) {
      try {
        const value = compileExpression(rule.source).evaluate(scope);
        applyEdgeProperty(style, rule.property, value, contexts.theme);
      } catch (err) {
        errors.push({
          target: "edge",
          id: edge.id,
          property: rule.property,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
    edgeStyles.set(edge.id, { ...style, ...edge.style });
  }

  return { nodeStyles, edgeStyles, errors };
}
