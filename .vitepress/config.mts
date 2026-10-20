import { withMermaid } from 'vitepress-plugin-mermaid'
import { chapters } from './reading.mjs'

const readingSidebar = chapters.map(chapter => ({
  text: chapter.key + ' · ' + chapter.title,
  collapsed: false,
  items: chapter.items.map(article => ({
    text: article.title,
    link: '/articles/' + article.slug
  }))
}))

export default withMermaid({
  title: 'ETF Agent · 工程手记',
  description: '真实工程现场里的 Agent：研究、治理、证据、交付与长期演进。',
  lang: 'zh-CN',
  base: '/eff-agent-article/',
  cleanUrls: false,
  lastUpdated: false,
  // Historical articles may contain old relative source references.
  // Every new public navigation entry is validated by the content checker.
  ignoreDeadLinks: true,
  head: [['meta', { name: 'theme-color', content: '#f9f8f5' }]],
  themeConfig: {
    siteTitle: 'ETF Agent / Notes',
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    sidebarMenuLabel: '章节目录',
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '阅读外观',
    editLink: {
      pattern: 'https://github.com/hpoenixf/eff-agent-article/edit/main/:path',
      text: '在 GitHub 上建议修改'
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文章', buttonAriaLabel: '搜索文章' },
          modal: { noResultsText: '没有找到相关文章', resetButtonTitle: '清除搜索', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } }
        }
      }
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/hpoenixf/eff-agent-article' }],
    footer: { message: '从可公开的工程事实出发 · 保留历史语境与验证边界' },
    nav: [
      { text: '文章目录', link: '/contents' },
      { text: '架构地图', link: '/architecture' },
      { text: '架构图册', link: '/atlas' },
      { text: '写作预告', link: '/roadmap' },
      { text: '博客', link: 'https://hpoenixf.com/' }
    ],
    sidebar: [
      { text: '阅读指南', items: [
        { text: '从这里开始', link: '/contents' },
        { text: '架构地图 · 2026.10', link: '/architecture' }
      ] },
      ...readingSidebar,
      { text: '06 · 接下来写什么', items: [
        { text: '选题预告', link: '/roadmap' },
        { text: '架构图册', link: '/atlas' }
      ] }
    ]
  }
})
