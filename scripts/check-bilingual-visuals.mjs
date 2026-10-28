import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { englishArticleSlugs } from '../book.en.mjs'

// A deliberately small structural check. Human review remains responsible for semantic accuracy.
const han = /[\u3400-\u9fff]/
const errors = []

function markdownStructure(source) {
  const lines = source.split(/\r?\n/)
  const diagrams = []
  const tables = []
  let fence = null
  let current = []
  let activeTable = 0
  for (const line of lines) {
    const start = line.match(/^\s*(\x60{3,}|~{3,})([\w-]*)/)
    if (start && !fence) {
      fence = { char: start[1][0], length: start[1].length, language: start[2], body: [] }
      if (activeTable) { tables.push(activeTable); activeTable = 0 }
      continue
    }
    if (fence) {
      if (new RegExp('^\\s*' + (fence.char === '~' ? '~' : '\\x60') + '{' + fence.length + ',}\\s*$').test(line)) {
        if (fence.language === 'mermaid') diagrams.push(fence.body.join('\n'))
        fence = null
      } else {
        fence.body.push(line)
      }
      continue
    }
    if (/^\s*\|/.test(line)) activeTable++
    else if (activeTable) { tables.push(activeTable); activeTable = 0 }
  }
  if (activeTable) tables.push(activeTable)
  if (fence) errors.push('Unclosed code fence')
  const images = [...source.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(x => x[1])
    .concat([...source.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/g)].map(x => x[1]))
  return { diagrams, tables, images }
}
export function localAsset(articlePath, link, root = '.') {
  const url = link.split(/[?#]/)[0].trim()
  if (!url || /^(?:https?:|data:|#)/i.test(url)) return null
  if (url.startsWith('/')) {
    const relative = decodeURIComponent(url.slice(1))
    const publicAsset = resolve(root, 'public', relative)
    // VitePress serves public assets at site-root URLs; preserve legacy root assets.
    return existsSync(publicAsset) ? publicAsset : resolve(root, relative)
  }
  return resolve(root, dirname(articlePath), decodeURIComponent(url))
}
export function englishImageError(articlePath, link, root = '.') {
  const path = localAsset(articlePath, link, root)
  if (!path) return null
  if (!existsSync(path)) return 'English image missing: ' + link
  if (/\.(?:svg|html?)$/i.test(path) && han.test(readFileSync(path, 'utf8'))) {
    return 'Chinese-labelled image in English article: ' + link
  }
  return null
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
for (const slug of englishArticleSlugs) {
  const zhPath = 'articles/' + slug + '.md'
  const enPath = 'en/articles/' + slug + '.md'
  if (!existsSync(zhPath) || !existsSync(enPath)) {
    errors.push(slug + ': missing paired edition')
    continue
  }
  const zh = markdownStructure(readFileSync(zhPath, 'utf8'))
  const en = markdownStructure(readFileSync(enPath, 'utf8'))
  if (zh.diagrams.length !== en.diagrams.length) errors.push(slug + ': Mermaid diagram count differs')
  if (JSON.stringify(zh.tables) !== JSON.stringify(en.tables)) errors.push(slug + ': Markdown table structure differs')
  if (zh.images.length !== en.images.length) errors.push(slug + ': image count differs')
  en.diagrams.forEach((diagram, i) => {
    if (han.test(diagram)) errors.push(slug + ': English Mermaid #' + (i + 1) + ' still has Chinese text')
    const sourceArrows = (zh.diagrams[i] || '').match(/(?:-->>|-->|->>)/g) || []
    const translatedArrows = diagram.match(/(?:-->>|-->|->>)/g) || []
    if (sourceArrows.length !== translatedArrows.length) errors.push(slug + ': Mermaid #' + (i + 1) + ' connector count differs')
  })
  for (const link of en.images) {
    const error = englishImageError(enPath, link)
    if (error) errors.push(slug + ': ' + error)
  }
}
if (errors.length) {
  console.error('Bilingual visual parity failed:\n' + errors.join('\n'))
  process.exit(1)
}
console.log('Bilingual visual parity:', englishArticleSlugs.length,
  'full article pairs; diagrams, tables and illustrations verified structurally.')

}
