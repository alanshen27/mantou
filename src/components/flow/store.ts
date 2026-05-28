import { createStore } from "zustand/vanilla";
import {
  applyGraphAction,
  buildReactiveContexts,
  buildRelationshipIndex,
  evaluateStyles,
  layoutGraph,
  mantouTheme,
  parseMantouGraph,
} from "@/lib/mantou";
import type {
  DiagramViewState,
  EvaluatedStyles,
  GraphAction,
  GraphRelationshipIndex,
  LayoutKind,
  LayoutResult,
  MantouGraph,
  MantouGraphEdge,
  MantouGraphNode,
  ReactiveContexts,
} from "@/lib/mantou";
import { emptyViewState } from "@/lib/mantou/types";
import type { ExpandResponse } from "@/app/api/expand/route";

interface DerivedState {
  index: GraphRelationshipIndex;
  layout: LayoutResult;
  contexts: ReactiveContexts;
  styles: EvaluatedStyles;
}

export interface DiagramState extends DerivedState {
  source: string;
  graph: MantouGraph;
  view: DiagramViewState;
  layoutKind: LayoutKind;
  parseError?: string;
  expanding: boolean;
  expandError?: string;

  load: (source: string) => void;
  selectNode: (id?: string) => void;
  selectEdge: (id?: string) => void;
  hoverNode: (id?: string) => void;
  hoverEdge: (id?: string) => void;
  toggleNodeOn: (id: string) => void;
  setNodeState: (id: string, state: Record<string, unknown>) => void;
  setEdgeState: (id: string, state: Record<string, unknown>) => void;
  dispatch: (action: GraphAction, restructure?: boolean) => void;
  setLayoutKind: (kind: LayoutKind) => void;
  toggleHidden: (id: string) => void;
  expandDependencies: (nodeId: string) => Promise<void>;
  resetView: () => void;
}

// Recompute reactive contexts + styles for the current graph/view.
function deriveReactive(
  graph: MantouGraph,
  index: GraphRelationshipIndex,
  view: DiagramViewState
): { contexts: ReactiveContexts; styles: EvaluatedStyles } {
  const contexts = buildReactiveContexts(graph, index, view, mantouTheme);
  const styles = evaluateStyles(graph, contexts);
  return { contexts, styles };
}

// Full rebuild including relationship index + layout (structural change).
function deriveStructural(
  graph: MantouGraph,
  view: DiagramViewState,
  layoutKind: LayoutKind
): DerivedState {
  const index = buildRelationshipIndex(graph);
  const layout = layoutGraph(graph, layoutKind);
  const { contexts, styles } = deriveReactive(graph, index, view);
  return { index, layout, contexts, styles };
}

export type DiagramStoreApi = ReturnType<typeof createDiagramStore>;

export function createDiagramStore(initialSource = "", layoutKind: LayoutKind = "dagre") {
  const graph = parseMantouGraph(initialSource);
  const view = emptyViewState();

  return createStore<DiagramState>()((set, get) => ({
    source: initialSource,
    graph,
    view,
    layoutKind,
    expanding: false,
    ...deriveStructural(graph, view, layoutKind),

    load: (source) => {
      try {
        const { layoutKind } = get();
        const nextGraph = parseMantouGraph(source);
        const nextView = emptyViewState();
        set({
          source,
          graph: nextGraph,
          view: nextView,
          parseError: undefined,
          ...deriveStructural(nextGraph, nextView, layoutKind),
        });
      } catch (err) {
        set({
          source,
          parseError: err instanceof Error ? err.message : String(err),
        });
      }
    },

    selectNode: (id) => {
      const { graph, index, view } = get();
      const nextView: DiagramViewState = {
        ...view,
        selectedNodeId: view.selectedNodeId === id ? undefined : id,
        selectedEdgeId: undefined,
      };
      set({ view: nextView, ...deriveReactive(graph, index, nextView) });
    },

    selectEdge: (id) => {
      const { graph, index, view } = get();
      const nextView: DiagramViewState = {
        ...view,
        selectedEdgeId: view.selectedEdgeId === id ? undefined : id,
        selectedNodeId: undefined,
      };
      set({ view: nextView, ...deriveReactive(graph, index, nextView) });
    },

    hoverNode: (id) => {
      const { graph, index, view } = get();
      if (view.hoveredNodeId === id) return;
      const nextView = { ...view, hoveredNodeId: id };
      set({ view: nextView, ...deriveReactive(graph, index, nextView) });
    },

    hoverEdge: (id) => {
      const { graph, index, view } = get();
      if (view.hoveredEdgeId === id) return;
      const nextView = { ...view, hoveredEdgeId: id };
      set({ view: nextView, ...deriveReactive(graph, index, nextView) });
    },

    toggleNodeOn: (id) => {
      const node = get().graph.nodes.find((n) => n.id === id);
      if (!node) return;
      get().setNodeState(id, { on: !(node.state.on === true) });
    },

    setNodeState: (id, state) => {
      const { graph, index, view } = get();
      const nextGraph = applyGraphAction(graph, { type: "setNodeState", id, state });
      set({ graph: nextGraph, ...deriveReactive(nextGraph, index, view) });
    },

    setEdgeState: (id, state) => {
      const { graph, index, view } = get();
      const nextGraph = applyGraphAction(graph, { type: "setEdgeState", id, state });
      set({ graph: nextGraph, ...deriveReactive(nextGraph, index, view) });
    },

    dispatch: (action, restructure = false) => {
      const { graph, index, view, layoutKind } = get();
      const nextGraph = applyGraphAction(graph, action);
      if (restructure) {
        set({ graph: nextGraph, ...deriveStructural(nextGraph, view, layoutKind) });
      } else {
        set({ graph: nextGraph, ...deriveReactive(nextGraph, index, view) });
      }
    },

    setLayoutKind: (kind) => {
      const { graph, view } = get();
      set({ layoutKind: kind, ...deriveStructural(graph, view, kind) });
    },

    toggleHidden: (id) => {
      const { graph, index, view } = get();
      const hiddenNodeIds = view.hiddenNodeIds.includes(id)
        ? view.hiddenNodeIds.filter((n) => n !== id)
        : [...view.hiddenNodeIds, id];
      const nextView = { ...view, hiddenNodeIds };
      set({ view: nextView, ...deriveReactive(graph, index, nextView) });
    },

    expandDependencies: async (nodeId) => {
      const { graph, view, layoutKind } = get();
      const binding = graph.actions.find(
        (a) => a.trigger === "expand" && a.nodeId === nodeId
      );
      if (!binding) return;

      set({ expanding: true, expandError: undefined });
      try {
        const res = await fetch("/api/expand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourcePath: binding.sourcePath }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? `Request failed (${res.status})`);
        }
        const data = (await res.json()) as ExpandResponse;

        const newNodes: MantouGraphNode[] = [];
        const newEdges: MantouGraphEdge[] = [];
        const existing = new Set(graph.nodes.map((n) => n.id));

        for (const dep of data.dependencies.slice(0, 40)) {
          const depId = `dep:${dep.name}`;
          if (existing.has(depId)) continue;
          existing.add(depId);
          newNodes.push({
            id: depId,
            label: dep.name,
            type: dep.dev ? "devDependency" : "dependency",
            parentId: nodeId,
            data: { version: dep.version },
            state: { on: true, status: "idle" },
          });
          newEdges.push({
            id: `${nodeId}->${depId}`,
            from: nodeId,
            to: depId,
            data: {},
            state: {},
          });
        }

        const nextGraph: MantouGraph = {
          ...graph,
          nodes: [...graph.nodes, ...newNodes],
          edges: [...graph.edges, ...newEdges],
        };
        set({
          graph: nextGraph,
          expanding: false,
          ...deriveStructural(nextGraph, view, layoutKind),
        });
      } catch (err) {
        set({
          expanding: false,
          expandError: err instanceof Error ? err.message : String(err),
        });
      }
    },

    resetView: () => {
      const { graph, view, layoutKind } = get();
      const nextView = emptyViewState();
      set({
        view: { ...nextView, hiddenNodeIds: view.hiddenNodeIds },
        ...deriveStructural(graph, nextView, layoutKind),
      });
    },
  }));
}
