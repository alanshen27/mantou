import type {
  DiagramViewState,
  GraphRelationshipIndex,
  MantouGraph,
  MantouGraphEdge,
  MantouGraphNode,
  MantouTheme,
  ReactiveEdgeContext,
  ReactiveEdgeRef,
  ReactiveNodeContext,
  ReactiveNodeRef,
} from "./types";

interface NodeFlags {
  selected: boolean;
  hovered: boolean;
  focused: boolean;
  dimmed: boolean;
  hidden: boolean;
  active: boolean;
}

interface EdgeFlags {
  selected: boolean;
  hovered: boolean;
  active: boolean;
  dimmed: boolean;
  hidden: boolean;
}

export interface ReactiveContexts {
  nodeContexts: Map<string, ReactiveNodeContext>;
  edgeContexts: Map<string, ReactiveEdgeContext>;
  theme: MantouTheme;
  view: DiagramViewState;
}

function asBool(value: unknown): boolean {
  return value === true;
}

function computeNodeFlags(
  graph: MantouGraph,
  index: GraphRelationshipIndex,
  view: DiagramViewState
): Map<string, NodeFlags> {
  const flags = new Map<string, NodeFlags>();
  const selected = view.selectedNodeId;
  const neighbors = selected
    ? new Set(index.neighborNodeIdsByNodeId.get(selected) ?? [])
    : null;

  for (const node of graph.nodes) {
    const isSelected = node.id === selected;
    const isNeighbor = neighbors?.has(node.id) ?? false;
    const stateActive = asBool(node.state.active);
    const stateDimmed = asBool(node.state.dimmed);

    // selection drives active/dimmed; explicit state can also force active.
    const active = isSelected || isNeighbor || stateActive;
    const dimmed = selected ? !(isSelected || isNeighbor) || stateDimmed : stateDimmed;

    flags.set(node.id, {
      selected: isSelected,
      hovered: node.id === view.hoveredNodeId,
      focused: node.id === view.focusedNodeId,
      hidden: view.hiddenNodeIds.includes(node.id),
      dimmed,
      active,
    });
  }
  return flags;
}

function computeEdgeFlags(
  graph: MantouGraph,
  view: DiagramViewState
): Map<string, EdgeFlags> {
  const flags = new Map<string, EdgeFlags>();
  const selected = view.selectedNodeId;

  for (const edge of graph.edges) {
    const touchesSelected =
      !!selected && (edge.from === selected || edge.to === selected);
    const stateActive = asBool(edge.state.active);
    const stateDimmed = asBool(edge.state.dimmed);

    const active = touchesSelected || stateActive;
    const dimmed = selected ? !touchesSelected || stateDimmed : stateDimmed;

    flags.set(edge.id, {
      selected: edge.id === view.selectedEdgeId,
      hovered: edge.id === view.hoveredEdgeId,
      active,
      dimmed,
      hidden: view.hiddenEdgeIds.includes(edge.id),
    });
  }
  return flags;
}

function makeNodeRef(
  node: MantouGraphNode,
  flags: NodeFlags
): ReactiveNodeRef {
  return {
    id: node.id,
    label: node.label,
    type: node.type,
    group: node.group,
    on: node.state.on as boolean | undefined,
    status: node.state.status as string | undefined,
    selected: flags.selected,
    active: flags.active,
    dimmed: flags.dimmed,
    data: node.data,
    state: node.state,
  };
}

function makeEdgeRef(edge: MantouGraphEdge, flags: EdgeFlags): ReactiveEdgeRef {
  return {
    id: edge.id,
    label: edge.label,
    active: flags.active,
    dimmed: flags.dimmed,
    selected: flags.selected,
    data: edge.data,
    state: edge.state,
  };
}

export function buildReactiveContexts(
  graph: MantouGraph,
  index: GraphRelationshipIndex,
  view: DiagramViewState,
  theme: MantouTheme
): ReactiveContexts {
  const nodeFlags = computeNodeFlags(graph, index, view);
  const edgeFlags = computeEdgeFlags(graph, view);

  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

  const nodeRefs = new Map<string, ReactiveNodeRef>();
  for (const node of graph.nodes) {
    nodeRefs.set(node.id, makeNodeRef(node, nodeFlags.get(node.id)!));
  }
  const edgeRefs = new Map<string, ReactiveEdgeRef>();
  for (const edge of graph.edges) {
    edgeRefs.set(edge.id, makeEdgeRef(edge, edgeFlags.get(edge.id)!));
  }

  const refsFor = (ids: string[] | undefined): ReactiveNodeRef[] =>
    (ids ?? []).map((id) => nodeRefs.get(id)).filter((r): r is ReactiveNodeRef => !!r);
  const edgeRefsFor = (ids: string[] | undefined): ReactiveEdgeRef[] =>
    (ids ?? []).map((id) => edgeRefs.get(id)).filter((r): r is ReactiveEdgeRef => !!r);

  const nodeContexts = new Map<string, ReactiveNodeContext>();
  for (const node of graph.nodes) {
    const flags = nodeFlags.get(node.id)!;
    const parentId = index.parentByNodeId.get(node.id);
    nodeContexts.set(node.id, {
      id: node.id,
      label: node.label,
      type: node.type,
      group: node.group,
      data: node.data,
      state: node.state,
      selected: flags.selected,
      hovered: flags.hovered,
      focused: flags.focused,
      dimmed: flags.dimmed,
      hidden: flags.hidden,
      active: flags.active,
      on: node.state.on as boolean | undefined,
      status: node.state.status as string | undefined,
      parent: parentId ? nodeRefs.get(parentId) : undefined,
      children: refsFor(index.childrenByNodeId.get(node.id)),
      incoming: edgeRefsFor(index.incomingEdgesByNodeId.get(node.id)),
      outgoing: edgeRefsFor(index.outgoingEdgesByNodeId.get(node.id)),
      neighbors: refsFor(index.neighborNodeIdsByNodeId.get(node.id)),
      ancestors: refsFor(index.ancestorNodeIdsByNodeId.get(node.id)),
      descendants: refsFor(index.descendantNodeIdsByNodeId.get(node.id)),
    });
  }

  const edgeContexts = new Map<string, ReactiveEdgeContext>();
  for (const edge of graph.edges) {
    const flags = edgeFlags.get(edge.id)!;
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    if (!fromNode || !toNode) continue;
    edgeContexts.set(edge.id, {
      id: edge.id,
      from: nodeRefs.get(edge.from)!,
      to: nodeRefs.get(edge.to)!,
      label: edge.label,
      data: edge.data,
      state: edge.state,
      selected: flags.selected,
      hovered: flags.hovered,
      active: flags.active,
      dimmed: flags.dimmed,
      hidden: flags.hidden,
    });
  }

  return { nodeContexts, edgeContexts, theme, view };
}
