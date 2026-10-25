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
| `offerDocument` | `entities/offer-document` | Шапка КП: получатель (pbx op_inn/op_name/op_position, падежи с бэка), счёт (3 вопроса + дата/номер), статус генерации | `document.current.recipient`, `documentInvoice` |
| `contractDocument` | `entities/contract-document` | Договор: поля сделки (pbx-коды, запись в Bitrix по blur), спецификация с бэка (`contract/specification-form`), статус генерации | `documentContract`, `documentContractBase`, `documentContractSpecification`, `pbxDeal` |
| `supplyReport` | `entities/supply-report-document` | Отчёт о поставке: 15 полей формы (`document-supply-report/form`), файлы договора/счёта (base64), контакты сделки, открытая заявка RPA, статус генерации | `documentContractSupply`, `pbxContact`, `documentContract.isSupplyReport` |
| `appSettings` | `entities/app-settings` | Портальные настройки приложения (`GET app-settings/konstructor?domain`, swrCache): флаги экранов, сейчас `zakupkiEnabled` | хардкод по домену (`withZoffer`) |
| `zakupki` | `entities/zakupki` | «3 КП для торгов»: настройки двух поставщиков (свои/портала, `zakupki-settings`), черновик правок, генерация `zakupki-offer/create` | `zoffer` |
| `complectDescription` | `entities/complect-description` | «Описание комплекта»: DOCX по группам наполнения главной строки (бэк complect-description/generate), ссылка на файл | `result.description` |
| `serviceOffer` | `entities/service-offer` | Сервисный отдел: период «текущий» (слепок сделки) / «следующий» (слепок со serviceSmartId, смарт service_offer), smartId; отправка в смарт — через deal-send `target` | `serviceOffer`, `service-department/*` |
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
boot: AppThunk.initial → app-init.util (Bitrix.start → placement DEAL|COMPANY → dealId
      (из компании — deal.getList по COMPANY_ID, pickCompanyDeal) → сделка+компания) → setAppData
listeners (app/model/listeners/start-store-listeners.ts):
  setAppData → initCatalog + initProviders + initPortal + fetchBXRQ (реквизиты по компании)
  setAppData → fetchAppSettings (портальные флаги через swrCache) + сброс шапок документов (offerDocument/contractDocument/supplyReport/zakupki)
  (данные только с nest konstructor: фикстур в рантайме нет; HTML-КП /offer/** со старта не грузится)
  init v2 → catalog: комплекты/инфоблоки/поставки/договоры/регионы (по порталу, own_abs)/меры
  (catalog.measures, bitrixId для productRows)/цены. Тексты поставок для договоров живут на бэке
  шаблонами по числу ОД (SupplyTextService, back/libs/garant/src/supply); фронт знает только
  supply.quantityForKp (подпись КП) и contractPropSuppliesQuantity; при генерации бэк дополняет
  payload по supply.code (X-ОД — x_<type>_<n>).
  initPortal.fulfilled | providers.setFetched → applyDealProvider (поставщик из сделки сильнее настройки)
  bxrq.setFetched | initPortal.fulfilled → setCurrentRqItems по op_client_type сделки
  dealId × каталог готов → restoreSnapshot → rowSet.restore
  initPortal.fulfilled × dealId × смарт вариантов → fetchComplectVariants
  initPortal.fulfilled → initServiceOffer (сервисный отдел: слепки периодов; иначе выходит сам)
  offerDocument.* | documentProvider.setCurrent | rowSet.upsertRow/edit*/setRowComposition → PDF-превью КП
  помечается устаревшим (needUpdate), само не перезапрашивается
вход `/` (processes/konstructor EntryGate): resolveEntryTarget → /start | /variants | /document
  (маршруты и сценарии — docs/routing.md)
row-set listeners (entities/row-set/model/listeners.ts):
  setRowComposition | upsertRow | resyncSet | setContext(regionCode) → syncSetWithComposition → writeSyncedSet
  documentProvider.setCurrent/… → setWithTax + applySetTaxChange по всем сетам
  writeSyncedSet → detectDroppedAcademy → чистка composition.academy
  appActions.setDepartment → rowSet.setContext(serviceDepartment) — средний пакет LT-other (вес 4) открыт сервисному отделу
UI: widgets/price-table (+ features/row-builder, features/composition-editor) → только экшены rowSet
save: SaveSnapshotButton → saveSnapshot thunk → serializeV2 → helper.saveSnapshot
      (POST upsert; SnapshotV2 сериализован в колонку rows, детект по schemaVersion)
документы: домен → легаси-payload ТОЛЬКО через `entities/document-payload` (buildDocBody/buildOfferPayload/
      buildDocVariant; code→number — legacy-numbers.util, второе и последнее место после v1-адаптера).
      КП: `entities/offer-document` buildOfferGenerateRequest(state) (превью PDF и generate) и
      buildOfferMultiGenerateRequest (variants по selectParticipants: открытый вариант — из живого row-set,
      остальные — из слепков v2 через parseSnapshotV2; composition только при вариантах).
      offerRequestBlocker(state) — текст, почему КП не собрать (нет сделки/главной строки/шаблона/поставщика).
      Договор: `entities/contract-document` buildSpecificationFormRequest (форма с бэка: общая часть + спецификация,
      тексты поставки резолвит бэк) и buildContractGenerateRequest (bxrq — текущий реквизит bx-rq через toContractBxRq,
      regions — buildDocRegions, LT — buildContractLt); contractRequestBlocker + contractValidationErrors
      (обязательные поля сделки contract_start/contract_end/garant_client_assigned_name + validatePushRq).
      Отчёт о поставке: `entities/supply-report-document` buildSupplyFormRequest / buildSupplyReportGenerateRequest /
      buildInitSupplyRequest (bxDealItems и bxCompanyItems — EntityFormFieldDto по pbx-кодам через buildPbxEntityItems;
      видимые поля формы — visibleSupplyItems с зависимыми группами); заявка RPA — rpaStage.listForType + rpaItem.list
      (buildSupplyRpaFilter). Поля сделки договора и отчёта делят contractDocument.dealFields (initDealDocumentFields).
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
5. **Сервисные строки — производные от наполнения** (merged composition garant-строк, от ведущей строки) — не редактируй их состав напрямую, меняй composition. Селекты сервисов в карточке (`use-service-row.ts`) именно это и делают: патчат composition ведущей строки. Пакеты LT-other (`composition.ltOther`) — тоже наполнение: строка `lt_other` на каждый собранный пакет (`refs.packetId`), переименование и удаление строки пишутся в composition строки-владельца. Искра: число вхождений (`ltServiceCount`) считается по наполнению и пакетам, в документ идёт подписью.
6. `RowSet.totalPrice` (ручная правка свёрнутого итога) сбрасывается при пересборке, развороте и смене количества.
7. **Поставку резолвить ТОЛЬКО через `resolveSupply(catalog, code)`** (`catalog/lib/custom-od.util.ts`), не `supplies.byCode` — иначе сломается X-ОД (синтетические коды `x_<type>_<n>`, произвольное количество доступов). Цена X-ОД НЕ вычисляется (решение владельца): коэффициент и PROF-прайс берутся у ближайшей справочной поставки того же типа (`referenceSupplyForCustom`: снизу, иначе сверху; std/local/flash не участвуют), строка получает `price.estimated` и бейдж «цена ориентировочная» — менеджер задаёт цену руками (правка снимает признак). Тексты договора/КП для X-ОД собирает бэк из шаблона той же справочной поставки. X-ОД переживает слепок v2 автоматически (код в `refs.supplyCode`).

## 5. Типовые задачи — куда идти

| Задача | Файлы |
|---|---|
| Формула/правило цены | `row-set/lib/price/*` (+ тест в `__tests__/pricing.test.ts`) |
| Правило состава комплекта | `entities/composition/lib/rules/*` (файл на правило) |
| Реакция «X случилось → Y» | listeners: row-set — `entities/row-set/model/listeners.ts`; app-уровень — `app/model/listeners/start-store-listeners.ts` |
| Новый блок экрана товаров | под-виджет в `widgets/price-table/<name>/{ui,hooks,index.ts}` (компонент = вёрстка, логика в хуке) |
| Смена комплекта/ОД/договора строки | `row-set/lib/row/rebuild-row-refs.util.ts` (+ `catalog/lib/compatibility-matrix.ts` — цепочки сброса, `resolveRefsForBuildParams` для шага «Параметры») |
| Новый экран / маршрут | `processes/konstructor/lib/routes.ts` (путь) → виджет-экран в `widgets/<name>` → тонкий `app/(shell)/…/page.tsx`; карта — `docs/routing.md` |
| Работа со слепками | `entities/snapshot` (parse-v1/map-v1/serialize-v2; API — только `lib/api/snapshot-helper.ts`) |
| X-ОД (произвольное кол-во доступов) | `catalog/lib/custom-od.util.ts` (домен) + `features/custom-od` (OdSelect) |
| UF-поля Bitrix для deal-send | `portal.*.bitrixfields`, поиск по `code` (B4; паттерн — event-sales `EventCompanyThunk`) |

## 6. Тесты и фикстуры

- `pnpm test` (vitest, 120). Ядро тестируется на реальном дампе
  `entities/catalog/lib/__fixtures__/oldinit.json` (только тесты, через from-oldinit.ts;
  в рантайме фикстура не используется — дамп разный у порталов).
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
