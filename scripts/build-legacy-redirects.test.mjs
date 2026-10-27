import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { redirectPage, buildRedirects } from './build-legacy-redirects.mjs'

test('old Chinese, English, home and standalone visual paths resolve to the one canonical reader', () => {
  for (const [path, target] of [
    ['index.html', ''],
    ['en/index.html', 'en/'],
    ['articles/memory.html', 'articles/memory'],
    ['en/articles/memory.html', 'en/articles/memory'],
    ['visuals/owner-architecture/index.html', 'visuals/owner-architecture/index.html'],
  ]) {
    const page = redirectPage(path)
    const url = 'https://hpoenixf.com/eff-agent-article/' + target
    assert.ok(page.includes(`rel="canonical" href="${url}"`))
    assert.ok(page.includes('noindex,follow'))
    let destination
    runInNewContext(page.match(/<script>(.*?)<\/script>/)[1], {
      location: {
        search: '?lang=en',
        hash: '#public-code',
        replace: (value) => {
          destination = value
        },
      },
    })
    assert.equal(destination, url + '?lang=en#public-code')
  }
})

test('redirect build copies no article body or JavaScript assets and refuses dirty output', async () => {
  const root = await mkdtemp(resolve('.reader-redirect-test-'))
  try {
    const source = resolve(root, 'source')
    const output = resolve(root, 'redirects')
    await mkdir(resolve(source, 'articles'), { recursive: true })
    await writeFile(resolve(source, 'index.html'), '<p>PRIVATE FIXTURE BODY</p>')
    await writeFile(resolve(source, 'articles/example.html'), '<p>PRIVATE FIXTURE BODY</p>')
    await writeFile(resolve(source, 'asset.js'), 'oldContent()')
    assert.equal(await buildRedirects(source, output), 2)
    assert.ok(
      !(await readFile(resolve(output, 'articles/example.html'), 'utf8')).includes('FIXTURE BODY')
    )
    assert.ok(!(await readdir(output)).includes('asset.js'))
    await assert.rejects(buildRedirects(source, output), /EEXIST/)
  } finally {
    await rm(root, { recursive: true })
  }
})
