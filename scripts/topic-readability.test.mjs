import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createMarkdownRenderer } from 'vitepress'
import { parse, compileStyle } from '@vue/compiler-sfc'
const expectations = [
  {
    "path": "en/fintech.md",
    "slugs": [
      "011-model-understands-code-authorizes",
      "030-fintech-from-research-to-investment-advice",
      "031-fintech-data-time-and-reproducible-numbers",
      "agent-numeric-kernel-exact-units-rounding",
      "agent-weekly-thesis-history-continuous-research",
      "financial-agent-python-result-consumption",
      "financial-agent-system-panorama",
      "financial-agent-trustworthy-evidence-chain",
      "investment-perspectives-and-thesis-falsification",
      "mcp-market-responsibility-retrospective",
      "portfolio-mcp-readonly-investment-data",
      "rag-retrieval-evaluation-evidence"
    ],
    "headings": [
      "# Fintech × Agent: From Information Access to Informed Investment Decisions",
      "## A · Financial AI Products and Investors",
      "## B · Research Quality and Strategy Science",
      "## C · Business Accountability and Trustworthy Governance",
      "## D · Institutional Adoption and Business Economics",
      "## How Topics Grow—and Why Some Remain Empty"
    ]
  },
  {
    "path": "en/panorama.md",
    "slugs": [
      "agent-context-governance-actions",
      "agent-context-governance-principles",
      "agent-in-15-minutes"
    ],
    "headings": [
      "# Panorama Series",
      "## Start with Your Current Problem"
    ]
  },
  {
    "path": "fintech.md",
    "slugs": [
      "011-model-understands-code-authorizes",
      "030-fintech-from-research-to-investment-advice",
      "031-fintech-data-time-and-reproducible-numbers",
      "agent-numeric-kernel-exact-units-rounding",
      "agent-weekly-thesis-history-continuous-research",
      "financial-agent-python-result-consumption",
      "financial-agent-system-panorama",
      "financial-agent-trustworthy-evidence-chain",
      "investment-perspectives-and-thesis-falsification",
      "mcp-market-responsibility-retrospective",
      "portfolio-mcp-readonly-investment-data",
      "rag-retrieval-evaluation-evidence"
    ],
    "headings": [
      "# 金融科技 × Agent：从信息获取到可靠的投资判断",
      "## A · 金融 AI 产品与投资者",
      "## B · 投研质量与策略科学",
      "## C · 业务责任与可信治理",
      "## D · 金融机构落地与经营",
      "## 专题满三篇，要不要拆分？"
    ]
  },
  {
    "path": "panorama.md",
    "slugs": [
      "agent-context-governance-actions",
      "agent-context-governance-principles",
      "agent-in-15-minutes"
    ],
    "headings": [
      "# 全景系列",
      "## 按你要解决的问题开始"
    ]
  }
]
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
test('topic cleanup preserves article-tag sources and every original heading anchor', async () => {
  const md = await createMarkdownRenderer(process.cwd())
  const ids = html => [...html.matchAll(/<h[12] id="([^"]+)"/g)].map(match => match[1])
  for (const entry of expectations) {
    const text = read(entry.path)
    const slugs = [...new Set([...text.matchAll(/\]\(\/(?:en\/)?articles\/([^\s)#]+)(?:#[^)]*)?\)/g)].map(match => match[1]))].sort()
    assert.deepEqual(slugs, entry.slugs, entry.path)
    const html = md.render(text)
    const expected = ids(md.render(entry.headings.join('\n\n')))
    for (const id of expected) assert.ok(ids(html).includes(id), entry.path + '#' + id)
    if (entry.path.includes('fintech')) {
      assert.ok(html.includes('<details>'))
      assert.ok(!html.includes('<details open'))
      assert.ok(!html.includes('<table>'))
    } else assert.ok(text.includes('<PanoramaSeries />'))
  }
})
test('Open topic retains readable responsive focus and touch controls', () => {
  const { descriptor } = parse(read('.vitepress/theme/OpenEtfTopic.vue'))
  const css = descriptor.styles[0].content
  assert.deepEqual(compileStyle({ source: css, id: 'data-v-topic-test', scoped: true }).errors, [])
  assert.ok(css.includes('min-height: 44px'))
  assert.ok(css.includes('.oet-topic a:focus-visible'))
  assert.ok(css.includes('.oet-hero h1 { font-size: 32px; }'))
  assert.ok(descriptor.template.content.includes('qualification'))
})
