import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { findMermaidBlocks, RENDERER_VERSION } from '../static-mermaid.mjs'

const target = resolve('public/generated/mermaid')
const cli = resolve('node_modules/.bin/mmdc')
const manifestPath = resolve('public/generated/mermaid/manifest.json')
const batchSize = 16

function sourceMarkdown() {
  const directories = ['.', 'articles', 'en', 'en/articles']
  return directories.flatMap(dir => readdirSync(dir, { withFileTypes: true })
    .filter(item => item.isFile() && item.name.endsWith('.md'))
    .map(item => join(dir, item.name)))
}

function findChrome() {
  if (process.env.MERMAID_CHROME_PATH) return process.env.MERMAID_CHROME_PATH
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH
  for (const candidate of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    const result = spawnSync('which', [candidate], { encoding: 'utf8' })
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim()
  }
  throw Error('Cannot find Chrome/Chromium; set MERMAID_CHROME_PATH for static SVG builds')
}

function auditSvg(content, sourceLabel) {
  if (!/<svg[\s>]/i.test(content)) throw Error('Missing SVG root: ' + sourceLabel)
  if (/<script[\s>]|<foreignObject[^>]*\bon(?:load|error|click)=|\bon(?:load|error|click)\s*=/i.test(content)) {
    throw Error('Executable markup in SVG: ' + sourceLabel)
  }
}

const files = sourceMarkdown()
const usages = new Map()
for (const path of files) {
  const blocks = findMermaidBlocks(readFileSync(path, 'utf8'))
  for (const block of blocks) {
    const current = usages.get(block.id)
    if (current && current.source !== block.source) throw Error('Hash collision: ' + block.id)
    if (!current) usages.set(block.id, { source: block.source, pages: [] })
    usages.get(block.id).pages.push(path + ':' + block.line)
  }
}

if (usages.size === 0) throw Error('No Mermaid blocks discovered; refusing an empty static diagram build')
if (!existsSync(cli)) throw Error('Mermaid CLI dependency is missing; run npm install before building diagrams')
const chrome = findChrome()
const temp = mkdtempSync(join(tmpdir(), 'etf-static-mermaid-'))
let rendered = 0
try {
  const pptr = join(temp, 'puppeteer.json')
  const mermaidConfig = join(temp, 'mermaid.json')
  writeFileSync(pptr, JSON.stringify({
    executablePath: chrome,
    headless: true,
    args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
  }))
  writeFileSync(mermaidConfig, JSON.stringify({
    theme: 'neutral', securityLevel: 'strict',
    fontFamily: 'Arial, Noto Sans CJK SC, sans-serif'
  }))
  mkdirSync(target, { recursive: true })
  const entries = [...usages.entries()]
  for (let offset = 0; offset < entries.length; offset += batchSize) {
    const batch = entries.slice(offset, offset + batchSize)
    const index = Math.floor(offset / batchSize)
    const input = join(temp, 'diagrams-' + index + '.md')
    const output = join(temp, 'rendered-' + index + '.md')
    writeFileSync(input, batch.map(([, v], i) =>
      '## Mermaid ' + i + '\n\n```mermaid\n' + v.source + '\n```\n'
    ).join('\n'))
    try {
      execFileSync(cli, [
        '-i', input, '-o', output, '-t', 'neutral', '-b', 'white',
        '-c', mermaidConfig, '-p', pptr
      ], { encoding: 'utf8', timeout: 300000, maxBuffer: 12 * 1024 * 1024 })
    } catch (error) {
      console.error('Unable to render batch ' + index + ': ' + batch.map(([id, v]) =>
        id + ' (' + v.pages.join(', ') + ')').join('; '))
      throw Error('Mermaid CLI failed: ' + (error.stderr?.toString() || error.message))
    }
    const assets = readdirSync(temp).filter(name =>
      new RegExp('^rendered-' + index + '-[0-9]+\\.svg.test(name)
    ).sort((a, b) =>
      Number(a.match(/-(\d+)\.svg$/)?.[1] || 0) - Number(b.match(/-(\d+)\.svg$/)?.[1] || 0)
    )
    if (assets.length !== batch.length) throw Error('Mermaid output count ' + assets.length +
      ' != expected ' + batch.length + ', files: ' + readdirSync(temp).join(', '))
    for (let i = 0; i < assets.length; i++) {
      const [id] = batch[i]
      const content = readFileSync(join(temp, assets[i]), 'utf8')
      auditSvg(content, assets[i])
      writeFileSync(join(target, id + '.svg'), content)
      rendered++
    }
  }
  const publicManifest = {
    generator: RENDERER_VERSION,
    diagramCount: rendered,
    occurrences: [...usages.values()].reduce((n, x) => n + x.pages.length, 0),
    diagrams: Object.fromEntries([...usages.entries()].map(([id, v]) => [id, { pages: v.pages }]))
  }
  writeFileSync(manifestPath, JSON.stringify(publicManifest, null, 2) + '\n')
  console.log('Static Mermaid SVG generated:', rendered, 'unique,', publicManifest.occurrences,
    'occurrences,', files.length, 'Markdown files')
} finally {
  rmSync(temp, { recursive: true, force: true })
}
).test(name)
    ).sort((a, b) =>
      Number(a.match(/-(\d+)\.svg$/)?.[1] || 0) - Number(b.match(/-(\d+)\.svg$/)?.[1] || 0)
    )
    if (assets.length !== batch.length) throw Error('Mermaid output count ' + assets.length +
      ' != expected ' + batch.length + ', files: ' + readdirSync(temp).join(', '))
    for (let i = 0; i < assets.length; i++) {
      const [id] = batch[i]
      const content = readFileSync(join(temp, assets[i]), 'utf8')
      auditSvg(content, assets[i])
      writeFileSync(join(target, id + '.svg'), content)
      rendered++
    }
  }
  const publicManifest = {
    generator: RENDERER_VERSION,
    diagramCount: rendered,
    occurrences: [...usages.values()].reduce((n, x) => n + x.pages.length, 0),
    diagrams: Object.fromEntries([...usages.entries()].map(([id, v]) => [id, { pages: v.pages }]))
  }
  writeFileSync(manifestPath, JSON.stringify(publicManifest, null, 2) + '\n')
  console.log('Static Mermaid SVG generated:', rendered, 'unique,', publicManifest.occurrences,
    'occurrences,', files.length, 'Markdown files')
} finally {
  rmSync(temp, { recursive: true, force: true })
}
