export const MEASUREMENT_ID: string
export const CONSENT_KEY: string
export type ConsentChoice = 'granted' | 'denied'
export interface SiteAnalytics {
  getConsent(): ConsentChoice | null
  setConsent(value: ConsentChoice): void
  pageView(): void
  subscribe(listener: (choice: ConsentChoice | null) => void): () => void
}
export function cleanLocation(value: string): string | null
export function cleanReferrer(value: string): string
export function readConsent(storage: Pick<Storage, 'getItem'>, now?: number): ConsentChoice | null
export function createAnalytics(win: Window, doc: Document): SiteAnalytics | null
export function mountAnalyticsConsent(win: Window, doc: Document): () => void
