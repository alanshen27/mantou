// Core data model for Mantou reactive graphs.

export type MantouGraphType = "flow" | "dag" | "state";

export interface MantouGraph {
  id: string;
  title?: string;
  type: MantouGraphType;
  nodes: MantouGraphNode[];
  edges: MantouGraphEdge[];
  groups: MantouGraphGroup[];
  styleRules: MantouStyleRule[];
  actions: MantouActionBinding[];
}

export interface MantouGraphNode {
  id: string;
  label: string;
  type?: string;
  group?: string;
  parentId?: string;
  data: Record<string, unknown>;
  state: Record<string, unknown>;
  style?: MantouNodeStyle;
}

export interface MantouGraphEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  data: Record<string, unknown>;
  state: Record<string, unknown>;
  style?: MantouEdgeStyle;
}

export interface MantouGraphGroup {
  id: string;
  label: string;
  nodeIds: string[];
  collapsed?: boolean;
}

export type MantouNodeShape = "rounded" | "circle" | "database" | "diamond";

export interface MantouNodeStyle {
  background?: string;
  border?: string;
  text?: string;
  opacity?: number;
  pulse?: boolean;
  icon?: string;
  shape?: MantouNodeShape;
}

export interface MantouEdgeStyle {
  color?: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
}

// A single declarative style rule, e.g. `background: node.on ? chili : cream`.
export interface MantouStyleRule {
  target: "node" | "edge";
  property: string;
  source: string;
}

// `on expand WebApp { add dependencies from "apps/web/package.json" depth 2 }`
export interface MantouActionBinding {
  trigger: "expand";
  nodeId: string;
  kind: "dependencies";
  sourcePath: string;
  depth: number;
}

// --- View / interaction state ---------------------------------------------

export interface DiagramViewState {
  selectedNodeId?: string;
  selectedEdgeId?: string;
  hoveredNodeId?: string;
  hoveredEdgeId?: string;

  hiddenNodeIds: string[];
  hiddenEdgeIds: string[];

  focusedNodeId?: string;
  focusDepth: number;

  activeGroupIds: string[];
  currentStep?: number;
}

export function emptyViewState(): DiagramViewState {
  return {
    hiddenNodeIds: [],
    hiddenEdgeIds: [],
    focusDepth: 1,
    activeGroupIds: [],
  };
}

// --- Relationship index ----------------------------------------------------

export interface GraphRelationshipIndex {
  parentByNodeId: Map<string, string>;
  childrenByNodeId: Map<string, string[]>;
  incomingEdgesByNodeId: Map<string, string[]>;
  outgoingEdgesByNodeId: Map<string, string[]>;
  neighborNodeIdsByNodeId: Map<string, string[]>;
  ancestorNodeIdsByNodeId: Map<string, string[]>;
  descendantNodeIdsByNodeId: Map<string, string[]>;
}

// --- Reactive expression context ------------------------------------------

export interface ReactiveNodeRef {
  id: string;
  label: string;
  type?: string;
  group?: string;
  on?: boolean;
  status?: string;
  selected: boolean;
  active: boolean;
  dimmed: boolean;
  data: Record<string, unknown>;
  state: Record<string, unknown>;
}

export interface ReactiveEdgeRef {
  id: string;
  label?: string;
  active: boolean;
  dimmed: boolean;
  selected: boolean;
  data: Record<string, unknown>;
  state: Record<string, unknown>;
}

export interface ReactiveNodeContext {
  id: string;
  label: string;
  type?: string;
  group?: string;

  data: Record<string, unknown>;
  state: Record<string, unknown>;

  selected: boolean;
  hovered: boolean;
  focused: boolean;
  dimmed: boolean;
  hidden: boolean;
  active: boolean;

  on?: boolean;
  status?: string;

  parent?: ReactiveNodeRef;
  children: ReactiveNodeRef[];
  incoming: ReactiveEdgeRef[];
  outgoing: ReactiveEdgeRef[];
  neighbors: ReactiveNodeRef[];
  ancestors: ReactiveNodeRef[];
  descendants: ReactiveNodeRef[];
}

export interface ReactiveEdgeContext {
  id: string;
  from: ReactiveNodeRef;
  to: ReactiveNodeRef;
  label?: string;

  data: Record<string, unknown>;
  state: Record<string, unknown>;

  selected: boolean;
  hovered: boolean;
  active: boolean;
  dimmed: boolean;
  hidden: boolean;
}

export interface NodeExpressionContext {
  node: ReactiveNodeContext;
  view: DiagramViewState;
  theme: MantouTheme;
}

export interface EdgeExpressionContext {
  edge: ReactiveEdgeContext;
  view: DiagramViewState;
  theme: MantouTheme;
}

// --- Theme -----------------------------------------------------------------

export type MantouThemeToken =
  | "chili"
  | "cream"
  | "scallion"
  | "bamboo"
  | "soy"
  | "danger"
  | "border"
  | "muted";

export type MantouTheme = Record<MantouThemeToken, string>;

// --- Runtime actions -------------------------------------------------------

export type GraphAction =
  | { type: "setNodeState"; id: string; state: Record<string, unknown> }
  | { type: "setNodeStyle"; id: string; style: MantouNodeStyle }
  | { type: "setEdgeState"; id: string; state: Record<string, unknown> }
  | { type: "addNode"; node: MantouGraphNode }
  | { type: "addEdge"; edge: MantouGraphEdge }
  | { type: "removeNode"; id: string }
  | { type: "removeEdge"; id: string }
  | {
      type: "expandDependencies";
      nodeId: string;
      sourcePath: string;
      depth: number;
    }
  | { type: "applyLayout"; layout: "dagre" | "tree" | "force" };
