import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { chapters } from '../book.mjs'
import { englishArticleSlugs, englishTitles } from '../book.en.mjs'
import { SITE_URL } from '../seo-routes.mjs'
import { seoDescription } from '../seo-content.mjs'

const xml = (s) => String(s ?? '').replace(/[&<>"']/g, (x) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[x])

function frontmatter(source) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? ''
  return Object.fromEntries(
    block.split(/\r?\n/).map(line => /^([\w-]+):\s*(.*)$/.exec(line))
      .filter(Boolean).map(m => [m[1], m[2].trim().replace(/^["']|["']$/g, '')])
  )
}

function gitDate(path) {
  try {
    const timestamp = execFileSync('git', ['log', '-1', '--format=%cI', '--', path], { encoding: 'utf8' }).trim()
    return timestamp && !Number.isNaN(Date.parse(timestamp)) ? new Date(timestamp) : null
  } catch {
    return null // no timestamp is better than a fictitious publication date
  }
}

function build(language) {
  const english = language === 'en'
  const accepted = new Set(englishArticleSlugs)
  const entries = chapters.flatMap(chapter => chapter.items)
    .filter(([slug]) => !english || accepted.has(slug))
    .map(([slug, readingTitle]) => {
      const path = (english ? 'en/' : '') + 'articles/' + slug + '.md'
      const fm = frontmatter(readFileSync(path, 'utf8'))
      const title = fm.title || (english ? englishTitles[slug] || readingTitle : readingTitle)
      const description = seoDescription({ title, frontmatter: fm, english })
      const date = gitDate(path)
      return { path, title, description, date, href: SITE_URL + path.slice(0, -3) }
    })
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .slice(0, 40)

  const title = english ? 'ETF Agent Engineering Notes' : 'ETF Agent 工程手记'
  const homepage = SITE_URL + (english ? 'en/' : '')
  const items = entries.map(entry => [
    '<item>',
    '<title>' + xml(entry.title) + '</title>',
    '<link>' + xml(entry.href) + '</link>',
    '<guid isPermaLink="true">' + xml(entry.href) + '</guid>',
    '<description>' + xml(entry.description) + '</description>',
    ...(entry.date ? ['<pubDate>' + xml(entry.date.toUTCString()) + '</pubDate>'] : []),
    '</item>'
  ].join('')).join('\n')
  const out = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0"><channel>\n' +
    '<title>' + xml(title) + '</title>\n' +
    '<link>' + xml(homepage) + '</link>\n' +
    '<description>' + xml(english ? 'Engineering mechanisms and evidence from AI agent development.' : 'Agent 工程机制、架构取舍与可核查的实践记录。') + '</description>\n' +
    '<language>' + (english ? 'en-US' : 'zh-CN') + '</language>\n' +
    items + '\n</channel></rss>\n'
  const target = 'public/' + (english ? 'en/' : '') + 'feed.xml'
  mkdirSync(english ? 'public/en' : 'public', { recursive: true })
  writeFileSync(target, out)
  console.log('Generated ' + target + ' (' + entries.length + ' current articles)')
}
build('zh')
build('en')
