/** GA4 web stream: hpoenixf.com. History-based enhanced pageviews are OFF.
 * Keep that stream setting off: this module is the single page_view owner.
 * Do not enable search/form/outbound automatic measurement (unfiltered input).
 */
export const MEASUREMENT_ID = 'G-TPTFGQ4C1H'
export const CONSENT_KEY = 'hpoenixf:analytics-consent:v1'
const MAX_AGE = 180 * 24 * 60 * 60 * 1000
const SINGLETON = '__hpoenixfAnalyticsV1'

export function cleanLocation(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'hpoenixf.com'
      ? `https://hpoenixf.com${url.pathname}` : null
  } catch { return null }
}
export function cleanReferrer(value) {
  try {
    const url = new URL(value)
    if (!['https:', 'http:'].includes(url.protocol)) return ''
    return url.hostname === 'hpoenixf.com' ? cleanLocation(value) || '' : url.origin
  } catch { return '' }
}
export function readConsent(storage, now = Date.now()) {
  try {
    const choice = JSON.parse(storage.getItem(CONSENT_KEY))
    return choice && ['granted', 'denied'].includes(choice.value) &&
      Number.isFinite(choice.time) && choice.time <= now && now - choice.time < MAX_AGE
      ? choice.value : null
  } catch { return null }
}

export function createAnalytics(win, doc) {
  if (!win || !doc || win.location.hostname !== 'hpoenixf.com' || win.location.protocol !== 'https:') return null
  if (win[SINGLETON]) return win[SINGLETON]
  // Another tag owner must be reviewed, not layered over or silently replaced.
  if (typeof win.gtag === 'function' || doc.querySelector('script[src*="googletagmanager.com/gtag/js"],script[src*="googletagmanager.com/gtm.js"]')) return null
  const disabled = `ga-disable-${MEASUREMENT_ID}`
  let storage
  try { storage = win.localStorage } catch { storage = { getItem: () => null, setItem: () => {} } }
  let choice = readConsent(storage)
  let expiresAt = 0
  try { if (choice) expiresAt = JSON.parse(storage.getItem(CONSENT_KEY)).time + MAX_AGE } catch { choice = null }
  let expiryTimer
  let started = false
  let previous = cleanReferrer(doc.referrer)
  let lastPage = ''
  const listeners = new Set()
  win[disabled] = true
  function gtag() { (win.dataLayer ||= []).push(arguments) }
  const location = () => cleanLocation(win.location.href)
  function context() {
    const page = location()
    if (!page) return null
    // All automatic events inherit sanitized document context too.
    gtag('set', { page_location: page, page_referrer: previous, page_title: doc.title })
    return page
  }
  function checkExpiry() {
    if (choice === 'granted' && Date.now() >= expiresAt) {
      choice = null
      win[disabled] = true
      for (const listener of listeners) listener(choice)
      if (started) win.location.reload()
      return false
    }
    return true
  }
  function scheduleExpiry() {
    if (expiryTimer) win.clearTimeout(expiryTimer)
    if (choice !== 'granted') return
    expiryTimer = win.setTimeout(() => {
      if (checkExpiry()) scheduleExpiry()
    }, Math.min(Math.max(0, expiresAt - Date.now()), 2147483647))
  }
  function pageView() {
    if (!checkExpiry()) return
    if (choice !== 'granted' || !started) return
    const page = location()
    if (!page || page === lastPage) return
    context()
    gtag('event', 'page_view', { send_to: MEASUREMENT_ID, page_location: page,
      page_referrer: previous, page_title: doc.title })
    previous = page
    lastPage = page
  }
  function start() {
    if (!checkExpiry()) return
    if (started || choice !== 'granted' || !location()) return
    started = true
    scheduleExpiry()
    win[disabled] = false
    win.gtag = gtag
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied' })
    context()
    gtag('js', new Date())
    gtag('config', MEASUREMENT_ID, { send_page_view: false, allow_google_signals: false,
      allow_ad_personalization_signals: false, cookie_domain: 'hpoenixf.com', cookie_path: '/',
      cookie_flags: 'SameSite=Lax;Secure', cookie_expires: MAX_AGE / 1000 })
    const script = doc.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
    script.id = 'hpoenixf-google-analytics'
    script.referrerPolicy = 'origin'
    doc.head.appendChild(script)
    pageView()
  }
  function setConsent(value) {
    if (!['granted', 'denied'].includes(value)) return
    choice = value
    expiresAt = Date.now() + MAX_AGE
    scheduleExpiry()
    try { storage.setItem(CONSENT_KEY, JSON.stringify({ value, time: Date.now() })) } catch { /* session-only */ }
    for (const listener of listeners) listener(choice)
    if (value === 'granted') start()
    else {
      win[disabled] = true
      // No consent ping on rejection. Reload removes already loaded Google code.
      if (started) win.location.reload()
    }
  }
  const api = { getConsent: () => choice, setConsent, pageView,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) } }
  win[SINGLETON] = api
  // Document-scoped listeners intentionally survive UI remounts (e.g. StrictMode).
  // Reload on withdrawal/expiry removes Google and this singleton together.
  doc.addEventListener('visibilitychange', () => { checkExpiry() })
  win.addEventListener('storage', event => {
    if (event.key !== CONSENT_KEY && event.key !== null) return
    choice = readConsent(storage)
    try { expiresAt = choice ? JSON.parse(storage.getItem(CONSENT_KEY)).time + MAX_AGE : 0 } catch { choice = null }
    scheduleExpiry()
    for (const listener of listeners) listener(choice)
    if (choice === 'granted') start()
    else { win[disabled] = true; if (started) win.location.reload() }
  })
  start()
  return api
}

/** Framework-neutral consent UI, so blog and reader have identical choices. */
export function mountAnalyticsConsent(win, doc) {
  const analytics = createAnalytics(win, doc)
  if (!analytics) return () => {}
  const host = doc.createElement('section')
  host.setAttribute('aria-label', 'Analytics privacy / 访问统计隐私')
  host.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:1000;max-width:min(440px,calc(100vw - 24px));padding:12px;border:1px solid #64748b;border-radius:8px;background:#fff;color:#172033;font:14px/1.5 system-ui;box-shadow:0 2px 12px #0002'
  function button(text, action) {
    const el = doc.createElement('button')
    el.type = 'button'; el.textContent = text
    el.style.cssText = 'margin:4px 8px 0 0;padding:6px 10px;border:1px solid #64748b;border-radius:5px;background:#fff;color:#172033;cursor:pointer;font:inherit'
    el.addEventListener('click', action)
    return el
  }
  function render() {
    host.replaceChildren()
    const choice = analytics.getConsent()
    if (choice) {
      host.appendChild(button('Privacy / 隐私设置', () => renderChoices()))
    } else renderChoices()
  }
  function renderChoices() {
    host.replaceChildren()
    const message = doc.createElement('p')
    message.textContent = 'Optional Google Analytics uses cookies to measure page visits only after you agree. Google receives your IP address and device information. No advertising features. Choice kept for 180 days; you can withdraw here. / 可选 Google Analytics 在同意后使用 Cookie 统计访问，Google 会接收 IP 和设备信息；不启用广告功能。选择保留180天，可随时在此撤回。'
    message.style.margin = '0 0 6px'
    host.appendChild(message)
    const privacy = doc.createElement('a')
    privacy.textContent = 'Google privacy policy / Google 隐私政策'
    privacy.href = 'https://policies.google.com/privacy'
    privacy.target = '_blank'; privacy.rel = 'noopener noreferrer'
    privacy.style.cssText = 'display:block;text-decoration:underline;color:#172033;margin:4px 0'
    host.appendChild(privacy)
    host.appendChild(button('Accept / 同意', () => analytics.setConsent('granted')))
    host.appendChild(button(analytics.getConsent() === 'granted' ? 'Withdraw / 撤回' : 'Decline / 拒绝', () => analytics.setConsent('denied')))
    if (analytics.getConsent()) host.appendChild(button('Close / 关闭', render))
  }
  const unsubscribe = analytics.subscribe(render)
  render(); doc.body.appendChild(host)
  return () => { unsubscribe(); host.remove() }
}
