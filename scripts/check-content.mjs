import { access, readFile } from 'node:fs/promises'
import { chapters, articles } from '../.vitepress/reading.mjs'

const seen = new Set()
if (chapters.length !== 5 || articles.length !== 29) {
  throw new Error('Expected 5 published chapters and 29 existing published articles')
}
for (const article of articles) {
  if (seen.has(article.slug)) throw new Error('Duplicate slug: ' + article.slug)
  seen.add(article.slug)
  await access(new URL('../articles/' + article.slug + '.md', import.meta.url))
}
for (const name of ['index.md', 'contents.md', 'architecture.md', 'atlas.md', 'roadmap.md']) {
  await access(new URL('../' + name, import.meta.url))
}
const diagrams = ['overview', 'identity', 'research', 'subagent', 'context', 'background', 'execution', 'hooks', 'evidence', 'calculation', 'delivery', 'continuity', 'control', 'observation', 'evaluation']
for (const name of diagrams) {
  await access(new URL('../visuals/017-prompt-to-answer-six-layer-panorama/diagrams/' + name + '.svg', import.meta.url))
}
for (const page of ['index.md', 'contents.md', 'architecture.md', 'atlas.md', 'roadmap.md', 'README.md']) {
  const text = await readFile(new URL('../' + page, import.meta.url), 'utf8')
  for (const match of text.matchAll(/!?\[[^\]]+\]\((?:\.\/)?articles\/([^#)]+)\.md(?:#[^)]+)?\)/g)) {
    if (!seen.has(match[1])) throw new Error(page + ': unknown article ' + match[1])
  }
}
console.log('Checked: 29 unique published articles, five chapters, 15 SVG diagrams, public page links.')
