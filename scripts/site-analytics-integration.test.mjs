import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
test('reader mounts one analytics owner and resolves real runtime import', async () => {
  const entry = await readFile(new URL('../.vitepress/theme/index.ts', import.meta.url), 'utf8')
  const vue = new URL('../.vitepress/theme/SiteAnalytics.vue', import.meta.url)
  const source = await readFile(vue, 'utf8')
  assert.equal((entry.match(/h\(SiteAnalytics\)/g) || []).length, 1)
  assert.match(source, /watch\(\(\) => route.path/)
  await access(new URL(source.match(/from '([^']+site-analytics.mjs)'/)[1], vue))
})
