// Targeted browser regression for the bilingual Deep Research article.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import puppeteer from 'puppeteer'

const root = resolve('.vitepress/dist'), output = resolve('test-output/deep-research')
mkdirSync(output, { recursive: true })
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' }
const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/eff-agent-article\//, '')
  let file = resolve(root, path || 'index.html')
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
const observations = []
let browser
try {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [] })
  for (const lang of ['zh', 'en']) for (const width of [1440, 375, 390]) {
    const page = await browser.newPage(), errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 })
    await page.goto(base + (lang === 'en' ? 'en/' : '') + 'articles/agent-deep-research-resource-and-delivery', { waitUntil: 'networkidle0' })
    const figures = await page.$$('.deep-research-figure')
    assert.equal(figures.length, 7)
    assert.equal(await page.$eval('link[rel="canonical"]', n => n.href), 'https://hpoenixf.com/eff-agent-article/' + (lang === 'en' ? 'en/' : '') + 'articles/agent-deep-research-resource-and-delivery')
    assert.ok((await page.$eval('.vp-doc', n => n.innerText)).includes(lang === 'zh' ? '完整冻结题面与逐项规则未随工程报告公开' : 'The complete frozen questions'))
    for (let i = 0; i < figures.length; i++) {
      await figures[i].evaluate(n => n.scrollIntoView({ block: 'center' }))
      await page.waitForFunction(index => { const image = document.querySelectorAll('.deep-research-figure img')[index]; return image?.complete && image.naturalWidth > 0 }, {}, i)
      const data = await figures[i].evaluate(n => { const image = n.querySelector('img'), b = image.getBoundingClientRect(); return { src: image.currentSrc, alt: image.alt, width: b.width, height: b.height, left: b.left, right: b.right } })
      assert.ok(data.src.endsWith(`-${lang}${width <= 700 ? '-mobile' : ''}.svg`), data.src)
      assert.ok(data.alt.length > 40)
      assert.ok(data.left >= 0 && data.right <= width + 1, JSON.stringify(data))
      await figures[i].screenshot({ path: `${output}/${lang}-${width}-figure-${i + 1}.png` })
      const trigger = await figures[i].$('.diagram-original')
      await trigger.focus(); await page.keyboard.press('Enter')
      await page.waitForSelector('dialog.diagram-zoom-dialog[open]')
      assert.equal(await page.$eval('dialog.diagram-zoom-dialog img', n => n.getAttribute('src')), data.src)
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => !document.querySelector('dialog.diagram-zoom-dialog[open]'))
      assert.ok(await trigger.evaluate(n => document.activeElement === n))
      assert.notEqual(await page.evaluate(() => document.documentElement.style.overflow), 'hidden')
      // Reopening and explicit Close must preserve the page and return focus too.
      const originalUrl = page.url()
      await trigger.click()
      await page.waitForSelector('dialog.diagram-zoom-dialog[open]')
      await page.click('.diagram-zoom-controls button:last-child')
      await page.waitForFunction(() => !document.querySelector('dialog.diagram-zoom-dialog[open]'))
      assert.equal(page.url(), originalUrl)
      assert.ok(await trigger.evaluate(n => document.activeElement === n))
      // Inspect actual browser font geometry, not only source dimensions.
      const svg = await browser.newPage()
      await svg.setViewport({ width: Math.ceil(data.width), height: Math.ceil(data.height), deviceScaleFactor: 1 })
      await svg.goto(data.src, { waitUntil: 'networkidle0' })
      const geometry = await svg.evaluate(async () => {
        await document.fonts.ready
        const view = document.documentElement.viewBox.baseVal
        return { title: document.querySelector('title')?.textContent, desc: document.querySelector('desc')?.textContent,
          overflow: [...document.querySelectorAll('text')].filter(n => { const b = n.getBBox(); return b.x < -1 || b.y < -1 || b.x + b.width > view.width + 1 || b.y + b.height > view.height + 1 }).map(n => n.textContent) }
      })
      assert.ok(geometry.title && geometry.desc)
      assert.deepEqual(geometry.overflow, [], `${lang} ${width} figure ${i + 1}: SVG text overflow`)
      await svg.close()
      observations.push({ lang, width, figure: i + 1, ...data, accessibleTitleAndDescription: true, svgTextWithinCanvas: true, keyboardZoomAndReturn: true })
    }
    assert.equal(await page.$('.diagram-static'), null, 'Research-loop SVG replaces the old Mermaid renderer')
    for (const host of ['developers.openai.com', 'www.anthropic.com', 'blog.google', 'github.com/langchain-ai/open_deep_research/blob/1b7d2e80']) {
      assert.ok(await page.$$eval('.vp-doc a[href]', (links, host) => links.some(n => n.href.includes(host)), host), `Missing primary source ${host}`)
    }
    const oldAnchors = lang === 'zh' ? ['二、怎样在同一套-runtime-上实现', '三、效果如何-让真实配对实验回答', '四、为什么最终没有另建-deep-工作流'] : ['_2-how-it-works-inside-the-existing-runtime', '_3-what-did-the-matched-runs-actually-show', '_4-why-not-introduce-a-separate-deep-graph']
    for (const id of oldAnchors) assert.ok(await page.evaluate(id => !!document.getElementById(id), id), `Lost anchor ${id}`)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
    assert.deepEqual(errors, [])
    await page.screenshot({ path: `${output}/${lang}-${width}-page.png`, fullPage: true })
    await page.goto(base + (lang === 'en' ? 'en/' : '') + 'thinking', { waitUntil: 'networkidle0' })
    await page.goBack({ waitUntil: 'networkidle0' })
    assert.ok(page.url().includes('agent-deep-research-resource-and-delivery'))
    assert.equal(await page.$('dialog.diagram-zoom-dialog[open]'), null)
    await page.close()
  }
  writeFileSync(output + '/verified.json', JSON.stringify({ observations }, null, 2) + '\n')
  console.log('Deep Research: bilingual desktop/375px/390px figures and keyboard zoom passed')
} finally { await browser?.close(); await new Promise(done => server.close(done)) }
