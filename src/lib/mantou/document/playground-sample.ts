export const PLAYGROUND_MDX_SAMPLE = `<Lead>
  Mantou pages are Markdown + JSX. Diagrams can be fenced blocks.
</Lead>

## Agent topology

\`\`\`mantou title="Agent Dependency Graph" height=360
node Planner {
  type: agent
  on: true
  status: running
}

node Researcher {
  type: subagent
  parent: Planner
  on: false
}

Planner -> Researcher

style node {
  background: node.on ? chili : node.parent.on ? bamboo : cream
  border: node.selected ? chili : border
  pulse: node.status == "running"
}
\`\`\`

<Callout type="tip" title="Try it">
  Edit the fence above — the diagram pane syncs from the first \`mantou\` block.
</Callout>
`;
