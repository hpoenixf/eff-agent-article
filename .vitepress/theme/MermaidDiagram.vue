<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { renderQueuedMermaid } from './mermaid-renderer'

const props = defineProps<{ source: string; title?: string; description?: string }>()
const { isDark, lang } = useData()
const html = ref('')
const error = ref('')
const mounted = ref(false)
const code = computed(() => decodeURIComponent(props.source))
const english = computed(() => lang.value.startsWith('en'))
const label = computed(() => decodeURIComponent(props.title || (english.value ? 'Architecture diagram' : '架构关系图')))
const description = computed(() => decodeURIComponent(props.description || props.title || label.value))
let generation = 0

async function renderDiagram() {
  const request = ++generation
  error.value = ''
  try {
    // Do not race Mermaid.initialize across diagrams or rerenders.
    const svg = await renderQueuedMermaid(code.value, isDark.value)
    if (generation === request) html.value = svg
  } catch (cause) {
    if (generation === request) {
      html.value = ''
      error.value = english.value
        ? 'This diagram could not render. Expand to inspect its source.'
        : '图表绘制失败，可展开查看原始图描述。'
      console.warn('Mermaid diagram rendering failed', cause)
    }
  }
}

onMounted(() => {
  mounted.value = true
  void renderDiagram()
})
watch([isDark, () => props.source], () => {
  if (mounted.value) void renderDiagram()
})
</script>

<template>
  <figure class="diagram-frame" :aria-label="label">
    <div v-if="html" class="mermaid-output" role="img" :aria-label="description" v-html="html" />
    <div v-else-if="!mounted" class="diagram-static-fallback">
      <p>{{ english ? 'The diagram is rendered when the page loads.' : '页面加载后将显示架构图。' }}</p>
      <noscript><p>{{ english ? 'JavaScript is required to draw this diagram. The surrounding article explains the relationships.' : '绘制此图需要 JavaScript，前后正文保留了关系与判断的文字解释。' }}</p></noscript>
    </div>
    <div v-else-if="!error" class="diagram-loading" aria-live="polite">
      {{ english ? 'Rendering diagram…' : '正在绘制架构图…' }}
    </div>
    <details v-else class="diagram-fallback">
      <summary>{{ error }}</summary>
      <pre>{{ code }}</pre>
    </details>
    <figcaption class="diagram-caption">{{ label }}</figcaption>
  </figure>
</template>
