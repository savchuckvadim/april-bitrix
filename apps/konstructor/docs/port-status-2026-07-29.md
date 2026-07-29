# Статус переноса: вспоминание сделок + экран товаров (2026-07-29)

Продолжение миграции по [migration-plan.md](./migration-plan.md). Закрыты (полностью или в рабочем объёме)
фазы **1** (каркас), **3–4** (состояние + PRODUCTS), **6** (персистентность/restore) и бэкенд-задача **B3**.
Домен и правила — [legacy-core.md](./legacy-core.md), формат слепков — [legacy-persistence.md](./legacy-persistence.md).
**Гайды: [user-guide.md](./user-guide.md) (пользователю), [dev-guide.md](./dev-guide.md) (разработчику — карта стора, структура row-set, инварианты).**

> Рефакторинг 2026-07-29 (после ревью владельца): `entities/row-set/lib` разложен
> по под-сущностям `price/` (весь налог — в `tax.util.ts`, правило «налог ≠ LIC»
> в одном месте), `row/`, `set/`; тесты в `lib/__tests__/`; селекторы в
> `model/selectors.ts`. Публичный API барреля не менялся. Дубли папок устранены:
> `widgetes`→`widgets`, `feature`→`features` (мёртвый `offer-pdf-settings` удалён).

---

## 1. Как теперь работает приложение (боевой флоу)

```
Boot (AppThunk.initial → app-init.util):
  Bitrix.start(TESTING_DOMAIN, TESTING_USER)      # во фрейме — реальные domain/user
  → placement → dealId (CRM_DEAL_DETAIL_*; COMPANY/LEAD пока без сделки)
  → WS-клиент → dispatch appActions.setAppData    # ЕДИНЫЙ триггер для listeners

Listeners (modules/app/model/listeners/start-store-listeners.ts):
  setAppData → initCatalog (init v2) + fetchBaseTemplate + fetchOfferTemplates
             + initProviders (налог) + initPortal (pbx bitrixfields, задел B4)
  initCatalog.rejected (dev) → фикстурный каталог docs/oldinit.json
  «dealId есть» × «каталог готов» → restoreSnapshot (однократно)

restoreSnapshot (entities/snapshot/model/SnapshotThunk.ts):
  GET /api/konstructor/deal (после регенерации пакета; до неё в dev — фикстура
  реальной прод-записи legacy-deal.v1.json для TESTING_DEAL_ID)
  → v2? restoreV2 : parseV1 → mapV1(catalog)      # number→code, цены КАК ЕСТЬ
  → setContext(regionCode) ДО restore             # sync-listener НЕ пересчитывает цены
  → rowSetActions.restore + selectRow(main)
  → snapshot.status='restored' → SnapshotNavWatcher → router.replace('/products')

/products (widgets/price-table):
  TableHeader (текущий комплект, селекты main-строки: комплект/ОД/договор,
               регион, поставщик-налог)
  SetBlock general («Основные») + SetBlock × N («Для сравнения», ≤7)
  RowBuilderPanel (главный / доп. Гарант / сравнение)
  CompositionEditorPanel (наполнение ЛЮБОЙ garant-строки, rules/free)
```

Ключевые инварианты restore (BC, legacy-persistence §5):
- денормализованные цены слепка **не пересчитываются** молча; пересчёт — явные
  действия (кнопка «Пересчитать» на сете = `resyncSet`, смена наполнения/рефов/региона);
- битые/отсутствующие поля v1 (`iskraConfig`, `academy`, `contract.code`) не роняют restore — warnings баннером;
- v2-слепок определяется по `schemaVersion: 2` в колонке `rows` (пишем только v2 — фаза 7).

## 2. Что сделано в этот заход

### Бэкенд (back/apps/konstructor) — B3 ГОТОВ (код)
- `modules/inner-deal`: **HTTP-контроллер** `@Controller('konstructor/deal')` (`@ApiTags('KonstructorDeal')`):
  - `GET /api/konstructor/deal?domain&dealId[&serviceSmartId]` → `{found, deal}` (не 404 — глобальный фильтр алертит в Telegram);
  - `GET /api/konstructor/deal/list?domain&dealId` — все слепки сделки (смарты);
  - `POST /api/konstructor/deal` — upsert по (domain, dealId, serviceSmartId), `portalId` по домену (паритет Laravel `DealController::addDeal`).
- DTO `InnerDeal*` (без enum, BigInt→number в mapper) — orval-безопасно.
- **Prisma-схема дополнена** колонками `offerSmartId`/`ltOther`/`iskraConfig` (есть в реальной таблице — Laravel-миграция 2026-05-08; prisma generate прогнан, build зелёный).
- Семантика обычного слепка: `serviceSmartId IS NULL`, fallback на любую запись (как Laravel getDeal).

### ✅ Подтверждено: Laravel пишет в ту же таблицу
`C:\Projects\April\online\app` → `App\Models\BxDocumentDeal` → `bx_document_deals`,
ключ `(dealId, domain)`. Старые слепки читаются новым бэком сразу, **миграция данных не нужна**
(вопрос №1 плана закрыт). Нюанс: Laravel getDeal имеет fallback на старую модель `Deal` — новому API не переносили (записи давно перезаписаны).

### Каркас app (эталон kpi-sales)
- Один `providers/Providers.tsx`; App-гейт в `app/layout.tsx`; `NonAuthScreen` вместо редиректов `/none-auth`, `/no-company` (страницы удалены).
- Listeners регистрируются в `store.ts` сразу после `setupStore` (не в thunk).
- `AppThunk.initial()` — тонкий: гард + `appInit()`; все загрузки — listeners на `setAppData`.
- `AppSlice`: `dealId: number | null` (ключ слепка), `company` nullable (dev против чужого портала не падает).
- Server-DAL переехал из `app/lib/{logs,metrics,redis,offer-style}` → `modules/app/lib/server/*`.
- Удалены: `AppThunkOld.ts`, `model/Provider.tsx` (дубль Providers), `providers/AppProvider.tsx`, `app/bitrix-dev/`, `app/public/page.tsx`, `app/logs/server.log` (+ gitignore), `konstructor-init.util` (слился в listener).
- `app-global.ts`: `IS_PROD` из `NEXT_PUBLIC_IN_BITRIX` (в `.env` false для dev), `TESTING_DOMAIN='gsr.bitrix24.ru'`, `TESTING_DEAL_ID=129487` — реальная прод-запись, совпадает с фикстурой снапшота.

### Snapshot-слайс (вспоминание)
- `SnapshotSlice` (`idle|loading|restored|none|error` + warnings + templateId), `restoreSnapshot` thunk, restore-listener (условие-джойн), `SnapshotNavWatcher` (декларативный переход на /products).
- `lib/api/snapshot-helper.ts` — единственное место импорта api-пакета; **до `pnpm generate` — заглушка** (`hasSnapshotApi=false`), dev работает на фикстуре.

### Ядро row-set — закрыты гэпы против легаси-правил
- `KRow.quantityLocked` (академия «в часах» вне единого количества), `RowSet.totalPrice` (ручная правка свёрнутого тотала; сбрасывается при пересборке/развороте/смене количества — паритет `getTotalFromRows`).
- `applySetQuantity` — **единое количество сета** (легаси-пропагация), `removeRowCascade` (последний garant убивает сет; main не удаляется), `normalizeCollapsed` (авторазворот ≤1 строки), `leadGarantRow`, переработанный `buildTotalRow` (единое qty, `current=Σsum/qty`, override).
- `pricing`: количество целое, sum-правка перезаписывает `month` и гард `−50<(sum/qty)/base<50` (легаси-паритет).
- `sync-set`: сервисные строки от **ведущей** garant-строки (фикс: comparison-сеты теперь получают LT/консалтинг/СТАР/академию), rename+quantity переживают пересборку, `applySetTaxChange` (масс-налог ×1.05, LIC и isFree пропускаются — слепко-безопасно), `detectDroppedAcademy`.
- `commercial-input.ts` — чистый разбор ввода (границы скидки −1500..500, «Аванс» vs «Количество», ₽/%-режимы).
- Слайс: `editTotalCommercial`, `renameRow`, `toggleDiscountMode`, `setWithTax`, `resyncSet`, `startSetEditing/stopSetEditing`, `editingSetId`; `editRowCommercial(quantity)` → единое количество.
- **Listeners переехали в `entities/row-set/model/listeners.ts`** (entity отдаёт регистраторы, app регистрирует): sync (`setContext` матчится ТОЛЬКО по региону — налог не пересобирает слепок), provider-tax, academy-duration (чистая замена React-эффекта `useAcademyQuantityListener`).

### Виджет `widgets/price-table` + фичи (замена Total-Table)
- `features/row-builder` (главный/доп. Гарант со СВОИМИ поставкой/договором/наполнением, сравнение ≤7), `features/composition-editor` (наполнение любой garant-строки, rules/free, вес, нарушения) — промоут dev-core.
- Sub-widgets: `table-header` (CurrentComplectName + селекты main-строки + регион + поставщик), `set-block` (сводка «Всего наименований … ₽, в т.ч. НДС», Объединить/Разъединить, карандаш редактирования свёрнутого сета, «Пересчитать», удаление сравнения), `row-card` (garant/сервис/total-карточки, inline-rename, per-row селекты, удаление), `commercial-inputs` (4 поля с буфером, коммит по blur/Enter, ₽/% переключатель).
- Правки коммерции per-row; в свёрнутом виде — только Количество (total), полный доступ — карандаш; редактирование одного сета «блюрит» остальные (легаси-поведение).
- Тема комплекта: `data-complect` + `getComplectStyleOverride` (цвет из админки побеждает токены).
- Роут `/products` (`dynamic`, `ssr:false`, скелетон), `/dev/core` не тронут.

### Данные: настоящий `docs/oldinit.json` восстановлен
Заглушка заменена **живым дампом** Firebase callable `getApril` (проект `april-garant`, домен gsr):
21 комплект, 19 поставок, 408 проф-цен, 117 универсал-цен, 18 LT, 4 пакета, контракты. 
Команда пересъёма: `curl -X POST https://us-central1-april-garant.cloudfunctions.net/getApril -H "Content-Type: application/json" -d '{"data":"gsr.bitrix24.ru"}'` → `.result.data`.
⚠️ В актуальном проде **нет региона `kbr`** (13 регионов: kali/spb/msk/mobl/nov/karel/br/rstv/stv/occup_*) — два ценовых теста переведены на `stv`.

### Тесты: 58/58 зелёные (`pnpm test`)
Было 3/37 на заглушке. Новые сьюты: `row-set.test.ts` (единое количество, каскад удаления, тотал+override, sync comparison-сета, масс-налог, академия), `commercial-input.test.ts`, `restore-flow.test.ts` (мини-стор с реальными listeners: цены слепка не пересчитаны, main выбран, none-ветки).
`vitest.config`: алиасы `@bitrix`, `@workspace/ui` + inline workspace-пакетов.

## 3. Решения владельца, зафиксированные в этот заход

1. **B4 (карта UF-полей): fields/stages — ТОЛЬКО из pbx-сущностей.** Никакой `bitrix{add,update,product}`-карты из старого init. Источник — `portal.*.bitrixfields`, поиск по `code` (паттерн: `event-sales/modules/entities/EventCompany/model/EventCompanyThunk.ts:15` — `pFields.find(pf => pf.code == '...')`). `initPortal` уже диспатчится на setAppData. Deal-send (фаза 7) обязан брать UF-id оттуда.
2. Слепки — через `@workspace/nest-konstructor-api` (кодогенерация), не raw-запросы.
3. Актуальный бэк — `C:\Projects\April\april-next\back\apps\konstructor`; референсы легаси-бэка: `C:\Projects\April\online\app` (garant-app.ru), `C:\Projects\April\hook` (april-app.ru, company→deals).

## 4. ~~GATE~~ ✅ ВЫПОЛНЕНО 2026-07-29 (после `pnpm generate` пользователем)

- Пакет регенерирован; **баррель `src/generated/index.ts` теперь автогенерится** — добавлен `scripts/build-generated-index.mjs` (копия из nest-kpi-report-sales-api), `generate` = `orval && node scripts/...`. Руками баррель больше не поддерживаем.
- `snapshot-helper.ts` — на generated-клиенте (`getKonstructorDeal().innerDealFind/innerDealList`), `hasSnapshotApi=true`; алиасы DTO в `entities/snapshot/model/dto.ts`.
- Thunk: если API недоступен (прод без деплоя / бэк не запущен) — в dev фоллбэк на фикстуру, иначе честный `error`-статус (не блокирует).
- **Смоук на живом локальном бэке прошёл**: GET → `{found:false}` (в БД бэка записи не было) → POST-upsert фикстуры → GET `{found:true}` (id 5454). Полный цикл API работает.

### ✅ Конфигурация БД (уточнено владельцем 2026-07-29)
- **Прод: Nest и Laravel живут на ОДНОЙ БД** → обратная совместимость слепков в проде работает из коробки, миграция данных не нужна.
- **Локальный бэк** — своя БД из `back/infra/compose/docker-compose.base.yml`, при первом старте сидируется дампом `back/db_dev/db_backup_06_03_clean.sql` (тестовые сделки/порталы «как на проде»; записи 129487 в дампе не было — залита фикстурой через upsert, id 5454).
- **Будущая задача (владелец): перенести Nest на новую БД и перегнать данные** — полностью отвязаться от легаси. Snapshot-контракт (v1-чтение/v2-запись) к этому готов: адресация по (domain, dealId, serviceSmartId), формат колонок переезжает как есть.

### Про `NEXT_PUBLIC_KONSTRUCTOR_API_URL`
Прод: `https://api.konstructor.april-app.ru/` (уже в `.env`). Локально — не принципиально: пусто = дефолт пакета `http://localhost:3007/` (локальный бэк); с прод-URL до деплоя B3-эндпоинтов вспоминание уходит в dev-фикстуру (фоллбэк в thunk).

## 4.1 Добавлено позже 2026-07-29 (вторая итерация)

- **X-ОД** — произвольное количество одновременных доступов: синтетический код
  `x_<type>_<n>` в `refs.supplyCode`, единый резолвер `resolveSupply`,
  интерполяция коэффициента/PROF-цены, пункт «X-ОД — своё…» во всех селектах ОД,
  слепок v2 переживает автоматически. Тесты 68/68.
- **Переработка карточки товара** (по ревью владельца — «духота» против легаси):
  рефы текстовой строкой «поставка • договор • мера» + ⚙-правка по требованию
  (селекты не торчат постоянно), подсказки в ячейках (цена/мес, мера, сумма без
  скидки), селекты сервисов прямо в сервисных карточках (консалтинг/академия/
  убрать СТАР — через composition ведущей строки), LT — вес пакета с хинтом.
- **Решения владельца**: app-cache (бэк-эндпоинты настроек) начали использовать;
  **КП — только «по шаблону»** (nest-модуль, уже перенесён), ларавел-«генерацию»
  НЕ переносим.
- **Разведка B5 (deal-send) завершена** — весь инструментарий на бэке готов:
  `PBXService.init(domain)` (hook/marketplace прозрачно), `bitrix.deal.set/update`
  + `bitrix.productRow.set` (+batch), `PortalModel.getDealFieldByCode` +
  `getFieldBitrixId` (UF по коду), реестр `PBX_SALES_KONSTRUCTOR_FIELDS`
  (маппинг легаси-ключей есть в отчёте). Рекомендуемая структура:
  `back/apps/konstructor/src/modules/deal-send` (controller/use-case per-request/
  services + whitelist-конст по образцу kpi-report-sales pbx-fields).
  **Открытые вопросы владельцу**: (1) поля `star`/field_14 НЕТ в pbx-реестре —
  добавить + прогнать pbx-install; (2) два расходящихся файла реестра
  (`pbx/domain/src/field/type/...` vs `pbx/app-type/field/...`) — какой канон;
  (3) коллизия кода `consalting` (update и product); (4) категория/стадия при
  создании сделки; (5) guard по `nestKonstructorKey` — вводить?; (6) measureCode
  ОКЕИ через `crm.measure.list` (в init сейчас баг measureId/measureCode).

## 5. Оставшиеся задачи (по фазам плана)

- **Фаза 5 (сервисы, добить):** LT-other как отдельные строки (`withoutRules`-прецедент → mode), Искра-конфиг (count) в composition/строке, star-подсервисы для описания КП.
- **Фаза 6:** ~~v2-запись при сохранении~~ **сделано 2026-07-29** — кнопка «Сохранить предложение» в шапке /products: `saveSnapshot` thunk → `serializeV2` → POST upsert (SnapshotV2 в колонке rows, `templateId` в свою колонку — асимметрия легаси починена); round-trip покрыт тестом (61/61). Осталось: избранное и сервисный смарт на том же snapshot-контракте (эндпоинты list уже есть).
- **Фаза 7:** deal-send (B5) — состояние → бэк → deal + UF-поля (из **pbx bitrixfields**, см. §3.1) + productRows (только general; total при свёрнутом сете); стыковка offer-word с новой моделью (`sets/rows/total/complect`); запись слепка v2 + `templateId`.
- **Фаза 8 (зачистка):** ~~`widgetes` → `widgets`~~ и ~~`feature` → `features`~~ **сделано 2026-07-29** (Header/GlobalSettings/Navigation/offer/start-settings переехали в `widgets/`, client-type/position — в `features/`; мёртвый дубль `feature/offer-pdf-settings` удалён). Осталось: дубль `pages/offer-template-settings` ↔ `entities/offer-template-konstructor`, миграция `april-theme` → `@workspace/theme`, удалить `entities/complect`/`infoblock`-заглушки, `LoadingTest.tsx`, кривые png в public/logo, eslint-boundaries.
- COMPANY/LEAD placement → резолв сделки компании (легаси: hookAPI `full/document/company/deals`; решить — фронт через `bitrix.deal.getList({COMPANY_ID})` или бэк).
- Экраны `/global` и `/constructor` конвейера (частично покрыты table-header'ом и composition-editor'ом на /products).
- Наполнить БД (админка): supplies/prices/universal-комплекты/сервисы — чтобы init v2 отдавал полный каталог и dev-фикстура стала не нужна; проверить универсал-формулу abs на реальных данных.
- Известное отличие от легаси (осознанное): правка total-строки хранится как override и сбрасывается при смене количества/развороте (легаси хранил total[0] и тоже перезаписывал его из строк при любом пересчёте).

## 6. Технические заметки

- **Слепко-безопасность sync**: `rowSetActions.restore` и `writeSyncedSet` НЕ матчатся sync-listener'ом; `setContext` матчится только с `regionCode` в payload; налог идёт отдельной веткой `applySetTaxChange` без пересборки по каталогу.
- Порядок в `restoreSnapshot` критичен: `setContext` ДО `restore`.
- `next/font` в entity-UI (offer-template-konstructor) не дружит ни с server-графом layout, ни с vitest — поэтому layout импортирует `App` напрямую из `ui/App`, а тесты собирают мини-стор (не `setupStore`).
- Turbopack кэширует удалённые роуты — после зачистки `rm -rf .next`.
- `getOriginalState()` в academy-listener — сравнение сета до/после `writeSyncedSet`.
