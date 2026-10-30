// Deliberately small, fail-closed grammar. Unsupported Mermaid is never guessed.
// This projection changes presentation only; the original diagram stays available.
export function readableRelations(source) {
  const lines = source.trim().split(/\r?\n/)
  // Only this exact layout-only directive is accepted, never arbitrary init configuration.
  if (lines[0]?.trim() === '%%{init: {"flowchart": {"curve": "step"}}}%%') lines.shift()
  const header = lines.shift()?.trim() || ''
  const graph = /^(?:graph|flowchart)\s+(TD|TB|LR|RL|BT)$/.test(header)
  const state = header === 'stateDiagram-v2'
  if (!graph && !state) return { supported: false, reason: 'diagram-kind' }
  const nodes = new Map()
  const edges = []
  const groups = []
  const stack = []
  const notes = []
  const fail = (line) => ({ supported: false, reason: 'unsupported-syntax', line })
  const label = (text) =>
    text
      .replace(/^"(.*)"$/, '$1')
      .replace(/\\"/g, '"')
      .replace(/<br\s*\/?\s*>/gi, '\n')

  function node(text, role = 'source') {
    const match = /^(\[\*\]|[\p{L}_](?:[\p{L}\p{N}_]|-(?![-.>]))*)/u.exec(text)
    if (!match) return null
    const marker = match[1]
    const boundary = state && marker === '[*]'
    const id = boundary ? (role === 'target' ? '__mermaid_end__' : '__mermaid_start__') : marker
    let tail = text.slice(marker.length)
    let display = marker
    let kind = boundary ? (role === 'target' ? 'end' : 'start') : 'node'
    let explicit = false
    for (const [open, close, shape] of [
      ['[', ']', 'node'],
      ['{', '}', 'decision'],
      ['(', ')', 'node'],
    ]) {
      if (!tail.startsWith(open)) continue
      const escaped = open === '[' ? '\\[' : open === '(' ? '\\(' : '\\{'
      const end = close === ']' ? '\\]' : close === ')' ? '\\)' : '\\}'
      const quoted = new RegExp('^' + escaped + '"((?:\\\\.|[^"\\\\])*)"' + end).exec(tail)
      const plain = new RegExp('^' + escaped + '([^\\[\\]{}()]*)' + end).exec(tail)
      const found = quoted || plain
      if (!found || /`|&(?:#|[A-Za-z])/.test(found[1])) return null
      display = label(found[1])
      explicit = true
      kind = shape
      tail = tail.slice(found[0].length)
      break
    }
    const prior = nodes.get(id)
    if (prior?.explicit && explicit && prior.label !== display) return null
    nodes.set(id, {
      id,
      label: explicit ? display : prior?.label || display,
      kind: explicit ? kind : prior?.kind || kind,
      explicit: explicit || prior?.explicit || false,
      group: prior?.group || stack.join(' / '),
    })
    return { id, tail: tail.trimStart() }
  }

  for (let index = 0; index < lines.length; index++) {
    const original = lines[index].trim()
    const line = original.replace(/;$/, '')
    if (!line) continue
    // These two exact legacy defaults style every node/edge alike; no semantic
    // classes, edge selection, dash patterns or individual overrides are ignored.
    if (
      line === 'classDef default fill:#FFFFFF,stroke:#A3B9C7,stroke-width:1.5px,color:#193649' ||
      line === 'linkStyle default stroke:#517A8D,stroke-width:1.8px'
    )
      continue
    if (line.startsWith('%%{')) return fail(index + 2)
    if (line.startsWith('%%')) {
      notes.push(line.slice(2).trim())
      continue
    }
    if (graph && /^subgraph\s+/.test(line)) {
      const group = /^subgraph\s+([A-Za-z_][\w-]*)(?:\["([^"\n]+)"\])?$/.exec(line)
      if (!group) return fail(index + 2)
      const name = group[2] || group[1]
      stack.push(name)
      groups.push(stack.join(' / '))
      continue
    }
    if (graph && line === 'end') {
      if (!stack.length) return fail(index + 2)
      stack.pop()
      continue
    }
    if (graph && /^direction\s+(TD|TB|LR|RL|BT)$/.test(line)) {
      if (!stack.length) return fail(index + 2)
      continue
    }
    if (state && /^state\s+"/.test(line)) {
      const declaration = /^state\s+"([^"\n]+)"\s+as\s+([A-Za-z_][\w-]*)$/.exec(line)
      if (!declaration || !node(declaration[2] + '["' + declaration[1] + '"]'))
        return fail(index + 2)
      continue
    }
    let from = node(line)
    if (!from) return fail(index + 2)
    if (!from.tail) continue
    while (from.tail) {
      let tail = from.tail
      let condition = ''
      let kind = 'solid'
      let arrow = /^(-->|-\.->|==>|---)/.exec(tail)
      if (arrow) {
        kind =
          arrow[1] === '-.->'
            ? 'dashed'
            : arrow[1] === '==>'
              ? 'thick'
              : arrow[1] === '---'
                ? 'undirected'
                : 'solid'
        tail = tail.slice(arrow[0].length).trimStart()
        if (tail.startsWith('|')) {
          const value = /^\|([^|]*)\|/.exec(tail)
          if (!value) return fail(index + 2)
          condition = label(value[1])
          tail = tail.slice(value[0].length).trimStart()
        }
      } else {
        arrow = /^(--|\-\.|==)\s+(.+?)\s+(-->|\.->|==>)/.exec(tail)
        if (
          !arrow ||
          (arrow[1] === '--' && arrow[3] !== '-->') ||
          (arrow[1] === '-.' && arrow[3] !== '.->') ||
          (arrow[1] === '==' && arrow[3] !== '==>')
        )
          return fail(index + 2)
        condition = label(arrow[2])
        kind = arrow[1] === '-.' ? 'dashed' : arrow[1] === '==' ? 'thick' : 'solid'
        tail = tail.slice(arrow[0].length).trimStart()
      }
      const to = node(tail, 'target')
      if (!to) return fail(index + 2)
      if (state && to.tail.startsWith(':')) {
        condition = to.tail.slice(1).trim()
        to.tail = ''
      }
      edges.push({ from: from.id, to: to.id, condition, kind })
      from = to
    }
  }
  if (stack.length || !edges.length) return fail(lines.length + 1)
  return { supported: true, nodes: [...nodes.values()], edges, groups, notes }
}

export function relationSections(result) {
  if (!result.supported) return []
  return result.nodes.map((node) => ({
    ...node,
    edges: result.edges.filter((edge) => edge.from === node.id),
  }))
}

export function diagramDimensions(svg) {
  const value = /<svg\b[^>]*\bviewBox=["']([^"']+)["']/i
    .exec(svg)?.[1]
    ?.trim()
    .split(/[ ,]+/)
    .map(Number)
  return value?.length === 4 && value.every(Number.isFinite) && value[2] > 0 && value[3] > 0
    ? { width: value[2], height: value[3] }
    : null
}

// 311px usable space is the 375px reading target after ordinary side padding.
// Geometry only selects a text alternative. It never claims visual acceptance.
export function needsReadableRelations(size) {
  return Boolean(size && Math.min(1, 311 / size.width, 530 / size.height) * 16 < 12)
}

export function renderRelations(result, english = false) {
  if (!result.supported) return ''
  const escape = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;')
  const nodes = new Map(result.nodes.map((node) => [node.id, node]))
  const kindLabel = {
    decision: english ? 'decision' : '判断',
    start: english ? 'start' : '起点',
    end: english ? 'end' : '终点',
  }
  const text = (node) =>
    escape(node.label) + (kindLabel[node.kind] ? ' (' + kindLabel[node.kind] + ')' : '')
  const kind = {
    solid: '',
    dashed: english ? 'dashed relation' : '虚线关系',
    thick: english ? 'thick arrow' : '加粗箭头',
    undirected: english ? 'undirected relation' : '无方向关系',
  }
  const sections = relationSections(result).filter(
    (node) => node.edges.length || !result.edges.some((edge) => edge.to === node.id)
  )
  let output =
    '<section class="diagram-relations" aria-label="' +
    (english ? 'Diagram relationships and conditions' : '图中关系与条件') +
    '"><p class="diagram-relations-intro">' +
    (english
      ? 'Read the relationships in groups; the complete diagram remains available below.'
      : '按起点分组阅读关系与条件；完整图保留在下方。') +
    '</p><div class="diagram-relations-grid">'
  for (const section of sections) {
    output += '<section class="diagram-relation-card">'
    if (section.group)
      output += '<p class="diagram-relation-group">' + escape(section.group) + '</p>'
    output += '<strong>' + text(section) + '</strong><ul>'
    for (const edge of section.edges) {
      const target = nodes.get(edge.to)
      output +=
        '<li>' +
        (edge.condition ? '<b>' + escape(edge.condition) + '</b> ' : '') +
        (edge.kind === 'undirected' ? '— ' : '→ ') +
        text(target)
      if (target.group && target.group !== section.group)
        output += ' <small>〔' + escape(target.group) + '〕</small>'
      if (kind[edge.kind]) output += ' <small>[' + kind[edge.kind] + ']</small>'
      output += '</li>'
    }
    if (!section.edges.length)
      output +=
        '<li>' +
        (english ? 'Independent node; no edge is drawn.' : '独立节点；原图未绘制连线。') +
        '</li>'
    output += '</ul></section>'
  }
  return output + '</div></section>'
}
