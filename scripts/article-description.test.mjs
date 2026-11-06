import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileStyle } from '@vue/compiler-sfc'
import { chapters, historicalEditions, mergedArticles } from '../book.mjs'
import { englishArticleSlugs, englishArticlePath } from '../book.en.mjs'
import { authoredArticleDescription, canonicalDescriptionPaths, buildArticleDescriptions, descriptionForArticle, descriptionSourcePath } from '../article-description.mjs'

const page = (url, description, extra = {}) => ({ url, frontmatter: { description, ...extra } })
test('description coverage follows canonical language editions, never a second article directory', () => {
  const paths = canonicalDescriptionPaths(), slugs = chapters.flatMap(c => c.items.map(([slug]) => slug))
  assert.equal(paths.length, slugs.length + englishArticleSlugs.length)
  assert.equal(new Set(paths).size, paths.length)
  for (const slug of Object.keys({ ...historicalEditions, ...mergedArticles })) assert.ok(!paths.includes('articles/' + slug + '.md'))
  const missingEnglish = slugs.filter(slug => !englishArticleSlugs.includes(slug))
  // Preserve the Chinese-original routing contract even when every real canonical article has English text.
  const fallback = missingEnglish[0] ?? 'synthetic-chinese-only-fixture'
  if (!missingEnglish.length) assert.ok(slugs.every(slug => englishArticleSlugs.includes(slug)), 'All canonical editions are translated')
  assert.equal(englishArticlePath(fallback), '/articles/' + fallback)
  assert.equal(descriptionForArticle({ ['articles/' + fallback + '.md']: '真实中文简介。' }, englishArticlePath(fallback)), '真实中文简介。')
})

test('only authored description is admitted; missing text fails rather than synthesizing an excerpt', () => {
  assert.equal(authoredArticleDescription({ description: ' A grounded\n description. ' }), 'A grounded description.')
  for (const description of [undefined, null, '', '   ', 17, {}, []]) assert.throws(() => authoredArticleDescription({ description }), /Missing authored/)
  assert.throws(() => authoredArticleDescription({ title: 'Title', readingBrief: { takeaways: ['A conclusion'] } }), /Missing authored/)
  for (const description of ['<b>Rich text</b>', '[A link](/target)']) assert.throws(() => authoredArticleDescription({ description }), /plain text/)
  for (const path of ['/articles/a', '/articles/a.html', 'articles/a.md', '/eff-agent-article/articles/a']) assert.equal(descriptionSourcePath(path), 'articles/a.md')
  assert.throws(() => descriptionSourcePath('/catalog'), /Invalid article/)
})

test('shared index requires every edition once and preserves full text and localization', () => {
  const paths = ['articles/a.md', 'en/articles/a.md'], long = 'A precise description of the topic and its real qualification boundary. '.repeat(6).trim()
  const input = [page('/articles/a.html', '中文介绍原机制与边界。'), page('/en/articles/a', long), page('/articles/retired', undefined)]
  const index = buildArticleDescriptions(input, paths)
  assert.equal(descriptionForArticle(index.articles, '/en/articles/a'), long, 'No substring clipping in the data pipeline')
  assert.equal(descriptionForArticle(index.articles, '/articles/a'), '中文介绍原机制与边界。')
  assert.deepEqual(Object.keys(index.articles), paths)
  assert.throws(() => buildArticleDescriptions(input.slice(0, 1), paths), /Missing canonical/)
  assert.throws(() => buildArticleDescriptions([...input, input[0]], paths), /Duplicate article/)
  assert.throws(() => buildArticleDescriptions([page('/articles/a', 'Readable', { draft: true })], paths.slice(0, 1)), /not published/)
  assert.throws(() => buildArticleDescriptions([page('/articles/a', 'Readable', { published: false })], paths.slice(0, 1)), /not published/)
  assert.throws(() => descriptionForArticle(index.articles, '/articles/missing'), /Missing indexed/)
})

test('both lists use the shared source and CSS-only two-line presentation', () => {
  for (const component of ['RecentArticles.vue', 'ChapterCatalog.vue']) {
    const source = readFileSync('.vitepress/theme/' + component, 'utf8')
    assert.ok(source.includes("from './article-descriptions.data'"))
    assert.ok(source.includes("from '../../article-description.mjs'"))
    assert.match(source, /aria-describedby=/)
    assert.match(source, /class="article-list-description"/)
    assert.match(source, /:title="descriptionForArticle\(/)
    assert.ok(!/readingBrief|seoDescription/.test(source))
  }
  const css = readFileSync('.vitepress/theme/custom.css', 'utf8').split('/* List summaries retain')[1]?.split('/* The editorial backlog remains plain')[0]
  assert.ok(css); assert.match(css, /-webkit-line-clamp: 2/); assert.match(css, /line-clamp: 2/)
  assert.ok(!/display:\s*none|visibility:\s*hidden/.test(css))
  assert.deepEqual(compileStyle({ source: '/* List summaries retain' + css, id: 'description-test' }).errors, [])
})

test('actual recent-articles SFC renders full bilingual descriptions and keeps missing-history fallback', async () => {
  const { parse, compileScript } = await import('@vue/compiler-sfc')
  const { build } = await import('esbuild')
  const { createSSRApp, ref } = await import('vue')
  const { renderToString } = await import('@vue/server-renderer')
  const { mkdirSync, writeFileSync } = await import('node:fs')
  const { resolve } = await import('node:path')
  const { pathToFileURL } = await import('node:url')
  const theme = resolve('.vitepress/theme')
  const { descriptor } = parse(readFileSync(resolve(theme, 'RecentArticles.vue'), 'utf8'))
  const compiled = compileScript(descriptor, { id: 'recent-description-test', inlineTemplate: true }).content
  const descriptions = {}, recent = { available: true, zh: [], en: [] }
  for (const [language, prefix] of [['zh', ''], ['en', 'en/']]) for (let index = 0; index < 5; index++) {
    const slug = 'fixture-' + index, href = '/' + prefix + 'articles/' + slug
    descriptions[prefix + 'articles/' + slug + '.md'] = language === 'zh'
      ? '完整的中文测试简介，保留机制、条件与尚未验证的边界，而不是标题截断。' + index
      : 'The complete English fixture describes a mechanism and its qualifications; it is not a clipped title or a claim of verified effects. ' + index
    recent[language].push({ slug, href, title: 'Fixture title ' + index, kind: index ? 'updated' : 'new', timestamp: '2026-01-02T00:00:00Z', date: '2026-01-02' })
  }
  globalThis.__recentDescriptionFixture = { descriptions: { articles: descriptions }, recent, data: { lang: ref('zh-CN') } }
  const bundled = await build({ stdin: { contents: compiled, loader: 'ts', resolveDir: theme }, bundle: true, write: false, platform: 'node', format: 'esm', external: ['vue'], plugins: [{ name: 'recent-description-fixtures', setup(builder) {
    builder.onResolve({ filter: /^(vitepress|\.\/article-descriptions\.data|\.\/recent-articles\.data)$/ }, args => ({ path: args.path, namespace: 'recent-description-fixture' }))
    builder.onLoad({ filter: /.*/, namespace: 'recent-description-fixture' }, args => ({ contents: args.path === 'vitepress'
      ? 'export const useData = () => globalThis.__recentDescriptionFixture.data; export const withBase = p => "/eff-agent-article" + p;'
      : 'export const data = globalThis.__recentDescriptionFixture.' + (args.path.includes('descriptions') ? 'descriptions' : 'recent') + ';' }))
  } }] })
  const cache = resolve('.vitepress/cache'); mkdirSync(cache, { recursive: true })
  const modulePath = resolve(cache, 'recent-description-fixture.mjs'); writeFileSync(modulePath, bundled.outputFiles[0].text)
  const Component = (await import(pathToFileURL(modulePath))).default
  for (const language of ['zh', 'en']) {
    globalThis.__recentDescriptionFixture.data.lang.value = language === 'en' ? 'en-US' : 'zh-CN'
    const html = await renderToString(createSSRApp(Component))
    assert.equal((html.match(/class="article-list-description"/g) || []).length, 5)
    assert.equal((html.match(/<time /g) || []).length, 5)
    for (const entry of recent[language]) {
      assert.ok(html.includes('href="/eff-agent-article' + entry.href + '"'))
      assert.ok(html.includes('aria-describedby="recent-description-' + entry.slug + '"'))
      assert.ok(html.includes(descriptions[entry.href.slice(1) + '.md']))
    }
  }
  recent.available = false; recent.en = []
  const fallback = await renderToString(createSSRApp(Component))
  assert.ok(!fallback.includes('article-list-description'))
  assert.ok(!fallback.includes('<time ')); assert.match(fallback, /Recent updates cannot be confirmed/)
  assert.deepEqual(compileStyle({ source: descriptor.styles[0].content, id: 'recent-description-test', scoped: true }).errors, [])
})
