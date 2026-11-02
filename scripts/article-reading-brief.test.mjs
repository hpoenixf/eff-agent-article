import test from 'node:test'
import assert from 'node:assert/strict'
import { createMarkdownRenderer } from 'vitepress'
import { articleReadingBriefPlugin, estimateReadingTime, isBriefArticle, readingText, validateReadingBrief } from '../article-reading-brief.mjs'
import { comparableArticle } from '../article-history.mjs'

const brief = { takeaways: ['First bounded conclusion.', 'Second distinct conclusion.', 'Third actionable conclusion.'], appliesTo: ['Reviewing a durable research handoff.'], notFor: ['Certifying production performance.'] }
const path = 'articles/agent-autonomous-scheduled-research.md'

test('article scope follows the catalogue and full-text history, not compatibility pages', () => {
  assert.ok(isBriefArticle(path))
  assert.ok(isBriefArticle('en/' + path))
  assert.ok(isBriefArticle('articles/017-prompt-to-answer-six-layer-panorama-v1.md'))
  for (const input of ['index.md', 'MAINTENANCE.md', 'articles/green-tests-can-lie.md', 'articles/not-catalogued.md', '../' + path]) assert.equal(isBriefArticle(input), false)
})

test('structural checks require 3–5 conclusions and both adoption boundaries', () => {
  assert.equal(validateReadingBrief(brief), brief)
  for (const invalid of [null, {}, { ...brief, takeaways: brief.takeaways.slice(0, 2) }, { ...brief, takeaways: Array(6).fill('duplicate') }, { ...brief, appliesTo: [] }, { ...brief, notFor: [''] }, { ...brief, minutes: 9 }, { ...brief, notFor: ['<b>raw HTML</b>'] }, { ...brief, notFor: [3] }]) assert.throws(() => validateReadingBrief(invalid))
  assert.throws(() => validateReadingBrief({ ...brief, takeaways: ['Same', 'Same', 'Other'] }))
})

test('mixed-language estimates count the complete parsed text additively and round up', () => {
  assert.deepEqual(estimateReadingTime([]), { minutes: 1, hanCharacters: 0, otherWords: 0 })
  assert.equal(estimateReadingTime([{ type: 'text', content: '字'.repeat(300) }]).minutes, 1)
  assert.equal(estimateReadingTime([{ type: 'text', content: 'word '.repeat(201) }]).minutes, 2)
  assert.deepEqual(estimateReadingTime([{ type: 'text', content: '字'.repeat(300) + 'word '.repeat(200) }]), { minutes: 2, hanCharacters: 300, otherWords: 200 })
  assert.equal(estimateReadingTime([{ type: 'text', content: '字'.repeat(301) }]).minutes, 2)
})

test('tokens preserve prose, table cells and examples without counting URLs or Mermaid syntax', () => {
  const tokens = [
    { type: 'inline', content: 'do not double count', children: [{ type: 'text', content: 'Visible prose' }, { type: 'link_open', attrs: [['href', 'https://very-long.example/url']] }, { type: 'code_inline', content: 'runId' }] },
    { type: 'fence', info: 'json', content: '{ "result": "partial" }' },
    { type: 'fence', info: 'mermaid', content: 'graph TD\nHidden --> DiagramSource' },
    { type: 'html_block', content: '<!-- hidden note --><script>secret script</script><style>.hidden{}</style><nav>navigation</nav><p class="hidden-attribute">Visible caption</p><LearningPathNav />' }
  ]
  const result = readingText(tokens)
  assert.match(result, /Visible prose.*runId.*result.*partial.*Visible caption/s)
  assert.doesNotMatch(result, /double count|https:|Hidden|DiagramSource|hidden|secret|navigation|LearningPathNav/)
})

const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code, config: renderer => renderer.use(articleReadingBriefPlugin) })
const source = body => `---\ntitle: Sample\nreadingBrief: ${JSON.stringify(brief)}\nreadingEstimate: { minutes: 999 }\n---\n\n${body}`

test('site renderer inserts exactly one brief after the original H1 and before the body', () => {
  const env = { relativePath: path }
  const html = md.render(source('# A preserved title {#old-anchor}\n\n<LearningPathNav />\n\nBody starts.\n\n## A section\n\nMore text.'), env)
  assert.equal(html.match(/<ArticleReadingBrief \/>/g)?.length, 1)
  assert.ok(html.indexOf('</h1>') < html.indexOf('<ArticleReadingBrief />'))
  assert.ok(html.indexOf('<ArticleReadingBrief />') < html.indexOf('Body starts.'))
  assert.match(html, /id="old-anchor"/)
  assert.equal(env.frontmatter.readingEstimate.minutes, 1)
  assert.deepEqual(env.frontmatter.readingBrief, brief)
})

test('missing brief fails on a real article; navigation and compatibility pages stay unchanged', () => {
  assert.throws(() => md.render('# Article\n\nBody', { relativePath: path }), /Missing readingBrief/)
  for (const relativePath of ['catalog.md', 'articles/green-tests-can-lie.md']) {
    assert.doesNotMatch(md.render('# Index\n\nA link.', { relativePath }), /ArticleReadingBrief/)
  }
})

test('headless articles get a top brief and later sections do not duplicate it', () => {
  const env = { relativePath: 'en/' + path }
  const html = md.render(source('Opening paragraph.\n\n## Section\n\nMore detail.'), env)
  assert.ok(html.startsWith('<ArticleReadingBrief />'))
  assert.equal(html.match(/<ArticleReadingBrief \/>/g)?.length, 1)
})

test('reading-estimate metadata is not part of source history; editorial briefs remain real content', () => {
  // Derived values never enter Markdown. Newly authored conclusions are genuine
  // reader-visible content, so retain the existing history contract unchanged.
  assert.notEqual(comparableArticle('# Body\n'), comparableArticle('---\nreadingBrief: ' + JSON.stringify(brief) + '\n---\n# Body\n'))
})


test('bare URLs in prose and code examples do not inflate the estimate', () => {
  const env = { relativePath: path }
  md.render(source('# Title\n\n' + 'word '.repeat(199) + '\n\n```bash\ngit https://example.com/a/very/long/path\n```'), env)
  // Title + 199 prose words + git; the URL itself contributes no words.
  assert.equal(env.frontmatter.readingEstimate.otherWords, 201)
  assert.equal(estimateReadingTime([{ type: 'text', content: 'word '.repeat(200) + 'https://example.com/a/b/c' }]).minutes, 1)
})
