import assert from 'node:assert/strict'
import { localizedSitePath } from '../language-routing.mjs'
const translations = ['tool-results-outside-model-context']
const testCases = [
  ['', 'en', '/en/'],
  ['modules', 'en', '/en/modules'],
  ['engineering', 'en', '/en/engineering'],
  ['en/engineering', 'zh', '/engineering'],
  ['en/articles/tool-results-outside-model-context', 'zh', '/articles/tool-results-outside-model-context'],
  ['articles/tool-results-outside-model-context', 'en', '/en/articles/tool-results-outside-model-context'],
  ['articles/unavailable-is-correct', 'en', null],
  ['en/articles/unavailable-is-correct', 'en', null],
  ['en/fintech', 'en', '/en/fintech'],
  ['articles/unavailable-is-correct', 'zh', '/articles/unavailable-is-correct'],
  ['/catalog.html', 'en', '/en/catalog']
]
for (const [path, language, expected] of testCases) {
  assert.equal(localizedSitePath(path, language, translations), expected, path + ':' + language)
}
console.log('Locale path and untranslated fallback routing validated.')
