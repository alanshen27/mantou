import type { ExprNode } from "./ast";

export class EvalError extends Error {}

// Barewords (theme tokens, shape names) are represented with this wrapper so
// they can be distinguished from quoted string literals when needed, while
// still comparing equal to the matching string.
export class Bareword {
  constructor(public readonly name: string) {}
  toString() {
    return this.name;
  }
}

const BLOCKED_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "call",
  "apply",
  "bind",
]);

type Scope = {
  root: Record<string, unknown>;
  locals?: Record<string, unknown>;
};

function unwrap(value: unknown): unknown {
  return value instanceof Bareword ? value.name : value;
}

function truthy(value: unknown): boolean {
  return Boolean(unwrap(value));
}

function getMember(obj: unknown, prop: string): unknown {
  if (BLOCKED_KEYS.has(prop)) {
    throw new EvalError(`Access to '${prop}' is not allowed`);
  }
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj !== "object") {
    // allow string/array length only
    if (prop === "length" && (typeof obj === "string" || Array.isArray(obj))) {
      return (obj as { length: number }).length;
    }
    return undefined;
  }
  if (Array.isArray(obj) && prop === "length") return obj.length;
  if (!Object.prototype.hasOwnProperty.call(obj, prop)) return undefined;
  return (obj as Record<string, unknown>)[prop];
}

function resolveIdentifier(name: string, scope: Scope): unknown {
  if (scope.locals && Object.prototype.hasOwnProperty.call(scope.locals, name)) {
    return scope.locals[name];
  }
  if (Object.prototype.hasOwnProperty.call(scope.root, name)) {
    return scope.root[name];
  }
  // Unknown identifier -> bareword (theme token / shape name / enum value).
  return new Bareword(name);
}

function compare(op: string, left: unknown, right: unknown): boolean {
  const l = unwrap(left);
  const r = unwrap(right);
  switch (op) {
    case "==":
      return l === r;
    case "!=":
      return l !== r;
    case ">":
      return (l as number) > (r as number);
    case "<":
      return (l as number) < (r as number);
    case ">=":
      return (l as number) >= (r as number);
    case "<=":
      return (l as number) <= (r as number);
    default:
      throw new EvalError(`Unknown operator '${op}'`);
  }
}

function evalNode(node: ExprNode, scope: Scope): unknown {
  switch (node.kind) {
    case "literal":
      return node.value;

    case "identifier":
      return resolveIdentifier(node.name, scope);

    case "member": {
      const obj = evalNode(node.object, scope);
      return getMember(obj, node.property);
    }

    case "method": {
      const receiver = evalNode(node.receiver, scope);
      const items = Array.isArray(receiver) ? receiver : [];
      const predicate = (item: unknown) => {
        const locals =
          item && typeof item === "object"
            ? (item as Record<string, unknown>)
            : { value: item };
        return truthy(evalNode(node.argument, { root: scope.root, locals }));
      };
      return node.name === "any" ? items.some(predicate) : items.every(predicate);
    }

    case "unary":
      return !truthy(evalNode(node.operand, scope));

    case "logical": {
      const left = evalNode(node.left, scope);
      if (node.op === "&&") {
        return truthy(left) ? evalNode(node.right, scope) : left;
      }
      return truthy(left) ? left : evalNode(node.right, scope);
    }

    case "binary":
      return compare(
        node.op,
        evalNode(node.left, scope),
        evalNode(node.right, scope)
      );

    case "ternary":
      return truthy(evalNode(node.condition, scope))
        ? evalNode(node.then, scope)
        : evalNode(node.otherwise, scope);

    default: {
      const exhaustive: never = node;
      throw new EvalError(`Unknown node ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function evaluate(
  ast: ExprNode,
  context: Record<string, unknown>
): unknown {
  return evalNode(ast, { root: context });
}
