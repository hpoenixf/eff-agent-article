import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

// Exercise the actual CI shell block, not a second implementation of the copy.
const workflow = readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8')
const block = workflow.match(/      - name: Include portable visual collection\r?\n        run: \|\r?\n((?:          [^\n]*\n)+)/)?.[1]
assert.ok(block, 'Portable visual collection step must remain present')
const command = block.replace(/^          /gm, '')

function fixture(t, { publicVisuals = false, source = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'article-visual-copy-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  function put(path, content) {
    const target = join(root, path)
    mkdirSync(join(target, '..'), { recursive: true })
    writeFileSync(target, content)
  }
  put('.vitepress/dist/index.html', 'reader home')
  put('.vitepress/dist/articles/017-prompt-to-answer-six-layer-panorama.html', 'article')
  if (source) {
    put('visuals/017-prompt-to-answer-six-layer-panorama/index.html', 'portable collection')
    put('visuals/en/017-prompt-to-answer-six-layer-panorama/index.html', 'English collection')
    put('visuals/.manifest', 'hidden source asset')
  }
  if (publicVisuals) {
    put('.vitepress/dist/visuals/spec/01.svg', '<svg>Chinese figure</svg>')
    put('.vitepress/dist/visuals/en/spec/01.svg', '<svg>English figure</svg>')
  }
  return { root, run: () => spawnSync('bash', ['-e', '-c', command], { cwd: root, encoding: 'utf8' }) }
}

for (const publicVisuals of [false, true]) {
  test(`portable copy merges at the same URL with public assets ${publicVisuals ? 'present' : 'absent'}`, (t) => {
    const { root, run } = fixture(t, { publicVisuals })
    // Repeated execution must not introduce another visuals/ directory.
    for (let i = 0; i < 2; i++) {
      const result = run()
      assert.equal(result.status, 0, result.stderr)
      for (const path of ['017-prompt-to-answer-six-layer-panorama/index.html', 'en/017-prompt-to-answer-six-layer-panorama/index.html', '.manifest']) {
        assert.equal(readFileSync(join(root, '.vitepress/dist/visuals', path), 'utf8'), readFileSync(join(root, 'visuals', path), 'utf8'))
      }
      assert.equal(existsSync(join(root, '.vitepress/dist/visuals/visuals')), false)
      if (publicVisuals) {
        assert.equal(readFileSync(join(root, '.vitepress/dist/visuals/spec/01.svg'), 'utf8'), '<svg>Chinese figure</svg>')
        assert.equal(readFileSync(join(root, '.vitepress/dist/visuals/en/spec/01.svg'), 'utf8'), '<svg>English figure</svg>')
      }
    }
  })
}

test('missing portable source remains a build failure', (t) => {
  const { run } = fixture(t, { publicVisuals: true, source: false })
  assert.notEqual(run().status, 0)
})
