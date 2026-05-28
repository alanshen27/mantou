import type { GraphAction, MantouGraph } from "./types";

// Pure reducer: applies a safe graph action and returns a new graph.
// Layout / index rebuilds are handled by callers after structural changes.
export function applyGraphAction(
  graph: MantouGraph,
  action: GraphAction
): MantouGraph {
  switch (action.type) {
    case "setNodeState":
      return {
        ...graph,
        nodes: graph.nodes.map((n) =>
          n.id === action.id
            ? { ...n, state: { ...n.state, ...action.state } }
            : n
        ),
      };

    case "setNodeStyle":
      return {
        ...graph,
        nodes: graph.nodes.map((n) =>
          n.id === action.id
            ? { ...n, style: { ...n.style, ...action.style } }
            : n
        ),
      };

    case "setEdgeState":
      return {
        ...graph,
        edges: graph.edges.map((e) =>
          e.id === action.id
            ? { ...e, state: { ...e.state, ...action.state } }
            : e
        ),
      };

    case "addNode": {
      if (graph.nodes.some((n) => n.id === action.node.id)) return graph;
      return { ...graph, nodes: [...graph.nodes, action.node] };
    }

    case "addEdge": {
      if (graph.edges.some((e) => e.id === action.edge.id)) return graph;
      return { ...graph, edges: [...graph.edges, action.edge] };
    }

    case "removeNode":
      return {
        ...graph,
        nodes: graph.nodes.filter((n) => n.id !== action.id),
        edges: graph.edges.filter(
          (e) => e.from !== action.id && e.to !== action.id
        ),
      };

    case "removeEdge":
      return {
        ...graph,
        edges: graph.edges.filter((e) => e.id !== action.id),
      };

    case "expandDependencies":
    case "applyLayout":
      // structural side-effects handled by the runtime store
      return graph;

    default: {
      const exhaustive: never = action;
      throw new Error(`Unknown action ${JSON.stringify(exhaustive)}`);
    }
  }
}
