<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ source: string; title?: string; description?: string }>()
const { isDark, lang } = useData()
const html = ref('')
const error = ref('')
const mounted = ref(false)
const code = computed(() => decodeURIComponent(props.source))
const label = computed(() => decodeURIComponent(props.title || (lang.value.startsWith('en') ? 'Architecture diagram' : '架构关系图')))
const description = computed(() => decodeURIComponent(props.description || props.title || label.value))
const english = computed(() => lang.value.startsWith('en'))
let generation = 0
let sequence = 0

async function renderDiagram() {
  const request = ++generation
  error.value = ''
  try {
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: isDark.value ? 'dark' : 'neutral',
      suppressErrorRendering: true
    })
    const { svg } = await mermaid.render('agent-reading-diagram-' + (++sequence) + '-' + Math.random().toString(36).slice(2), code.value)
    if (generation === request) html.value = svg
  } catch (cause) {
    if (generation === request) {
      html.value = ''
      error.value = english.value
        ? 'This diagram could not render. The relationships are available below.'
        : '这张图暂时无法渲染，请查看下方关系文本。'
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
      <p>{{ description }}</p>
      <pre>{{ code }}</pre>
    </div>
    <div v-else-if="!error" class="diagram-loading" aria-live="polite">
      {{ english ? 'Rendering diagram…' : '正在绘制架构图…' }}
    </div>
    <details v-else open class="diagram-fallback">
      <summary>{{ error }}</summary>
      <pre>{{ code }}</pre>
    </details>
    <figcaption class="diagram-caption">{{ label }}</figcaption>
  </figure>
</template>
