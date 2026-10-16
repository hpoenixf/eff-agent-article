# Public article privacy review

Review the exact files that will enter the public destination, including HTML, SVG metadata, README indexes, code blocks, and link targets.

## Remove or generalize

- Real holdings, share counts, account balances, transactions, or uniquely identifying portfolio details.
- Names, email addresses, phone numbers, government IDs, account numbers, credentials, access tokens, or private keys.
- Local absolute paths, private hostnames/IP addresses, access-bearing endpoints, private PDFs, raw tool payloads, and run-specific content.
- Internal evidence links when they expose private reports or operational details beyond the intended engineering claim.

## Preserve accurately

- Synthetic examples only when they are clearly labeled and cannot be mistaken for real user data.
- Public repository links only when the destination is public and the linked content is suitable for the same audience.
- The distinction between verified behavior, historical observations, design intent, and unverified outcomes.

## Manual review remains required

The bundled scanner flags common patterns without printing values. It cannot determine whether an amount, identifier, example, endpoint, or source reference is private. Resolve every hit and review surrounding context before publication.
