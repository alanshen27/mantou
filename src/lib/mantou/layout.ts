import dagre from "dagre";
import type { MantouGraph } from "./types";

export interface NodePosition {
  x: number;
  y: number;
}

export interface LayoutResult {
  positions: Map<string, NodePosition>;
  width: number;
  height: number;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 64;

export type LayoutKind = "dagre" | "tree" | "force";

// Compute node positions with dagre. `tree` is a tighter top-down variant.
export function layoutGraph(
  graph: MantouGraph,
  kind: LayoutKind = "dagre"
): LayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    nodesep: kind === "tree" ? 36 : 60,
    ranksep: kind === "tree" ? 70 : 90,
    marginx: 24,
    marginy: 24,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of graph.nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of graph.edges) {
    if (graph.nodes.some((n) => n.id === edge.from) &&
        graph.nodes.some((n) => n.id === edge.to)) {
      g.setEdge(edge.from, edge.to);
    }
  }

  dagre.layout(g);

  const positions = new Map<string, NodePosition>();
  for (const node of graph.nodes) {
    const pos = g.node(node.id);
    if (pos) {
      positions.set(node.id, {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      });
    }
  }

  const graphLabel = g.graph();
  return {
    positions,
    width: graphLabel.width ?? 0,
    height: graphLabel.height ?? 0,
  };
}

export const NODE_DIMENSIONS = { width: NODE_WIDTH, height: NODE_HEIGHT };
