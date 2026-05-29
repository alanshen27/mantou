import type {
  MantouGraph,
  MantouGraphEdge,
  MantouGraphGroup,
  MantouGraphNode,
  MantouGraphType,
  MantouStyleRule,
  MantouActionBinding,
} from "./types";

export class MantouParseError extends Error {}

// State keys (everything else becomes node/edge `data`).
const NODE_STATE_KEYS = new Set(["on", "status"]);
const EDGE_STATE_KEYS = new Set(["active", "dimmed"]);

function parseScalar(raw: string): string | number | boolean {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

function stripComment(line: string): string {
  // strip // and # comments, but only when not inside a string
  let inString: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inString) {
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "#") return line.slice(0, i);
    if (ch === "/" && line[i + 1] === "/") return line.slice(0, i);
  }
  return line;
}

interface ParseOptions {
  id?: string;
  title?: string;
  type?: MantouGraphType;
}

export function parseMantouGraph(
  source: string,
  options: ParseOptions = {}
): MantouGraph {
  const lines = source.split("\n");
  const nodes = new Map<string, MantouGraphNode>();
  const edges: MantouGraphEdge[] = [];
  const groups: MantouGraphGroup[] = [];
  const styleRules: MantouStyleRule[] = [];
  const actions: MantouActionBinding[] = [];
  const edgeIds = new Set<string>();

  const ensureNode = (id: string): MantouGraphNode => {
    let node = nodes.get(id);
    if (!node) {
      node = { id, label: id, data: {}, state: {} };
      nodes.set(id, node);
    }
    return node;
  };

  const makeEdgeId = (from: string, to: string): string => {
    let id = `${from}->${to}`;
    let i = 1;
    while (edgeIds.has(id)) id = `${from}->${to}#${i++}`;
    edgeIds.add(id);
    return id;
  };

  type Block =
    | { kind: "node"; node: MantouGraphNode }
    | { kind: "edge"; edge: MantouGraphEdge }
    | { kind: "group"; group: MantouGraphGroup }
    | { kind: "style"; target: "node" | "edge" }
    | { kind: "action"; binding: MantouActionBinding };

  let block: Block | null = null;

  const nodeHeader = /^node\s+([A-Za-z_][\w-]*)\s*\{$/;
  const styleHeader = /^style\s+(node|edge)\s*\{$/;
  const groupHeader = /^group\s+([A-Za-z_][\w-]*)\s*\{$/;
  const edgeBlockHeader = /^edge\s+([A-Za-z_][\w-]*)\s*->\s*([A-Za-z_][\w-]*)\s*\{$/;
  const actionHeader = /^on\s+expand\s+([A-Za-z_][\w-]*)\s*\{$/;
  const edgeShorthand = /^([A-Za-z_][\w-]*)\s*-(?:-|>)\s*([A-Za-z_][\w-]*)\s*(?::\s*(.+))?$/;
  const expandStmt = /^add\s+dependencies\s+from\s+["']([^"']+)["']\s+depth\s+(\d+)$/;

  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const raw = stripComment(lines[lineNo]).trim();
    if (raw === "") continue;

    // closing brace
    if (raw === "}") {
      if (!block) throw new MantouParseError(`Unexpected '}' on line ${lineNo + 1}`);
      block = null;
      continue;
    }

    // inside a block
    if (block) {
      if (block.kind === "style") {
        const idx = raw.indexOf(":");
        if (idx === -1) {
          throw new MantouParseError(
            `Invalid style rule on line ${lineNo + 1}: '${raw}'`
          );
        }
        const property = raw.slice(0, idx).trim();
        const expr = raw.slice(idx + 1).trim();
        styleRules.push({ target: block.target, property, source: expr });
        continue;
      }

      if (block.kind === "action") {
        const m = raw.match(expandStmt);
        if (!m) {
          throw new MantouParseError(
            `Invalid expand statement on line ${lineNo + 1}: '${raw}'`
          );
        }
        block.binding.sourcePath = m[1];
        block.binding.depth = Number(m[2]);
        continue;
      }

      const idx = raw.indexOf(":");
      if (idx === -1) {
        throw new MantouParseError(`Invalid property on line ${lineNo + 1}: '${raw}'`);
      }
      const key = raw.slice(0, idx).trim();
      const valueRaw = raw.slice(idx + 1).trim();

      if (block.kind === "node") {
        const node = block.node;
        if (key === "type") node.type = String(parseScalar(valueRaw));
        else if (key === "parent") node.parentId = String(parseScalar(valueRaw));
        else if (key === "group") node.group = String(parseScalar(valueRaw));
        else if (key === "label") node.label = String(parseScalar(valueRaw));
        else if (NODE_STATE_KEYS.has(key)) node.state[key] = parseScalar(valueRaw);
        else node.data[key] = parseScalar(valueRaw);
      } else if (block.kind === "edge") {
        const edge = block.edge;
        if (key === "label") edge.label = String(parseScalar(valueRaw));
        else if (EDGE_STATE_KEYS.has(key)) edge.state[key] = parseScalar(valueRaw);
        else edge.data[key] = parseScalar(valueRaw);
      } else if (block.kind === "group") {
        if (key === "label") block.group.label = String(parseScalar(valueRaw));
        else if (key === "collapsed")
          block.group.collapsed = parseScalar(valueRaw) === true;
        else if (key === "nodes") {
          block.group.nodeIds = valueRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      continue;
    }

    // not in a block: look for headers / statements

    let m = raw.match(nodeHeader);
    if (m) {
      const node = ensureNode(m[1]);
      block = { kind: "node", node };
      continue;
    }

    m = raw.match(styleHeader);
    if (m) {
      block = { kind: "style", target: m[1] as "node" | "edge" };
      continue;
    }

    m = raw.match(edgeBlockHeader);
    if (m) {
      ensureNode(m[1]);
      ensureNode(m[2]);
      const edge: MantouGraphEdge = {
        id: makeEdgeId(m[1], m[2]),
        from: m[1],
        to: m[2],
        data: {},
        state: {},
      };
      edges.push(edge);
      block = { kind: "edge", edge };
      continue;
    }

    m = raw.match(groupHeader);
    if (m) {
      const group: MantouGraphGroup = { id: m[1], label: m[1], nodeIds: [] };
      groups.push(group);
      block = { kind: "group", group };
      continue;
    }

    m = raw.match(actionHeader);
    if (m) {
      ensureNode(m[1]);
      const binding: MantouActionBinding = {
        trigger: "expand",
        nodeId: m[1],
        kind: "dependencies",
        sourcePath: "",
        depth: 1,
      };
      actions.push(binding);
      block = { kind: "action", binding };
      continue;
    }

    m = raw.match(edgeShorthand);
    if (m) {
      ensureNode(m[1]);
      ensureNode(m[2]);
      const edge: MantouGraphEdge = {
        id: makeEdgeId(m[1], m[2]),
        from: m[1],
        to: m[2],
        data: {},
        state: {},
      };
      if (m[3]) edge.label = String(parseScalar(m[3]));
      edges.push(edge);
      continue;
    }

    throw new MantouParseError(`Unrecognized syntax on line ${lineNo + 1}: '${raw}'`);
  }

  if (block) throw new MantouParseError("Unterminated block (missing '}')");

  // assign nodes to groups -> group.nodeIds, and back-reference node.group
  for (const group of groups) {
    for (const nodeId of group.nodeIds) {
      const node = nodes.get(nodeId);
      if (node && !node.group) node.group = group.id;
    }
  }
  // also collect implicit groups defined only via node `group:`
  for (const node of nodes.values()) {
    if (node.group && !groups.some((g) => g.id === node.group)) {
      groups.push({ id: node.group, label: node.group, nodeIds: [node.id] });
    } else if (node.group) {
      const g = groups.find((gr) => gr.id === node.group);
      if (g && !g.nodeIds.includes(node.id)) g.nodeIds.push(node.id);
    }
  }

  return {
    id: options.id ?? "mantou-graph",
    title: options.title,
    type: options.type ?? "dag",
    nodes: [...nodes.values()],
    edges,
    groups,
    styleRules,
    actions,
  };
}
