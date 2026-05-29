import { compile, type CompileOptions } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { remarkMantou } from "../document/remark-mantou";
import { mantouMdxDevelopment } from "./runtime";

export const mantouRemarkPlugins = [remarkGfm, remarkMantou];

export const mantouMdxCompileOptions: CompileOptions = {
  remarkPlugins: mantouRemarkPlugins,
  outputFormat: "function-body",
  development: mantouMdxDevelopment,
};

export async function compileMantouMdx(source: string): Promise<string> {
  const compiled = await compile(source, mantouMdxCompileOptions);
  return String(compiled);
}
