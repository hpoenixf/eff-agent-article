import { createHash } from 'node:crypto'

// Bump the renderer version when upgrading mermaid-cli: unchanged source
// must never reuse a cached image from a different rendering contract.
export const RENDERER_VERSION = 'mermaid-cli-11.17.0-neutral-v1'
export const IMAGE_ROOT = '/eff-agent-article/generated/mermaid/'

export function diagramId(source) {
  return createHash('sha256')
    .update(RENDERER_VERSION + '\n' + source.trim())
    .digest('hex')
    .slice(0, 24)
}

// Respect *all* Markdown fences, so an example showing ```mermaid inside a
// larger code block is not mistaken for a live figure.
export function findMermaidBlocks(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const found = []
  let opened = null
  for (let line = 0; line < lines.length; line++) {
    const text = lines[line]
    if (!opened) {
      const match = /^ {0,3}(`{3,}|~{3,})([^`~]*)$/.exec(text)
      if (!match) continue
      opened = { fence: match[1][0], width: match[1].length,
        lang: match[2].trim().split(/\s+/)[0], rows: [], start: line + 1 }
      continue
    }
    const closing = opened.fence === '`'
      ? /^ {0,3}`{3,}[ \t]*$/
      : /^ {0,3}~{3,}[ \t]*$/
    if (closing.test(text) && text.trim().length >= opened.width) {
      if (opened.lang === 'mermaid') {
        const source = opened.rows.join('\n').trim()
        if (!source) throw Error('Empty Mermaid fence at line ' + opened.start)
        found.push({ source, id: diagramId(source), line: opened.start })
      }
      opened = null
    } else opened.rows.push(text)
  }
  if (opened?.lang === 'mermaid') throw Error('Unclosed Mermaid fence at line ' + opened.start)
  return found
}

export function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
