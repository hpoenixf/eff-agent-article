import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse, compileScript, compileStyle } from '@vue/compiler-sfc'
import { build } from 'esbuild'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

const theme = resolve('.vitepress/theme')
const source = readFileSync(resolve(theme, 'OpenEtfTopic.vue'), 'utf8')
const { descriptor } = parse(source)
const bundled = await build({
  stdin: { contents: compileScript(descriptor, { id: 'project-listings-test', inlineTemplate: true }).content, loader: 'ts', resolveDir: theme },
  bundle: true, write: false, platform: 'node', format: 'esm', external: ['vue'],
  plugins: [{ name: 'project-listings-base', setup(builder) {
    builder.onResolve({ filter: /^vitepress$/ }, () => ({ path: 'vitepress', namespace: 'project-listings-test' }))
    builder.onLoad({ filter: /.*/, namespace: 'project-listings-test' }, () => ({ contents: 'export const withBase = p => "/eff-agent-article" + p;' }))
  } }]
})
const cache = resolve('.vitepress/cache'); mkdirSync(cache, { recursive: true })
const fixture = resolve(cache, 'project-listings-render-fixture.mjs')
writeFileSync(fixture, bundled.outputFiles[0].text)
const Component = (await import(pathToFileURL(fixture))).default

test('project listings render together in both languages with bounded and accessible claims', async () => {
  for (const language of ['zh', 'en']) {
    const html = await renderToString(createSSRApp(Component, { language }))
    const listings = /<section class="oet-recognition"[^>]*>([\s\S]*?)<\/section>/.exec(html)?.[1]
    assert.ok(listings)
    assert.equal((listings.match(/class="oet-listing"/g) || []).length, 2)
    assert.match(listings, /href="https:\/\/hub\.xerj\.org\/corpus\/hpoenixf--open-etf-agent"/)
    assert.match(listings, /v0\.9 CLI Worker/)
    assert.match(listings, /href="https:\/\/toolpotion\.ai\/en\/ai-apps\/open-etf-agent\?utm_source=toolpotion&amp;utm_medium=badge&amp;utm_campaign=listed"[^>]*rel="noopener noreferrer"/)
    assert.match(listings, /aria-describedby="xerj-listing-note"/)
    assert.match(listings, /aria-describedby="toolpotion-listing-note"/)
    assert.match(listings, language === 'en' ? /AI tool directory listing/ : /AI 工具目录收录/)
    assert.ok(listings.includes('src="https://toolpotion.ai/badge/33838/listed-compact-light.svg' + (language === 'en' ? '' : '?lang=zh') + '"'))
    assert.ok(listings.includes(language === 'en' ? 'alt="Open ETF Agent — Listed on ToolPotion.ai"' : 'alt="Open ETF Agent — 已收录于 ToolPotion.ai"'))
    assert.match(listings, /width="199" height="20"/)
    assert.match(listings, /width="200" height="43"/)
    assert.equal((listings.match(/referrerpolicy="no-referrer"/g) || []).length, 2)
    assert.equal((listings.match(/loading="lazy"/g) || []).length, 2)
    assert.doesNotMatch(listings, /<script|<iframe|<object|nofollow|featured|award|certified|获奖|认证/i)
    assert.ok(html.indexOf('class="oet-recognition"') > html.indexOf('id="coverage-reading"'), 'Listings stay in the project-specific lower section, not the hero')
  }
  assert.deepEqual(compileStyle({ source: descriptor.styles[0].content, id: 'project-listings-test', scoped: true }).errors, [])
  assert.match(source, /\.oet-listings\{[^}]*display:flex;flex-wrap:wrap/)
  assert.match(source, /\.oet-listing-badge\{[^}]*min-height:44px/)
  assert.match(source, /\.oet-listing-badge img\{[^}]*height:auto/)
  assert.match(source, /a:focus-visible/)
})
