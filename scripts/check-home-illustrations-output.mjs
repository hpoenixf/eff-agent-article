// Real-browser regression for the built bilingual gallery and primary navigation.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import puppeteer from 'puppeteer'

const root = resolve('.vitepress/dist'), output = resolve('test-output/home-illustrations')
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
const results = []
try {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true,
    args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [] })
  for (const language of ['zh', 'en']) for (const width of [1440, 1024, 768, 390]) for (const dark of [false, true]) {
    const page = await browser.newPage()
    await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base + (language === 'en' ? 'en/index.html' : 'index.html'), { waitUntil: 'networkidle0' })
    await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), dark)
    await page.waitForFunction(() => [...document.querySelectorAll('.VPHome img[src*="/images/home/"]')].length === 4 && [...document.querySelectorAll('.VPHome img[src*="/images/home/"]')].every(i => i.complete && i.naturalWidth > 0))
    const layout = await page.evaluate(() => ({
      viewport: innerWidth, document: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll('body *')].filter(node => {
        const box = node.getBoundingClientRect()
        return box.width > 0 && (box.right > innerWidth + 1 || box.left < -1)
      }).slice(0, 24).map(node => {
        const box = node.getBoundingClientRect(), css = getComputedStyle(node)
        return { tag: node.tagName, class: String(node.className), left: box.left, right: box.right, width: box.width, minWidth: css.minWidth, overflowX: css.overflowX }
      })
    }))
    assert.equal(layout.document > layout.viewport + 1, false, `${language} ${width}: overflow ${JSON.stringify(layout)}`)
    assert.deepEqual(errors, [])
    const id = `${language}-${width}-${dark ? 'dark' : 'light'}`
    await page.screenshot({ path: output + '/' + id + '.png', fullPage: true })
    assert.equal(await page.$$eval('.reader-tabs [role="tab"]', nodes => nodes.length), 5)
    for (const tab of ['catalog', 'start', 'architecture', 'finance', 'engineering']) {
      await page.click('#reader-tab-' + tab)
      assert.equal(await page.$eval('#reader-tab-' + tab, node => node.getAttribute('aria-selected')), 'true')
      assert.equal(await page.$eval('#reader-panel-' + tab, node => node.hidden), false)
      assert.equal(await page.$$eval('.reader-home [role="tabpanel"]', nodes => nodes.filter(node => !node.hidden).length), 1)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${id} ${tab}: overflow`)
      if (tab !== 'catalog') {
        const links = await page.$$eval('#reader-panel-' + tab + ' .reader-route a', nodes => nodes.map(node => node.getAttribute('href')))
        const prefix = '/eff-agent-article/' + (language === 'en' ? 'en/' : '')
        const topics = { start: 'getting-started', architecture: 'thinking', finance: 'fintech', engineering: 'engineering' }
        assert.equal(links.length, 6, id + ' ' + tab + ': five articles plus one topic card')
        assert.equal(new Set(links.slice(0, 5)).size, 5, 'Article previews must be distinct')
        for (const href of links.slice(0, 5)) {
          assert.ok(href.startsWith(prefix + 'articles/'), 'Wrong-language article preview: ' + href)
          assert.ok(existsSync(resolve(root, href.replace('/eff-agent-article/', '') + '.html')), 'Missing built article: ' + href)
        }
        assert.equal(links[5], prefix + topics[tab], 'Sixth card must open the complete matching topic')
        assert.equal(await page.$eval('#reader-panel-' + tab + ' .reader-route li:last-child', node => node.classList.contains('reader-view-all')), true)
        assert.ok(existsSync(resolve(root, (language === 'en' ? 'en/' : '') + topics[tab] + '.html')), 'Missing built topic')
      }
    }
    await page.focus('#reader-tab-engineering')
    await page.keyboard.press('Home')
    assert.equal(await page.$eval('#reader-tab-catalog', node => node === document.activeElement && node.getAttribute('aria-selected') === 'true'), true)
    await page.keyboard.press('ArrowRight')
    assert.equal(await page.$eval('#reader-tab-start', node => node === document.activeElement && node.getAttribute('aria-selected') === 'true'), true)
    await page.screenshot({ path: output + '/' + id + '-route.png', fullPage: true })
    await page.keyboard.press('End')
    assert.equal(await page.$eval('#reader-tab-engineering', node => node === document.activeElement && node.getAttribute('aria-selected') === 'true'), true)
    await page.keyboard.press('ArrowRight')
    assert.equal(await page.$eval('#reader-tab-catalog', node => node === document.activeElement), true)
    assert.equal(await page.$$eval('.recent-articles time', nodes => nodes.length), 7)
    assert.equal(await page.$$eval('.recent-articles li', nodes => nodes.length), 8)
    assert.equal(await page.$eval('.recent-all a', node => node.getAttribute('href')), '/eff-agent-article/' + (language === 'en' ? 'en/' : '') + 'catalog')
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    assert.equal(await page.$eval('.reader-tab-slider', node => getComputedStyle(node).transitionDuration), '0s')
    assert.equal(await page.$eval('#reader-panel-catalog', node => getComputedStyle(node).animationName), 'none')
    assert.deepEqual(errors, [])
    results.push({ id, images: 4, overflow: false, tabs: 'five tabs clicked; Home/End/ArrowRight focus and selection passed' })
    await page.close()
  }
  writeFileSync(output + '/results.json', JSON.stringify(results, null, 2))
  console.log(`Homepage illustrations: ${results.length} language/viewport/theme combinations passed`)
} finally {
  await browser?.close()
  await new Promise(done => server.close(done))
}
