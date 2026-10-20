import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import type { Theme } from 'vitepress'
import ChapterCatalog from './ChapterCatalog.vue'
import ContinueReading from './ContinueReading.vue'
import MermaidDiagram from './MermaidDiagram.vue'
import ReadingTracker from './ReadingTracker.vue'
import StarLink from './StarLink.vue'
import ArticleStar from './ArticleStar.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'nav-bar-content-after': () => h(StarLink, { class: 'nav-star-link' }),
    'home-hero-actions-after': () => h('p', { class: 'hero-star-note' }, '如果这些工程笔记对你有帮助，欢迎 Star 支持。'),
    'doc-footer-before': () => h(ArticleStar),
    'layout-bottom': () => h(ReadingTracker)
  }),
  enhanceApp({ app }) {
    app.component('ChapterCatalog', ChapterCatalog)
    app.component('ContinueReading', ContinueReading)
    app.component('MermaidDiagram', MermaidDiagram)
  }
} satisfies Theme
