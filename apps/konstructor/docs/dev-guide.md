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
| `offerDocument` | `entities/offer-document` | Шапка КП: получатель (pbx op_inn/op_name/op_position, падежи с бэка), счёт (2 вопроса, оба «Нет» по умолчанию; дата `first_pay_date` и номер `invoice_number` пишутся в сделку по blur; пустой номер перед формированием берётся у нумератора, `takeInvoiceNumber`), статус генерации | `document.current.recipient`, `documentInvoice` |
| `contractDocument` | `entities/contract-document` | Договор: поля сделки (pbx-коды, запись в Bitrix по blur), спецификация с бэка (`contract/specification-form`), статус генерации | `documentContract`, `documentContractBase`, `documentContractSpecification`, `pbxDeal` |
| `supplyReport` | `entities/supply-report-document` | Отчёт о поставке: 15 полей формы (`document-supply-report/form`), файлы договора/счёта (base64), контакты сделки, открытая заявка RPA, статус генерации | `documentContractSupply`, `pbxContact`, `documentContract.isSupplyReport` |
| `appSettings` | `entities/app-settings` | Портальные настройки приложения (`GET app-settings/konstructor?domain`, swrCache): флаги экранов, сейчас `zakupkiEnabled` | хардкод по домену (`withZoffer`) |
| `zakupki` | `entities/zakupki` | «3 КП для торгов»: настройки двух поставщиков (свои/портала, `zakupki-settings`), черновик правок, генерация `zakupki-offer/create` | `zoffer` |
| `compositionView` | `features/composition-editor` | Личная настройка: вид наполнения (`cards / flat / dense / summary`) и видимость весов. При старте — копия из localStorage, затем app-cache (Redis + `app_cache`, ключ `composition-view`) как источник истины | — |
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
      (из компании — открытая сделка sales_base: слепок портала → воронка и финальные стадии →
      deal.getList по COMPANY_ID + CATEGORY_ID + CLOSED=N → pickCompanyDeal, самая свежая;
      такой нет — dealId=null, компания читается company.get, работа идёт на компании без сделки;
      лид и прочие карточки — экран NoEntityScreen) → сделка+компания) → setAppData
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
  bxrq.setFetched | initPortal.fulfilled | app.patchCompany | snapshot.restored → setCurrentRqItems по типу
  клиента (selectClientTypeOrDefault: компания → сделка → организация) и rqId слепка;
  bxrq.setCurrentRqItems | setCurrentItem | saveBaseCreating → snapshot.setRqId
  dealId × каталог готов → restoreSnapshot → rowSet.restore
  «Создать сделку» в компании без сделки (features/deal-send): deal-send с requestKey → setDealId → saveSnapshot →
  опрос status/{operationId} → deal.get → setDeal → initPortal со сделкой (отдел, поставщик, варианты);
  saveDone без восстановления → snapshot.adopted (вход `/` не ждёт слепка)
  initPortal.fulfilled × dealId × смарт вариантов → fetchComplectVariants
  initPortal.fulfilled → initServiceOffer (сервисный отдел: слепки периодов; иначе выходит сам)
  offerDocument.* | documentProvider.setCurrent | любое действие набора строк (isRowSetContentAction: правки строк,
  сворачивание, наборы для сравнения, раскладка слепка) | выбор Word-шаблона (app/lib/stale-actions) → PDF-превью КП
  помечается устаревшим (needUpdate), само не перезапрашивается
вход `/` (processes/konstructor EntryGate): resolveEntryTarget → /start | /variants | /document
  (маршруты и сценарии — docs/routing.md)
row-set listeners (entities/row-set/model/listeners.ts):
  setRowComposition | upsertRow | resyncSet | setContext(regionCode) → syncSetWithComposition → writeSyncedSet
  documentProvider.setCurrent/… → setWithTax + applySetTaxChange по всем сетам
  writeSyncedSet → detectDroppedAcademy → чистка composition.academy
  appActions.setDepartment → rowSet.setContext(serviceDepartment) — средний пакет LT-other (вес 4) открыт сервисному отделу
UI: widgets/price-table (+ features/row-builder, features/composition-editor) → только экшены rowSet
save: DealSendButton → sendDeal (deal-send) → saveSnapshot thunk → serializeV2 → helper.saveSnapshot
      (POST upsert; SnapshotV2 сериализован в колонку rows, детект по schemaVersion)
документы: домен → легаси-payload ТОЛЬКО через `entities/document-payload` (buildDocBody/buildOfferPayload/
      buildDocVariant; code→number — legacy-numbers.util, второе и последнее место после v1-адаптера).
      КП: `entities/offer-document` buildOfferGenerateRequest(state) (одиночное тело) и
      buildOfferMultiGenerateRequest (variants — открытый вариант: КП идёт по одному варианту при любом режиме сделки,
      см. раздел «Варианты комплекта: кто идёт в документы» ниже; он берётся из живого row-set; composition с режимом
      `compare` только при участнике).
      Превью Word (offer-template-word: buildWordPreviewRequest) и PDF-КП (offer-pdf: buildOfferPdfGenerateRequest)
      шлют то же тело плюс необязательные variants и composition (offerVariantsFields) — когда открытый вариант есть.
      offerBlocker(state, 'word' | 'pdf') — общий блокер формирования и превью (offerRequestBlocker — его Word-вариант,
      offerPdfRequestBlocker — PDF): текст, почему КП не собрать (нет сделки/главной строки/шаблона Word/поставщика/
      открытого варианта, который собрать нельзя; стадии вариантов ещё грузятся; участник — selectOfferVariantsPayload,
      кэшированный селектор). Ключ превью PDF — offerPdfRequestKey (по содержимому, без меток времени адаптера).
      Договор: `entities/contract-document` buildSpecificationFormRequest (форма с бэка: общая часть + спецификация,
      тексты поставки резолвит бэк) и buildContractGenerateRequest (bxrq — текущий реквизит bx-rq через toContractBxRq,
      regions — buildDocRegions, LT — buildContractLt c paidPackets); contractRequestBlocker (домен, сделка,
      главная строка, поставщик) — единственное, что останавливает договор. Без реквизита уходит
      emptyContractBxRq, пустые места бэк заполняет прочерками (nullGetter docxtemplater).
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
| Правило состава комплекта | `entities/composition/lib/rules/*` (файл на правило); ЭР и пакеты — `er-packets.ts` (вес 0.5 / 1 / 0, один пакет или ровно два у Офиса, развал пакета) |
| Регионы для выбора | `entities/catalog/lib/portal-regions.util.ts` (`inPortal` из init; «Все регионы» — `widgets/build-params/hooks/use-region-field.ts`) |
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

## Legal Tech

План и решения: `docs/legal-tech.tasks.md`. Код: `entities/composition/lib/rules/lt/`.

- Состав хранит прежние поля `lt`, `ltInPacket`, `ltOther`, поэтому слепки читаются без миграции. Читать их напрямую
  для подбора пакета нельзя: единая точка — `describeLtPackets(composition, ctx)`, её используют редактор, строки цен,
  договор, сделка и сводка.
- Лимит бесплатных — вес LT, привязанного к комплекту в админке (`ltFreeLimit`). В `COMPLECT_RULE_FLAGS` только
  исключения: `pinnedLt`, `ltDefaultsPaid`.
- Тесты правил LT идут на `catalog/lib/__fixtures__/init-v2.live.json`, срезе настоящего init. На `oldinit.json`
  сервисы есть всегда, поэтому он не показывает поломки данных init.
- В документ доп. пакет идёт, только если у него есть строка в наборе (`docComposition`).
- Спецификация договора устаревает при изменении сборки (`formStale`, те же действия набора строк, что у превью,
  включая раскладку слепка): отчёт о поставке перезапросит её при входе, а без изменений сохранит ручные правки менеджера.
  Смена режима вариантов спецификацию не трогает: сбрасываются только готовые результаты договора и отчёта (см. ниже).
- Участник документа, которого собрать нельзя (слепок не читается, нет главной строки, договора или поставки),
  не выпадает молча: `buildVariantsPayload` возвращает его в `skipped`, `offerRequestBlocker` и `supplyReportBlocker`
  (при включённой заявке) блокируют формирование и называют вариант. Заявка поставки шлёт `variants` участников по
  режиму сделки («Только открытый вариант» даёт открытый, «Все варианты» все незакрытые).

## Варианты комплекта: кто идёт в документы (23.11.2026)

- КП делают по одному варианту. Word-КП, PDF-КП и оба превью всегда идут по открытому варианту, настройка сделки
  `composition.mode` на КП не влияет вовсе. Открытого варианта нет или он закрыт — КП идёт по живому состоянию, как у
  сделки без вариантов. В запросе КП настройки сделки уходят с режимом `compare` при любом выбранном режиме
  (`selectOfferComposition`), поэтому тело запроса и ключ превью от смены режима не меняются.
- Режим живёт на экранах договора и отчёта о поставке: общий компонент `ComplectModeSelect`
  (`features/complect-mode-select`, поле «Варианты в договоре и отчёте») стоит на обоих экранах и пишет одну настройку
  сделки, смена на одном экране видна на другом. Запись идёт thunk `saveComplectComposition`. Выбор показывается,
  когда незакрытых вариантов два и больше (`selectComplectModeView`); пока стадии грузятся, он скрыт.
- Значения режима на бэке прежние, меняется смысл: `compare` — «Только открытый вариант», `single_contract` — «Все
  варианты одним договором», `multi_contract` — «Все варианты, каждому свой договор». Режим управляет договором
  (единицы договора), отчётом о поставке, заявкой на поставку (init-supply) и товарами сделки при отправке в сделку
  (deal-send). «Все варианты одним договором» доступно, только когда у всех незакрытых вариантов один тип договора
  (`getVariantContractCode`, `isSingleContractAllowed`): недоступный пункт отключён, причина написана под выбором.
  Сравнивать варианты между собой в одном КП не нужно: для сравнения служат «наборы для сравнения» внутри варианта,
  поэтому `offer.showAlternatives` при каждом сохранении настроек пишется `false` (`mergeComposition`).
- Участники — `selectParticipants(variants, stageOf, mode, openVariantSmartId)` (`entities/complect-variant/lib/participants.ts`):
  - «Только открытый вариант»: единственный участник открытый вариант (`state.complectVariant.openVariantSmartId`), если
    он есть в списке и не закрыт; открытого варианта нет или он закрыт — участников нет, документы идут по живому
    состоянию, как у сделки без вариантов;
  - «Все варианты»: все незакрытые варианты, черновики тоже;
  - закрытые (финальные стадии: Успех, Отклонён, Не состоялся) не участвуют ни в одном режиме. Остальные стадии
    элемента смарта (Черновик, Текущий, В мердже, КП, Счёт, Договор, Поставка, Согласование) служебная пометка хода
    работы и на участие не влияют; менеджер двигает их в Битриксе свободно.
- Входов участников два, и из имени ясно, чей каждый (`ComplectVariantSlice`, оба кэшируются):
  - `selectOfferVariantParticipants` для КП: режим в селектор не входит, это `selectParticipants` с режимом `compare`
    (`selectOfferParticipants`). Вход сборки `selectOfferVariantsInput` и `selectOfferVariantsPayload` (`offer-document`)
    читают Word-КП (generate-multi), PDF-КП, оба превью и `offerBlocker`;
  - `selectModeVariantParticipants` для документов по режиму. Вход `selectModeVariantsInput` и
    `selectModeVariantsPayload` читают единицы договора (`selectContractUnits`), отчёт о поставке (`supplyReportBlocker`),
    заявку поставки (`buildInitSupplyRequest`) и товары сделки (`selectDealProductRows`, `buildDealProductRows`).
  Запись товаров в элемент смарта варианта (`writeVariantProductRows`) участников не читает: она пишет строки одного,
  сохраняемого варианта.
- Устаревание. Превью КП устаревает от действий из `isOfferPreviewStaleAction` и от `setComposition`, если в настройках
  изменилось то, что уходит в КП (открытый вариант, печать КП): `isOfferPreviewStale` сравнивает настройки до и после
  через `isSameOfferComposition`, режим в сравнение не входит. Результаты договора (живой и единиц) и отчёта о
  поставке сбрасываются при смене режима: слушатель `setupModeStaleListener` по `isComplectModeChanged` вызывает
  `contractDocumentActions.generateStale` и `supplyReportActions.generateStale` (готовый документ и прежняя ошибка
  проверки уходят, идущее формирование и введённые значения остаются).
- Панель вариантов на «Ценах» (`features/complect-variant-select`) переключает варианты и режим не выбирает: «Редактировать» /
  «Закрыть», «Отклонить» (любой незакрытый вариант), «Вернуть» (только отклонённый, ставит «Черновик»), «Удалить»,
  создание варианта. Селекта режима и бейджа «В документах» в ней нет. Кнопки «Сделать текущим» тоже нет.
- Единицы договора и товары сделки по-прежнему появляются только в режимах «Все варианты» при двух и более участниках.
- Подсказки «В КП войдут варианты: …» нет: участник КП один, открытый вариант, и он помечен «Сейчас редактируется».

## Академия

- Выбор живёт в `composition.academy` ведущего Гаранта набора, но правится на шаге цен:
  `features/academy-picker` (кнопка у набора, список пакетов под срок). В редакторе наполнения академии нет:
  она зависит от количества, которого там не видно.
- Срок сделки набора: `setTermMonths(set, catalog)` = количество ведущего Гаранта × `contract.durationMonths`
  (легаси `useAcademy`: quantity × contractCoefficient). Подходящие пакеты — `academyPackagesFor(catalog, termMonths)`.
- Правило `rules/academy.ts` получает `ctx.termMonths`: неподходящий пакет нельзя выбрать (error), уже выбранный
  подсвечивается (warning). Выбор остаётся в составе; строку даёт `academyRowFor`, только когда срок совпал.
  Легаси убирал пакет и возвращал из памяти экрана, здесь память — само наполнение.
- Смена количества (`editRowCommercial`/`editTotalCommercial` с `kind: 'quantity'`) → `setupAcademyTermListener` →
  `syncAcademyRow`: пересобирается только строка академии, остальные строки и ручные правки цен не трогаются.
- Сервисные строки при пересборке получают количество набора (`quantity: lead.price.quantity`), пакет академии
  «до конца комплекта» живёт со своим (`quantityLocked`).
- В документы академия идёт только со строкой: `docComposition` обнуляет `academy` без строки `academy` в наборе.

## Виды наполнения

Вид по умолчанию — `classic` (две колонки, блоки сверху вниз). Исходное состояние категорий задаёт вид
(`useCompositionSections(..., defaultOpen)`): «Классика» раскрыта, «Карточки» свёрнуты; ручные переключения
хранятся вместе с видом, для которого их делали, и сбрасываются при смене вида.

## PDF-КП: страницы и переносы

Бэк: `back/apps/konstructor/src/offer-pdf`. Текст меряет сам react-pdf по метрикам PT Sans и режет
страницы по измеренным высотам, поэтому подсчёт строк «по символам», как в старом PHP, не нужен. Что
добавлено поверх движка:

- `lib/pdf-layout.ts`: рендер с деревом раскладки (`renderPdfWithLayout`), измерение шапки и подвала
  (`measurePageChrome`) и подбор полей страницы (`fitPageFrame`). Fixed-блоки текст не раздвигают, поэтому
  `OfferPdfRenderService` рисует документ второй раз с полями под длинные реквизиты или контакты менеджера.
- Таблица цен: шапка вместе с первой строкой, у последней строки `minPresenceAhead` под итог. Заголовки
  разделов — `minPresenceAhead`, строки и пункты — `wrap={false}`.
- Текст с render-пропом (номер страницы) в fixed-подвале получает явную высоту: иначе Yoga даёт ему тысячи
  пунктов, подвал уезжает за верх листа, его линия не печатается.
- Проверка: `npm run offer-pdf:audit` в `back` — рендер десяти крайних сценариев (`dev/layout-audit.scenarios.ts`)
  и аудит координат (`dev/layout-audit.ts`): наезд на шапку/подвал, выход за поля, заголовок последним на
  странице. PDF-файлы складываются в `--out`, смотреть глазами после правок шаблона.

## PDF-КП: наполнение наборов для сравнения (23.11.2026)

Бэк печатает у наборов для сравнения только цены, наполнение берёт общее. Настройка «Наполнение наборов для
сравнения» добавляет блок с наполнением каждого набора: бэк принимает необязательное поле `alternativeComplects`
(массив `{ setNumber, title, complects }`) у КП и у участника-варианта.

- Настройка — `prefs.settings.alternativeComplects` (`entities/offer-pdf`), по умолчанию выключена. Хранится
  как остальные настройки PDF: слепок сделки и варианта, избранное, последний выбор менеджера (браузер и app_cache);
  разбор — `normalizeOfferPdfStyle`, записи без поля читаются как выключенное. Переключатель
  `OfferPdfAlternativeComplects` виден, когда в сделке есть набор для сравнения с наполнением
  (`hasAlternativeComplects(rowSet.alternative)`); иначе скрыт и поле в запрос не идёт.
- Данные: `buildAlternativeComplects(catalog, alternative)` (`entities/document-payload`) даёт запись на набор с
  наполнением. Разделы комплектов набора строит `buildSetComplectSections`, та же функция, что разделы общего
  набора (`buildComplectSections` добавляет к ней порог «два комплекта и больше»; у набора для сравнения порога
  нет, раздел есть и у одного комплекта). Набор без комплекта с наполнением в массив не попадает.
- Номер и заголовок. Бэк связывает строки таблицы цен и наполнение набора по номеру и со строками их не сверяет.
  `setNumber` равен позиции набора в `rowSet.alternative` плюс один (`alternativeSetNumber`, `doc-set-numbers.ts`).
  Та же формула даёт `setId` строк в `toDocRows` и `toDocRowSets`. `title` равен «Набор N»
  (`alternativeSetTitle`): так бэк подписывает набор в таблице цен по `setId`. Пропущенный набор номера других
  не сдвигает.
- Запрос: `buildOfferPdfGenerateRequest` кладёт поле на верхний уровень и участнику-варианту (бэк берёт у участника
  только его собственное наполнение, `withVariant`). Наборы живые: открытый вариант собран из живого состояния
  (`entry.alternative`), как остальное тело документа. Выключено или наполнения нет — поля нет. Ключ превью
  (`offerPdfRequestKey`) включает поле, поэтому переключатель пересобирает превью.
- Word. Word-шаблоны блок не печатают (бэк отдаёт `AlternativeComplectSections` и `IsAlternativeComplects`, а
  docx-шаблоны правит владелец). Выбор формата — одна точка, `ALTERNATIVE_COMPLECTS_FORMATS`
  (`entities/offer-document/lib/offer-alternative-complects.ts`): `{ word: false, pdf: true }`. Word-запросы уже
  собирают поле через `alternativeComplectsFields` и берут настройку из настроек PDF-КП, поэтому включение Word
  сводится к `word: true`.
- Тип поля описан руками в `document-payload/model/dto.ts` (`DocComplectsFields`); после `pnpm run generate` это
  расширение убирается.

## КП без сопроводительного письма (27.11.2026)

Менеджер может отключить письмо совсем. Решение владельца: без письма печать и подпись поставщика, что стоят
под ним, тоже пропадают.

- Флаг — `prefs.settings.withLetter` (`entities/offer-pdf`), по умолчанию включён. Хранится как остальные настройки
  PDF: слепок сделки и варианта, избранное, последний выбор менеджера; разбор — `normalizeOfferPdfStyle`, записи
  без поля читаются как «с письмом».
- PDF-запрос: `settings.withLetter`. Выключено: письма и подписи в документе нет, текст письма в запрос не уходит
  (в состоянии он остаётся до включения). У стиля, где письмо стоит на промо-странице (`moderne`), страница не печатается.
  Бэк: `offerDocumentPages`, `offerSectionOrder` (`templates/kit/document/document.util.ts`).
- Word-запрос (одиночный, generate-multi, превью): поле верхнего уровня `withLetter`, оно есть только при `false`
  (`offerLetterFields`, `entities/offer-document/lib/offer-letter.ts`). Тип поля описан руками (`OfferLetterFields`),
  после `pnpm run generate` расширение убирается. Бэк отдаёт Word-шаблону метку `WithLetter` (всегда, по умолчанию
  `true`): письмо и подпись исчезают у шаблонов, где они обёрнуты условным блоком `{#WithLetter}…{/WithLetter}`.
  Текст письма и подпись лежат в самом .docx, поэтому шаблон без такого блока печатает их при любом значении.
- Превью Word устаревает от переключателя (`isOfferLetterToggleAction`, `app/lib/stale-actions.ts`).
- UI: `OfferLetterToggle` в шапке карточки письма (PDF) и в `OfferWordLetterCard` (Word); у выключенного письма
  карточка свёрнута, переключатель «Печать и подпись» закрыт.

## Реквизиты клиента (bx-rq)

- Бэк: `back/libs/rq-lib` (общий с `apps/rq`, форма `get_rq`/`store_rq` не менялась). Пресеты портала
  даёт `RqPresetService`: `bx_rqs` из БД (bitrix_id там строка, в коде всегда число), без зеркала —
  `crm.requisite.preset.list` по XML_ID, затем по имени; хардкода 1/3/5 нет (на april-garant это 2/4/6).
  `BxRqService.getRq` возвращает реквизиты компании плюс заготовку (-1) на каждый тип и ничего не пишет
  в Bitrix; маппер кладёт заготовку в `default` каждой группы, при пустой группе — ещё и в `items`
  (Альфацентр узнаёт «пусто» по `items[0].bx_id === -1`). `store_rq` с `bx_id: -1` требует `preset_id`
  портала и собирает реквизит из заготовки этого пресета; пользовательские поля (должность, основание,
  падежи) пишутся через каталог `crm.requisite.userfield.list`.
- Фронт `entities/bx-rq`: `startNewRecord({clientType})` — черновик из `rqs[type].default`;
  `saveBaseCreating` добавляет новый к списку (заготовка вытесняется) и делает его текущим; адаптер при
  старом бэке без `default` собирает шаблон из любого реквизита типа с очищенными значениями.
  Хук карточки `lib/hooks/use-base-card.ts`; экран — `widgets/requisites` (`use-requisites`).
- Тип клиента: `entities/deal` `resolveClientType` / `selectClientType(state)` — компания → сделка;
  в шапке чип `clientType` (`entities/client-card`, пишет `op_client_type` компании). Все сборщики
  документов берут тип из `selectClientType`.
- Тип клиента известен до работы с документами: фича `features/client-type-prompt`. Когда загружены
  компания, портал и реквизиты, слушатель `app/model/listeners/client-type-detect.listener.ts` один раз
  за загрузку сделки смотрит на тип клиента. Поле пустое и все реквизиты компании одного однозначного типа
  (`detectClientTypeByBundle`, `entities/bx-rq`) — тип пишется в `op_client_type` компании тем же thunk'ом
  `updateClientChoice`, что и чип шапки (код пункта — `getClientTypeItemCode`). Реквизитов нет или типы
  разные — запись не идёт; реквизиты только организации тоже не пишутся: в этом пресете лежат и коммерческие,
  и бюджетники, их различает только менеджер. Затем, пока тип неизвестен, окно «Укажите тип клиента» (`ClientTypePromptDialog`
  в `widgets/app-shell`) открывается поверх любого экрана. «Позже» скрывает его до перезагрузки страницы
  (флаг в сторе, без localStorage); поля нет на портале — окна нет.
- Текущий реквизит сделки — `snapshot.rqId` (v2; v1 и старые v2 без поля — первый подходящего типа).

## Спецификация договора и платные Legal Tech

- Бэк строит по паре строк на каждый платный пакет: первый — легаси-коды `specification_lt_packet` /
  `specification_lt_services` (их читают старые шаблоны), второй и дальше — `specification_lt_packet_N` /
  `specification_lt_services_N`. Код строки в DTO — строка с проверкой `SPECIFICATION_CODE_PATTERN`.
  Помощники — `back/apps/konstructor/src/document-generate/lib/specification-lt.util.ts` (`readLtPaidPackets`),
  ими пользуются договор (`legal_techs`), отчёт о поставке (`lt_packet`) и комментарий заявки RPA.
- Запрос формы: `lt.paidPackets` (имя товара и сервисы на пакет, ContractSpecificationLtPacketDto).
  `paidPacket`/`paidServices` остаются для легаси-клиентов (`init-form`).
- Фронт: `visibleSpecification` (сразу видно) и `specificationDetails` (активные скрытые) из `entities/contract-document`;
  разделы и пакеты LT — `features/contract-form/lib/specification-sections.util.ts`, UI —
  `SpecificationDetails` (Collapsible) и `SpecificationLtPackets`.
- Адрес клиента в договоре — только юридический (type_id 6), у физлица тоже. Подпись на экране —
  «Юридический адрес» для всех типов клиента (`addressTitle` в `entities/bx-rq/lib/address-util.ts`);
  «Адрес прописки» (тип 4) не используется и не проверяется — решение владельца 12.11.2026.

## Договоры по вариантам комплекта (23.11.2026)

- Договорная единица — один договор одного варианта. Когда варианты продаются вместе (режим сборки `multi_contract`
  или `single_contract`, на экране «Все варианты…») и участников документа два и больше, `selectContractUnits(state)`
  отдаёт по единице на участника (`key` — строка от `variantSmartId`, набор строк `general`, шапка `summary`). Открытый
  вариант берётся из живого состояния, остальные из слепков; участников даёт вход по режиму `selectModeVariantsInput`
  (`buildVariantEntries`); участник, которого собрать нельзя, попадает в `skipped` и даёт блокер тем же текстом
  (`contractGenerateBlocker`). Режим
  `compare` («Только открытый вариант»), один участник и отсутствие вариантов единиц не дают: экран работает по живому
  состоянию. Режим выбирают на этом же экране (`ComplectModeSelect` над договорами).
- Запросы собирает ядро без стора (`lib/build-contract-core.ts`: каталог, набор строк, значения единицы, общие данные);
  `buildSpecificationFormRequest` и `buildContractGenerateRequest` — обёртки над ним для живого состояния.
- Состояние единиц — `contractDocument.units[key]` (форма, спецификация, номер, результат). `formStale` устаревает и их,
  `unitsRetained` на входе на экран удаляет вышедшие из участников. Вход: `initContractDocument` грузит живую форму, затем
  формы единиц по одной; `generateContractUnit(key)` и `generateContractUnits()` (по очереди, сбой одной не останавливает
  остальные) сохраняют слепок и пишут результат в состояние единицы. Поля сделки, реквизит и поставщик общие.
- Режим `single_contract`: общий договор на все наборы бэк пока не собирает, экран показывает единицы как при
  `multi_contract` и пояснение (`SINGLE_CONTRACT_NOTE`).
- Экран: `features/contract-form` (`ContractUnitsSection`, карточка единицы, `SpecificationEditor` общий с живым договором),
  выбор между списком и одиночным блоком и выбор режима (`ComplectModeSelect`) — `widgets/contract-document-screen`.
  На экране отчёта о поставке (`widgets/supply-report-screen`) тот же компонент стоит вверху.

## Экран КП: превью, поля, падежи (06.11.2026)

- Текстовые поля, от которых зависит превью PDF (получатель, фраза об акции, исходящий номер, письмо),
  отдают значение по blur: `BlurCommitInput` / `BlurCommitTextarea` из `@workspace/april-ui/fields`
  (хук `useCommitOnBlur`). Enter в однострочном поле снимает фокус. Селекты и переключатели — сразу.
- `PdfPreviewViewer` (shared): область постоянной высоты (85vh, не меньше 640px), страница во всю ширину
  колонки, прокрутка внутри. Раньше высота шла от содержимого и страница вписывалась целиком — мелко.
- Падежи адресата КП — дательный (легаси nameCase/wordCase): `rq/case` с `grammaticalCase: dative`, у должности
  склоняется главная часть («Заместителю генерального директора»), сокращение в начале не трогается.
  Реквизиты и договор просят родительный (по умолчанию, совместимо с apps/rq).
- Бесплатные блоки старых слепков: индексы 3 и 11 → `bcaonsalting` и `ltsemi` (коды каталога). Сохранённые
  уже с `bcaonsalting_free`/`ltsemi_free` чинит `normalizeComposition` (`LEGACY_FREEBLOCK_ALIASES`).
  `pbcaonsalting` («ПК Премиум: База знаний») в БД админки нет — печатается кодом, пока его не заведут.
