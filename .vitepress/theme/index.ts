import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import type { Theme } from 'vitepress'
import ChapterCatalog from './ChapterCatalog.vue'
import FlagshipEntry from './FlagshipEntry.vue'
import ContinueReading from './ContinueReading.vue'
import HomeOverview from './HomeOverview.vue'
import MermaidDiagram from './MermaidDiagram.vue'
import PanoramaViewer from './PanoramaViewer.vue'
import EvidenceScope from './EvidenceScope.vue'
import OpenSourceBridge from './OpenSourceBridge.vue'
import PrinciplesLink from './PrinciplesLink.vue'
import ReadingTracker from './ReadingTracker.vue'
import StarLink from './StarLink.vue'
import ArticleStar from './ArticleStar.vue'
import LanguagePreference from './LanguagePreference.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'nav-bar-content-after': () => [h(LanguagePreference), h(StarLink, { class: 'nav-star-link' })],
    'doc-before': () => [h(EvidenceScope), h(OpenSourceBridge)],
    'doc-footer-before': () => [h(PrinciplesLink, { placement: 'bottom' }), h(ArticleStar)],
    'layout-bottom': () => h(ReadingTracker)
  }),
  enhanceApp({ app }) {
    app.component('ChapterCatalog', ChapterCatalog)
    app.component('FlagshipEntry', FlagshipEntry)
    app.component('ContinueReading', ContinueReading)
    app.component('HomeOverview', HomeOverview)
    app.component('OpenSourceBridge', OpenSourceBridge)
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('PanoramaViewer', PanoramaViewer)
  }
} satisfies Theme
