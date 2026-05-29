export type ExprNode =
  | LiteralNode
  | IdentifierNode
  | MemberNode
  | MethodNode
  | UnaryNode
  | BinaryNode
  | LogicalNode
  | TernaryNode;

export interface LiteralNode {
  kind: "literal";
  value: string | number | boolean;
  // strings written as quoted literals are "string"; barewords are "token".
  literalType: "string" | "number" | "boolean" | "token";
}

export interface IdentifierNode {
  kind: "identifier";
  name: string;
}

export interface MemberNode {
  kind: "member";
  object: ExprNode;
  property: string;
}

export interface MethodNode {
  kind: "method";
  receiver: ExprNode;
  name: "any" | "all";
  argument: ExprNode;
}

export interface UnaryNode {
  kind: "unary";
  op: "!";
  operand: ExprNode;
}

export interface BinaryNode {
  kind: "binary";
  op: "==" | "!=" | ">" | "<" | ">=" | "<=";
  left: ExprNode;
  right: ExprNode;
}

export interface LogicalNode {
  kind: "logical";
  op: "&&" | "||";
  left: ExprNode;
  right: ExprNode;
}

export interface TernaryNode {
  kind: "ternary";
  condition: ExprNode;
  then: ExprNode;
  otherwise: ExprNode;
}
