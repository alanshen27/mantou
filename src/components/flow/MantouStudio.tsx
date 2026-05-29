"use client";

import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { DiagramProvider, useDiagram } from "./DiagramProvider";
import { FlowCanvas } from "./FlowCanvas";
import { DetailPanel } from "./DetailPanel";
import { SAMPLES, mantouTheme, evaluateExpression } from "@/lib/mantou";
import type { LayoutKind } from "@/lib/mantou";

const LAYOUTS: LayoutKind[] = ["dagre", "tree"];

function SampleTabs() {
  const load = useDiagram((s) => s.load);
  const source = useDiagram((s) => s.source);
  return (
    <div className="flex flex-wrap gap-2">
      {SAMPLES.map((sample) => {
        const activeTab = source.trim() === sample.source.trim();
        return (
          <button
            key={sample.id}
            onClick={() => load(sample.source)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeTab
                ? "bg-[#3a2a20] text-[#fbf4e6]"
                : "bg-white/60 text-[#3a2a20] hover:bg-white"
            }`}
            title={sample.description}
          >
            {sample.title}
          </button>
        );
      })}
    </div>
  );
}

function Toolbar() {
  const layoutKind = useDiagram((s) => s.layoutKind);
  const setLayoutKind = useDiagram((s) => s.setLayoutKind);
  const resetView = useDiagram((s) => s.resetView);
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full bg-white/60 p-0.5">
        {LAYOUTS.map((l) => (
          <button
            key={l}
            onClick={() => setLayoutKind(l)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
              layoutKind === l ? "bg-[#e2483d] text-white" : "text-[#3a2a20]"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <button
        onClick={resetView}
        className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#3a2a20] transition hover:bg-white"
      >
        Reset
      </button>
    </div>
  );
}

function SourceEditor() {
  const source = useDiagram((s) => s.source);
  const load = useDiagram((s) => s.load);
  const parseError = useDiagram((s) => s.parseError);
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a89b82]">
          Diagram source
        </span>
        {parseError && (
          <span className="text-[11px] font-medium text-[#b5341f]">
            {parseError}
          </span>
        )}
      </div>
      <textarea
        value={source}
        onChange={(e) => load(e.target.value)}
        spellCheck={false}
        className="h-full min-h-[260px] w-full resize-none rounded-xl border border-[#e3d7be] bg-[#241812] p-3 font-mono text-[12px] leading-relaxed text-[#f3e7d0] outline-none focus:border-[#e2483d]"
      />
    </div>
  );
}

function ExpressionTester() {
  const view = useDiagram((s) => s.view);
  const contexts = useDiagram((s) => s.contexts);
  const graph = useDiagram((s) => s.graph);
  const [expr, setExpr] = useState("node.on ? chili : node.parent.on ? bamboo : cream");

  const targetId = view.selectedNodeId ?? graph.nodes[0]?.id;
  const ctx = targetId ? contexts.nodeContexts.get(targetId) : undefined;
  const result = ctx
    ? evaluateExpression(expr, { node: ctx, view, theme: mantouTheme })
    : null;

  return (
    <div className="rounded-xl border border-[#e3d7be] bg-white/50 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a89b82]">
          Expression sandbox
        </span>
        <span className="text-[11px] text-[#a89b82]">
          {targetId ? `node = ${targetId}` : "no node"}
        </span>
      </div>
      <input
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        spellCheck={false}
        className="w-full rounded-lg border border-[#e3d7be] bg-white px-2.5 py-1.5 font-mono text-[12px] text-[#3a2a20] outline-none focus:border-[#e2483d]"
      />
      <div className="mt-2 flex items-center gap-2 text-[12px]">
        <span className="text-[#a89b82]">→</span>
        {result?.ok ? (
          <code className="font-mono font-semibold text-[#3a2a20]">
            {JSON.stringify(
              typeof result.value === "object" ? "[ref]" : result.value
            )}
          </code>
        ) : (
          <span className="font-mono text-[#b5341f]">
            {result?.error ?? "select a node"}
          </span>
        )}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="rounded-xl border border-[#e3d7be] bg-white/50 p-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#a89b82]">
        Theme tokens
      </span>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {Object.entries(mantouTheme).map(([token, color]) => (
          <span
            key={token}
            className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-medium text-[#3a2a20]"
          >
            <span
              className="h-3 w-3 rounded-full ring-1 ring-black/10"
              style={{ background: color }}
            />
            {token}
          </span>
        ))}
      </div>
    </div>
  );
}

function StudioInner() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr_320px]">
      <div className="flex flex-col gap-4">
        <SourceEditor />
        <ExpressionTester />
        <Legend />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SampleTabs />
          <Toolbar />
        </div>
        <div className="relative h-[560px] overflow-hidden rounded-3xl border border-[#e3d7be] bg-[#fbf4e6] shadow-[0_24px_60px_-30px_rgba(58,42,32,0.5)]">
          <FlowCanvas />
        </div>
      </div>

      <div className="h-[560px] overflow-hidden rounded-3xl border border-[#e3d7be] bg-white/50 lg:mt-[44px]">
        <DetailPanel />
      </div>
    </div>
  );
}

export function MantouStudio({ initialSource }: { initialSource: string }) {
  return (
    <DiagramProvider source={initialSource}>
      <ReactFlowProvider>
        <StudioInner />
      </ReactFlowProvider>
    </DiagramProvider>
  );
}
