// Presentation helpers only. Tags and evidence retain their existing source owners.
const examples = {
  '019-agent-answer-publication': 'src/publication.mjs',
  '020-agent-extension-host-smartphone': 'src/extensions.mjs',
  '026-agent-memory-forget-durable-effects': 'src/memory-effects.mjs',
  'mcp-host-from-discovery-to-consumption': 'src/mcp.mjs',
  'agent-subagent-context-specialization': 'src/child.mjs',
  'agent-main-run-context-compaction': 'src/compaction.mjs',
  'agent-model-runtime-mcp-skill-boundaries': 'src/runtime.mjs',
  'open-etf-agent-v01-first-readable-report': 'src/cli.mjs'
}

export function articleSlug(relativePath) {
  return /^(?:en\/)?articles\/([a-z0-9-]+)\.md$/.exec(relativePath)?.[1]
}
export function articleEvidence(frontmatter) {
  const evidence = frontmatter.evidence
  return evidence && (evidence.implementation || evidence.scoped || evidence.live) ? evidence : undefined
}
export function articleTopicTags(relativePath, data) {
  return (data.articles[articleSlug(relativePath) || ''] || []).map(tag => ({ ...data.definitions.find(def => def.id === tag.id), ...tag }))
}
export function openSourceExample(relativePath) {
  return examples[articleSlug(relativePath)]
}
