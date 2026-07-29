# Конструктор — гайд разработчика

Куда смотреть и где что менять. Домен: [legacy-core.md](./legacy-core.md),
слепки: [legacy-persistence.md](./legacy-persistence.md), план: [migration-plan.md](./migration-plan.md),
статус: [port-status-2026-07-29.md](./port-status-2026-07-29.md), для пользователя: [user-guide.md](./user-guide.md).

## 1. Карта стора (`modules/app/model/store.ts`)

| Ключ | Модуль | Что хранит | Легаси-аналог |
|---|---|---|---|
| `catalog` | `entities/catalog` | ВСЕ справочники: комплекты, поставки (ОД), договоры, регионы, сервисы, **прайс-таблицы** (`catalog.prices`), академия | `price`, `products`(матрица), `profs`, `universals`, `od`, справочники `contract`/`region`, чекбокс-каталоги |
| `rowSet` | `entities/row-set` | Коммерческое состояние: general-сет + comparison-сеты; каждая строка (`KRow`) несёт `refs` + `composition` + `price`; контекст (регион, налог) | `rows`, `products.current`, `currentComplect`, все чекбокс-слайсы |
| `snapshot` | `entities/snapshot` | Статус вспоминания (`idle→loading→restored\|none\|error`), warnings, templateId | `remember` |
| `app` | `modules/app` | domain/user/**dealId**/deal/company, init-флаги | `app` |
| `documentProvider` | `entities/provider` | Поставщик → налог | `documentProvider` |
| `portal` | `entities/portal` | pbx PortalModel: **`bitrixfields` — источник UF-id** (решение B4) | `bitrixFields` из init |
| остальное | offer-/base-template, deal, bxrq | документы/шаблоны (перенесены ранее) | — |

**Слайса `product` НЕТ намеренно**: продукт — чистая функция
`buildGarantRow(catalog, комплект, поставка, договор, регион)` по требованию
(план §2.1, вместо предгенерированной матрицы). **Слайса `price` НЕТ**: таблицы
в `catalog.prices`, формулы в `row-set/lib/price`, цены строк — в `KRow.price`.

## 2. Структура `entities/row-set` (после рефакторинга 2026-07-29)

```
row-set/
  model/
    types.ts        # KRow, RowSet, RowPrice, RowRefs… (+quantityLocked, totalPrice)
    RowSetSlice.ts  # состояние + экшены (upsertRow, editRowCommercial, restore…)
    selectors.ts    # selectGeneralSet/MainRow/SelectedRow/EditingSetId…
    listeners.ts    # регистраторы реакций (sync / provider-tax / academy)
  lib/
    price/          # ЦЕНООБРАЗОВАНИЕ
      tax.util.ts             # TAX_COEFFICIENT, isTaxApplied, applyTaxChange ← ЕДИНСТВЕННОЕ место «налог ≠ LIC»
      price-table.util.ts     # findProfBasePrice, findPackagePrice, regionScope
      period-price.util.ts    # calcPeriodPrice (×срок ×налог ×скидка), makeRowPrice
      commercial-edit.util.ts # applyCommercialEdit (цена/кол-во/скидка/сумма), finalizeRowPrice
      commercial-input.util.ts# разбор ввода, подписи («Аванс»), display-значения
    row/            # СТРОКА (сборка по требованию)
      build-garant-row.util.ts / build-service-row.util.ts / build-academy-row.util.ts
      lt-package.util.ts      # подбор платного LT-пакета по весу
    set/            # СЕТ (набор строк)
      set-ops.util.ts         # create/upsert/remove, findMainRow, leadGarantRow
      set-quantity.util.ts    # единое количество сета
      set-cascade.util.ts     # удаление с каскадом, normalizeCollapsed
      total-row.util.ts       # свёрнутая total-строка (+ totalPrice-override)
      sync-set.util.ts        # syncSetWithComposition — пересборка сета
      set-tax.util.ts         # массовая смена налога (слепко-безопасная)
      academy-drop.util.ts    # детект выпавшей академии
    __tests__/      # pricing / row-set / commercial-input
    round.util.ts   # round2 — единая точка округления
```

## 3. Поток данных

```
boot: AppThunk.initial → app-init.util (Bitrix.start → placement → dealId) → setAppData
listeners (app/model/listeners/start-store-listeners.ts):
  setAppData → initCatalog + fetchBaseTemplate + fetchOfferTemplates + initProviders + initPortal
  initCatalog.rejected (dev) → фикстура docs/oldinit.json
  dealId × каталог готов → restoreSnapshot → rowSet.restore → /products (SnapshotNavWatcher)
row-set listeners (entities/row-set/model/listeners.ts):
  setRowComposition | upsertRow | resyncSet | setContext(regionCode) → syncSetWithComposition → writeSyncedSet
  documentProvider.setCurrent/… → setWithTax + applySetTaxChange по всем сетам
  writeSyncedSet → detectDroppedAcademy → чистка composition.academy
UI: widgets/price-table (+ features/row-builder, features/composition-editor) → только экшены rowSet
save: SaveSnapshotButton → saveSnapshot thunk → serializeV2 → helper.saveSnapshot
      (POST upsert; SnapshotV2 сериализован в колонку rows, детект по schemaVersion)
```

## 4. Инварианты (НЕ ломать; всё покрыто тестами)

1. **Налог поставщика влияет на цену, НО НЕ на лицензионные договоры** —
   правило живёт ТОЛЬКО в `lib/price/tax.util.ts` (`isTaxApplied` для сборки,
   `applyTaxChange` для живых строк; `contract.kind === 'lic'` → цена неизменна).
   `applySetTaxChange` дополнительно пропускает `isFree`-строки.
2. **Цены восстановленного слепка не пересчитываются молча**: `restore` и
   `writeSyncedSet` не матчатся sync-листенером; `setContext` матчится ТОЛЬКО
   с `regionCode` в payload; смена налога идёт трансформацией цен
   (`applySetTaxChange`), а не пересборкой по каталогу. Порядок в
   `restoreSnapshot`: `setContext` ДО `restore`.
3. **Количество едино по сету** (`applySetQuantity`), исключение — `quantityLocked`.
4. **Главный товар (`role: 'main'`) не удаляется**; удаление последнего Гаранта убивает сет.
5. **Сервисные строки — производные от наполнения** (merged composition garant-строк, от ведущей строки) — не редактируй их состав напрямую, меняй composition. Селекты сервисов в карточке (`use-service-row.ts`) именно это и делают: патчат composition ведущей строки.
6. `RowSet.totalPrice` (ручная правка свёрнутого итога) сбрасывается при пересборке, развороте и смене количества.
7. **Поставку резолвить ТОЛЬКО через `resolveSupply(catalog, code)`** (`catalog/lib/custom-od.util.ts`), не `supplies.byCode` — иначе сломается X-ОД (синтетические коды `x_<type>_<n>`, произвольное количество доступов). Коэффициент и PROF-цена X-ОД — линейная интерполяция соседних поставок (`findProfBasePriceForSupply`); ⚠️ формула — рабочее допущение, согласовать с бизнесом. X-ОД переживает слепок v2 автоматически (код в `refs.supplyCode`).

## 5. Типовые задачи — куда идти

| Задача | Файлы |
|---|---|
| Формула/правило цены | `row-set/lib/price/*` (+ тест в `__tests__/pricing.test.ts`) |
| Правило состава комплекта | `entities/composition/lib/rules/*` (файл на правило) |
| Реакция «X случилось → Y» | listeners: row-set — `entities/row-set/model/listeners.ts`; app-уровень — `app/model/listeners/start-store-listeners.ts` |
| Новый блок экрана товаров | под-виджет в `widgets/price-table/<name>/{ui,hooks,index.ts}` (компонент = вёрстка, логика в хуке) |
| Смена комплекта/ОД/договора строки | `widgets/price-table/lib/change-row-refs.util.ts` (+ `catalog/lib/compatibility-matrix.ts` — цепочки сброса) |
| Работа со слепками | `entities/snapshot` (parse-v1/map-v1/serialize-v2; API — только `lib/api/snapshot-helper.ts`) |
| X-ОД (произвольное кол-во доступов) | `catalog/lib/custom-od.util.ts` (домен) + `features/custom-od` (OdSelect) |
| UF-поля Bitrix для deal-send | `portal.*.bitrixfields`, поиск по `code` (B4; паттерн — event-sales `EventCompanyThunk`) |

## 6. Тесты и фикстуры

- `pnpm test` (vitest, 59). Ядро тестируется на РЕАЛЬНОМ дампе `docs/oldinit.json`
  (живой Firebase `getApril`; пересъём — команда в port-status §«Данные»).
- Слепок-фикстура: `entities/snapshot/lib/__fixtures__/legacy-deal.v1.json`
  (реальная прод-запись deal 129487 gsr.bitrix24.ru; она же залита в локальную БД бэка).
- Интеграционный restore-тест — МИНИ-стор (полный store в node нельзя: next/font
  в offer-template UI); листенеры row-set реиспользуются как есть.

## 7. Dev-консоль браузера (`window.store`)

Вне прод-фрейма стор доступен в консоли (`App.tsx` выставляет `window.store`).
Redux DevTools-расширение тоже работает (RTK включает его в dev по умолчанию).
Рецепты (замена легаси-обращений):

```js
store.getState()                                     // весь стор
const s = store.getState();

// бывш. state.rows.sets.general[0]
s.rowSet.general
// бывш. products.current / строка id===0 («текущий продукт»)
s.rowSet.general.rows.find(r => r.role === 'main')
// наполнение текущего комплекта (бывш. state.currentComplect)
s.rowSet.general.rows.find(r => r.role === 'main')?.composition
// альтернативы (бывш. sets.alternative)
s.rowSet.alternative
// регион/налог (бывш. global + провайдер)
s.rowSet.context
// справочники и прайсы (бывш. initialData + state.price)
s.catalog.catalog
s.catalog.catalog.prices.items.filter(p => p.complectCode === 'buh')
// статус вспоминания/сохранения
s.snapshot

// живой диспатч из консоли (эшены реэкспортированы не в window —
// проще через Redux DevTools → Dispatch)
```

## 8. API-пакет

`@workspace/nest-konstructor-api`: `pnpm generate` = orval + автосборка барреля
(`scripts/build-generated-index.mjs`) — руками `generated/index.ts` не трогать.
Импорт пакета — ТОЛЬКО в `lib/api/*-helper.ts` слайсов (catalog-helper, snapshot-helper).
База URL: `NEXT_PUBLIC_KONSTRUCTOR_API_URL` (пусто = `http://localhost:3007/`).
