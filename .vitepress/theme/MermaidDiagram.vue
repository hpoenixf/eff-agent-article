<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ source: string }>()
const { isDark } = useData()
const html = ref('')
const error = ref('')
const code = computed(() => decodeURIComponent(props.source))
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
      error.value = '这张图暂时无法渲染，请查看下方原始 Mermaid 文本。'
      console.warn('Mermaid diagram rendering failed', cause)
    }
  }
}

onMounted(renderDiagram)
watch([isDark, () => props.source], () => { void renderDiagram() })
</script>

<template>
  <div class="diagram-frame">
    <div v-if="html" class="mermaid-output" v-html="html" />
    <div v-else-if="!error" class="diagram-loading">正在绘制架构图…</div>
    <details v-else open class="diagram-fallback">
      <summary>{{ error }}</summary>
      <pre>{{ code }}</pre>
    </details>
  </div>
</template>
