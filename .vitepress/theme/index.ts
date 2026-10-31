import RecentArticles from './RecentArticles.vue'
import SiteAnalytics from './SiteAnalytics.vue'
import OpenEtfTopic from './OpenEtfTopic.vue'
import OpenEtfTopicEntry from './OpenEtfTopicEntry.vue'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import type { Theme } from 'vitepress'
import ChapterCatalog from './ChapterCatalog.vue'
import FlagshipEntry from './FlagshipEntry.vue'
import ContinueReading from './ContinueReading.vue'
import HomeReadingMenu from './HomeReadingMenu.vue'
import HomeOverview from './HomeOverview.vue'
import PanoramaSeries from './PanoramaSeries.vue'
import ArticleTopicTags from './ArticleTopicTags.vue'
import PanoramaViewer from './PanoramaViewer.vue'
import EvidenceScope from './EvidenceScope.vue'
import OpenSourceBridge from './OpenSourceBridge.vue'
import PrinciplesLink from './PrinciplesLink.vue'
import ReadingTracker from './ReadingTracker.vue'
import StarLink from './StarLink.vue'
import ArticleStar from './ArticleStar.vue'
import WeChatFollow from './WeChatFollow.vue'
import LanguagePreference from './LanguagePreference.vue'
import DiagramZoom from './DiagramZoom.vue'
import LearningPathNav from './LearningPathNav.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'home-hero-actions-after': () => h(HomeReadingMenu),
    'nav-bar-content-after': () => [h(LanguagePreference), h(StarLink, { class: 'nav-star-link' })],
    'doc-before': () => [h(EvidenceScope), h(ArticleTopicTags), h(OpenSourceBridge)],
    'doc-footer-before': () => [h(PrinciplesLink, { placement: 'bottom' }), h(ArticleStar), h(WeChatFollow, { articleOnly: true })],
    'layout-bottom': () => [h(ReadingTracker), h(SiteAnalytics), h(DiagramZoom)]
  }),
  enhanceApp({ app }) {
    app.component('RecentArticles', RecentArticles)
    app.component('LearningPathNav', LearningPathNav)
    app.component('WeChatFollow', WeChatFollow)
    app.component('OpenEtfTopic', OpenEtfTopic)
    app.component('OpenEtfTopicEntry', OpenEtfTopicEntry)
    app.component('ChapterCatalog', ChapterCatalog)
    app.component('FlagshipEntry', FlagshipEntry)
    app.component('ContinueReading', ContinueReading)
    app.component('HomeOverview', HomeOverview)
    app.component('PanoramaSeries', PanoramaSeries)
    app.component('OpenSourceBridge', OpenSourceBridge)
    app.component('PanoramaViewer', PanoramaViewer)
  }
} satisfies Theme


