export type TokenType =
  | "ident"
  | "number"
  | "string"
  | "bool"
  | "op"
  | "punc"
  | "eof";

export interface Token {
  type: TokenType;
  value: string;
  start: number;
}

const TWO_CHAR_OPS = new Set(["==", "!=", ">=", "<=", "&&", "||"]);
const ONE_CHAR_OPS = new Set([">", "<", "!"]);
const PUNC = new Set(["?", ":", ".", "(", ")", ","]);

const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;
const DIGIT = /[0-9]/;

export class LexError extends Error {}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    const ch = input[i];

    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i++;
      continue;
    }

    // strings (single or double quoted)
    if (ch === '"' || ch === "'") {
      const quote = ch;
      const start = i;
      i++;
      let str = "";
      while (i < n && input[i] !== quote) {
        if (input[i] === "\\" && i + 1 < n) {
          str += input[i + 1];
          i += 2;
        } else {
          str += input[i];
          i++;
        }
      }
      if (i >= n) throw new LexError("Unterminated string literal");
      i++; // closing quote
      tokens.push({ type: "string", value: str, start });
      continue;
    }

    // numbers
    if (DIGIT.test(ch) || (ch === "." && DIGIT.test(input[i + 1] ?? ""))) {
      const start = i;
      let num = "";
      while (i < n && (DIGIT.test(input[i]) || input[i] === ".")) {
        num += input[i];
        i++;
      }
      tokens.push({ type: "number", value: num, start });
      continue;
    }

    // identifiers / booleans
    if (IDENT_START.test(ch)) {
      const start = i;
      let id = "";
      while (i < n && IDENT_PART.test(input[i])) {
        id += input[i];
        i++;
      }
      if (id === "true" || id === "false") {
        tokens.push({ type: "bool", value: id, start });
      } else {
        tokens.push({ type: "ident", value: id, start });
      }
      continue;
    }

    // two-char operators
    const two = input.slice(i, i + 2);
    if (TWO_CHAR_OPS.has(two)) {
      tokens.push({ type: "op", value: two, start: i });
      i += 2;
      continue;
    }

    if (ONE_CHAR_OPS.has(ch)) {
      tokens.push({ type: "op", value: ch, start: i });
      i++;
      continue;
    }

    if (PUNC.has(ch)) {
      tokens.push({ type: "punc", value: ch, start: i });
      i++;
      continue;
    }

    throw new LexError(`Unexpected character '${ch}' at position ${i}`);
  }

  tokens.push({ type: "eof", value: "", start: n });
  return tokens;
}
