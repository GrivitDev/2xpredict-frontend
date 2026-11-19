# Stage 1F — Registry and compatibility consolidation

## What changed
- Replaced the service barrel with one canonical service export per backend module.
- Confirmed the hook barrel exports canonical module namespaces and keeps presentation/infrastructure hooks separate.
- Migrated the remaining direct component imports away from controller-specific service files.
- Corrected the admin prediction slip detail call to use `getEngineSlip` and updated the public search Pick Center query shape.
- Changed the subscription monitor page to use `subscriptionsService` rather than the cross-module monitor facade.
- Converted controller-specific service files into thin compatibility re-exports; they no longer own API requests.
- Restricted the old monitoring compatibility file to System Monitor only. Domain monitors are owned by their backend module services.
- Kept Billing as a compatibility type of entrypoint only; the four underlying services remain separate.
- Included the audited Stage 1D endpoint inventory with canonical service-file mappings.

## Compatibility audit
- Direct page/component imports of old service files were migrated.
- Legacy service file paths remain available as deprecation shims for imports not yet migrated.
- The canonical service registry contains no controller-specific duplicate exports.
- The hook registry contains canonical module hook namespaces plus distinct realtime, match-presentation and Telegram integration namespaces.

## Validation
- TypeScript source parsing and relative import resolution were checked for all Stage 1F files.
- Static scan found no remaining application imports of the deprecated service entrypoints in the supplied frontend snapshot.
- A full Next.js build and project-wide typecheck were not run because the editable repository/package environment is not mounted in this conversation.

Apply Stages 1A–1F in order, then run `npm run build` and `npx tsc --noEmit` in the actual frontend repository.
