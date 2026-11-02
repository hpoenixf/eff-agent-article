import { defineConfig } from 'vitepress'
import { articleReadingBriefPlugin } from '../article-reading-brief.mjs'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { collections } from '../book.mjs'
import { SITE_URL, canonicalUrl, isLegacyArticleRoute, isNonReaderRoute, filterSitemapItems, languageAlternates } from '../seo-routes.mjs'
import { englishCollections, englishArticlePath } from '../book.en.mjs'
import { seoDescription, socialHead, articleStructuredData, structuredDataHead } from '../seo-content.mjs'
import { diagramId, IMAGE_ROOT, escapeAttribute } from '../static-mermaid.mjs'
import { readableRelations, diagramDimensions, needsReadableRelations, renderRelations } from '../diagram-reading.mjs'

const readingSidebar = collections.map((collection) => ({
  text: collection.title,
  collapsed: true,
  items: collection.chapters.map((chapter) => ({
    text: chapter.title,
    collapsed: true,
    items: chapter.items.map(([slug, text]) => ({
      text,
      link: '/articles/' + slug
    }))
  }))
}))

const englishSidebar = englishCollections.map(collection => ({
  text: collection.title,
  collapsed: true,
  items: collection.chapters.map(chapter => ({
    text: chapter.title,
    collapsed: true,
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
        nav: [{ text: 'About', link: '/about' }],
        sidebar: [
          { text: 'All articles', link: '/en/catalog' },
          ...englishSidebar,
          { text: 'Tag topics', collapsed: true, items: [
            { text: 'Finance', link: '/en/fintech' },
            { text: 'Open source · Open ETF Agent', link: '/en/open-etf-agent' },
            { text: 'Panorama', link: '/en/panorama' }
          ] },
          { text: 'More pages', collapsed: true, items: [
            { text: 'Architecture Gallery', link: '/en/gallery' },
            { text: 'Architecture Guide', link: '/en/architecture' },
            { text: 'Financial Research Backlog', link: '/en/financial-research-backlog' },
            { text: 'Blog', link: 'https://hpoenixf.com/' }
          ] },
          { text: 'Runnable code', link: 'https://github.com/hpoenixf/open-etf-agent' }
        ],
        outline: { level: [2, 3], label: 'On This Page' },
        lastUpdated: { text: 'Last updated' },
        docFooter: { prev: 'Previous', next: 'Next' },
        returnToTopLabel: 'Back to Top',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Toggle Appearance',
        editLink: { pattern: 'https://github.com/hpoenixf/eff-agent-article/edit/main/:path', text: 'Improve This Page on GitHub' },
        footer: {
          message: 'Engineering notes, evidence and boundaries. · Contact: <a href="mailto:hpoenixf@foxmail.com">hpoenixf@foxmail.com</a> · WeChat: hpoenixf0510',
          copyright: 'ETF Agent Engineering Notes'
        }
      }
    }
  },
  title: 'ETF Agent · 工程手记',
  description: '从真实工程问题出发，沿模块机制、架构判断和 AI 研发实践连续阅读，并以金融专题串联领域案例。',
  lang: 'zh-CN',
  base: '/eff-agent-article/',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: SITE_URL,
    transformItems: filterSitemapItems
  },
  transformPageData(pageData) {
    const relativePath = pageData.relativePath
    if (!relativePath.endsWith('.md') || relativePath === '404.md') return
    const canonical = canonicalUrl(relativePath)
    const legacy = isLegacyArticleRoute(relativePath)
    const noindex = legacy || isNonReaderRoute(relativePath)
    const heads = (pageData.frontmatter.head ??= [])
    const english = relativePath.startsWith('en/')
    const description = seoDescription({
      title: pageData.title,
      headers: pageData.headers,
      frontmatter: pageData.frontmatter,
      english
    })
    pageData.description = description
    // VitePress reads pageData.description for the ordinary search snippet.
    // Normalize pre-existing per-page SEO heads so the build has one owner.
    for (let index = heads.length - 1; index >= 0; index--) {
      const [tag, attrs] = heads[index]
      if ((tag === 'link' && attrs?.rel === 'canonical') ||
          (noindex && tag === 'meta' && attrs?.name === 'robots') ||
          (tag === 'meta' && (String(attrs?.property || '').startsWith('og:') ||
            String(attrs?.name || '').startsWith('twitter:')))) {
        heads.splice(index, 1)
      }
    }
    heads.push(['link', { rel: 'canonical', href: canonical }])
    if (noindex) {
      heads.push(['meta', { name: 'robots', content: 'noindex,follow' }])
      return
    }

    heads.push(...socialHead({
      title: pageData.title,
      description,
      canonical,
      image: 'https://hpoenixf.com/static/images/twitter-card.png',
      article: relativePath.startsWith('articles/') || relativePath.startsWith('en/articles/'),
      english
    }))

    heads.push(...languageAlternates(relativePath, path =>
      existsSync(fileURLToPath(new URL('../' + path, import.meta.url)))))
    if (/^(?:en\/)?articles\//.test(relativePath)) {
      heads.push(structuredDataHead(articleStructuredData({
        title: pageData.title, description, canonical, english,
        metadata: pageData.frontmatter.articleMetadata
      })))
    }

    const pairedPage = relativePath.replace(/^en\//, '').replace(/\.md$/, '')
    if (!['principles', 'open-etf-agent', 'panorama'].includes(pairedPage)) return
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
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/eff-agent-article/brand.svg' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'ETF Agent 工程手记', href: SITE_URL + 'feed.xml' }]
  ],
  markdown: {
    lineNumbers: true,
    config(md) {
      md.use(articleReadingBriefPlugin)
      const fallback = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token.info.trim().split(/\s+/)[0] === 'mermaid') {
          // Static, same-origin SVG: no JavaScript or Mermaid runtime is needed to
          // read figures. Built from exactly the same source as the Markdown fence.
          const previous = tokens[idx - 2]?.type === 'inline' ? tokens[idx - 2].content.trim() : ''
          const title = /^\*\*([^\n*]{2,100})\*\*$/.exec(previous)?.[1] || ''
          const summary = previous.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[\x60*]/g, '').trim()
          const description = (summary.length > 10 ? summary : title).slice(0, 180) || 'Agent architecture diagram'
          const caption = escapeAttribute(title || 'Agent architecture diagram')
          const imageUrl = IMAGE_ROOT + diagramId(token.content) + '.svg'
          // VitePress compiles static src attributes as build imports, while
          // public/generated is created during prebuild. A literal Vue binding
          // emits a plain SSR src without bundling each output SVG as a module.
          let figure = '<figure class="diagram-frame diagram-static">' +
            '<a class="diagram-preview" href="' + escapeAttribute(imageUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="放大查看完整图 / Open full-size diagram">' +
            '<img :src="\'' + imageUrl + '\'" alt="' + escapeAttribute(description) +
            '" loading="lazy" decoding="async" /></a>' +
            '<figcaption class="diagram-caption">' + caption +
              ' <a class="diagram-original" href="' + escapeAttribute(imageUrl) + '" target="_blank" rel="noopener noreferrer">放大查看完整图 / Open full-size SVG</a>' +
              '</figcaption></figure>\n'
          const asset = fileURLToPath(new URL('../public/generated/mermaid/' + diagramId(token.content) + '.svg', import.meta.url))
          const dimensions = existsSync(asset) ? diagramDimensions(readFileSync(asset, 'utf8')) : null
          if (dimensions) figure = figure.replace('<img ', '<img width="' + dimensions.width + '" height="' + dimensions.height + '" ')
          const projection = readableRelations(token.content)
          if (!needsReadableRelations(dimensions) || !projection.supported) return figure
          const english = /(^|\/)en\//.test(String(env.relativePath || env.path || ''))
          return renderRelations(projection, english) + '<details class="diagram-full-details"><summary>' +
            (english ? 'Complete relationship diagram · enlarge for detail' : '完整关系图 · 可放大查看细节') +
            '</summary>' + figure + '</details>\n'

        }
        return fallback ? fallback(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
      }
    }
  },
  themeConfig: {
    logo: '/brand.svg',
    siteTitle: 'ETF Agent / Notes',
    nav: [{ text: 'About', link: '/about' }],
    sidebar: [
      { text: '全部文章', link: '/catalog' },
      ...readingSidebar,
      { text: '标签专题', collapsed: true, items: [
        { text: '金融', link: '/fintech' },
        { text: '开源 · Open ETF Agent', link: '/open-etf-agent' },
        { text: '全景', link: '/panorama' }
      ] },
      { text: '独立页面', collapsed: true, items: [
        { text: '架构图册', link: '/gallery' },
        { text: '架构导读', link: '/architecture' },
        { text: '金融研究清单', link: '/financial-research-backlog' },
        { text: '博客', link: 'https://hpoenixf.com/' }
      ] },
      { text: '可运行源码', link: 'https://github.com/hpoenixf/open-etf-agent' }
    ],
    outline: { level: [2, 3], label: '本页目录' },
    lastUpdated: { text: '最近修订' },
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
      message: '与个人博客并行：这里按问题连续阅读，博客保留时间线。 · 联系邮箱：<a href="mailto:hpoenixf@foxmail.com">hpoenixf@foxmail.com</a> · 微信：hpoenixf0510',
      copyright: 'ETF Agent Engineering Notes · 思考、证据与边界'
    }
  }
})
