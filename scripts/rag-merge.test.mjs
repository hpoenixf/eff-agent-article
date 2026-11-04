import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { createMarkdownRenderer } from 'vitepress'
import { chapters, mergedArticles, panoramaSeriesSlugs } from '../book.mjs'
import { englishArticleSlugs } from '../book.en.mjs'
import { canonicalUrl, isLegacyArticleRoute, filterSitemapItems } from '../seo-routes.mjs'

const oldSlug = 'rag-end-to-end-system-panorama'
const target = 'agent-knowledge-retrieval-end-to-end'
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const expected = {
  "zh": {
    "all": [
      "知识检索-一段文档怎样成为可引用、可撤权的研究证据",
      "一、先分清四件容易混淆的事",
      "二、离线链路-为什么要先审材料-再建立索引",
      "_1-来源准入先于文本提取",
      "_2-解析、切块要保住限定条件",
      "_3-更新不是-把旧行覆盖掉",
      "三、在线链路-从用户问题到候选片段-谁决定什么",
      "_1-host-允许查询-不等于模型一定调用",
      "_2-硬过滤必须发生在-top-k-之前",
      "_3-为什么需要两路召回与-rrf",
      "_4-取相邻上下文不是扩大引用范围的许可证",
      "四、候选进入模型-怎样才算变成证据",
      "五、没有答案时-先找到-最早丢失证据-的阶段",
      "六、怎样从这篇文章走到一个可运行的最小实现",
      "七、最后一个架构判断-不要再造一个包办研究的-rag-manager",
      "rag-全链路全景-从知识入库到可信回答-一套-agent-检索系统如何工作",
      "一、先建立全景-一条问题链-四种不同的工作",
      "二、知识进入系统之前-先回答-我们究竟拥有什么",
      "一份报告有三种身份",
      "解析覆盖比-chunk-数量更重要",
      "更新是一个有条件的状态变化",
      "三、在线查询不是-拿用户输入去搜全库",
      "权限过滤为什么应在-top-k-之前",
      "词法、向量、融合和精排解决的是不同问题",
      "四、最容易消失的不是-chunk-而是-模型实际看到它-的事实",
      "外置结果尤其容易制造-读过了-的假象",
      "一条答案里-哪些部分真的能说",
      "五、模型读过之后-资料仍可能失去披露资格",
      "六、四条链路怎样分工-而不是造一个包办一切的-rag-manager",
      "七、评测要沿-证据第一次在哪儿丢失-展开",
      "八、什么时候采用完整-rag-什么时候应该主动保持简单",
      "九、重新走完那份-2023-年公告研究"
    ],
    "panorama": [
      "rag-全链路全景-从知识入库到可信回答-一套-agent-检索系统如何工作",
      "一、先建立全景-一条问题链-四种不同的工作",
      "二、知识进入系统之前-先回答-我们究竟拥有什么",
      "一份报告有三种身份",
      "解析覆盖比-chunk-数量更重要",
      "更新是一个有条件的状态变化",
      "三、在线查询不是-拿用户输入去搜全库",
      "权限过滤为什么应在-top-k-之前",
      "词法、向量、融合和精排解决的是不同问题",
      "四、最容易消失的不是-chunk-而是-模型实际看到它-的事实",
      "外置结果尤其容易制造-读过了-的假象",
      "一条答案里-哪些部分真的能说",
      "五、模型读过之后-资料仍可能失去披露资格",
      "六、四条链路怎样分工-而不是造一个包办一切的-rag-manager",
      "七、评测要沿-证据第一次在哪儿丢失-展开",
      "八、什么时候采用完整-rag-什么时候应该主动保持简单",
      "九、重新走完那份-2023-年公告研究"
    ]
  },
  "en": {
    "all": [
      "knowledge-retrieval-how-does-a-document-become-citable-revocable-research-evidence",
      "_1-four-entities-that-must-not-be-collapsed",
      "_2-offline-why-review-the-material-before-indexing-it",
      "source-admission-precedes-extraction",
      "parsing-and-chunking-must-retain-qualifying-clauses",
      "updating-a-source-is-not-overwriting-an-old-row",
      "_3-online-who-chooses-what-between-a-question-and-its-candidates",
      "authorization-to-use-a-tool-is-not-evidence-that-it-was-invoked",
      "hard-restrictions-belong-before-top-k",
      "why-lexical-retrieval-vectors-and-rrf-belong-together",
      "reading-neighboring-chunks-does-not-expand-an-existing-citation",
      "_4-when-does-a-candidate-actually-become-evidence-for-the-model",
      "_5-no-answer-find-the-earliest-point-where-usable-evidence-disappeared",
      "_6-from-this-architecture-to-one-runnable-minimum",
      "_7-the-architectural-trap-inventing-a-rag-manager-that-owns-everything",
      "the-full-rag-lifecycle-from-knowledge-ingestion-to-a-trustworthy-agent-answer",
      "_1-the-big-picture-one-user-question-four-kinds-of-work",
      "_2-before-knowledge-enters-the-system-what-do-we-actually-possess",
      "a-report-has-three-distinct-identities",
      "extraction-coverage-matters-more-than-the-number-of-chunks",
      "updating-a-source-is-a-conditional-state-change",
      "_3-an-online-query-is-not-search-the-user-s-text-across-everything",
      "why-hard-filters-must-precede-top-k",
      "lexical-search-vectors-fusion-and-reranking-solve-different-problems",
      "_4-what-often-disappears-is-proof-that-the-model-actually-saw-the-chunk",
      "externalized-results-make-the-model-read-it-especially-easy-to-overclaim",
      "which-parts-of-an-answer-are-genuinely-supported",
      "_5-a-document-can-lose-disclosure-eligibility-after-the-model-has-read-it",
      "_6-divide-responsibilities-rather-than-invent-a-rag-manager-for-everything",
      "_7-evaluate-where-evidence-was-first-lost",
      "_8-when-is-full-rag-worth-it—and-when-should-we-keep-things-simple",
      "_9-walk-the-2023-notice-question-through-the-system-again"
    ],
    "panorama": [
      "the-full-rag-lifecycle-from-knowledge-ingestion-to-a-trustworthy-agent-answer",
      "_1-the-big-picture-one-user-question-four-kinds-of-work",
      "_2-before-knowledge-enters-the-system-what-do-we-actually-possess",
      "a-report-has-three-distinct-identities",
      "extraction-coverage-matters-more-than-the-number-of-chunks",
      "updating-a-source-is-a-conditional-state-change",
      "_3-an-online-query-is-not-search-the-user-s-text-across-everything",
      "why-hard-filters-must-precede-top-k",
      "lexical-search-vectors-fusion-and-reranking-solve-different-problems",
      "_4-what-often-disappears-is-proof-that-the-model-actually-saw-the-chunk",
      "externalized-results-make-the-model-read-it-especially-easy-to-overclaim",
      "which-parts-of-an-answer-are-genuinely-supported",
      "_5-a-document-can-lose-disclosure-eligibility-after-the-model-has-read-it",
      "_6-divide-responsibilities-rather-than-invent-a-rag-manager-for-everything",
      "_7-evaluate-where-evidence-was-first-lost",
      "_8-when-is-full-rag-worth-it—and-when-should-we-keep-things-simple",
      "_9-walk-the-2023-notice-question-through-the-system-again"
    ]
  }
}
const root = new URL('../', import.meta.url).pathname
const md = await createMarkdownRenderer(root, { highlight: code => code })

test('RAG merge keeps one L4 primary article and one panorama tag identity', () => {
  const items = chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))
  assert.equal(items.filter(slug => slug === target).length, 1)
  assert.ok(chapters.find(chapter => chapter.id === 'l4').items.some(([slug]) => slug === target))
  assert.ok(!items.includes(oldSlug))
  assert.equal(mergedArticles[oldSlug], target)
  assert.equal(panoramaSeriesSlugs.filter(slug => slug === target).length, 1)
  assert.ok(!panoramaSeriesSlugs.includes(oldSlug))
  assert.ok(englishArticleSlugs.includes(target))
  assert.ok(!englishArticleSlugs.includes(oldSlug))
  const registry = JSON.parse(read('visuals/owner-architecture/owner-articles.json'))
  assert.equal(registry.owners.A20.primary, target)
  assert.ok(!registry.owners.A20.related.includes(oldSlug))
})

for (const [language, prefix] of [['zh', ''], ['en', 'en/']]) {
  test(language + ' retains all 32 original heading anchors in the merged article', () => {
    const source = read(prefix + 'articles/' + target + '.md')
    const html = md.render(source.replace(/^---[\s\S]*?---\n/, ''))
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
    assert.equal(new Set(ids).size, ids.length, 'No duplicate authored or generated anchor')
    assert.equal(expected[language].all.length, 32)
    for (const id of expected[language].all) assert.ok(ids.includes(id), id)
    for (const name of ['LlamaIndex', 'LangChain', 'Haystack', 'search_financial_knowledge', 'sourceIds', 'grounded', 'not-indexed', '306', 'retrieve-reread']) assert.ok(source.includes(name), name)
    for (const name of ['system', 'disclosure', 'diagnose-1', 'diagnose-2']) assert.ok(source.includes('/panorama-rag/' + name + '.svg'), name)
    for (const name of ['ingest-flow', 'query-flow']) {
      assert.ok(source.includes('/diagrams/rag-lifecycle/' + language + '/' + name + '.svg'))
      assert.ok(source.includes('/diagrams/rag-lifecycle/' + language + '/' + name + '-mobile.svg'))
      const dir = 'public/diagrams/rag-lifecycle/' + language + '/'
      for (const suffix of ['', '-mobile']) {
        const asset = read(dir + name + suffix + '.svg')
        assert.ok(asset.includes('<title') && asset.includes('<desc'))
        if (language === 'en') assert.doesNotMatch(asset, /[\u3400-\u9fff]/)
      }
    }
  })

  test(language + ' old URL carries the exact fragment and retains no-JS section links', () => {
    const source = read(prefix + 'articles/' + oldSlug + '.md')
    assert.match(source, /search: false/)
    const script = /<script setup>([\s\S]*?)<\/script>/.exec(source)?.[1].replace(/^import .*$/gm, '')
    assert.ok(script)
    for (const hash of ['', '#'+expected[language].panorama[1], '#'+encodeURIComponent(expected[language].panorama[5])]) {
      const destinations = []
      runInNewContext(script, {
        onMounted: fn => fn(), withBase: path => '/eff-agent-article' + path,
        window: { location: { hash, replace: value => destinations.push(value) } }
      })
      assert.deepEqual(destinations, ['/eff-agent-article/' + prefix + 'articles/' + target + hash])
    }
    for (const id of expected[language].panorama) {
      assert.ok(source.includes('id="' + id + '"'), 'Fallback fragment: ' + id)
      assert.ok(source.includes('](' + target + '.md#' + id + ')'), 'Fallback destination: ' + id)
    }
    assert.ok(source.includes('](' + target + '.md)'))
    assert.ok(source.includes('/blob/a629e450e9e3a505089b54d68a14eaecf3b9a2fb/'))
    assert.equal(canonicalUrl(prefix + 'articles/' + oldSlug + '.md'), canonicalUrl(prefix + 'articles/' + target + '.md'))
    assert.equal(isLegacyArticleRoute(prefix + 'articles/' + oldSlug), true)
    assert.deepEqual(filterSitemapItems([{url:prefix+'articles/'+oldSlug},{url:prefix+'articles/'+target}]), [{url:prefix+'articles/'+target}])
  })

  test(language + ' built pages retain canonical, noindex, source anchors and responsive images', { skip: !process.env.RAG_CHECK_OUTPUT }, () => {
    const path = '.vitepress/dist/' + prefix + 'articles/'
    const html = read(path + target + '.html')
    const legacy = read(path + oldSlug + '.html')
    for (const id of expected[language].all) assert.ok(html.includes('id="' + id + '"'), id)
    assert.ok(legacy.includes('noindex,follow'))
    assert.ok(legacy.includes(canonicalUrl(prefix + 'articles/' + target + '.md')))
    const entry = [...legacy.matchAll(/href="\/eff-agent-article\/assets\/([^"]*rag-end-to-end-system-panorama[^"]*\.lean\.js)"/g)].map(match => match[1])[0]
    assert.ok(entry, 'Legacy component bundle is linked from actual HTML')
    const bundle = read('.vitepress/dist/assets/' + entry)
    assert.ok(bundle.includes('window.location.replace') && bundle.includes('window.location.hash') && bundle.includes(target), 'Compiled compatibility handler preserves the fragment')
    for (const name of ['ingest-flow', 'query-flow']) {
      const path = 'diagrams/rag-lifecycle/' + language + '/' + name
      assert.ok(html.includes('srcset="/eff-agent-article/' + path + '-mobile.svg"'))
      assert.ok(html.includes('src="/eff-agent-article/' + path + '.svg"'))
      assert.ok(html.includes('href="/eff-agent-article/' + path + '.svg"'))
      for (const suffix of ['', '-mobile']) {
        assert.equal(read('.vitepress/dist/' + path + suffix + '.svg'), read('public/' + path + suffix + '.svg'))
      }
    }
    assert.doesNotMatch(html, /(?:src|srcset)="\.\.\//)
  })
}


test('combined curation renders fourteen cards and keeps focused articles readable without the tag', { skip: !process.env.RAG_CHECK_OUTPUT }, () => {
  const excluded = ['agent-trust-from-claims-to-commitments', 'agent-fragility-and-antifragility', 'ai-citations-do-not-prove-reliability']
  const retained = ['025-agent-langfuse-from-trace-to-trustworthy-observability', 'honest-agent-evaluation', 'agent-subagent-context-specialization']
  assert.equal(panoramaSeriesSlugs.length, 14)
  for (const prefix of ['', 'en/']) {
    const landing = read('.vitepress/dist/' + prefix + 'panorama.html')
    const cards = [...landing.matchAll(/<article\b[^>]*class="panorama-series-card"[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[1])
    assert.equal(cards.length, 14)
    for (const slug of [...excluded, ...retained]) {
      assert.equal(cards.some(card => card.includes('/articles/' + slug)), retained.includes(slug), slug)
      assert.ok(landing.includes('/' + prefix + 'articles/' + slug), 'Retained reading link: ' + slug)
      const html = read('.vitepress/dist/' + prefix + 'articles/' + slug + '.html')
      const tags = /<nav[^>]*class="article-topic-tags"[\s\S]*?<\/nav>/.exec(html)?.[0] || ''
      assert.equal(/href="[^"]*\/panorama"/.test(tags), retained.includes(slug), prefix + slug)
      assert.ok(html.includes('<h1') && html.includes('class="vp-doc'))
    }
  }
})
