import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanLocation, cleanReferrer, readConsent, createAnalytics, mountAnalyticsConsent, CONSENT_KEY, MEASUREMENT_ID } from '../site-analytics.mjs'
function fixture({ hostname = 'hpoenixf.com', existing = false, consent } = {}) {
  const values = new Map(consent ? [[CONSENT_KEY, JSON.stringify({value:consent,time:Date.now()})]] : [])
  class Element {
    children = []; listeners = {}; style = {}; attrs = {}
    setAttribute(k,v) { this.attrs[k]=v }
    appendChild(el) { this.children.push(el); return el }
    replaceChildren() { this.children = [] }
    addEventListener(k,v) { this.listeners[k] = v }
    remove() { this.removed = true }
    focus(options) { doc.activeElement = this; this.focusOptions = options }
    contains(el) { return this === el || this.children.some(child => child.contains(el)) }
  }
  const doc = { addEventListener:()=>{}, title:'Public article', referrer:'https://example.org/from?email=private#secret',
    querySelector:()=>existing ? {} : null, createElement:()=>new Element(), head:new Element(), body:new Element() }
  let reloads = 0
  const events={}; let timer
  const win = { setTimeout:fn=>{timer=fn;return 1}, clearTimeout:()=>{}, location:{hostname, protocol:'https:',href:`https://${hostname}/a?email=private#secret`,reload(){reloads++}},
    localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},addEventListener:(k,v)=>{events[k]=v} }
  return {win,doc,events,values,reloads:()=>reloads, expire:()=>timer()}
}
const views = f => (f.win.dataLayer || []).filter(x=>x[0]==='event'&&x[1]==='page_view')
test('safe public locations and referrers never retain query/hash',()=>{
  assert.equal(cleanLocation('https://hpoenixf.com/a?q=x#private'),'https://hpoenixf.com/a')
  assert.equal(cleanLocation('https://other.com/a'),null)
  assert.equal(cleanReferrer('https://other.com/private?q=x#s'),'https://other.com')
  assert.equal(cleanReferrer('javascript:alert(1)'),'')
})
test('unknown/declined consent creates no script, queue or event',()=>{
  const f=fixture();const api=createAnalytics(f.win,f.doc)
  api.pageView();api.setConsent('denied');api.pageView()
  assert.equal(f.doc.head.children.length,0);assert.equal(f.win.dataLayer,undefined)
})
test('accept once; strict lifecycle repeat dedupes; A to B to A counts all',()=>{
  const f=fixture();const api=createAnalytics(f.win,f.doc);api.setConsent('granted');api.setConsent('granted')
  assert.equal(createAnalytics(f.win,f.doc),api);api.pageView()
  f.win.location.href='https://hpoenixf.com/b?q=secret';api.pageView()
  f.win.location.href='https://hpoenixf.com/a#secret';api.pageView()
  assert.equal(f.doc.head.children.length,1);assert.equal(views(f).length,3)
  assert.equal(views(f)[1][2].page_referrer,'https://hpoenixf.com/a')
  assert.equal(views(f)[0][2].page_referrer,'https://example.org')
  assert.ok(!JSON.stringify(f.win.dataLayer).includes('private'))
  assert.ok(!JSON.stringify(f.win.dataLayer).includes('secret'))
  const config=f.win.dataLayer.find(x=>x[0]==='config')[2]
  assert.equal(config.send_page_view,false);assert.equal(config.allow_google_signals,false)
  assert.equal(f.doc.head.children[0].referrerPolicy,'origin')
})
test('revoke disables immediately and reloads; denied reload remains inert',()=>{
  const f=fixture({consent:'granted'});const api=createAnalytics(f.win,f.doc)
  api.setConsent('denied');f.win.location.href='https://hpoenixf.com/b';api.pageView()
  assert.equal(views(f).length,1);assert.equal(f.win[`ga-disable-${MEASUREMENT_ID}`],true)
  assert.equal(f.reloads(),1)
  const fresh=fixture({consent:'denied'});createAnalytics(fresh.win,fresh.doc)
  assert.equal(fresh.doc.head.children.length,0)
})
test('existing tag/preview hostname fail closed',()=>{
  for(const options of [{existing:true},{hostname:'localhost'},{hostname:'hpoenixf.github.io'}]) {
    const f=fixture(options);assert.equal(createAnalytics(f.win,f.doc),null);assert.equal(f.doc.head.children.length,0)
  }
})
test('cross-tab denial disables running runtime',()=>{
  const f=fixture({consent:'granted'});createAnalytics(f.win,f.doc)
  f.values.set(CONSENT_KEY,JSON.stringify({value:'denied',time:Date.now()}));f.events.storage({key:CONSENT_KEY})
  assert.equal(f.win[`ga-disable-${MEASUREMENT_ID}`],true);assert.equal(f.reloads(),1)
})
test('consent expires or malformed/future values fail closed',()=>{
  assert.equal(readConsent({getItem:()=>'{'}),null)
  assert.equal(readConsent({getItem:()=>JSON.stringify({value:'granted',time:1})},200*86400000),null)
  assert.equal(readConsent({getItem:()=>JSON.stringify({value:'granted',time:100})},99),null)
})
test('actual UI offers equal accept/decline and persistent reopen; remount does not retrack',()=>{
  const f=fixture();const cleanup=mountAnalyticsConsent(f.win,f.doc)
  const host=f.doc.body.children[0];assert.equal(host.children.length,4)
  assert.equal(host.children[2].style.cssText,host.children[3].style.cssText)
  host.children[2].listeners.click();assert.equal(views(f).length,1)
  host.children[0].listeners.click();assert.match(host.children[3].textContent,/Withdraw/)
  cleanup();assert.equal(host.removed,true)
  mountAnalyticsConsent(f.win,f.doc);assert.equal(views(f).length,1)
})
test('expiry blocks pageviews and automatic activity using bounded timer',()=>{
 const f=fixture({consent:'granted'}); const api=createAnalytics(f.win,f.doc)
 const original=Date.now;Date.now=()=>original()+181*86400000
 try { f.expire();api.pageView(); assert.equal(f.win[`ga-disable-${MEASUREMENT_ID}`],true);assert.equal(views(f).length,1);assert.equal(f.reloads(),1) }
 finally {Date.now=original}
})
test('storage clear invalidates active consent',()=>{
 const f=fixture({consent:'granted'});createAnalytics(f.win,f.doc);f.values.clear();f.events.storage({key:null})
 assert.equal(f.win[`ga-disable-${MEASUREMENT_ID}`],true);assert.equal(f.reloads(),1)
})
test('duplicate view preserves global prior referrer',()=>{
 const f=fixture({consent:'granted'});const api=createAnalytics(f.win,f.doc)
 api.pageView();const sets=f.win.dataLayer.filter(x=>x[0]==='set')
 assert.equal(sets.at(-1)[1].page_referrer,'https://example.org')
})

test('saved choices collapse to document footer and keep keyboard reopen/close/withdraw reachable', () => {
  for (const consent of ['granted', 'denied']) {
    const f = fixture({ consent }); mountAnalyticsConsent(f.win, f.doc)
    const host = f.doc.body.children[0]
    assert.equal(host.children.length, 1)
    assert.match(host.style.cssText, /position:static/)
    assert.doesNotMatch(host.style.cssText, /position:fixed|box-shadow|z-index|border:/)
    let entry = host.children[0]; entry.focus(); entry.listeners.click()
    assert.match(host.style.cssText, /position:fixed/)
    assert.equal(f.doc.activeElement, host.children[2])
    assert.deepEqual(f.doc.activeElement.focusOptions, { preventScroll: true })
    assert.equal(host.children[2].style.cssText, host.children[3].style.cssText)
    const close = host.children[4]; close.focus(); close.listeners.click()
    assert.match(host.style.cssText, /position:static/)
    assert.equal(f.doc.activeElement, host.children[0])
    entry = host.children[0]; entry.listeners.click()
    let prevented = false
    host.listeners.keydown({key:'Escape', preventDefault(){prevented=true}})
    assert.equal(prevented,true); assert.equal(f.doc.activeElement,host.children[0])
    host.children[0].listeners.click()
    const decline = host.children[3]; decline.focus(); decline.listeners.click()
    assert.equal(f.win[`ga-disable-${MEASUREMENT_ID}`],true)
    assert.match(host.style.cssText,/position:static/)
    assert.equal(host.children.length,1)
    assert.equal(f.doc.activeElement,host.children[0])
  }
})
test('first choice has equal actions then collapses without forcing scroll', () => {
  const f=fixture(); mountAnalyticsConsent(f.win,f.doc)
  const host=f.doc.body.children[0]
  assert.match(host.style.cssText,/position:fixed/)
  assert.equal(f.doc.activeElement,undefined)
  assert.equal(host.children[2].style.cssText,host.children[3].style.cssText)
  host.children[2].focus(); host.children[2].listeners.click()
  assert.match(host.style.cssText,/position:static/)
  assert.equal(f.doc.activeElement,host.children[0])
  assert.deepEqual(host.children[0].focusOptions,{preventScroll:true})
})
