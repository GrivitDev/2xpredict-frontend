# Stage 5A — Subscriptions, Payments and Billing Integration

## What changed

- Aligned Payments, Payment Gateways, Subscriptions and Plan Config service/type contracts with the backend controllers and response shapes.
- Corrected Paystack quote handling to use the backend's `amount` field (instead of the unsupported `finalAmount`).
- Removed the unsupported client-supplied `currency` field from manual payment submissions; the backend derives currency from the user's account.
- Updated payment verification to treat `processing` as a pending state instead of a failed payment.
- Migrated public pricing, checkout, payment callback and admin payment/configuration screens to dedicated React Query hooks.
- Centralized cache invalidation after payment verification, approval, rejection and plan configuration changes.
- Updated payment/subscription endpoint inventory metadata and retained compatibility type exports.

## Validation

- 497 TypeScript/TSX files parsed: zero syntax errors.
- 28 changed files checked: no missing files or unresolved local imports.
- 16 contract/integration checks passed.
- Full Next.js build and semantic TypeScript check were not run because the supplied source snapshot does not contain the project's `package.json`, `tsconfig.json` or installed dependencies.

## Apply

Merge the contents of `stage-5A/frontend/` into the existing frontend folder, preserving the folder structure. Then run:

```powershell
node frontend/scripts/validate-stage-5A.cjs
```

The validation report is included at `frontend/scripts/STAGE-5A-VALIDATION.json`.
