import type { ComponentType, ReactNode } from "react";
import type { MantouDocumentNode } from "./types";

export type MantouNodeRenderer<P = Record<string, unknown>> = ComponentType<P>;

export interface MantouNodeRegistration<P = Record<string, unknown>> {
  kind: MantouDocumentNode["kind"] | string;
  component: MantouNodeRenderer<P>;
}

export class MantouNodeRegistry {
  private readonly map = new Map<string, MantouNodeRenderer>();

  register<P extends Record<string, unknown>>(
    kind: string,
    component: MantouNodeRenderer<P>
  ): this {
    this.map.set(kind, component as MantouNodeRenderer);
    return this;
  }

  get(kind: string): MantouNodeRenderer | undefined {
    return this.map.get(kind);
  }

  entries(): [string, MantouNodeRenderer][] {
    return [...this.map.entries()];
  }
}

export function registerMantouNode<P extends Record<string, unknown>>(
  registry: MantouNodeRegistry,
  kind: string,
  component: MantouNodeRenderer<P>
): MantouNodeRegistry {
  return registry.register(kind, component);
}

/** Default registry for custom Mantou document block kinds. */
export function createDefaultMantouRegistry(): MantouNodeRegistry {
  return new MantouNodeRegistry();
}

export type { ReactNode };
