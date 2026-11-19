# 2xPredict Bet Lab — compact ticket and logo refinement

This is a complete replacement for `frontend/components/bet-lab/`. The package
includes the Bet Lab landing page, ticket pages, shared logo renderer and the
complete fixture statistics experience.

## Changes in this update

### My Tickets — grouped and compact

- Ticket details are grouped by fixture/event ID. A match is rendered once even
  when the ticket contains several market selections for that same match.
- Each match card uses a compact header containing the league logo/name, match
  status, kickoff/live time, prediction status and settlement status.
- The match line keeps both team logos/names and the score together; all selections
  for that fixture appear alongside it as compact `Market: Selection` and odds
  chips.
- Expanded ticket details use one match column on mobile and two match columns on
  desktop. Multiple selections for one match remain inside the same match card.
- Ticket summary metrics and expanded-card spacing have been tightened.

### Logo reliability

- `BetLabLogo` now accepts one or several image sources and tries each candidate
  when an earlier CDN URL fails, before falling back to initials.
- Logo URL resolution supports protocol-relative and HTTP URLs, arrays, nested
  image objects and multiple provider image fields.
- Fixture team-logo resolution supports direct home/away fields and ESPN's nested
  `competitions[].competitors[].team.logos[].href` structure.
- League-logo resolution also checks nested competition payloads.
- Ticket match cards and statistics use the same source resolution path.

### Statistics experience

- Team logos now sit beside team names throughout the stats modal: fixture header,
  team strength, recent-form headings, recent opponents, season comparison, live
  match statistics, and head-to-head summaries/history.
- The stats dialog is portalled to `document.body` and now uses z-index `10000`,
  keeping it above the site navbar, sticky bars and mobile drawers.

## Layering

| Component | z-index |
|---|---:|
| Normal page content | auto / 0 |
| Sticky market selector | 20 |
| Mobile country/league drawer and slip sheet | 60 |
| Access/verification dialogs | 80 |
| Statistics dialog | 10000 |

## Files changed

- `BetLabTicketCard.tsx`
- `BetLabLogo.tsx`
- `FixtureMarketRow.tsx`
- `BetLabApp.tsx`
- `bet-lab.utils.ts`
- `stats/FixtureStatsDialog.tsx`
- `stats/fixture-stats.utils.ts`
- `stats/stats.types.ts`
- `stats/TeamFormPanel.tsx`
- `stats/SeasonComparisonPanel.tsx`
- `stats/LiveMatchStatsPanel.tsx`
- `stats/HeadToHeadPanel.tsx`

All other Bet Lab component files are retained unchanged in the replacement
package.

## Scope and validation

Ticket grouping changes are display-only; ticket leg data, market codes, odds,
ticket placement, wallet behavior and settlement APIs are unchanged. Fixture
logos only use values already present in the fixture/presentation/API payloads.
No backend or database changes are required.

All 30 TypeScript/TSX files in this replacement package passed TypeScript
transpilation syntax checks, and all relative imports within the package resolved.
This is source-level validation only; a full Next.js application build and live
browser testing were not performed because the complete application workspace
was not supplied.



### Standardised scrolling

- The Bet Lab page uses the browser/document as its single primary scroll area.
  Desktop country/league, fixture/market, and slip panels grow with their content
  instead of creating competing viewport-height scroll regions.
- Desktop fixture rows no longer sit inside a `76dvh` nested scroll box, and the
  market selector is no longer sticky inside that box.
- The desktop country and slip panels no longer impose independent viewport-height
  limits. This allows normal wheel, trackpad, keyboard, and touch scrolling through
  the whole page without getting trapped in one column.
- The mobile country drawer and slip sheet remain independently scrollable overlays;
  the statistics dialog remains independently scrollable as a dialog.
- All Bet Lab overlays use one reference-counted body scroll-lock utility. It
  preserves and restores the exact page scroll position, supports overlapping
  dialogs/drawers, compensates for the desktop scrollbar, and avoids leaving the
  page locked after an overlay closes.
- Internal overlay scroll areas use consistent vertical overscroll containment
  and touch scrolling. The regular Bet Lab page itself does not suppress scroll
  chaining or create nested desktop scroll containers.
