# Optional site analytics

The canonical hpoenixf.com deployment uses the existing GA4 web stream
`G-TPTFGQ4C1H`. The independent blog and article reader both need their own
client adapter. They share the same versioned consent choice on this origin.
The ID is public configuration, not a credential.

## Consent and data

No Google script or analytics command is loaded before an explicit opt-in.
Accept and decline have equal presentation. The always-available privacy button
reopens the choice. Consent is retained for at most 180 days; expiry and
withdrawal immediately disable the tag, then reload to remove its runtime.
A failed browser-storage write makes the choice session-only. Reload after
withdrawal does not retract visits that were already sent to Google.

Google receives connection/device information when the visitor opts in. The
integration sends only public page locations/titles, strips query strings and
fragments, reduces external referrers to origins, and does not enable user IDs,
advertising personalization, Google Signals, form/search inputs or cross-domain
linking. The site is informational; do not put personal data into public page
titles or URL paths. This implementation is not a legal-compliance certification.

## Single pageview owner

`site-analytics.mjs` sends the first and subsequent canonical-path pageviews.
It uses `send_page_view: false`; automatic enhanced **history-change pageviews
must remain disabled** in the GA4 stream. That setting was observed disabled
on 2026-10-28, as were automatic scroll, outbound, search, form, video and file
measurement. Turning those on requires another privacy/duplication review.

The singleton belongs to a document, not a UI component: StrictMode and theme
remounts do not load another Google tag. Its expiry/storage listeners intentionally
remain until the document unloads, even when the visible control unmounts.
Existing Google tag/GTM code makes this integration fail closed rather than
adding a second owner. Tracking is disabled outside HTTPS hpoenixf.com, including
localhost, preview deployments and the legacy github.io hostname.

## Verification

Run `node --test scripts/site-analytics*.test.mjs` before the normal build.
After deployment, verify no Google requests before consent or after decline;
after consent check one initial pageview and one per article/blog navigation,
including Back/Forward. Check that query/fragment data is absent and that
withdrawal disables tracking. Use the existing stream's DebugView/Realtime
without enabling advertising or additional automatic measurement. Source/unit
checks do not themselves prove that Google has received production traffic.
