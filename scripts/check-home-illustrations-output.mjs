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
    await page.waitForFunction(() => [...document.querySelectorAll('.VPHome img[src*="/images/home/"]')].length === 7 && [...document.querySelectorAll('.VPHome img[src*="/images/home/"]')].every(i => i.complete && i.naturalWidth > 0))
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${language} ${width}: overflow`)
    assert.deepEqual(errors, [])
    const id = `${language}-${width}-${dark ? 'dark' : 'light'}`
    await page.screenshot({ path: output + '/' + id + '.png', fullPage: true })
    const menu = '.home-reading-menu summary'
    await page.focus(menu)
    await page.keyboard.press('Enter')
    assert.equal(await page.$eval('.home-reading-menu', e => e.open), true)
    await page.keyboard.press('Enter')
    assert.equal(await page.$eval('.home-reading-menu', e => e.open), false)
    results.push({ id, images: 7, overflow: false, menu: 'keyboard open/close passed' })
    await page.close()
  }
  writeFileSync(output + '/results.json', JSON.stringify(results, null, 2))
  console.log(`Homepage illustrations: ${results.length} language/viewport/theme combinations passed`)
} finally {
  await browser?.close()
  await new Promise(done => server.close(done))
}
