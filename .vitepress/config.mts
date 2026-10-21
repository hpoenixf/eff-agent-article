import { defineConfig } from 'vitepress'
import { collections } from '../book.mjs'

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

export default defineConfig({
  title: 'ETF Agent · 工程手记',
  description: '从真实工程问题出发，沿模块机制、架构判断和 AI 研发实践连续阅读，并以金融专题串联领域案例。',
  lang: 'zh-CN',
  base: '/eff-agent-article/',
  cleanUrls: true,
  lastUpdated: false,
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
          return '<MermaidDiagram source="' + code + '" />\n'
        }
        return fallback ? fallback(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
      }
    }
  },
  themeConfig: {
    logo: '/brand.svg',
    siteTitle: 'ETF Agent / Notes',
    nav: [
      { text: '模块维度', link: '/modules' },
      { text: '架构与系统思考', link: '/thinking' },
      { text: '研发工程实践', link: '/engineering' },
      { text: '金融专题', link: '/fintech' },
      { text: '全部文章', link: '/catalog' },
      { text: '架构图册', link: '/gallery' },
      { text: '写作预告', link: '/roadmap' },
      { text: '博客 ↗', link: 'https://hpoenixf.com/' }
    ],
    sidebar: {
      '/articles/': readingSidebar,
      '/': [
        { text: '开始阅读', items: [
          { text: '模块维度', link: '/modules' },
          { text: '架构与系统思考', link: '/thinking' },
          { text: '研发工程实践', link: '/engineering' },
          { text: '金融专题', link: '/fintech' },
          { text: '完整目录', link: '/catalog' },
          { text: '架构原则速查', link: '/principles' },
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
