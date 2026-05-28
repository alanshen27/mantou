export interface MantouSample {
  id: string;
  title: string;
  description: string;
  source: string;
}

export const AGENT_GRAPH = `node Planner {
  type: agent
  on: true
  status: running
}

node Researcher {
  type: subagent
  parent: Planner
  on: false
  status: idle
}

node Writer {
  type: subagent
  parent: Planner
  on: false
  status: idle
}

node Critic {
  type: subagent
  parent: Planner
  on: false
  status: failed
}

Planner -> Researcher
Planner -> Writer
Planner -> Critic

style node {
  background: node.on ? chili : node.parent.on ? bamboo : cream
  border: node.selected ? chili : border
  text: node.on ? cream : soy
  opacity: node.on || node.parent.on ? 1 : 0.45
  pulse: node.status == "running"
  shape: node.type == "agent" ? circle : rounded
}

style edge {
  color: edge.active ? chili : bamboo
  width: edge.active ? 3 : 1.5
  opacity: edge.dimmed ? 0.2 : 1
}
`;

export const SERVICE_GRAPH = `node Gateway {
  type: service
  on: true
  status: running
  cost: 0.21
}

node Auth {
  type: service
  on: true
  status: running
}

node Orders {
  type: service
  on: true
  status: degraded
}

node Postgres {
  type: database
  on: true
  status: running
}

node Cache {
  type: database
  on: false
  status: idle
}

Gateway -> Auth
Gateway -> Orders
Orders -> Postgres
Orders -> Cache
Auth -> Postgres

style node {
  background: node.status == "degraded" ? danger : node.on ? scallion : cream
  border: node.selected ? chili : border
  text: node.on ? cream : muted
  opacity: node.on ? 1 : 0.5
  pulse: node.status == "running"
  shape: node.type == "database" ? database : rounded
}

style edge {
  color: edge.active ? chili : bamboo
  width: edge.active ? 3 : 1.5
  opacity: edge.dimmed ? 0.2 : 1
}
`;

export const ANCESTRY_GRAPH = `node Root {
  type: group
  on: true
}

node Frontend {
  type: group
  parent: Root
}

node Backend {
  type: group
  parent: Root
}

node WebApp {
  type: app
  parent: Frontend
  status: idle
}

node Mobile {
  type: app
  parent: Frontend
  status: idle
}

node Api {
  type: service
  parent: Backend
  status: running
}

node Worker {
  type: service
  parent: Backend
  status: failed
}

Root -> Frontend
Root -> Backend
Frontend -> WebApp
Frontend -> Mobile
Backend -> Api
Backend -> Worker

on expand WebApp {
  add dependencies from "package.json" depth 1
}

style node {
  background: node.selected ? chili : node.ancestors.any(selected) ? bamboo : node.descendants.any(status == "failed") ? danger : cream
  border: node.selected ? chili : node.parent.selected ? scallion : border
  text: node.selected ? cream : soy
  opacity: node.dimmed ? 0.35 : 1
  pulse: node.status == "running"
}

style edge {
  color: edge.active ? chili : bamboo
  width: edge.active ? 3 : 1.5
  opacity: edge.dimmed ? 0.2 : 1
}
`;

export const SAMPLES: MantouSample[] = [
  {
    id: "agents",
    title: "Agent Dependency Graph",
    description:
      "Planner toggles power to its subagents. Background reacts to node.on and node.parent.on.",
    source: AGENT_GRAPH,
  },
  {
    id: "services",
    title: "Service Mesh",
    description:
      "Microservices with database shapes and a degraded service highlighted in danger.",
    source: SERVICE_GRAPH,
  },
  {
    id: "ancestry",
    title: "Org / Dependency Tree",
    description:
      "Deep parent/child styling with ancestors.any(selected) and descendants.any(status == \"failed\"). Click WebApp to expand its package.json deps.",
    source: ANCESTRY_GRAPH,
  },
];
