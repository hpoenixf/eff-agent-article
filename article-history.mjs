import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

// A deliberately narrow comparison, not an AI claim of semantic equivalence.
// Ignore only known derived/layout metadata and ordinary prose whitespace; retain fenced code verbatim
// (except CRLF), because whitespace can change executable examples and diagrams.
export function comparableArticle(source) {
  const normalized = source.replace(/\r\n?/g, '\n')
  const header = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(normalized)
  const body = header ? normalized.slice(header[0].length) : normalized
  // Keep unknown fields conservatively, including title, description, evidence,
  // draft and publication flags. No YAML/semantic equivalence is claimed.
  const ignored = new Set(['lastUpdated', 'updatedAt', 'createdAt', 'layout', 'outline', 'sidebar', 'pageClass'])
  const metadata = []; let skip = false
  for (const line of (header?.[1] || '').split('\n')) {
    const key = /^([A-Za-z_][\w-]*):/.exec(line)?.[1]
    if (key) skip = ignored.has(key)
    if (!skip) metadata.push(line.trimEnd())
  }
  const parts = metadata.join('\n').trim() ? ['frontmatter:\n' + metadata.join('\n').trim()] : []; let prose = []; let code = []; let fence = null
  const flush = () => { if (prose.length) parts.push(prose.join('\n').replace(/\s+/g, ' ').trim()); prose = [] }
  for (const line of body.split('\n')) {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1]
    if (!fence && marker) { flush(); fence = marker; code = [line] }
    else if (fence) {
      code.push(line)
      if (/^\s{0,3}(`{3,}|~{3,})[ \t]*$/.test(line) && marker && marker[0] === fence[0] && marker.length >= fence.length) { parts.push(code.join('\n')); code = []; fence = null }
    } else if (line.includes('`')) { flush(); parts.push(line.trim()) }
    else prose.push(line)
  }
  flush(); if (code.length) parts.push(code.join('\n'))
  return parts.filter(Boolean).join('\n')
}

const calendarDate = timestamp => new Date(Date.parse(timestamp) + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)

export function articleHistory(root, paths, { includeCreated = false } = {}) {
  const raw = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore','pipe','pipe'] })
  const git = (...args) => raw(...args).trimEnd()
  if (resolve(git('rev-parse', '--show-toplevel')) !== resolve(root)) throw new Error('Article source has no independent Git history')
  if (git('rev-parse', '--is-shallow-repository') !== 'false') throw new Error('Recent articles require full Git history (checkout fetch-depth: 0); no invented dates.')
  const wanted = new Set(paths)
  for (const path of wanted) if (!/^(?:en\/)?articles\/[a-z0-9][a-z0-9-]*\.md$/.test(path)) throw new Error('Invalid article history path: ' + path)
  const history = new Map()
  if (!wanted.size) return history
  const rows = git('log', '--first-parent', '--format=@@%H\t%P\t%cI', '--name-only', '--no-renames', '--diff-filter=AM', 'HEAD', '--', 'articles', 'en/articles').split('\n')
  let revision
  for (const row of rows) {
    if (row.startsWith('@@')) { const [commit, parents, timestamp] = row.slice(2).split('\t'); revision = { commit, parent: parents.split(' ')[0], timestamp }; continue }
    if (!wanted.has(row) || history.has(row) || !revision) continue
    const { commit, parent, timestamp } = revision
    const current = raw('show', `${commit}:${row}`)
    // Determine absence using the parent tree, not a catch-all that hides Git failures.
    const existed = parent && git('ls-tree', '--name-only', parent, '--', row) === row
    const previous = existed ? raw('show', `${parent}:${row}`) : null
    if (previous !== null && comparableArticle(previous) === comparableArticle(current)) continue
    if (!Number.isFinite(Date.parse(timestamp))) throw new Error('Invalid Git article timestamp: ' + commit)
    history.set(row, { date: calendarDate(timestamp), timestamp, kind: previous === null ? 'new' : 'updated', commit })
  }
  if (includeCreated) {
    // First recorded version of this edition, not the author's original writing date.
    // Walk the same first-parent history backwards, following Git-recognized renames.
    // Stop at its addition: an unrelated deleted/re-created path is not the same lineage.
    const currentPaths = new Set(git('ls-tree', '-r', '--name-only', 'HEAD', '--', 'articles', 'en/articles').split('\n'))
    const lineages = new Map([...wanted].filter(path => currentPaths.has(path) && history.has(path)).map(path => [path, new Set([path])]))
    const additions = git('log', '--first-parent', '--format=@@%H\t%cI', '--name-status', '--find-renames', '--diff-filter=AR', 'HEAD', '--', 'articles', 'en/articles').split('\n')
    let event
    for (const row of additions) {
      if (row.startsWith('@@')) { const [commit, timestamp] = row.slice(2).split('\t'); event = { commit, timestamp }; continue }
      if (!event) continue
      const [status, from, to] = row.split('\t')
      if (/^R\d+$/.test(status) && lineages.has(to)) {
        const origins = lineages.get(from) || new Set()
        for (const path of lineages.get(to)) origins.add(path)
        lineages.set(from, origins); lineages.delete(to)
      } else if (status === 'A' && lineages.has(from)) {
        if (!Number.isFinite(Date.parse(event.timestamp))) throw new Error('Invalid Git article timestamp: ' + event.commit)
        for (const path of lineages.get(from)) history.get(path).created = { ...event, date: calendarDate(event.timestamp), path: from }
        lineages.delete(from)
      }
    }
  }
  return history
}

// Optional discovery must not make the article site unavailable.
export function availableArticleHistory(root, paths, warn = console.warn, options = {}) {
  try { return { history: articleHistory(root, paths, options), available: true } }
  catch {
    warn('Recent updates unavailable: reliable full Git history could not be read. Article content and catalogue remain available.')
    return { history: new Map(), available: false }
  }
}
