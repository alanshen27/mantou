"use client";

import { createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import {
  createDiagramStore,
  type DiagramState,
  type DiagramStoreApi,
} from "./store";
import type { LayoutKind } from "@/lib/mantou";

const DiagramContext = createContext<DiagramStoreApi | null>(null);

export function DiagramProvider({
  source,
  layoutKind = "dagre",
  children,
}: {
  source: string;
  layoutKind?: LayoutKind;
  children: React.ReactNode;
}) {
  const [store] = useState<DiagramStoreApi>(() =>
    createDiagramStore(source, layoutKind)
  );
  return (
    <DiagramContext.Provider value={store}>{children}</DiagramContext.Provider>
  );
}

export function useDiagram<T>(selector: (state: DiagramState) => T): T {
  const store = useContext(DiagramContext);
  if (!store) {
    throw new Error("useDiagram must be used within a <DiagramProvider>");
  }
  return useStore(store, selector);
}
