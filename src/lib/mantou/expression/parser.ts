import type {
  ExprNode,
  BinaryNode,
  LogicalNode,
} from "./ast";
import { tokenize, type Token } from "./lexer";

export class ParseError extends Error {}

const ARRAY_METHODS = new Set(["any", "all"]);

// Recursive-descent parser for the tiny, safe Mantou expression language.
class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private next(): Token {
    return this.tokens[this.pos++];
  }

  private expect(value: string): Token {
    const tok = this.peek();
    if (tok.value !== value) {
      throw new ParseError(`Expected '${value}' but found '${tok.value || "<eof>"}'`);
    }
    return this.next();
  }

  parse(): ExprNode {
    const expr = this.parseTernary();
    if (this.peek().type !== "eof") {
      throw new ParseError(`Unexpected token '${this.peek().value}'`);
    }
    return expr;
  }

  private parseTernary(): ExprNode {
    const condition = this.parseOr();
    if (this.peek().value === "?") {
      this.next();
      const then = this.parseTernary();
      this.expect(":");
      const otherwise = this.parseTernary();
      return { kind: "ternary", condition, then, otherwise };
    }
    return condition;
  }

  private parseOr(): ExprNode {
    let left = this.parseAnd();
    while (this.peek().value === "||") {
      this.next();
      const right = this.parseAnd();
      left = { kind: "logical", op: "||", left, right } satisfies LogicalNode;
    }
    return left;
  }

  private parseAnd(): ExprNode {
    let left = this.parseEquality();
    while (this.peek().value === "&&") {
      this.next();
      const right = this.parseEquality();
      left = { kind: "logical", op: "&&", left, right } satisfies LogicalNode;
    }
    return left;
  }

  private parseEquality(): ExprNode {
    let left = this.parseComparison();
    while (this.peek().value === "==" || this.peek().value === "!=") {
      const op = this.next().value as BinaryNode["op"];
      const right = this.parseComparison();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  private parseComparison(): ExprNode {
    let left = this.parseUnary();
    while (
      this.peek().value === ">" ||
      this.peek().value === "<" ||
      this.peek().value === ">=" ||
      this.peek().value === "<="
    ) {
      const op = this.next().value as BinaryNode["op"];
      const right = this.parseUnary();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  private parseUnary(): ExprNode {
    if (this.peek().value === "!") {
      this.next();
      const operand = this.parseUnary();
      return { kind: "unary", op: "!", operand };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): ExprNode {
    let node = this.parsePrimary();
    while (this.peek().value === ".") {
      this.next();
      const prop = this.next();
      if (prop.type !== "ident") {
        throw new ParseError(`Expected property name after '.', got '${prop.value}'`);
      }
      // method call (.any(...) / .all(...))
      if (this.peek().value === "(" && ARRAY_METHODS.has(prop.value)) {
        this.next(); // (
        const argument = this.parseTernary();
        this.expect(")");
        node = {
          kind: "method",
          receiver: node,
          name: prop.value as "any" | "all",
          argument,
        };
      } else {
        node = { kind: "member", object: node, property: prop.value };
      }
    }
    return node;
  }

  private parsePrimary(): ExprNode {
    const tok = this.peek();

    if (tok.value === "(") {
      this.next();
      const expr = this.parseTernary();
      this.expect(")");
      return expr;
    }

    if (tok.type === "number") {
      this.next();
      return { kind: "literal", value: Number(tok.value), literalType: "number" };
    }

    if (tok.type === "string") {
      this.next();
      return { kind: "literal", value: tok.value, literalType: "string" };
    }

    if (tok.type === "bool") {
      this.next();
      return {
        kind: "literal",
        value: tok.value === "true",
        literalType: "boolean",
      };
    }

    if (tok.type === "ident") {
      this.next();
      return { kind: "identifier", name: tok.value };
    }

    throw new ParseError(`Unexpected token '${tok.value || "<eof>"}'`);
  }
}

export function parseExpression(source: string): ExprNode {
  const tokens = tokenize(source);
  return new Parser(tokens).parse();
}
