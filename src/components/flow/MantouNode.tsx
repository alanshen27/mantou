"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { MantouNodeShape, MantouNodeStyle } from "@/lib/mantou";

export interface MantouNodeData extends Record<string, unknown> {
  label: string;
  sublabel?: string;
  style: MantouNodeStyle;
  shape: MantouNodeShape;
  selected: boolean;
  active: boolean;
  dimmed: boolean;
  pulse: boolean;
  expandable: boolean;
  status?: string;
}

function shapeClasses(shape: MantouNodeShape): string {
  switch (shape) {
    case "circle":
      return "rounded-full aspect-square";
    case "diamond":
      return "rounded-xl";
    case "database":
      return "rounded-[40%/18%]";
    default:
      return "rounded-2xl";
  }
}

function MantouNodeComponent({ data }: NodeProps) {
  const d = data as MantouNodeData;
  const style = d.style ?? {};
  const background = style.background ?? "#fbf4e6";
  const border = style.border ?? "#d8c7a6";
  const text = style.text ?? "#3a2a20";
  const opacity = style.opacity ?? 1;

  return (
    <div
      className="group relative transition-all duration-300 ease-out"
      style={{ opacity, transform: d.selected ? "scale(1.04)" : "scale(1)" }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-[#a89b82]"
      />

      {d.pulse && (
        <span
          className="pointer-events-none absolute inset-0 -z-10 animate-mantou-pulse"
          style={{ background, borderRadius: "1rem" }}
        />
      )}

      <div
        className={`flex min-h-[64px] w-[180px] flex-col justify-center px-4 py-3 shadow-sm transition-all duration-300 ${shapeClasses(
          d.shape
        )}`}
        style={{
          background,
          color: text,
          border: `2px solid ${border}`,
          boxShadow: d.selected
            ? `0 0 0 3px ${border}55, 0 10px 30px -10px ${border}`
            : d.active
            ? `0 6px 18px -8px ${border}`
            : undefined,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold tracking-tight">
            {d.label}
          </span>
          {d.status && (
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: `${text}22`, color: text }}
            >
              {d.status}
            </span>
          )}
        </div>
        {d.sublabel && (
          <span className="mt-0.5 truncate text-[11px] opacity-70">
            {d.sublabel}
          </span>
        )}
      </div>

      {d.expandable && (
        <span className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e2483d] text-[10px] font-bold text-white shadow">
          +
        </span>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-[#a89b82]"
      />
    </div>
  );
}

export const MantouNode = memo(MantouNodeComponent);
