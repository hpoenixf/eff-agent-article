<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { englishArticleSlugs, historicalEnglishArticleSlugs } from '../../book.en.mjs'
import { localizedSitePath } from '../../language-routing.mjs'

type Language = 'zh' | 'en'
const route = useRoute()
const selected = ref<Language>('zh')
const unavailable = ref(false)
const storageKey = 'etf-agent:language'

function relativePath() {
  const base = withBase('/')
  const raw = decodeURI(window.location.pathname)
  const clean = raw.startsWith(base) ? raw.slice(base.length) : raw.replace(/^\//, '')
  return clean.replace(/\/$/, '').replace(/\.html$/, '')
}
function urlFor(lang: Language): string | null {
  const path = localizedSitePath(relativePath(), lang, [...englishArticleSlugs, ...historicalEnglishArticleSlugs])
  return path ? withBase(path) + window.location.hash : null
}
function save(value: Language) {
  selected.value = value
  try { window.localStorage.setItem(storageKey, value) } catch { /* Storage may be disabled. */ }
}
function savedLanguage(): Language | null {
  try {
    const value = window.localStorage.getItem(storageKey)
    return value === 'zh' || value === 'en' ? value : null
  } catch { return null }
}
function sync() {
  const params = new URLSearchParams(window.location.search)
  const explicit = params.get('lang')
  const queryLanguage = explicit === 'en' ? 'en' : explicit === 'zh' || explicit === 'zh-CN' ? 'zh' : null
  const path = relativePath()
  // A directly requested /en/ path wins over an old saved preference.
  const language: Language = queryLanguage || (path.startsWith('en/') || path === 'en' ? 'en' : savedLanguage() || 'zh')
  save(language)
  const target = urlFor(language)
  unavailable.value = language === 'en' && !target
  if (queryLanguage && target && window.location.pathname !== target.split('#')[0]) {
    window.location.replace(target)
    return
  }
  if (!queryLanguage && language === 'en' && target && !path.startsWith('en/') && path !== 'en') {
    window.location.replace(target)
    return
  }
  if (queryLanguage) {
    params.delete('lang')
    const rest = params.toString()
    const clean = window.location.pathname + (rest ? '?' + rest : '') + window.location.hash
    window.history.replaceState(window.history.state, '', clean)
  }
}
function choose(value: Language) {
  save(value)
  const target = urlFor(value)
  unavailable.value = value === 'en' && !target
  if (target) window.location.assign(target)
}
onMounted(sync)
watch(() => route.path, () => { if (typeof window !== 'undefined') sync() })
</script>

<template>
  <div class="language-pref" aria-label="Reading language">
    <button type="button" :class="{ active: selected === 'zh' }" @click="choose('zh')" :aria-pressed="selected === 'zh'">中文</button>
    <span aria-hidden="true">/</span>
    <button type="button" :class="{ active: selected === 'en' }" @click="choose('en')" :aria-pressed="selected === 'en'">EN</button>
    <span v-if="unavailable" class="language-unavailable" role="status" title="Full English translation not published; showing the Chinese original">Chinese original</span>
  </div>
</template>
