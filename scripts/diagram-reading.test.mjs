import test from 'node:test'
import assert from 'node:assert/strict'
import {
  readableRelations,
  diagramDimensions,
  needsReadableRelations,
  renderRelations,
} from '../diagram-reading.mjs'

test('diagram reading projection preserves semantics and rejects unknown grammar', () => {
  const relation = readableRelations(
    'graph TD\nA["原问题"] --> B{"可接受?"}\nB -- 否 --> C[拒绝]\nB -->|是| D[处理]\nD -. 原身份 .-> A'
  )
  assert.equal(relation.supported, true)
  assert.deepEqual(relation.edges, [
    { from: 'A', to: 'B', condition: '', kind: 'solid' },
    { from: 'B', to: 'C', condition: '否', kind: 'solid' },
    { from: 'B', to: 'D', condition: '是', kind: 'solid' },
    { from: 'D', to: 'A', condition: '原身份', kind: 'dashed' },
  ])
  assert.equal(relation.nodes.find((x) => x.id === 'B').kind, 'decision')
  assert.equal(relation.nodes.find((x) => x.id === 'A').label, '原问题')
  const grouped = readableRelations(
    'flowchart LR\nsubgraph Inputs["原输入条件"]\ndirection TB\nA[读取] --> B[核对]\nend\nB ==> C[保留]'
  )
  assert.equal(grouped.supported, true)
  assert.deepEqual(grouped.groups, ['原输入条件'])
  assert.equal(grouped.nodes.find((x) => x.id === 'A').group, '原输入条件')
  assert.equal(grouped.edges[1].kind, 'thick')
  const state = readableRelations(
    'stateDiagram-v2\n[*] --> submitted\nsubmitted --> accepted: 外部确认受理\naccepted --> [*]'
  )
  assert.equal(state.supported, true)
  assert.equal(state.edges[1].condition, '外部确认受理')
  for (const input of [
    'sequenceDiagram\nA->>B: hi',
    'flowchart TD\nA-->B\nclick A callback',
    'graph TD\nA & B --> C',
    'graph TD\nA-->B\nclassDef x fill:red',
    'graph TD\nsubgraph X\nA-->B',
    'graph TD\nA[原]-->B\nA[新]-->C',
  ])
    assert.equal(readableRelations(input).supported, false, input)
  assert.equal(
    readableRelations('%%{init: {"flowchart": {"curve": "step"}}}%%\ngraph TD\n原输入 --> 原回执')
      .supported,
    true
  )
  assert.equal(
    readableRelations('%%{init: {"securityLevel":"loose"}}}%%\ngraph TD\nA-->B').supported,
    false
  )
  assert.notEqual(state.edges[0].from, state.edges[2].to)
  const html = renderRelations(
    readableRelations('graph TD\nA["<script>alert(1)</script>"] --> B["{{code}}"]')
  )
  assert.ok(!html.includes('<script>') && !html.includes('{{code}}'))
  assert.ok(html.includes('&lt;script&gt;') && html.includes('&#123;'))
  assert.deepEqual(diagramDimensions('<svg viewBox="0 0 100 200">'), { width: 100, height: 200 })
  assert.equal(needsReadableRelations({ width: 1200, height: 800 }), true)
  assert.equal(needsReadableRelations({ width: 200, height: 300 }), false)
  assert.equal(
    readableRelations(
      'graph TD\nA-->B\nclassDef default fill:#FFFFFF,stroke:#A3B9C7,stroke-width:1.5px,color:#193649;\nlinkStyle default stroke:#517A8D,stroke-width:1.8px;'
    ).supported,
    true
  )
  assert.equal(
    readableRelations('graph TD\nA-->B\nlinkStyle default stroke-dasharray:4 4;').supported,
    false
  )
  assert.equal(
    readableRelations('graph TD\nA-->B\n%%{init: {"securityLevel":"loose"}}%%').supported,
    false
  )

  assert.deepEqual(
    readableRelations('graph TD\n原-input-->B').edges,
    readableRelations('graph TD\n原-input --> B').edges
  )
  assert.equal(readableRelations('graph TD\n原-input-->B').supported, true)
  for (const arrow of ['-->', '-.->', '==>', '---', '-->|条件|']) {
    const compact = readableRelations('graph TD\n原-input' + arrow + '目标-output')
    const spaced = readableRelations('graph TD\n原-input ' + arrow + ' 目标-output')
    assert.equal(compact.supported, true, arrow)
    assert.deepEqual(compact.edges, spaced.edges, arrow)
  }
  assert.equal(readableRelations('graph TD\nA -- condition --> B').edges[0].condition, 'condition')
  assert.equal(readableRelations('graph TD\nA -. condition .-> B').edges[0].kind, 'dashed')
  assert.equal(readableRelations('graph TD\nA -- condition ==> B').supported, false)
})
