import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import type { Theme } from 'vitepress'
import ChapterCatalog from './ChapterCatalog.vue'
import ContinueReading from './ContinueReading.vue'
import MermaidDiagram from './MermaidDiagram.vue'
import ReadingTracker from './ReadingTracker.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-bottom': () => h(ReadingTracker)
  }),
  enhanceApp({ app }) {
    app.component('ChapterCatalog', ChapterCatalog)
    app.component('ContinueReading', ContinueReading)
    app.component('MermaidDiagram', MermaidDiagram)
  }
} satisfies Theme
