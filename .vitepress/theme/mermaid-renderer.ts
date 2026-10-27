// Mermaid uses a shared global configuration and DOM-backed renderer.
// Serializing initialization + rendering prevents diagrams with different themes
// from mutating shared state while another diagram is still rendering.
let nextId = 0
let queue: Promise<void> = Promise.resolve()

export function renderQueuedMermaid(source: string, dark: boolean): Promise<string> {
  const task = queue.catch(() => {}).then(async () => {
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: dark ? 'dark' : 'neutral',
      suppressErrorRendering: true
    })
    const { svg } = await mermaid.render('agent-reading-diagram-' + ++nextId, source)
    return svg
  })
  queue = task.then(() => {}, () => {})
  return task
}
