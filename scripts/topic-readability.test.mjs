import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createMarkdownRenderer } from 'vitepress'
import { parse, compileStyle } from '@vue/compiler-sfc'
const expectations = [
  {
    "path": "en/fintech.md",
    "slugs": [
      "011-model-understands-code-authorizes",
      "030-fintech-from-research-to-investment-advice",
      "031-fintech-data-time-and-reproducible-numbers",
      "agent-deterministic-fund-allocation",
      "agent-atomic-portfolio-report-production",
      "agent-numeric-kernel-exact-units-rounding",
      "agent-weekly-thesis-history-continuous-research",
      "financial-agent-python-result-consumption",
      "financial-agent-system-panorama",
      "financial-agent-trustworthy-evidence-chain",
      "financial-business-agent-trusted-handoff",
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
      "agent-in-15-minutes",
      "agent-trust-from-claims-to-commitments",
      "rag-end-to-end-system-panorama"
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
      "agent-deterministic-fund-allocation",
      "agent-atomic-portfolio-report-production",
      "agent-numeric-kernel-exact-units-rounding",
      "agent-weekly-thesis-history-continuous-research",
      "financial-agent-python-result-consumption",
      "financial-agent-system-panorama",
      "financial-agent-trustworthy-evidence-chain",
      "financial-business-agent-trusted-handoff",
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
      "agent-in-15-minutes",
      "agent-trust-from-claims-to-commitments",
      "rag-end-to-end-system-panorama"
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
    if (entry.path.includes('fintech')) {
      const { financeTopicGroups } = await import('../finance-topic-groups.mjs')
      const grouped = Object.values(financeTopicGroups).flat()
      assert.deepEqual(grouped.slice().sort(), [...entry.slugs, 'vertical-financial-agent-principles-panorama', 'etf-agent-framework-comparison-panorama'].sort())
      assert.deepEqual(slugs, [], 'No duplicate static article list')
    } else assert.deepEqual(slugs, entry.slugs, entry.path)
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

// Editorial invariants, not a second runtime source: the Markdown owns all rows.
// A layout refactor must not change the question, topic, material, state or queue.
const expected = {
  "financial-research-backlog.md": {
    "items": [
      {
        "id": "F01",
        "code": "B3",
        "hash": "27dcd09ea63d5010240e7a9171bfb147f439542f1363cc86efaa64cc7f0438d8",
        "priority": "P0"
      },
      {
        "id": "F02",
        "code": "D1",
        "hash": "248484c29a3b8e7886d0219e11548298c4c7c7c81cafd7dc805bd7cfeba08b03",
        "priority": "P0"
      },
      {
        "id": "F03",
        "code": "C4",
        "hash": "329aba5fed50f0106bb5b08f0927ee3bd03552eb986bc98946271376dd14237a",
        "priority": "P0"
      },
      {
        "id": "F04",
        "code": "C4",
        "hash": "db915a4bb0ad2b08fdf38ce22c705db33de2b3dcb0d6ed16102d54bf532fad57",
        "priority": "P0"
      },
      {
        "id": "F05",
        "code": "A2",
        "hash": "b3e17dac910c3a628d3dfcd52b403fa4c6a302f0dac7fcd7a3f13aff886ca29a",
        "priority": "P0"
      },
      {
        "id": "F06",
        "code": "A3",
        "hash": "45609c73fa3ad0a8e9652a37dbf9a4b1bd32405e4134d5004b722fbde1fab3b6",
        "priority": "P0"
      },
      {
        "id": "F07",
        "code": "B1",
        "hash": "e1e76df56d2772a9dde0fd35b88a2d4a83ec6b945e2adedb8e74a038d30375d0",
        "priority": "P1"
      },
      {
        "id": "F08",
        "code": "B4",
        "hash": "cba157958b97f2e3bd9edcb1c3ba2fc124654549544066a6a4de2016f1f7a99b",
        "priority": "P1"
      },
      {
        "id": "F09",
        "code": "A1",
        "hash": "08384395900cdff0d0b030a1b2b846f6f0892545a22af404237fc21455a7a51f",
        "priority": "P1"
      },
      {
        "id": "F10",
        "code": "D4",
        "hash": "008ff927b162d17328234079fc5bacbdb536778d5a41a9c6d909e57cf498c7de",
        "priority": "P1"
      },
      {
        "id": "F11",
        "code": "D3",
        "hash": "849d6a125081d781f0e91d6883470bf7381218b1b9224ed6340a7dcf04e1c861",
        "priority": "P1"
      },
      {
        "id": "F12",
        "code": "B4",
        "hash": "0dcb135ab6a7dadaf1aba6e355fc5bdf071973c5343b6deb20d41ca4e3509e91",
        "priority": "P1"
      },
      {
        "id": "F13",
        "code": "D2",
        "hash": "2e10c133e3a2cffd383524c9dbef7da54c49a4887805f2cd7af1cf01ea40bf17",
        "priority": "P1"
      },
      {
        "id": "F14",
        "code": "C1",
        "hash": "527eb0a661e5988dac130f69129d65dd30530a0aaf047476e723ccbd9a9e4e3e",
        "priority": "P1"
      },
      {
        "id": "F15",
        "code": "A3",
        "hash": "21bc56534d1b0ded31f47a6828d948ea062becbdbcab5421b55a3dd4fa530a67",
        "priority": "P1"
      }
    ],
    "headings": [
      "P0 · 优先深化与取证",
      "P1 · 值得规划的研究",
      "第一批攻克顺序",
      "三篇行业材料贡献了哪些研究线索？",
      "每项研究的完成条件"
    ],
    "linksHash": "491ce83ac4623909996f66e265c56eb8c2ef36923c958ab77b86089390290e4d",
    "protected": [
      "[金融专题精选](/fintech)负责展示**已经有深度文章**的问题；本清单只记录**还要研究什么、缺少什么资料、有哪些不同观点**，是唯一的编辑选题索引。",
      "研究状态依次为：**待取证 → 研究中 → 形成论点 → 编辑决策 → 深化旧稿／独立新稿／暂缓**。只有实际开始攻克一个题目时才开 GitHub Issue，不给所有候选预建空任务；研究完成不必产出文章。产品功能改动才进入 ETF Agent 独立的工程 OpenSpec。",
      "**F01 → F02 → F09 → F13** 是编辑优先级，不是任务依赖，也不是四篇新文章的发表承诺。",
      "第一项任务已建：[F01 · 怎样证明一次投资研究真正有效（Issue #12）](https://github.com/hpoenixf/eff-agent-article/issues/12)。先使用“多只 AI 行业基金是否重复集中，应维持还是调整”的完整金融问题，区分数据可靠、方法适用、反证和决策帮助。结束时产出有来源的研究笔记与编辑判断，不要求立即写新文。",
      "- **《券商APP里那些AI功能，到底能干什么、不能干什么》：** F09、F14、F15；产品功能、投资者理解、信息与判断的关系。\n- **《AI炒股亏损潮的真相：拿到了工具，没拿到工序》：** F02、F06、F08、F12、F15；错误资产、护栏和复盘、回测与同质化。\n- **《券商AI落地的真相：喊“拥抱”的人多，想清楚的人少》：** F03、F09、F11、F13、F14；场景 ROI、专业评测、实质复核、员工端和业务准入。",
      "这些用户提供的行业文章属于**研究线索**，不是已经核验的收益统计或监管原文。机构与散户胜率对比、所谓零幻觉、备案范围及统一留痕期限等说法，发表前需核对原始数据、监管对象、时点及地域。",
      "完成一份独立可读的研究记录：明确金融问题、资料来源及日期、方法与适用条件、反例、一个贯穿案例、与已有文章的差异和未解决事项。最终明确选择**深化旧稿、独立新稿或暂缓**。新稿才进入中英文完整正文、目录及站点同步。**工程实现、局部测试、投资收益和合规认证是不同事实，不能用测试数字冒充金融论证。**",
      "每个二级专题最多精选三篇；满额先核查重复与质量，只在专业问题真正分化时拆分。文章正文依然只在 [唯一正式目录](/catalog) 登记一次。",
      "[返回金融专题](/fintech) · [写作预告](/roadmap) · [文章目录](/catalog)\n"
    ]
  },
  "en/financial-research-backlog.md": {
    "items": [
      {
        "id": "F01",
        "code": "B3",
        "hash": "6731062f76c75368e55574de72dc6cc8d51c4a6c36ae831413c7e7eb6f490f28",
        "priority": "P0"
      },
      {
        "id": "F02",
        "code": "D1",
        "hash": "b848d8778df426b68d7877529ff52d200a619e6bfc1f860c4af75c8f6c5f9296",
        "priority": "P0"
      },
      {
        "id": "F03",
        "code": "C4",
        "hash": "c323942fc8436af4e8728df8dcb26407ff95e80cbc66db84e6975b8daf529ab4",
        "priority": "P0"
      },
      {
        "id": "F04",
        "code": "C4",
        "hash": "12e5a8c485f93f1ea4549bb8c4d710be283ddc58fee16c63b9afacc8a56ea099",
        "priority": "P0"
      },
      {
        "id": "F05",
        "code": "A2",
        "hash": "cf23637b6a21321a76d3c932281e233d5d5b686e0e7329c27e92cbbc1f008549",
        "priority": "P0"
      },
      {
        "id": "F06",
        "code": "A3",
        "hash": "3725e4e449eeecaf498f0d1e5ac39de642946e25285267b116501db80b9d36ea",
        "priority": "P0"
      },
      {
        "id": "F07",
        "code": "B1",
        "hash": "4de8fbffc2f163d1552ab58630aa4af92ec1775a174a28b6caede7de4587e9cf",
        "priority": "P1"
      },
      {
        "id": "F08",
        "code": "B4",
        "hash": "b522de2c6967bcae1eeb6a9365194c0c9769b72333bb78c8a3a379d36595c129",
        "priority": "P1"
      },
      {
        "id": "F09",
        "code": "A1",
        "hash": "4afb36d3fd246d285c8ca7a2dcf0066be58bab2bf6175acfa35f25aa51d6fd07",
        "priority": "P1"
      },
      {
        "id": "F10",
        "code": "D4",
        "hash": "4779c60a9dbc558f61da93bc221c71ae0ed8fd0dca784ff1ec85ef4a29f0148c",
        "priority": "P1"
      },
      {
        "id": "F11",
        "code": "D3",
        "hash": "71da22a0971d23b446604be23e852c16657ced70c34ab9dab36a3b7c7b65773b",
        "priority": "P1"
      },
      {
        "id": "F12",
        "code": "B4",
        "hash": "cf95c6f91ba6d8c4333ee3b2bd99d2b7d84fd31a09f56f58a7b647ab4693ed71",
        "priority": "P1"
      },
      {
        "id": "F13",
        "code": "D2",
        "hash": "41202c20fd72055a4726eba9143748f7e3281d850a4df4ec27563ee1f5207636",
        "priority": "P1"
      },
      {
        "id": "F14",
        "code": "C1",
        "hash": "fcd83d98640b1f2ff358fd6dbf63425f147fcbc9950cf37a20df837f959fff46",
        "priority": "P1"
      },
      {
        "id": "F15",
        "code": "A3",
        "hash": "f85d37fae08c434c1d297bbd5658cab71149c8051051a3b8802eb59fedd5b551",
        "priority": "P1"
      }
    ],
    "headings": [
      "P0 · Priority Research",
      "P1 · Research Pipeline",
      "Initial Research Queue",
      "What We Took from Three Industry Essays",
      "Exit Criteria for Each Task"
    ],
    "linksHash": "3b9b7c9d3e46ec77e449cb0830d60bd222b09d348919483aaf2437503420138e",
    "protected": [
      "The [curated finance topics](/en/fintech) show what is already worth reading. This backlog records **questions still needing evidence, method, cases and opposing views**. It is the only editorial topic register: open an Issue when a topic is actively researched, rather than opening fifteen empty tasks.",
      "Research states: **evidence needed → researching → thesis formed → editorial decision → deepen / publish separately / defer**. A completed study need not become an essay. Product changes, if any, belong to ETF Agent's separate engineering OpenSpec. Source dates, financial definitions, jurisdiction and uncertain findings must be preserved.",
      "**F01 → F02 → F09 → F13** is the editorial priority, not a dependency chain or a commitment to publish four essays.",
      "The first actionable item is [F01 · When is an AI investment study genuinely useful? (Issue #12)](https://github.com/hpoenixf/eff-agent-article/issues/12). Use a worked case: whether multiple AI-sector funds cause overlapping exposure and whether the evidence supports holding, adjusting or waiting. A valid deliverable is a sourced research note with methodology, counterexamples, limits and an editorial decision—**not a new publication by default**.",
      "- **“What AI Features in Brokerage Apps Can and Cannot Do”** raises F09/F14/F15: product functionality, service boundaries and investor reliance.\n- **“AI Trading Losses: Tools Without Work Processes”** raises F02/F06/F08/F12/F15: domain error sets, guards, evidence, investor reviews, strategy tests and correlated judgments.\n- **“Why AI Adoption in Brokerages Is Harder Than Saying Yes”** raises F03/F09/F11/F13/F14: business ROI, domain evaluation, substantial human review, employee workflows and approvals.",
      "These user-provided industry essays are **research starting points**, not verified original statistics or regulations. Do not repeat claimed investor or institutional win rates, universal retention periods, filing rules or guaranteed monitoring accuracy without primary-source verification.",
      "Deliver a self-contained note with the question, dated references, financial definitions, competing explanations, one worked example, verified versus unknown claims and overlap with existing essays. End with an explicit **deepen / new essay / defer** decision. If a new essay is warranted, produce and validate both complete language versions under the existing publishing workflow. Tests or tool-call counts do not replace financial reasoning.",
      "[Finance topics](/en/fintech) · [Writing roadmap](/en/roadmap) · [Catalog](/en/catalog)\n"
    ]
  }
}
const sha = value => createHash('sha256').update(value).digest('hex')

test('bilingual backlog keeps every research question, priority, topic, material and pending state', async () => {
  const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code })
  for (const [path, baseline] of Object.entries(expected)) {
    const english = path.startsWith('en/'), source = read(path)
    const items = [...source.matchAll(/<article class="financial-research-item" aria-labelledby="(f\d\d)">([\s\S]*?)<\/article>/g)]
    assert.equal(items.length, 15)
    for (const [index, match] of items.entries()) {
      const entry = baseline.items[index], body = match[2]
      const heading = /### (F\d\d) · (.+) \{#(f\d\d)\}/.exec(body)
      assert.ok(heading); assert.equal(heading[1], entry.id); assert.equal(heading[3], match[1])
      const code = /<p class="research-item-code">(?:Topic|专题) ([A-D]\d)<\/p>/.exec(body)
      const question = body.split('</p>\n\n')[1].split('\n\n<div')[0]
      const material = /\*\*(?:Existing material:|既有材料：)\*\* ([\s\S]*?)\n\n<\/div>/.exec(body)[1]
      assert.equal(code[1], entry.code)
      assert.equal(sha([entry.id, heading[2], code[1], question, material].join('\n')), entry.hash, path + ': ' + entry.id)
      assert.ok(body.includes('<span class="research-item-state">' + (english ? 'Evidence needed' : '待取证') + '</span>'))
      const start = source.indexOf(match[0])
      assert.equal(source.slice(0, start).lastIndexOf('## P0') > source.slice(0, start).lastIndexOf('## P1') ? 'P0' : 'P1', entry.priority)
    }
    for (const heading of baseline.headings) assert.ok(source.includes('## ' + heading))
    for (const paragraph of baseline.protected) assert.ok(source.includes(paragraph), path + ': original qualification or source paragraph changed')
    assert.equal(sha([...source.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]).sort().join('\n')), baseline.linksHash)
    assert.ok(source.indexOf('F01 → F02 → F09 → F13') < source.indexOf('## P0'))
    const html = md.render(source)
    assert.equal((html.match(/<h1\b/g) || []).length, 1)
    assert.equal((html.match(/<article class="financial-research-item"/g) || []).length, 15)
    assert.ok(!html.includes('<table'))
    assert.ok(html.includes('id="' + (english ? 'financial-ai-articles-research-backlog' : '金融-ai-深度文章-research-backlog') + '"'))
    assert.ok(html.includes('id="f15"'))
  }
})

test('backlog styling stays within its page and avoids fixed-width cards', () => {
  const css = read('.vitepress/theme/custom.css').split('/* The editorial backlog remains plain')[1]
  assert.ok(css)
  assert.deepEqual(compileStyle({ source: '/* The editorial backlog remains plain' + css, id: 'backlog-test' }).errors, [])
  for (const match of css.replace(/^[\s\S]*?\*\//, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (match[1].trim().startsWith('@')) continue
    assert.ok(match[1].trim().split(',').every(selector => selector.trim().startsWith('.financial-backlog')), match[1])
  }
  assert.ok(!/min-width:|grid-template-columns:/.test(css))
})
