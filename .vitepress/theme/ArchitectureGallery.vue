<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import PanoramaViewer from './PanoramaViewer.vue'
import { galleryStageForKey, galleryStageFromHash, learningPathStages } from './learning-path-nav.mjs'

const { lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const stages = computed(() => learningPathStages(english.value))
const selectedKey = ref('panorama')
const selected = computed(() => stages.value.find(stage => stage.key === selectedKey.value) ?? stages.value.at(-1)!)
const ready = ref(false)
const navigation = ref<HTMLElement>()
const inventory = ref<HTMLDetailsElement>()

function restoreHash() {
  if (window.location.hash === '#owner-inventory') {
    if (inventory.value) inventory.value.open = true
    return
  }
  selectedKey.value = galleryStageFromHash(window.location.hash)
}
function select(key: string) {
  selectedKey.value = key
  window.history.replaceState(window.history.state, '', '#stage=' + key)
}
function activate(event: MouseEvent, key: string) {
  if (!ready.value || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
  event.preventDefault()
  select(key)
}
async function keydown(event: KeyboardEvent, key: string) {
  if (!ready.value || event.metaKey || event.ctrlKey || event.altKey) return
  const next = galleryStageForKey(key, event.key)
  if (next) {
    event.preventDefault()
    select(next)
    await nextTick()
    navigation.value?.querySelector<HTMLAnchorElement>('#gallery-tab-' + next)?.focus({ preventScroll: true })
  } else if (event.key === ' ') {
    event.preventDefault()
    select(key)
  }
  // Enter retains the anchor's native click behavior, enhanced by activate().
}
onMounted(() => {
  ready.value = true
  restoreHash()
  window.addEventListener('hashchange', restoreHash)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', restoreHash))
</script>

<template>
  <div class="architecture-gallery">
    <!-- VitePress intercepts clicks in window capture: vp-raw leaves these real links to our enhancement. -->
    <nav ref="navigation" class="gallery-stages vp-raw" :role="ready ? 'tablist' : undefined" :aria-label="english ? 'Reading stages' : '阅读阶段'">
      <a v-for="stage in stages" :id="'gallery-tab-' + stage.key" :key="stage.key"
        :href="withBase(stage.href)" :class="{ selected: selected.key === stage.key }"
        :role="ready ? 'tab' : undefined" :aria-selected="ready ? selected.key === stage.key : undefined"
        :aria-controls="ready && selected.key === stage.key ? 'gallery-stage-panel' : undefined"
        :tabindex="ready ? (selected.key === stage.key ? 0 : -1) : undefined"
        @click="activate($event, stage.key)" @keydown="keydown($event, stage.key)">
        {{ stage.label }}
      </a>
    </nav>
    <section id="gallery-stage-panel" class="gallery-stage-panel" :role="ready ? 'tabpanel' : 'region'"
      :aria-labelledby="'gallery-tab-' + selected.key" :tabindex="ready ? 0 : undefined">
      <div class="gallery-stage-heading">
        <p>{{ selected.description }}</p>
        <a :href="withBase(selected.href)">{{ english ? 'Read this stage →' : '阅读这一站 →' }}</a>
      </div>
      <PanoramaViewer :key="selected.key" :src="withBase(selected.src)" :label="selected.label"
        :source-links="selected.sourceLinks" :workshop="selected.key === 'workshop'" :canvas-width="selected.width" :canvas-height="selected.height">
        <picture v-if="selected.mobileSrc" class="gallery-workshop-map">
          <source media="(max-width: 640px)" :srcset="withBase(selected.mobileSrc)" />
          <img class="gallery-stage-map" :src="withBase(selected.src)" :alt="selected.description" />
        </picture>
        <object v-else class="gallery-stage-map" :data="withBase(selected.src)" type="image/svg+xml"
          :aria-label="selected.label" :style="{ aspectRatio: `${selected.width} / ${selected.height}` }">
          <a :href="withBase(selected.src)">{{ english ? 'Open the full SVG diagram' : '打开完整 SVG 图' }}</a>
        </object>
      </PanoramaViewer>
      <div class="gallery-links">
        <a :href="withBase(selected.src)">{{ english ? 'Open original SVG ↗' : '查看原尺寸 SVG ↗' }}</a>
        <a :href="withBase('/visuals/owner-architecture/index.html')">{{ english ? 'Owner details (Chinese) ↗' : '查找 Owner ↗' }}</a>
      </div>
    </section>
    <details id="owner-inventory" ref="inventory" class="gallery-inventory">
      <summary>{{ english ? 'Browse the registered Owner index' : '按阅读分组查找 Owner' }}</summary>
      <p class="gallery-scope">{{ english ? 'A reading index of registered nodes, not a release or acceptance checklist. Owner detail pages use Chinese labels.' : '图示是已登记节点的阅读索引，不是上线或验收清单。' }}</p>
      <slot />
    </details>
  </div>
</template>

<style scoped>
.architecture-gallery { min-width: 0; }
.gallery-stages { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; padding: 4px; margin: 24px 0 18px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); }
.gallery-stages a { display: flex; align-items: center; justify-content: center; min-height: 44px; padding: 8px 12px; border-radius: 8px; color: var(--vp-c-text-2); font-size: 14px; line-height: 1.4; text-align: center; text-decoration: none; }
.gallery-stages a:hover { color: var(--vp-c-brand-1); }
.gallery-stages a.selected { background: var(--vp-c-bg); color: var(--vp-c-brand-1); box-shadow: 0 1px 4px #0000000c; font-weight: 650; }
.gallery-stages a:focus-visible, .gallery-stage-panel:focus-visible, .gallery-inventory summary:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.gallery-stage-panel { min-width: 0; }
.gallery-stage-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px 24px; flex-wrap: wrap; }
.gallery-stage-heading p { flex: 1 1 420px; margin: 0; color: var(--vp-c-text-2); font-size: 14px; line-height: 1.7; }
.gallery-stage-heading a { flex: 0 0 auto; font-size: 14px; }
.architecture-gallery :deep(.panorama-viewer) { margin: 18px 0 12px; }
.gallery-stage-map { display: block; width: 100%; height: auto; max-width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: #fff; }
.gallery-links { display: flex; flex-wrap: wrap; gap: 8px 24px; font-size: 13px; }
.gallery-inventory { margin-top: 32px; padding: 16px 0; border-top: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); }
.gallery-inventory summary { cursor: pointer; font-size: 14px; font-weight: 600; min-height: 28px; }
.gallery-scope { font-size: 13px; color: var(--vp-c-text-2); }
.gallery-inventory :deep(table) { display: table; width: 100%; table-layout: fixed; font-size: 13px; }
.gallery-inventory :deep(th:first-child), .gallery-inventory :deep(td:first-child) { width: 23%; }
.gallery-inventory :deep(td) { overflow-wrap: anywhere; line-height: 1.9; }
@media (max-width: 640px) {
  .gallery-stages { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .gallery-stages a { padding: 8px 4px; font-size: 13px; }
  .gallery-stage-heading { gap: 8px; }
  .gallery-stage-heading p { flex-basis: 100%; }
  .gallery-inventory summary { min-height: 44px; }
  .gallery-inventory :deep(table), .gallery-inventory :deep(tbody), .gallery-inventory :deep(tr), .gallery-inventory :deep(td) { display: block; width: auto; }
  .gallery-inventory :deep(thead) { display: none; }
  .gallery-inventory :deep(tr) { padding: 12px 0; border-top: 1px solid var(--vp-c-divider); }
  .gallery-inventory :deep(td) { padding: 0; border: 0; background: none; }
  .gallery-inventory :deep(td:first-child) { width: auto; font-weight: 600; margin-bottom: 6px; }
}
</style>
