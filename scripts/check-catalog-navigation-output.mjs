// Real-browser regression for the built bilingual gallery and primary navigation.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import puppeteer from 'puppeteer'
import { collections } from '../book.mjs'

const root = resolve('.vitepress/dist'), output = resolve('test-output/catalog-navigation')
mkdirSync(output, { recursive: true })
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' }
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost')
  const relative = decodeURIComponent(url.pathname).replace(/^\/eff-agent-article\//, '')
  let file = resolve(root, relative || 'index.html')
  if (!file.startsWith(root + '/') && file !== root) { response.writeHead(403).end(); return }
  if (file.endsWith('/')) file += 'index.html'
  if (!extname(file)) file += '.html'
  if (!existsSync(file)) { response.writeHead(404).end(); return }
  response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' })
  response.end(readFileSync(file))
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const base = `http://127.0.0.1:${server.address().port}/eff-agent-article/`
const chrome = process.env.MERMAID_CHROME_PATH || ['/opt/google/chrome/chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync)
let browser
const observations = []
try {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true,
    args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [] })
  for (const language of ['zh', 'en']) {
    const en = language === 'en', prefix = en ? 'en/' : ''
    const page = await browser.newPage(), errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.setViewport({ width: 1440, height: 1000 })
    const go = route => page.goto(base + prefix + route, { waitUntil: 'networkidle0' })
    const tag = async label => {
      const buttons = await page.$$('.catalog-tag-filter button')
      for (const button of buttons) if ((await button.evaluate(n => n.textContent.trim())) === label) { await button.click(); return }
      throw Error('Missing filter ' + label)
    }
    await go('modules')
    assert.match(await page.$eval('.catalog-headline', n => n.textContent), /41/)
    assert.equal(await page.$$eval('.chapter-card > ol > li', nodes => nodes.length), 41)
    // Expand the actual native sidebar groups and inspect their visible associated links.
    await page.$$eval('.VPSidebarItem.collapsed > .item', nodes => nodes.forEach(n => n.click()))
    const side = await page.$eval('.VPSidebar', n => n.innerText)
    assert.ok(side.includes(en ? 'Related reading' : '关联阅读'))
    const sidebarDeep = await page.$('.VPSidebar a[href="/eff-agent-article/' + prefix + 'articles/agent-deep-research-resource-and-delivery"]')
    assert.ok(sidebarDeep && await sidebarDeep.isVisible())
    await page.screenshot({ path: output + '/' + language + '-sidebar.png', fullPage: true })
    await tag(en ? 'Panorama' : '全景')
    await page.waitForFunction(() => document.querySelectorAll('.chapter-card').length < 6)
    const l3 = await page.$eval('.chapter-grid', n => [...n.querySelectorAll('.chapter-card')].find(c => c.querySelector('.chapter-title')?.textContent.includes('L3'))?.outerHTML || '')
    assert.ok(l3.includes('agent-subagent-context-specialization'), 'Related-only L3 survives panorama filtering')
    assert.ok(!/<ol><li/.test(l3.split('chapter-related')[0]), 'L3 contains no matching primary article')
    await tag(en ? 'Open source' : '开源')
    assert.ok((await page.$eval('.chapter-grid', n => n.innerHTML)).includes('agent-subagent-context-specialization'), 'AND intersection retains the actual related match')
    await page.screenshot({ path: output + '/' + language + '-related-only.png', fullPage: true })
    const relatedLink = await page.$('.chapter-related a[href="/eff-agent-article/' + prefix + 'articles/agent-subagent-context-specialization"]')
    await relatedLink.click()
    await page.waitForFunction(() => location.pathname.includes('agent-subagent-context-specialization'))
    await page.goBack({ waitUntil: 'networkidle0' })
    assert.ok(page.url().includes('modules'))
    // Only canonical categories count in the independent catalogue, even when related chapters match.
    await go('catalog?tags=panorama,open-source')
    await page.waitForSelector('.catalog-tag-filter button[aria-pressed="true"]')
    const allLinks = await page.$$eval('.catalog-all-links a', nodes => nodes.map(n => n.getAttribute('href').split('/').at(-1)))
    const expectedCategories = collections.filter(c => c.chapters.some(ch => ch.items.some(([slug]) => allLinks.includes(slug)))).length
    assert.ok((await page.$eval('.catalog-heading-summary', n => n.textContent)).includes(expectedCategories + (en ? ' categories' : ' 大类')))
    assert.equal(new Set(allLinks).size, allLinks.length)
    await go('catalog')
    await page.waitForSelector('.catalog-article-list li')
    assert.match(await page.$eval('.catalog-heading-summary', n => n.textContent), /113/)
    const first = await page.$$eval('.catalog-article-list [data-article]', nodes => nodes.map(n => n.dataset.article))
    assert.equal(first.length, 20)
    await page.click('.catalog-pagination > button:last-child')
    await page.waitForFunction(() => new URL(location.href).searchParams.get('page') === '2')
    const second = await page.$$eval('.catalog-article-list [data-article]', nodes => nodes.map(n => n.dataset.article))
    assert.equal(second.length, 20)
    assert.ok(second.every(slug => !first.includes(slug)))
    await tag(en ? 'Panorama' : '全景')
    await page.waitForFunction(() => !new URL(location.href).searchParams.has('page'))
    await page.goBack({ waitUntil: 'networkidle0' })
    await page.waitForFunction(() => new URL(location.href).searchParams.get('page') === '2')
    assert.deepEqual(await page.$$eval('.catalog-article-list [data-article]', nodes => nodes.map(n => n.dataset.article)), second)
    assert.deepEqual(errors, [])
    observations.push({ language, canonicalModules: 41, total: 113, sidebarRelated: true, relatedOnlyAndFilter: true, uniqueResults: true, paginationAndBack: true })
    await page.close()
  }
  writeFileSync(output + '/verified.json', JSON.stringify({ observations }, null, 2) + '\n')
  console.log('Bilingual catalogue: module counts, related sidebar/filter, canonical totals, pagination and Back passed')
} finally { await browser?.close(); await new Promise(done => server.close(done)) }
