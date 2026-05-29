import type { ExprNode } from "./ast";
import { parseExpression, ParseError } from "./parser";
import { evaluate, Bareword, EvalError } from "./evaluator";
import { LexError } from "./lexer";

export { Bareword, ParseError, EvalError, LexError };
export type { ExprNode };

export interface CompiledExpression {
  source: string;
  ast: ExprNode;
  evaluate: (context: Record<string, unknown>) => unknown;
}

const cache = new Map<string, CompiledExpression>();

// Compile (and cache) a Mantou style expression into a reusable evaluator.
export function compileExpression(source: string): CompiledExpression {
  const trimmed = source.trim();
  const cached = cache.get(trimmed);
  if (cached) return cached;

  const ast = parseExpression(trimmed);
  const compiled: CompiledExpression = {
    source: trimmed,
    ast,
    evaluate: (context) => evaluate(ast, context),
  };
  cache.set(trimmed, compiled);
  return compiled;
}

// Convenience: compile + evaluate with built-in error safety.
export function evaluateExpression(
  source: string,
  context: Record<string, unknown>
): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    const compiled = compileExpression(source);
    return { ok: true, value: compiled.evaluate(context) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
