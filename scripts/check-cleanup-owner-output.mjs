// Focused reading and figure regression for the cleanup/result ownership article.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import puppeteer from 'puppeteer'

const root = resolve('.vitepress/dist')
const output = resolve('test-output/cleanup-owner')
const slug = 'agent-cleanup-result-ownership'
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' }
mkdirSync(output, { recursive: true })
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
    page.on('pageerror', error => errors.push(error.message))
    await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 })
    const route = `${lang === 'en' ? 'en/' : ''}articles/${slug}`
    await page.goto(base + route, { waitUntil: 'networkidle0' })
    assert.equal(await page.$eval('link[rel="canonical"]', node => node.href), 'https://hpoenixf.com/eff-agent-article/' + route)
    const text = await page.$eval('.vp-doc', node => node.innerText)
    assert.ok(text.includes(lang === 'zh' ? '调用结果、共享等待条目和物理容量' : 'physical capacity'))
    assert.equal((await page.$$('.vp-doc h1')).length, 1)
    assert.equal((await page.$$('.vp-doc h2')).length, 5)
    const figures = await page.$$('.vp-doc figure.diagram-static')
    assert.equal(figures.length, 3)
    for (let index = 0; index < figures.length; index++) {
      const figure = figures[index]
      await figure.evaluate(node => node.scrollIntoView({ block: 'center' }))
      await page.waitForFunction(i => { const image = document.querySelectorAll('.vp-doc figure.diagram-static img')[i]; return image?.complete && image.naturalWidth > 0 }, {}, index)
      const data = await figure.evaluate(node => {
        const image = node.querySelector('img'), bounds = image.getBoundingClientRect()
        return { src: image.currentSrc, alt: image.alt, width: bounds.width, height: bounds.height, left: bounds.left, right: bounds.right }
      })
      assert.ok(data.alt.length > 30)
      assert.ok(data.left >= 0 && data.right <= width + 1, JSON.stringify(data))
      await figure.screenshot({ path: `${output}/${lang}-${width}-figure-${index + 1}.png` })
      assert.ok(await figure.$('img[data-diagram-zoom]'), 'The figure must use the shared zoom enhancement')
      const trigger = await figure.$('.diagram-original')
      await trigger.focus(); await page.keyboard.press('Enter')
      await page.waitForSelector('dialog.diagram-zoom-dialog[open]')
      assert.equal(await page.$eval('dialog.diagram-zoom-dialog img', node => node.getAttribute('src')), data.src)
      await page.screenshot({ path: `${output}/${lang}-${width}-zoom-${index + 1}.png` })
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => !document.querySelector('dialog.diagram-zoom-dialog[open]'))
      assert.ok(await trigger.evaluate(node => document.activeElement === node))
      assert.notEqual(await page.evaluate(() => document.documentElement.style.overflow), 'hidden')
      const svg = await browser.newPage()
      await svg.setViewport({ width: Math.ceil(data.width), height: Math.ceil(data.height), deviceScaleFactor: 1 })
      await svg.goto(data.src, { waitUntil: 'networkidle0' })
      const geometry = await svg.evaluate(async () => {
        await document.fonts.ready
        const view = document.documentElement.viewBox.baseVal
        return { title: document.querySelector('title')?.textContent, desc: document.querySelector('desc')?.textContent,
          text: [...document.querySelectorAll('text')].map(node => node.textContent).join('\n'),
          overflow: [...document.querySelectorAll('text')].filter(node => { const box = node.getBBox(); return box.x < -1 || box.y < -1 || box.x + box.width > view.width + 1 || box.y + box.height > view.height + 1 }).map(node => node.textContent) }
      })
      assert.ok(geometry.title && geometry.desc)
      assert.deepEqual(geometry.overflow, [], `${lang}/${width}/figure-${index + 1}: SVG text exceeds canvas`)
      if (lang === 'en') assert.ok(!/[\u3400-\u9fff]/u.test(geometry.text), 'English diagram must be localized')
      await svg.close()
      observations.push({ lang, width, figure: index + 1, ...data, svgTextWithinCanvas: true, keyboardZoomAndFocusReturn: true })
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
    assert.deepEqual(errors, [])
    await page.screenshot({ path: `${output}/${lang}-${width}-page.png`, fullPage: true })
    await page.close()
  }
  writeFileSync(output + '/verified.json', JSON.stringify({ observations }, null, 2) + '\n')
  console.log('Cleanup ownership: bilingual desktop/375px/390px figures and keyboard zoom passed')
} finally { await browser?.close(); await new Promise(done => server.close(done)) }
