import DefaultTheme from 'vitepress/theme'
import ArticleCatalog from './ArticleCatalog.vue'
import ContinueReading from './ContinueReading.vue'
import { articles } from '../reading.mjs'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('ArticleCatalog', ArticleCatalog)
    app.component('ContinueReading', ContinueReading)
    if (typeof window !== 'undefined') {
      const remember = (to: string) => {
        if (!to.includes('/articles/')) return
        const slug = to.split('/articles/')[1]?.split(/[?#]/)[0]?.replace(/\.html$/, '')
        if (slug && articles.some(item => item.slug === slug)) {
          try { window.localStorage.setItem('etf-agent-notes:last-read', slug) }
          catch { /* storage may be disabled by the reader */ }
        }
      }
      router.onAfterRouteChanged = remember
      remember(router.route.path)
    }
  }
}
