// Real-browser regression for the built bilingual gallery and primary navigation.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import puppeteer from 'puppeteer'

const root = resolve('.vitepress/dist'), output = resolve('test-output/gallery-navigation')
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
  for (const language of ['zh', 'en']) for (const width of [1440, 390]) {
    const prefix = language === 'en' ? 'en/' : ''
    const page = await browser.newPage()
    await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base + prefix + 'gallery#stage=deep', { waitUntil: 'networkidle0' })
    await page.waitForSelector('#gallery-tab-deep[aria-selected="true"]')
    assert.equal(await page.$$eval('.gallery-stages [role="tab"]', nodes => nodes.length), 5)
    await page.focus('#gallery-tab-deep'); await page.keyboard.press('ArrowRight')
    await page.waitForSelector('#gallery-tab-workshop[aria-selected="true"]')
    assert.ok(page.url().endsWith('gallery#stage=workshop'))
    const src = await page.$eval('.gallery-workshop-map img', image => image.currentSrc)
    assert.ok(src.endsWith(`six-layers-${language}${width < 640 ? '-mobile' : ''}.svg`), src)
    assert.ok(await page.$eval('.gallery-workshop-map img', image => image.complete && image.naturalWidth > 0))
    const target = '/eff-agent-article/' + prefix + 'catalog'
    if (width > 959) {
      assert.equal(await page.$eval('.VPNavBarMenu a', node => node.getAttribute('href')), target)
      assert.ok(await page.$eval('.VPNavBarMenu', node => node.getBoundingClientRect().width > 0))
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
    assert.equal(overflow, false, `${language} ${width}: horizontal overflow`)
    await page.screenshot({ path: output + `/${language}-${width}.png`, fullPage: true })
    // Closing and reopening must restore scrolling and avoid a stale fullscreen overlay.
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.click('.panorama-toolbar button[aria-haspopup="dialog"]')
      await page.waitForSelector('dialog[open]')
      assert.equal(await page.$eval('dialog[open] object', node => node.getAttribute('data')), '/eff-agent-article/diagrams/open-workshop/six-layers-' + language + '.svg')
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => !document.querySelector('dialog[open]'))
      assert.notEqual(await page.evaluate(() => document.documentElement.style.overflow), 'hidden')
    }
    if (width < 960) {
      await page.click('.VPNavBarHamburger')
      await page.waitForSelector('.VPNavScreenMenuLink')
      await page.waitForFunction(() => {
        const menu = document.querySelector('.VPNavScreen')
        return menu && getComputedStyle(menu).opacity === '1'
      })
      assert.equal(await page.$eval('.VPNavScreenMenuLink', node => node.getAttribute('href')), target)
      await page.screenshot({ path: output + `/${language}-${width}-menu.png`, fullPage: false })
      await page.click('.VPNavScreenMenuLink')
    } else await page.click('.VPNavBarMenu a')
    await page.waitForFunction(expected => location.pathname === expected, {}, target)
    await page.goBack({ waitUntil: 'networkidle0' })
    await page.waitForSelector('#gallery-tab-workshop[aria-selected="true"]')
    await page.reload({ waitUntil: 'networkidle0' })
    await page.waitForSelector('#gallery-tab-workshop[aria-selected="true"]')
    assert.deepEqual(errors, [])
    observations.push({ language, width, tabs: 5, picture: src.split('/').at(-1), catalogue: target, closeReopen: true, backAndRefresh: true, horizontalOverflow: false })
    await page.close()
  }
  writeFileSync(output + '/verified.json', JSON.stringify({ observations }, null, 2) + '\n')
  console.log('Gallery and primary navigation: bilingual desktop/mobile browser checks passed')
} finally {
  await browser?.close()
  await new Promise(done => server.close(done))
}
