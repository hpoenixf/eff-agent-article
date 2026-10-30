<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ src: string; label: string; sourceLinks?: boolean; canvasWidth?: number; canvasHeight?: number }>()
const { lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const dialog = ref<HTMLDialogElement>()
const stage = ref<HTMLDivElement>()
const trigger = ref<HTMLButtonElement>()
const mounted = ref(false)
const opened = ref(false)
const scale = ref(1)
const fitting = ref(true)
const naturalWidth = computed(() => props.canvasWidth ?? 2960)
const naturalHeight = computed(() => props.canvasHeight ?? 1754)
const size = computed(() => ({
  width: `${naturalWidth.value * scale.value}px`,
  height: `${naturalHeight.value * scale.value}px`
}))
// The full 2960×1754 panorama keeps its established preview dimensions.
// Compact stage maps use a more readable intrinsic preview aspect ratio.
const compactPreviewStyle = computed(() => {
  const width = Math.min(1320, Math.round(naturalWidth.value * 0.64))
  const height = Math.round(width * naturalHeight.value / naturalWidth.value)
  return { '--learning-preview-width': `${width}px`, '--learning-preview-height': `${height}px` }
})
let observer: ResizeObserver | undefined
let ownsFullscreen = false
let previousOverflow = ''

function fit() {
  if (!stage.value) return
  fitting.value = true
  scale.value = Math.min(stage.value.clientWidth / naturalWidth.value, stage.value.clientHeight / naturalHeight.value, 1)
}

function zoom(value: number) {
  fitting.value = false
  scale.value = Math.max(0.1, Math.min(2, value))
}

async function open() {
  if (opened.value || !dialog.value) return
  previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  opened.value = true
  dialog.value.showModal()
  // Keep the viewport viewer usable when browser fullscreen is unavailable or denied.
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    ownsFullscreen = true
    void document.documentElement.requestFullscreen().catch(() => { ownsFullscreen = false })
  }
  await nextTick()
  fit()
}

function cleanup() {
  if (!opened.value) return
  opened.value = false
  document.documentElement.style.overflow = previousOverflow
  if (ownsFullscreen) {
    ownsFullscreen = false
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
  }
  trigger.value?.focus({ preventScroll: true })
}

function close() {
  dialog.value?.close()
  cleanup()
}

function fullscreenChanged() {
  if (ownsFullscreen && !document.fullscreenElement) close()
}

onMounted(async () => {
  mounted.value = true
  await nextTick()
  observer = new ResizeObserver(() => { if (opened.value && fitting.value) fit() })
  if (stage.value) observer.observe(stage.value)
  document.addEventListener('fullscreenchange', fullscreenChanged)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('fullscreenchange', fullscreenChanged)
  close()
})
</script>

<template>
  <figure class="panorama-viewer" :class="{ 'compact-learning-map': props.sourceLinks }" :style="props.sourceLinks ? compactPreviewStyle : undefined">
    <div class="panorama-toolbar">
      <span>{{ props.sourceLinks ? (english ? 'Learning map · select a chip for pinned source code' : '分阶段能力图 · 点击卡片查看固定源码') : (english ? 'Panorama · select a module to read more' : '全景图 · 点击模块阅读专文') }}</span>
      <button ref="trigger" type="button" aria-haspopup="dialog" :disabled="!mounted" @click="open">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" /></svg>
        {{ english ? 'Expand fullscreen' : '全屏展开' }}
      </button>
    </div>
    <slot />
    <Teleport v-if="mounted" to="body">
      <dialog ref="dialog" class="panorama-dialog" :aria-label="label" @close="cleanup" @cancel.prevent="close">
        <div class="panorama-toolbar panorama-controls">
          <strong>{{ props.sourceLinks ? (english ? 'Six-layer learning map' : '六层能力地图') : (english ? 'Six-layer panorama' : '六层调用全景') }}</strong>
          <div class="panorama-actions">
            <button type="button" :aria-label="english ? 'Zoom out' : '缩小'" :disabled="scale <= 0.1" @click="zoom(scale / 1.25)">−</button>
            <output aria-live="polite">{{ Math.round(scale * 100) }}%</output>
            <button type="button" :aria-label="english ? 'Zoom in' : '放大'" :disabled="scale >= 2" @click="zoom(scale * 1.25)">+</button>
            <button type="button" @click="fit">{{ english ? 'Fit' : '适应屏幕' }}</button>
            <button type="button" @click="zoom(1)">{{ english ? 'Actual size' : '原始尺寸' }}</button>
            <button type="button" autofocus @click="close">{{ english ? 'Close' : '退出全屏' }} <span aria-hidden="true">×</span></button>
          </div>
        </div>
        <div ref="stage" class="panorama-stage" tabindex="0" :aria-label="english ? 'Scrollable panorama' : '可滚动的全景图'">
          <object v-if="opened" class="panorama-canvas" :style="size" type="image/svg+xml" :data="src" :aria-label="label">
            <a :href="src">{{ english ? 'Open SVG panorama' : '打开 SVG 全景图' }}</a>
          </object>
        </div>
        <p class="panorama-hint">{{ props.sourceLinks ? (english ? 'Zoom and scroll · Select a chip for the pinned source · Esc to close' : '放大后可滚动查看 · 点击卡片打开固定源码 · Esc 退出') : (english ? 'Zoom in and scroll to explore · Select a module to read more · Esc to close' : '放大后可横向、纵向滚动查看 · 点击模块阅读专文 · Esc 退出') }}</p>
      </dialog>
    </Teleport>
  </figure>
</template>

<style scoped>
.panorama-viewer { margin: 24px 0; }
.compact-learning-map :deep(.v3-owner-map) {
  width: var(--learning-preview-width);
  height: var(--learning-preview-height);
}
.panorama-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; color: var(--vp-c-text-2); font-size: 13px; padding-bottom: 12px; }
.panorama-toolbar button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font: inherit; font-weight: 600; cursor: pointer; }
.panorama-toolbar button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.panorama-toolbar button:disabled { cursor: default; opacity: .45; }
.panorama-toolbar button:focus-visible, .panorama-stage:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: -2px; }
.panorama-dialog { position: fixed; inset: 0; width: 100%; height: 100%; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.panorama-dialog[open] { display: flex; flex-direction: column; }
.panorama-dialog::backdrop { background: var(--vp-c-bg); }
.panorama-controls { flex: none; margin: 0; padding: 12px 16px; border-bottom: 1px solid var(--vp-c-divider); }
.panorama-controls strong { color: var(--vp-c-text-1); font-size: 15px; }
.panorama-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.panorama-actions output { min-width: 48px; text-align: center; font-variant-numeric: tabular-nums; }
.panorama-stage { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; background: var(--vp-c-bg-alt); }
.panorama-canvas { display: block; max-width: none; margin: auto; border: 0; }
.panorama-hint { flex: none; margin: 0; padding: 8px 16px; border-top: 1px solid var(--vp-c-divider); font-size: 12px; line-height: 1.5; color: var(--vp-c-text-2); }
@media (max-width: 640px) {
  .panorama-controls { padding: 8px; gap: 4px; }
  .panorama-controls strong { width: 100%; }
  .panorama-actions { gap: 4px; }
  .panorama-toolbar button { min-height: 44px; padding: 8px; }
  .panorama-hint { padding: 8px; }
}
</style>
