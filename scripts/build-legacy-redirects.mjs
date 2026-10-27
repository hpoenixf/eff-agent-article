import assert from 'node:assert/strict'
import { readdir, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const baseUrl = 'https://hpoenixf.com/eff-agent-article/'

export function redirectPage(path) {
  assert.ok(!path.startsWith('/') && !path.split('/').includes('..'), 'Unsafe legacy route')
  let route = path
  if (!route.startsWith('visuals/'))
    route = route.replace(/\.html$/, '').replace(/(^|\/)index$/, '$1')
  const target = baseUrl + route
  const safeTarget = target
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
  const scriptTarget = JSON.stringify(target).replaceAll('<', '\\u003c')
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Reader moved to hpoenixf.com</title><link rel="canonical" href="${safeTarget}"><meta http-equiv="refresh" content="0;url=${safeTarget}"><script>location.replace(${scriptTarget}+location.search+location.hash)</script></head><body><p>This reading page has moved to <a href="${safeTarget}">hpoenixf.com</a>.</p></body></html>\n`
}

export async function buildRedirects(source, output) {
  source = resolve(source)
  output = resolve(output)
  assert.notEqual(source, output, 'Redirect output must not overwrite the reader build')
  // Refuse reuse instead of leaving old body files/assets in a redirect-only artifact.
  await mkdir(output, { recursive: false })
  let count = 0
  async function visit(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = resolve(dir, entry.name)
      if (entry.isDirectory()) await visit(file)
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const path = relative(source, file).split(sep).join('/')
        const target = resolve(output, path)
        await mkdir(dirname(target), { recursive: true })
        await writeFile(target, redirectPage(path))
        count++
      }
    }
  }
  await visit(source)
  assert.ok(count > 0, 'No legacy HTML routes found')
  await writeFile(resolve(output, '.nojekyll'), '')
  console.log(`Built ${count} redirect-only pages; no article bodies or assets copied`)
  return count
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  buildRedirects(
    process.argv[2] ?? '.vitepress/dist',
    process.argv[3] ?? '.vitepress/legacy-redirects'
  ).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
