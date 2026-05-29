import type { MDXComponents } from "mdx/types";
import { mantouMdxComponents } from "@/lib/mantou/document/components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mantouMdxComponents,
    ...components,
  };
}
