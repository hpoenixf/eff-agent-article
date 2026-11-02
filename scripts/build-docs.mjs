import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// VitePress can finish with exit 0 after a page's SSR render has thrown.
// Keep its normal output and exit status, but reject observable render errors too.
export function hasBuildException(text) {
  const plain = text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
  return /^(?:[A-Za-z]*Error)(?:\s+\[[^\]]+\])?:/m.test(plain) ||
    /Unhandled error during execution|Error when evaluating SSR module/.test(plain)
}

export async function runCheckedBuild(command, args, { writeOut = bytes => process.stdout.write(bytes), writeErr = bytes => process.stderr.write(bytes), cancelGraceMs = 2000 } = {}) {
  return new Promise(resolveExit => {
    const child = spawn(command, args, { stdio: ['inherit', 'pipe', 'pipe'] })
    let failed = false, startFailed = false, cancelledBy = null, cancelTimer
    const cancel = signal => {
      if (cancelledBy) { child.kill('SIGKILL'); return }
      cancelledBy = signal; child.kill(signal)
      cancelTimer = setTimeout(() => child.kill('SIGKILL'), cancelGraceMs)
      cancelTimer.unref()
    }
    const interrupt = () => cancel('SIGINT'), terminate = () => cancel('SIGTERM')
    process.on('SIGINT', interrupt); process.on('SIGTERM', terminate)
    const observe = write => {
      let tail = ''
      return bytes => {
        write(bytes)
        const text = tail + bytes.toString()
        failed ||= hasBuildException(text)
        tail = text.slice(text.lastIndexOf('\n') + 1).slice(-4096)
      }
    }
    child.stdout.on('data', observe(writeOut)); child.stderr.on('data', observe(writeErr))
    child.on('error', error => { failed = true; startFailed = true; writeErr(Buffer.from('Build process could not start: ' + error.message + '\n')) })
    child.on('close', (code, signal) => {
      clearTimeout(cancelTimer)
      process.off('SIGINT', interrupt); process.off('SIGTERM', terminate)
      if (failed && code === 0) writeErr(Buffer.from('Build rejected: an SSR/build exception was logged despite exit code 0.\n'))
      const finalSignal = cancelledBy || signal
      resolveExit({ code: finalSignal ? null : startFailed ? 1 : code === 0 ? (failed ? 1 : 0) : (code ?? 1), signal: finalSignal })
    })
  })
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  const require = createRequire(import.meta.url)
  const packageFile = require.resolve('vitepress/package.json')
  const cli = resolve(dirname(packageFile), 'bin/vitepress.js')
  const result = await runCheckedBuild(process.execPath, [cli, 'build', '.'])
  if (result.signal) process.kill(process.pid, result.signal)
  else process.exitCode = result.code
}
