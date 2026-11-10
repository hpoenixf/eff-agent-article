// Update navigation only. Owner responsibilities and layer membership stay untouched.
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { englishArticleSlugs } from '../book.en.mjs'
const site = 'https://hpoenixf.com/eff-agent-article/'
const registry = JSON.parse(readFileSync(new URL('../visuals/owner-architecture/owner-articles.json', import.meta.url), 'utf8'))
export function ownerTarget(id, language, absolute = false) {
  const primary = registry.owners[id]?.primary
  if (!primary) return site + 'visuals/owner-architecture/index.html#owner=' + id
  return (absolute ? site : '/') + (language === 'en' && englishArticleSlugs.includes(primary) ? 'en/' : '') + 'articles/' + primary
}
export function syncOwnerLinks(source, language, svg = false) {
  if (svg) return source.replace(/<a class="owner-chip-link" href="[^"]+"[^>]*>[\s\S]*?<\/a>/g, chip => {
    const id = chip.match(/>([ABE]\d{2})<\/text><\/a>$/)?.[1]
    if (!registry.owners[id]) throw Error('Unknown Owner chip: ' + id)
    return chip.replace(/href="[^"]+"/, 'href="' + ownerTarget(id, language, true) + '"')
  })
  return source.replace(/^(\| ([ABE]\d{2}) \| \[[^\]]+\]\()[^)]+(\).+)$/gm,
    (_, before, id, after) => before + ownerTarget(id, language) + after)
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!['--check', '--write'].includes(process.argv[2])) throw Error('Use --check or --write')
  for (const language of ['zh', 'en']) {
    for (const [path, svg] of [
      [(language === 'en' ? 'en/' : '') + 'articles/017-prompt-to-answer-six-layer-panorama-v3.md', false],
      ['visuals/017-prompt-to-answer-six-layer-panorama/diagrams/v3-owner-map-' + language + '.svg', true]
    ]) {
      const old = readFileSync(path, 'utf8'), updated = syncOwnerLinks(old, language, svg)
      if (process.argv[2] === '--write') writeFileSync(path, updated)
      else if (old !== updated) throw Error('Owner navigation drift: ' + path)
    }
  }
  console.log('Panorama Owner navigation matches the article registry')
}
