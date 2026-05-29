"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type NodeChange,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MantouNode, type MantouNodeData } from "./MantouNode";
import { useDiagram } from "./DiagramProvider";

const nodeTypes = { mantou: MantouNode };

export function FlowCanvas() {
  const graph = useDiagram((s) => s.graph);
  const styles = useDiagram((s) => s.styles);
  const layout = useDiagram((s) => s.layout);
  const view = useDiagram((s) => s.view);
  const contexts = useDiagram((s) => s.contexts);
  const selectNode = useDiagram((s) => s.selectNode);
  const selectEdge = useDiagram((s) => s.selectEdge);
  const hoverNode = useDiagram((s) => s.hoverNode);

  // Manual drag positions, versioned by the layout they were based on so a
  // structural relayout transparently discards stale overrides (no effect).
  type OverrideState = {
    layout: typeof layout;
    map: Record<string, { x: number; y: number }>;
  };
  const [overrideState, setOverrideState] = useState<OverrideState>({
    layout,
    map: {},
  });

  const nodes = useMemo<Node<MantouNodeData>[]>(() => {
    const overrides = overrideState.layout === layout ? overrideState.map : {};
    return graph.nodes.map((node) => {
      const ctx = contexts.nodeContexts.get(node.id);
      const style = styles.nodeStyles.get(node.id) ?? {};
      const pos = overrides[node.id] ?? layout.positions.get(node.id) ?? { x: 0, y: 0 };
      const expandable = graph.actions.some(
        (a) => a.trigger === "expand" && a.nodeId === node.id
      );
      const versionSub =
        typeof node.data.version === "string" ? `v${node.data.version}` : node.type;
      return {
        id: node.id,
        type: "mantou",
        position: pos,
        hidden: view.hiddenNodeIds.includes(node.id),
        data: {
          label: node.label,
          sublabel: versionSub,
          style,
          shape: style.shape ?? "rounded",
          selected: ctx?.selected ?? false,
          active: ctx?.active ?? false,
          dimmed: ctx?.dimmed ?? false,
          pulse: style.pulse ?? false,
          expandable,
          status: ctx?.status,
        },
      };
    });
  }, [graph, styles, layout, view, contexts, overrideState]);

  const edges = useMemo<Edge[]>(() => {
    return graph.edges.map((edge) => {
      const style = styles.edgeStyles.get(edge.id) ?? {};
      const ctx = contexts.edgeContexts.get(edge.id);
      const color = style.color ?? "#c9b06b";
      return {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        label: edge.label,
        hidden: view.hiddenEdgeIds.includes(edge.id),
        animated: ctx?.active ?? false,
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
        style: {
          stroke: color,
          strokeWidth: style.width ?? 1.5,
          opacity: style.opacity ?? 1,
          strokeDasharray: style.dashed ? "6 4" : undefined,
        },
      };
    });
  }, [graph, styles, view, contexts]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setOverrideState((prev) => {
        const base = prev.layout === layout ? { ...prev.map } : {};
        let changed = false;
        for (const change of changes) {
          if (change.type === "position" && change.position) {
            base[change.id] = change.position;
            changed = true;
          }
        }
        if (!changed && prev.layout === layout) return prev;
        return { layout, map: base };
      });
    },
    [layout]
  );

  const onNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => selectNode(node.id),
    [selectNode]
  );
  const onEdgeClick = useCallback<EdgeMouseHandler>(
    (_, edge) => selectEdge(edge.id),
    [selectEdge]
  );
  const onNodeMouseEnter = useCallback<NodeMouseHandler>(
    (_, node) => hoverNode(node.id),
    [hoverNode]
  );
  const onNodeMouseLeave = useCallback<NodeMouseHandler>(
    () => hoverNode(undefined),
    [hoverNode]
  );
  const onPaneClick = useCallback(() => selectNode(undefined), [selectNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      onPaneClick={onPaneClick}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      className="mantou-flow"
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="#e3d7be" />
      <MiniMap
        pannable
        zoomable
        className="!bg-[#fbf4e6] !border !border-[#e3d7be]"
        nodeColor={(n) => (n.data as MantouNodeData)?.style?.background ?? "#d8c7a6"}
      />
      <Controls className="!border !border-[#e3d7be] !shadow-sm" />
    </ReactFlow>
  );
}
