import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { diagramId, findMermaidBlocks, IMAGE_ROOT, escapeAttribute } from '../static-mermaid.mjs'

test('fenced Mermaid source is detected but nested examples are not diagrams', () => {
  const example = [
    '# Article',
    '```js',
    'const documentation = "```mermaid"',
    '```',
    '```mermaid',
    'graph TD',
    '  A --> B',
    '```',
    '~~~~markdown',
    '```mermaid',
    'graph TD',
    '  Wrong --> Wrong',
    '```',
    '~~~~',
    '~~~mermaid',
    'stateDiagram-v2',
    '  A --> B',
    '~~~'
  ].join('\n')
  const blocks = findMermaidBlocks(example)
  assert.equal(blocks.length, 2)
  assert.equal(blocks[0].source, 'graph TD\n  A --> B')
  assert.equal(blocks[1].source, 'stateDiagram-v2\n  A --> B')
})
test('diagram names are content addressed and independent of surrounding prose', () => {
  const a = diagramId('graph TD\nA-->B\n')
  const b = diagramId(' graph TD\nA-->B ')
  assert.equal(a, b)
  assert.notEqual(a, diagramId('graph TD\nA-->C'))
  assert.match(IMAGE_ROOT + a + '.svg', /^\/eff-agent-article\/generated\/mermaid\/[a-f0-9]{24}\.svg$/)
})
test('missing or unfinished fences fail loudly and text attributes are escaped', () => {
  assert.throws(() => findMermaidBlocks('```mermaid\ngraph TD\nA-->B'), /Unclosed/)
  assert.throws(() => findMermaidBlocks('```mermaid\n```'), /Empty/)
  assert.equal(escapeAttribute('a" <b>&'), 'a&quot; &lt;b&gt;&amp;')
})

// Guard the original source of the clipping issue: oversized Mermaid SVGs
// must be fully visible at article width and remain openable at native size.
test('static Mermaid figures fit the reader column and retain a full-size link', () => {
  const config = readFileSync(new URL('../.vitepress/config.mts', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../.vitepress/theme/custom.css', import.meta.url), 'utf8')
  assert.match(config, /class="diagram-original"/)
  assert.match(config, /escapeAttribute\(imageUrl\)/)
  const imageRule = /\.diagram-static img\s*\{([^}]*)\}/.exec(css)?.[1]
  assert.ok(imageRule, 'static diagram image rule must exist')
  assert.match(imageRule, /max-width:\s*100%/)
  assert.match(imageRule, /max-height:\s*none/)
  assert.doesNotMatch(imageRule, /min-width:\s*min\(/)
})
