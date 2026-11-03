// Topic navigation is a presentation of the existing reading map, not a second catalog.
import { topicGroups, topicPath, qualification, repo } from './open-etf-topic.mjs'

export function openEtfSidebar(language = 'en') {
  const en = language === 'en'
  const page = topicPath(language)
  const label = (english, chinese) => en ? english : chinese
  return [
    { text: 'Open ETF Agent', link: page },
    { text: label('On this topic', '本专题'), items: [
      { text: label('Read recent modules', '阅读最近模块'), link: page + '#reading' },
      { text: label('Run the first report', '运行第一份报告'), link: page + '#quickstart' },
      { text: label('Fixed version history', '固定版本历史'), link: page + '#versions' },
      { text: label('Mechanisms and boundaries', '机制与验证边界'), link: page + '#mechanisms-title' },
      { text: label('Full module reading map', '完整模块阅读地图'), link: page + '#coverage-reading' }
    ] },
    ...topicGroups(language).map(group => ({
      text: group.title,
      collapsed: true,
      items: group.articles.map(article => ({
        text: article.title + (en && !article.translated ? ' · Chinese original' : ''),
        link: article.href
      }))
    })),
    { text: label('Code and evidence', '源码与证据'), collapsed: true, items: [
      { text: label('Articles and code guide', '文章与代码导读'), link: repo + '/blob/' + qualification.sourceCommit + (en ? '/docs/articles-and-code.md' : '/docs/articles-and-code.zh-CN.md') },
      { text: label('Runnable source', '可运行源码'), link: repo },
      { text: 'GitHub Releases', link: repo + '/releases' }
    ] },
    { text: label('Back to all articles', '返回全部文章'), link: en ? '/en/catalog' : '/catalog' }
  ]
}
