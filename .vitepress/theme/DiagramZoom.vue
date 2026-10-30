<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { lang } = useData()
const route = useRoute()
const english = computed(() => lang.value.startsWith('en'))
const mounted = ref(false)
const dialog = ref<HTMLDialogElement>()
const stage = ref<HTMLDivElement>()
const picture = ref<HTMLImageElement>()
const source = ref('')
const label = ref('')
const opened = ref(false)
const scale = ref(1)
const fittedWidth = ref(300)
let trigger: HTMLElement | undefined
let previousOverflow = ''
let observer: ResizeObserver | undefined
let removeDecorations: (() => void)[] = []

function fit() {
  if (!stage.value || !picture.value) return
  const image = picture.value
  const ratio = image.naturalWidth / image.naturalHeight
  if (!Number.isFinite(ratio) || ratio <= 0) return
  fittedWidth.value = Math.max(1, Math.min(stage.value.clientWidth - 32, (stage.value.clientHeight - 32) * ratio))
  scale.value = 1
}

async function open(image: HTMLImageElement, button: HTMLElement) {
  if (!dialog.value || opened.value) return
  source.value = image.currentSrc || image.src
  label.value = image.alt || (english.value ? 'Article diagram' : '文章图表')
  trigger = button
  previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  opened.value = true
  try { dialog.value.showModal() } catch { cleanup(); return }
  await nextTick()
  fit()
}

function cleanup() {
  if (!opened.value) return
  opened.value = false
  document.documentElement.style.overflow = previousOverflow
  if (trigger?.isConnected) trigger.focus({ preventScroll: true })
}

function close() { dialog.value?.close(); cleanup() }
function zoom(factor: number) { scale.value = Math.min(8, Math.max(0.25, scale.value * factor)) }
function clearDecorations() { for (const remove of removeDecorations) remove(); removeDecorations = [] }

// Progressive enhancement covers Markdown and retained hand-authored figures.
// Existing navigation links and the interactive Owner map keep their own behavior.
async function enhance() {
  close()
  clearDecorations()
  await nextTick()
  for (const image of document.querySelectorAll<HTMLImageElement>('.vp-doc img')) {
    if (image.closest('.wechat-follow, .panorama-viewer') || /wechat-public-account/.test(image.src)) continue
    const link = image.closest('a')
    if (link && link.href !== image.src && link.href !== image.currentSrc) continue
    const existing = image.closest('figure')?.querySelector<HTMLAnchorElement>('.diagram-original')
    const button = existing || document.createElement('button')
    if (!existing) {
      button.className = 'diagram-zoom-trigger'
      button.setAttribute('type', 'button')
      button.textContent = english.value ? 'Enlarge diagram' : '放大查看图表'
      ;(link || image).insertAdjacentElement('afterend', button)
      removeDecorations.push(() => button.remove())
    }
    const click = (event: MouseEvent) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      void open(image, button)
    }
    button.setAttribute('aria-haspopup', 'dialog')
    image.setAttribute('data-diagram-zoom', '')
    button.addEventListener('click', click)
    image.addEventListener('click', click)
    removeDecorations.push(() => {
      button.removeEventListener('click', click)
      image.removeEventListener('click', click)
      button.removeAttribute('aria-haspopup')
      image.removeAttribute('data-diagram-zoom')
    })
  }
}

onMounted(async () => {
  mounted.value = true
  await nextTick()
  observer = new ResizeObserver(() => { if (opened.value && scale.value === 1) fit() })
  if (stage.value) observer.observe(stage.value)
  await enhance()
})
watch(() => route.path, enhance)
onBeforeUnmount(() => { observer?.disconnect(); close(); clearDecorations() })
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <dialog ref="dialog" class="diagram-zoom-dialog" :aria-label="label" @cancel.prevent="close" @close="cleanup">
      <header class="diagram-zoom-toolbar">
        <strong>{{ english ? 'Diagram detail' : '图表细节' }}</strong>
        <div class="diagram-zoom-controls">
          <button type="button" :aria-label="english ? 'Zoom out' : '缩小'" :disabled="scale <= 0.25" @click="zoom(0.8)">−</button>
          <output aria-live="polite">{{ Math.round(scale * 100) }}%</output>
          <button type="button" :aria-label="english ? 'Zoom in' : '放大'" :disabled="scale >= 8" @click="zoom(1.25)">+</button>
          <button type="button" @click="fit">{{ english ? 'Fit screen' : '适应屏幕' }}</button>
          <a :href="source" target="_blank" rel="noopener noreferrer">{{ english ? 'Open original' : '打开原图' }}</a>
          <button type="button" autofocus @click="close">{{ english ? 'Close' : '关闭' }} ×</button>
        </div>
      </header>
      <div ref="stage" class="diagram-zoom-stage" tabindex="0" :aria-label="english ? 'Scroll enlarged diagram' : '滚动查看放大的图表'">
        <img v-if="opened" ref="picture" :src="source" :alt="label" :style="{ width: `${fittedWidth * scale}px` }" @load="fit" />
      </div>
      <p class="diagram-zoom-hint">{{ english ? 'Zoom, then scroll horizontally or vertically. Escape closes and returns focus.' : '放大后可横向、纵向滚动查看；Esc 关闭并返回原位置。' }}</p>
    </dialog>
  </Teleport>
</template>
