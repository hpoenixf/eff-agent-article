import { defineConfig } from 'vitepress'
import { collections, mergedArticles, historicalEditions } from '../book.mjs'
import { englishCollections, englishArticlePath } from '../book.en.mjs'

const SITE_URL = 'https://hpoenixf.github.io/eff-agent-article/'

function canonicalUrl(relativePath: string) {
  let path = relativePath.replace(/\.md$/, '')
  if (path === 'index') path = ''
  if (path === 'en/index') path = 'en/'
  const article = /^(en\/)?articles\/([^/]+)$/.exec(path)
  if (article && Object.hasOwn(mergedArticles, article[2])) {
    path = (article[1] || '') + 'articles/' + mergedArticles[article[2]]
  } else if (article && Object.hasOwn(historicalEditions, article[2])) {
    // Preserve full-text historical URLs but don't make them competing search canonicals.
    path = (article[1] || '') + 'articles/' + historicalEditions[article[2]]
  }
  return SITE_URL + path
}

const readingSidebar = collections.map((collection) => ({
  text: collection.title,
  collapsed: false,
  items: collection.chapters.map((chapter) => ({
    text: chapter.title,
    collapsed: false,
    items: chapter.items.map(([slug, text]) => ({
      text,
      link: '/articles/' + slug
    }))
  }))
}))

const englishSidebar = englishCollections.map(collection => ({
  text: collection.title,
  collapsed: false,
  items: collection.chapters.map(chapter => ({
    text: chapter.title,
    collapsed: false,
    items: chapter.items.map(([slug, title]) => ({
      text: title + (englishArticlePath(slug).startsWith('/en/') ? '' : ' · 中文'),
      link: englishArticlePath(slug)
    }))
  }))
}))

export default defineConfig({
  locales: {
    root: { label: '简体中文', lang: 'zh-CN' },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'ETF Agent · Engineering Notes',
      description: 'Engineering notes on AI agent mechanisms, architecture and development.',
      themeConfig: {
        nav: [
          { text: 'System Overview', link: '/en/articles/017-prompt-to-answer-six-layer-panorama-v3' },
          { text: 'Principles', link: '/en/principles' },
          { text: 'Gallery', link: '/en/gallery' },
          { text: 'Topics', items: [
            { text: 'Modules', link: '/en/modules' },
            { text: 'Architecture', link: '/en/thinking' },
            { text: 'Engineering', link: '/en/engineering' },
            { text: 'Fintech', link: '/en/fintech' }
          ] }
        ],
        sidebar: {
          '/en/articles/': englishSidebar,
          '/en/': [{ text: 'Start Reading', items: [
            { text: 'Six-Layer Agent Architecture', link: '/en/articles/017-prompt-to-answer-six-layer-panorama-v3' },
            { text: 'Architecture Principles', link: '/en/principles' },
            { text: 'All Articles', link: '/en/catalog' },
            { text: 'Module Deep Dives', link: '/en/modules' },
            { text: 'Architecture', link: '/en/thinking' },
            { text: 'Engineering Practice', link: '/en/engineering' },
            { text: 'Fintech', link: '/en/fintech' },
            { text: 'Financial Research Backlog', link: '/en/financial-research-backlog' },
            { text: 'Architecture Gallery', link: '/en/gallery' },
            { text: 'Writing Roadmap', link: '/en/roadmap' }
          ] }]
        },
        outline: { level: [2, 3], label: 'On This Page' },
        docFooter: { prev: 'Previous', next: 'Next' },
        returnToTopLabel: 'Back to Top',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Toggle Appearance',
        editLink: { pattern: 'https://github.com/hpoenixf/eff-agent-article/edit/main/:path', text: 'Improve This Page on GitHub' },
        footer: { message: 'Engineering notes, evidence and boundaries.', copyright: 'ETF Agent Engineering Notes' }
      }
    }
  },
  title: 'ETF Agent · 工程手记',
  description: '从真实工程问题出发，沿模块机制、架构判断和 AI 研发实践连续阅读，并以金融专题串联领域案例。',
  lang: 'zh-CN',
  base: '/eff-agent-article/',
  cleanUrls: true,
  lastUpdated: false,
  sitemap: { hostname: SITE_URL },
  transformPageData(pageData) {
    const relativePath = pageData.relativePath
    if (!relativePath.endsWith('.md') || relativePath === '404.md') return
    const canonical = canonicalUrl(relativePath)
    const heads = (pageData.frontmatter.head ??= [])
    heads.push(['link', { rel: 'canonical', href: canonical }])

    // Keep this editorial map discoverable without adding an article classification system.
    if (relativePath !== 'principles.md' && relativePath !== 'en/principles.md') return
    const english = relativePath.startsWith('en/')
    const description = String(pageData.frontmatter.description || '')
    heads.push(['meta', { property: 'og:type', content: 'website' }])
    heads.push(['meta', { property: 'og:title', content: pageData.title }])
    heads.push(['meta', { property: 'og:description', content: description }])
    heads.push(['meta', { property: 'og:url', content: canonical }])
    heads.push(['link', { rel: 'alternate', hreflang: 'zh-CN', href: SITE_URL + 'principles' }])
    heads.push(['link', { rel: 'alternate', hreflang: 'en', href: SITE_URL + 'en/principles' }])
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageData.title,
      description,
      url: canonical,
      inLanguage: english ? 'en-US' : 'zh-CN',
      isPartOf: { '@type': 'WebSite', name: 'ETF Agent · Engineering Notes', url: SITE_URL }
    }
    heads.push(['script', { type: 'application/ld+json' }, JSON.stringify(structuredData).replace(/</g, '\\u003c')])
  },
  head: [
    ['meta', { name: 'theme-color', content: '#f8f8f4' }],
    ['meta', { name: 'referrer', content: 'strict-origin-when-cross-origin' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/eff-agent-article/brand.svg' }]
  ],
  markdown: {
    lineNumbers: true,
    config(md) {
      const fallback = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token.info.trim().split(/\s+/)[0] === 'mermaid') {
          const code = encodeURIComponent(token.content)
          // Expose the diagram's editorial context in the server-rendered HTML.
          const preceding = tokens[idx - 2]?.type === 'inline' ? tokens[idx - 2].content.trim() : ''
          const title = /^\*\*([^\n*]{2,100})\*\*$/.exec(preceding)?.[1] || ''
          const summary = preceding.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[\x60*]/g, '').trim()
          const safeTitle = encodeURIComponent(title)
          const safeSummary = encodeURIComponent((summary.length > 10 ? summary : title).slice(0,180))
          return '<MermaidDiagram source="' + code + '" title="' + safeTitle + '" description="' + safeSummary + '" />\n'
        }
        return fallback ? fallback(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
      }
    }
  },
  themeConfig: {
    logo: '/brand.svg',
    siteTitle: 'ETF Agent / Notes',
    nav: [
      { text: '系统全景', link: '/articles/017-prompt-to-answer-six-layer-panorama-v3' },
      { text: '架构原则', link: '/principles' },
      { text: '架构图册', link: '/gallery' },
      { text: '文章分类', items: [
        { text: '模块维度', link: '/modules' },
        { text: '架构与系统思考', link: '/thinking' },
        { text: '研发工程实践', link: '/engineering' },
        { text: '金融专题', link: '/fintech' }
      ] },
      { text: '博客 ↗', link: 'https://hpoenixf.com/' }
    ],
    sidebar: {
      '/articles/': readingSidebar,
      '/': [
        { text: '开始阅读', items: [
          { text: '六层系统全景 · 必读', link: '/articles/017-prompt-to-answer-six-layer-panorama-v3' },
          { text: '架构原则与方法', link: '/principles' },
          { text: '模块维度', link: '/modules' },
          { text: '架构与系统思考', link: '/thinking' },
          { text: '研发工程实践', link: '/engineering' },
          { text: '金融专题', link: '/fintech' },
          { text: '金融研究清单', link: '/financial-research-backlog' },
          { text: '完整目录', link: '/catalog' },
          { text: '架构导读', link: '/architecture' },
          { text: '架构图册', link: '/gallery' },
          { text: '写作预告', link: '/roadmap' }
        ]}
      ]
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '切换外观',
    editLink: {
      pattern: 'https://github.com/hpoenixf/eff-agent-article/edit/main/:path',
      text: '在 GitHub 改进此页'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文章', buttonAriaLabel: '搜索文章' },
              modal: {
                displayDetails: '展开结果',
                resetButtonTitle: '清除查询',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有找到相关内容',
                footer: { selectText: '选择', navigateText: '导航', closeText: '关闭' }
              }
            }
          }
        }
      }
    },
    footer: {
      message: '与个人博客并行：这里按问题连续阅读，博客保留时间线。',
      copyright: 'ETF Agent Engineering Notes · 思考、证据与边界'
    }
  }
})
