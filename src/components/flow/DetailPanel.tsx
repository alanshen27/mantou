"use client";

import { useDiagram } from "./DiagramProvider";

const STATUS_OPTIONS = ["idle", "running", "degraded", "failed"];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-[#a89b82]">{label}</span>
      <span className="font-medium text-[#3a2a20]">{value}</span>
    </div>
  );
}

export function DetailPanel() {
  const view = useDiagram((s) => s.view);
  const graph = useDiagram((s) => s.graph);
  const index = useDiagram((s) => s.index);
  const toggleNodeOn = useDiagram((s) => s.toggleNodeOn);
  const setNodeState = useDiagram((s) => s.setNodeState);
  const toggleHidden = useDiagram((s) => s.toggleHidden);
  const expandDependencies = useDiagram((s) => s.expandDependencies);
  const expanding = useDiagram((s) => s.expanding);
  const expandError = useDiagram((s) => s.expandError);
  const selectNode = useDiagram((s) => s.selectNode);

  const node = graph.nodes.find((n) => n.id === view.selectedNodeId);
  const edge = graph.edges.find((e) => e.id === view.selectedEdgeId);

  if (!node && !edge) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="text-3xl">🥟</div>
        <p className="text-sm font-medium text-[#3a2a20]">Nothing selected</p>
        <p className="text-xs text-[#a89b82]">
          Click a node or edge to inspect it. Connected nodes light up, the rest dim.
        </p>
      </div>
    );
  }

  if (edge) {
    return (
      <div className="flex h-full flex-col gap-4 p-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e2483d]">
            Edge
          </span>
          <h3 className="text-lg font-bold text-[#3a2a20]">
            {edge.from} → {edge.to}
          </h3>
        </div>
        <div className="rounded-xl border border-[#e3d7be] bg-white/60 p-3">
          <Row label="from" value={edge.from} />
          <Row label="to" value={edge.to} />
          {edge.label && <Row label="label" value={edge.label} />}
          <Row label="active" value={String(edge.state.active === true)} />
        </div>
      </div>
    );
  }

  if (!node) return null;

  const parentId = index.parentByNodeId.get(node.id);
  const children = index.childrenByNodeId.get(node.id) ?? [];
  const expandable = graph.actions.some(
    (a) => a.trigger === "expand" && a.nodeId === node.id
  );
  const hidden = view.hiddenNodeIds.includes(node.id);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#e2483d]">
          {node.type ?? "Node"}
        </span>
        <h3 className="text-lg font-bold text-[#3a2a20]">{node.label}</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleNodeOn(node.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            node.state.on === true
              ? "bg-[#e2483d] text-white"
              : "bg-[#efe6d2] text-[#3a2a20] hover:bg-[#e3d7be]"
          }`}
        >
          {node.state.on === true ? "On" : "Off"}
        </button>
        <button
          onClick={() => toggleHidden(node.id)}
          className="rounded-full bg-[#efe6d2] px-3 py-1.5 text-xs font-semibold text-[#3a2a20] transition hover:bg-[#e3d7be]"
        >
          {hidden ? "Show" : "Hide"}
        </button>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#a89b82]">
          Status
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setNodeState(node.id, { status })}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                node.state.status === status
                  ? "bg-[#3a2a20] text-white"
                  : "bg-[#efe6d2] text-[#3a2a20] hover:bg-[#e3d7be]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#e3d7be] bg-white/60 p-3">
        <Row label="id" value={node.id} />
        {node.type && <Row label="type" value={node.type} />}
        {node.group && <Row label="group" value={node.group} />}
        {parentId && (
          <Row
            label="parent"
            value={
              <button
                className="text-[#e2483d] underline-offset-2 hover:underline"
                onClick={() => selectNode(parentId)}
              >
                {parentId}
              </button>
            }
          />
        )}
        {Object.entries(node.state).map(([k, v]) => (
          <Row key={k} label={`state.${k}`} value={String(v)} />
        ))}
        {Object.entries(node.data).map(([k, v]) => (
          <Row key={k} label={`data.${k}`} value={String(v)} />
        ))}
      </div>

      {children.length > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#a89b82]">
            Children
          </p>
          <div className="flex flex-wrap gap-1.5">
            {children.map((c) => (
              <button
                key={c}
                onClick={() => selectNode(c)}
                className="rounded-md bg-[#efe6d2] px-2 py-1 text-[11px] font-medium text-[#3a2a20] hover:bg-[#e3d7be]"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {expandable && (
        <div className="mt-auto">
          <button
            onClick={() => expandDependencies(node.id)}
            disabled={expanding}
            className="w-full rounded-xl bg-[#e2483d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c93a30] disabled:opacity-60"
          >
            {expanding ? "Expanding…" : "Expand dependencies"}
          </button>
          {expandError && (
            <p className="mt-2 text-xs text-[#b5341f]">{expandError}</p>
          )}
          <p className="mt-2 text-[11px] text-[#a89b82]">
            Reads package.json inside the project directory only. Adds dependency
            nodes + edges, then relayouts.
          </p>
        </div>
      )}
    </div>
  );
}
