<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { readingRoutes, categoryLinks } from '../../home-reading-routes.mjs'
import { data as tagData } from './article-tags.data'
const { lang } = useData()
const locale = computed(() => lang.value.startsWith('en') ? 'en' : 'zh')
const en = computed(() => locale.value === 'en')
const active = ref('catalog')
const routes = computed(() => readingRoutes(locale.value, tagData))
const tabs = computed(() => [{ id: 'catalog', label: en.value ? 'Categories & tags' : '分类与标签' }, ...routes.value])
const categories = computed(() => categoryLinks(locale.value))
function navigate(event: KeyboardEvent, index: number) {
  const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
  if (!keys.includes(event.key)) return
  event.preventDefault()
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.value.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.value.length) % tabs.value.length
  active.value = tabs.value[next].id
  document.getElementById(`reader-tab-${active.value}`)?.focus()
}
</script>
<template>
<section class="reader-home" :aria-label="en ? 'Find your next read' : '选择你的下一篇阅读'">
  <div class="reader-heading"><p>{{ en ? 'READ WITH A PURPOSE' : '从你的问题出发' }}</p><h2>{{ en ? 'Find your next read' : '找到适合你的阅读入口' }}</h2></div>
  <div class="reader-tabs" role="tablist" :aria-label="en ? 'Reading interests' : '阅读方向'">
    <button v-for="(tab, index) in tabs" :id="`reader-tab-${tab.id}`" :key="tab.id" role="tab" :aria-selected="active === tab.id" :aria-controls="`reader-panel-${tab.id}`" :tabindex="active === tab.id ? 0 : -1" @click="active = tab.id" @keydown="navigate($event, index)">{{ tab.label }}</button>
  </div>
  <div id="reader-panel-catalog" role="tabpanel" aria-labelledby="reader-tab-catalog" :hidden="active !== 'catalog'" tabindex="0">
    <p class="reader-goal">{{ en ? 'Browse by category, or choose a topic above.' : '按分类查找，或切换上方专题直接选读。' }}</p>
    <div class="reader-categories"><a v-for="item in categories" :key="item.id" :href="withBase(item.href)"><img :src="withBase(item.image)" alt="" width="360" height="152"><strong>{{ item.title }}</strong><span aria-hidden="true"> ↗</span></a></div>

  </div>
  <div v-for="route in routes" :id="`reader-panel-${route.id}`" :key="route.id" role="tabpanel" :aria-labelledby="`reader-tab-${route.id}`" :hidden="active !== route.id" tabindex="0">
    <p class="reader-goal">{{ route.goal }}</p>

    <ol class="reader-route"><li v-for="(article, index) in route.articles" :key="article.slug"><a :href="withBase(article.href)"><span class="reader-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ article.title }}</strong><span class="reader-arrow" aria-hidden="true">↗</span></a></li><li class="reader-view-all"><a :href="withBase(route.href)"><span><strong>{{ en ? 'View all' : '查看全部' }}</strong><small>{{ en ? `${route.total} articles in this topic` : `本专题共 ${route.total} 篇` }}</small></span><span class="reader-arrow" aria-hidden="true">→</span></a></li></ol>
  </div>
</section>
</template>
<style scoped>
.reader-home{margin:12px 0 40px}.reader-heading p{font-size:12px;letter-spacing:.12em;color:var(--vp-c-brand-1);margin:0}.reader-heading h2{border:0;margin:6px 0 24px;padding:0;font-size:28px}.reader-tabs{display:flex;overflow-x:auto;border-bottom:1px solid var(--vp-c-divider);gap:8px;padding-bottom:0}.reader-tabs button{flex-shrink:0;padding:13px 18px;min-height:48px;font-weight:600;font-size:15px;border-bottom:3px solid transparent;color:var(--vp-c-text-2)}.reader-tabs button[aria-selected=true]{color:var(--vp-c-brand-1);border-bottom-color:var(--vp-c-brand-1);background:var(--vp-c-bg-soft)}[hidden]{display:none!important}.reader-goal{font-size:18px;margin:24px 0 12px}.reader-hint{font-size:13px;color:var(--vp-c-text-2);margin:0 0 20px}.reader-categories{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.reader-categories a{text-decoration:none;color:var(--vp-c-text-1)}.reader-categories img{width:100%;height:auto;border-radius:12px;margin:12px 0}.reader-tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.reader-tags a{padding:8px 14px;min-height:44px;border:1px solid var(--vp-c-divider);border-radius:24px;text-decoration:none}.reader-route{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;list-style:none;padding:0}.reader-route li{margin:0}.reader-route a{display:flex;gap:14px;align-items:center;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;min-height:104px;height:100%;color:var(--vp-c-text-1);text-decoration:none;background:var(--vp-c-bg-soft)}.reader-route a:hover{border-color:var(--vp-c-brand-1)}.reader-route strong{font-size:15px;line-height:1.6;font-weight:550}.reader-number{align-self:flex-start;font-size:20px;color:var(--vp-c-brand-1);font-variant-numeric:tabular-nums}.reader-arrow{margin-left:auto;color:var(--vp-c-brand-1)}button:focus-visible,a:focus-visible,[role=tabpanel]:focus-visible{outline:2px solid var(--vp-c-brand-1);outline-offset:3px}@media(max-width:640px){.reader-heading h2{font-size:24px}.reader-categories,.reader-route{grid-template-columns:1fr}.reader-categories a{display:flex;align-items:center;gap:16px}.reader-categories img{width:96px}.reader-tabs button{padding:12px}.reader-route a{min-height:88px;padding:16px}.reader-goal{font-size:16px}}

.reader-view-all a{border-style:dashed;background:var(--vp-c-brand-soft)}.reader-view-all small{display:block;color:var(--vp-c-text-2);margin-top:6px;font-size:12px}
.reader-home{margin-bottom:24px}.reader-home .reader-heading h2{margin:4px 0 14px;font-size:24px}.reader-home .reader-goal{margin:16px 0 12px;font-size:15px}.reader-categories{gap:16px}.reader-categories img{max-height:100px;object-fit:cover;margin:8px 0}.reader-route a{min-height:84px;padding:14px}.reader-categories a{border-radius:12px;padding:6px}
.reader-tabs button,.reader-categories a,.reader-route a{transition:background-color .18s ease,color .18s ease,transform .18s ease,box-shadow .18s ease,border-color .18s ease}
@media(hover:hover){.reader-tabs button:hover{background:var(--vp-c-brand-soft);color:var(--vp-c-brand-1)}.reader-categories a:hover{transform:translateY(-3px);background:var(--vp-c-bg-soft);box-shadow:0 5px 16px #167b6b14}.reader-route a:hover{transform:translateY(-2px)}}
@media(prefers-reduced-motion:reduce){.reader-tabs button,.reader-categories a,.reader-route a{transition:none!important;transform:none!important}}
</style>
