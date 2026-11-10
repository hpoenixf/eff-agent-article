<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { learningPathNavigation } from './learning-path-nav.mjs'

const { lang, frontmatter } = useData()
const route = useRoute()
const disclosure = ref<HTMLDetailsElement>()
const english = computed(() => lang.value.startsWith('en'))
const steps = computed(() => learningPathNavigation(`${english.value ? 'en/' : ''}articles/agent-in-15-minutes.md`)!.steps.slice(1))

function fit() {
  const menu = disclosure.value
  if (!menu) return
  const box = menu.getBoundingClientRect()
  const below = window.innerHeight - box.bottom - 16
  const above = box.top - 16
  const placement = below < 200 && above > below ? 'above' : 'below'
  menu.dataset.placement = placement
  menu.style.setProperty('--home-menu-space', `${Math.max(0, placement === 'above' ? above : below)}px`)
}

function close(restoreFocus = false) {
  if (!disclosure.value?.open) return
  disclosure.value.open = false
  if (restoreFocus) disclosure.value.querySelector('summary')?.focus()
}
function outside(event: Event) {
  if (event.target instanceof Node && !disclosure.value?.contains(event.target)) close()
}
function escape(event: KeyboardEvent) {
  if (event.key === 'Escape' && disclosure.value?.open) {
    event.preventDefault()
    close(true)
  }
}
watch(() => route.path, () => close())
watch(lang, () => close())
onMounted(() => {
  fit()
  document.addEventListener('pointerdown', outside)
  document.addEventListener('focusin', outside)
  document.addEventListener('keydown', escape)
  window.addEventListener('resize', fit)
  window.addEventListener('scroll', fit, { passive: true })
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside)
  document.removeEventListener('focusin', outside)
  document.removeEventListener('keydown', escape)
  window.removeEventListener('resize', fit)
  window.removeEventListener('scroll', fit)
})
</script>

<template>
  <div class="home-reading-actions">
    <details ref="disclosure" class="home-reading-menu" @toggle="fit">
      <summary>
        <span>{{ english ? 'Keep reading' : '继续阅读' }}<small>{{ english ? 'Concepts and hands-on guides' : '概念串讲与实作进阶' }}</small></span>
        <svg class="home-reading-menu__chevron" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false"><path d="m5 7.5 5 5 5-5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </summary>
      <nav :aria-label="english ? 'Continue the learning path' : '继续阅读路线'" class="home-reading-menu__links">
        <a v-for="step in steps" :key="step.slug" :href="withBase(step.href)" @click="close()">
          <span><strong>{{ step.label }}</strong><small>{{ step.description }}</small></span>
          <span aria-hidden="true">→</span>
        </a>
      </nav>
    </details>
    <div class="home-reading-actions__secondary">
    <a v-for="action in frontmatter.hero?.secondaryActions" :key="action.link" class="home-reading-actions__link" :href="withBase(action.link)" :target="action.target ?? (/^https?:\/\//.test(action.link) ? '_blank' : undefined)" :rel="action.rel ?? (/^https?:\/\//.test(action.link) ? 'noreferrer' : undefined)">{{ action.text }}</a>
    </div>
  </div>
</template>

<style scoped>
.home-reading-actions { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 10px; margin-top: 8px; text-align: left; }
.home-reading-menu { width: 100%; max-width: 330px; color: #eef7ee; }
.home-reading-menu summary { display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 48px; padding: 10px 18px; border: 1px solid rgba(219,237,226,.55); border-radius: 8px; cursor: pointer; list-style: none; font-size: 14px; font-weight: 650; line-height: 1.5; background: rgba(255,255,255,.07); }
.home-reading-menu summary::-webkit-details-marker { display: none; }
.home-reading-menu small { display: block; font-size: 12px; font-weight: 400; line-height: 1.5; color: #c8dbd0; }
.home-reading-menu__chevron { flex: 0 0 16px; transition: transform .16s ease; }
.home-reading-menu[open] .home-reading-menu__chevron { transform: rotate(180deg); }
.home-reading-menu__links { display: grid; margin-top: 6px; padding: 5px; border: 1px solid rgba(219,237,226,.4); border-radius: 8px; background: #173e35; }
.home-reading-menu__links a { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 54px; padding: 9px 12px; border-radius: 5px; color: #eef7ee; text-decoration: none; }
.home-reading-menu__links strong { font-size: 14px; }
.home-reading-menu__links a:hover, .home-reading-menu summary:hover { background: rgba(255,255,255,.12); }
.home-reading-actions__secondary { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; }
.home-reading-actions__link { display: inline-flex; align-items: center; min-height: 44px; padding: 8px 14px; border: 1px solid rgba(219,237,226,.38); border-radius: 8px; font-size: 13px; line-height: 1.6; font-weight: 600; color: #eef7ee; text-decoration: none; }
.home-reading-actions__link:hover { background: rgba(255,255,255,.1); }
.home-reading-actions a:focus-visible, .home-reading-menu summary:focus-visible { outline: 3px solid #d9efbd; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .home-reading-menu__chevron { transition: none; } }
@media (max-width: 639px) { .home-reading-menu { max-width: none; flex-basis: 100%; } }
</style>
