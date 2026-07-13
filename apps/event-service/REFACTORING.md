# event-service — remaining migration & future refactoring tasks

Status snapshot: model/store/Bitrix-calls ported & typecheck-clean; `@workspace/april-ui`
fully migrated to shadcn + configured theme tokens (0 scss/0 reactstrap); app `shared/ui`
duplicates removed; theme wired like konstructor (`@workspace/april-theme`). Remaining app
UI: 38 files still on reactstrap/scss. Full plan: `~/.claude/plans/enumerated-imagining-hellman.md`.

## A. Finish UI migration (blocks green build)

Convert remaining 38 app files (reactstrap + `*.module.scss` → shadcn + Tailwind + tokens),
reusing `@workspace/april-ui` (`AButton/ABadge/ASelect/EVCard/AInput/...`) and
`@workspace/ui/components/*`. Pattern table + standards in the plan file.

- [ ] **A1 widgets/Header** — DONE (reference).
- [ ] **A2 widgets/EventList** — `EventList`, `components/EventListRow` → shadcn `table` + Tailwind.
- [ ] **A3 widgets/EventItem** — `EventItem`, `components/{ActionMenu,SalesMenu,ServiceMenu,NewTaskQuestion}` → shadcn `dropdown-menu`/`popover` + `ABadge`/`AButton`.
- [ ] **A4 features/ServiceSiganal** — `ServiceSignalReport`, `ServiceSignalLink`, `component/{CheckList,CheckListHeader,Mark,RatingMenu,Navigation}` → shadcn `checkbox` + `ATogglerColor`.
- [ ] **A5 entities/EventReport** — `Result`, `Noresult`, `WorkStatus`.
- [ ] **A6 entities/EventPresentation** — `Presentation`, `components/Action`.
- [ ] **A7 entities/EventCompany** — `CompanyColor` ×2 → `ATogglerColor`/`ABadge`.
- [ ] **A8 entities** — `ServiceResults`, `KonstructorInfoblock` (`Infoblock`,`DocumentInfoblock`), `KonstructorComplect`, `EventSale`, `EventPlan`, `EventSupply`, `EventContact` ui-forms (`Field*`/`AInput`/`ASelect`).
- [ ] **A9 shared** — `BBCode/BBCodeRenderer`, `Preloader/*` (app copy).
- [ ] **A10** delete every `*.module.scss` as its consumer is converted.

## B. Bitrix-library finalization (quality)

- [ ] **B1 init** — un-stub `modules/app/model/thunk/AppThunk.ts` + `lib/utills/{app-setup-util,placement-util}.ts`: load company/deal/lead/contact/task via `Bitrix.getService()` domain services; `setAppData`, `portalAPI.fetchPortal`, `setDepartmentMode`/`getDepartment`. Guarantee `Bitrix.start()` before any `getService()`.
- [ ] **B2 types** — migrate entity types `@workspace/bx` `BX*` → `@workspace/bitrix` `IBX*` (~270 refs: BXContact/BXUser/BXTask/BXDeal/BXCompany/BXList/BXLead/BXSmart/BXDepartment). NOT a rename — fix field-shape fallout (camelCase). Keep `Placement/CustomPlacement/DISPLAY_MODE` from `@workspace/bx`. Add root re-exports of `IBX*` to `packages/bitrix/src/index.ts`.
- [ ] **B3 Portal.contact gap** — new `@workspace/pbx` `Portal` lacks `contact.bitrixfields` (cast to `any` + `TODO(port)` in `EventContact/util/pbx-contact-util.ts`). Wire real source (userfieldconfig) or extend pbx.

## C. Architecture: remove container components → hooks

- [ ] Delete 6 `*Container.tsx` (`processes/event/ui/EventContainer`, `widgets/EventItem/ui/EventItemContainer`, `widgets/EventList/ui/EventListContainer`, `entities/EventReport/ui/ReportContainer`, `entities/EventPlan/ui/{PlanContainer,PlanServiceContainer}`); move `useAppSelector/useAppDispatch/useEffect` logic into `lib/hooks/use-*.ts`; component consumes hook directly (konstructor style).

## D. Routing → Next app-routes

- [ ] `pages-src/event/{ListPage,ItemPage,FinishPage}` → `modules/pages/event/*` (drop `*Lazy.tsx`, drop scss); entry via `app/page.tsx` rendering current screen from `processes/event` Redux state. Delete `pages-src/` and unused konstructor-era `modules/pages/{EventItemPage,EventItemsPage,ErrorPage}.tsx`.

## E. Cleanup

- [ ] Remove `reactstrap`, `bootstrap`, `sass` from `apps/event-service/package.json` (and any from `@workspace/april-ui`). Confirm `grep -r reactstrap` / `module.scss` empty.
- [ ] `tsc --noEmit` 0 errors; `next build` green; smoke-test dev (port 5005) — list/item/finish, light/dark theme, status colors.

## Future quality refactors (post-green, nice-to-have)

- [ ] **FSD compliance (CLAUDE.md)** — restructure entity slices to the reference pattern: `model/index.ts` (DTO→domain aliases), `lib/api/<name>-helper.ts` (the only place importing the generated client), `lib/hooks/use-<name>.ts` (react-query), `ui/`. Several event slices predate this.
- [ ] **react-query** — `EventContact` already uses it; standardize other entity data-fetching hooks on `@tanstack/react-query` instead of bespoke thunks where it fits.
- [ ] **strictNullChecks** — currently off (legacy parity). Re-enable incrementally per slice and fix nullability properly.
- [ ] **Remove `@workspace/theme` dep** if fully superseded by `@workspace/april-theme`.
- [ ] **Dead code** — prune commented-out legacy blocks left from the port (AppThunk, thunks, EventContact) once behavior verified.
- [ ] **Shared extraction** — promote any event-generic widgets reused by `event-sales` into `@workspace/april-ui`.
- [ ] **Tests** — none ported; add smoke/unit coverage for store wiring, intents mapping, and Bitrix init.
