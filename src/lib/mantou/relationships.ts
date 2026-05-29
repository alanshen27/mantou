import type { GraphRelationshipIndex, MantouGraph } from "./types";

// Build the relationship index once after parsing; rebuild when structure
// changes (nodes/edges/parents added or removed).
export function buildRelationshipIndex(
  graph: MantouGraph
): GraphRelationshipIndex {
  const parentByNodeId = new Map<string, string>();
  const childrenByNodeId = new Map<string, string[]>();
  const incomingEdgesByNodeId = new Map<string, string[]>();
  const outgoingEdgesByNodeId = new Map<string, string[]>();
  const neighborNodeIdsByNodeId = new Map<string, string[]>();
  const ancestorNodeIdsByNodeId = new Map<string, string[]>();
  const descendantNodeIdsByNodeId = new Map<string, string[]>();

  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  for (const id of nodeIds) {
    childrenByNodeId.set(id, []);
    incomingEdgesByNodeId.set(id, []);
    outgoingEdgesByNodeId.set(id, []);
    neighborNodeIdsByNodeId.set(id, []);
  }

  // explicit parents
  for (const node of graph.nodes) {
    if (node.parentId && nodeIds.has(node.parentId)) {
      parentByNodeId.set(node.id, node.parentId);
      childrenByNodeId.get(node.parentId)!.push(node.id);
    }
  }

  const neighborSets = new Map<string, Set<string>>();
  for (const id of nodeIds) neighborSets.set(id, new Set());

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) continue;
    outgoingEdgesByNodeId.get(edge.from)!.push(edge.id);
    incomingEdgesByNodeId.get(edge.to)!.push(edge.id);
    neighborSets.get(edge.from)!.add(edge.to);
    neighborSets.get(edge.to)!.add(edge.from);
  }

  for (const id of nodeIds) {
    neighborNodeIdsByNodeId.set(id, [...neighborSets.get(id)!]);
  }

  // ancestors via parent chain (cycle-safe)
  for (const id of nodeIds) {
    const ancestors: string[] = [];
    const seen = new Set<string>();
    let current = parentByNodeId.get(id);
    while (current && !seen.has(current)) {
      seen.add(current);
      ancestors.push(current);
      current = parentByNodeId.get(current);
    }
    ancestorNodeIdsByNodeId.set(id, ancestors);
  }

  // descendants via children (BFS, cycle-safe)
  for (const id of nodeIds) {
    const descendants: string[] = [];
    const seen = new Set<string>();
    const queue = [...(childrenByNodeId.get(id) ?? [])];
    while (queue.length) {
      const next = queue.shift()!;
      if (seen.has(next)) continue;
      seen.add(next);
      descendants.push(next);
      queue.push(...(childrenByNodeId.get(next) ?? []));
    }
    descendantNodeIdsByNodeId.set(id, descendants);
  }

  return {
    parentByNodeId,
    childrenByNodeId,
    incomingEdgesByNodeId,
    outgoingEdgesByNodeId,
    neighborNodeIdsByNodeId,
    ancestorNodeIdsByNodeId,
    descendantNodeIdsByNodeId,
  };
}
