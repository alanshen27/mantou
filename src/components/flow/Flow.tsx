"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { DiagramProvider } from "./DiagramProvider";
import { FlowCanvas } from "./FlowCanvas";
import { DetailPanel } from "./DetailPanel";
import type { LayoutKind } from "@/lib/mantou";

// MDX-style embeddable diagram: <Flow title="...">{`...source...`}</Flow>
export function Flow({
  title,
  source,
  children,
  layout = "dagre",
  height = 480,
}: {
  title?: string;
  source?: string;
  children?: string;
  layout?: LayoutKind;
  height?: number;
}) {
  const src = source ?? (typeof children === "string" ? children : "");
  return (
    <DiagramProvider source={src} layoutKind={layout}>
      <ReactFlowProvider>
        <div className="overflow-hidden rounded-3xl border border-[#e3d7be] bg-[#fbf4e6] shadow-[0_24px_60px_-30px_rgba(58,42,32,0.5)]">
          {title && (
            <div className="flex items-center gap-2 border-b border-[#e3d7be] bg-white/50 px-5 py-3">
              <span className="text-lg">🥟</span>
              <h3 className="text-sm font-bold tracking-tight text-[#3a2a20]">
                {title}
              </h3>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px]">
            <div style={{ height }} className="relative">
              <FlowCanvas />
            </div>
            <div className="border-t border-[#e3d7be] bg-white/40 md:border-l md:border-t-0">
              <DetailPanel />
            </div>
          </div>
        </div>
      </ReactFlowProvider>
    </DiagramProvider>
  );
}
