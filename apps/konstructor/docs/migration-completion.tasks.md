# Завершение переезда конструктора — анализ и план (2026-10-24)

Итог ревизии трёх сторон: легаси (`C:\Projects\April\front\konstructor\src`),
новый фронт (`apps/konstructor`), бэк (`back/apps/konstructor`, порт 3007).
Предыдущие планы — [migration-plan.md](./migration-plan.md) (фазы 0–8) и
[port-status-2026-07-29.md](./port-status-2026-07-29.md) — остаются
историей; текущий статус и остаток работ — здесь. Домен — в
[legacy-core.md](./legacy-core.md), слепки — в
[legacy-persistence.md](./legacy-persistence.md), маршруты — в
[routing.md](./routing.md).

## 0. Правила переезда (решения владельца)

1. **Один бэкенд.** Только `back/apps/konstructor` через
   `@workspace/nest-konstructor-api`. В приложении не остаётся Firebase,
   Laravel `garant-app.ru`, hook `april-app.ru`, монолита `back.april-app.ru`
   и `event.april-app.ru`. Чего нет на нашем бэке — дописываем туда.
2. **Обратная совместимость слепков**: v1 читаем, v2 пишем; старые сделки
   открываются с теми же ценами.
3. **Типизация без исключений**: ноль `any`; `as unknown as` допустим только
   на границе разбора v1-слепка и в тестах.
4. **Чистота**: FSD с линтером границ, DRY/SOLID/KISS, компонент = вёрстка,
   логика в хуках, DAL в helper-классах, правила — отдельные утилиты/классы.
5. **`number` — пережиток.** Домен адресуется `code` (справочники) и `id`
   (записи БД, Bitrix). `number` живёт только внутри адаптера слепков v1 как
   ключ таблиц маппинга `legacy-codes.ts`.
6. **Поставки (ОД)** — паритет с легаси один в один + **X-ОД** (произвольное
   количество доступов).
7. **Продукты, цены, строки** — работают как было, доказано тестами на
   реальных слепках.
8. **`base-template` выпилить целиком.**
9. **Договоры и отчёты о поставке** — особое внимание: это то, ради чего
   конструктор открывают.

## 1. Что уже готово

| Область | Состояние | Где |
| --- | --- | --- |
| Каркас: Next, тема `@workspace/theme`, `april-ui`, один прелоадер, Providers, App-гейт | готово | `modules/app` |
| Маршруты и экраны: вход → старт / варианты / хаб; шаги Параметры → Комплект → Цены → Документ; шапка как в «Звонках» | готово (документы — заглушки) | `processes/konstructor`, `widgets/*`, `routing.md` |
| Каталог init v2 → домен по `code`; матрица совместимости; X-ОД (`x_<type>_<n>`; цена пока интерполяцией — заменить на ручную, решение 14); тема комплекта | готово | `entities/catalog` |
| Движок правил наполнения (`rules`/`free`), вес, подбор универсала | готово, неполный паритет (§2.6, этап 5) | `entities/composition` |
| Сеты/строки: цены, налог ×1.05 (не LIC), единое количество, total с override, сравнение ≤7, listeners | готово | `entities/row-set` |
| Слепки: разбор v1 → v2, запись v2, restore на старте | готово; избранное/сервисный смарт — нет | `entities/snapshot` |
| Варианты КП: смарт `complect_variant`, стадии, настройки сборки, выбор на входе | готово | `entities/complect-variant`, `widgets/variant-picker` |
| Наполнение по категориям, у каждого товара своё (окном) | готово | `features/composition-editor` |
| Бэк: `init/data`, `konstructor/deal*` (find/upsert/list/variants/settings/copy), `deal-send`, генерация КП (Word, multi, PDF-превью), `contract/generate`, `document-supply-report/*`, `init-supply`, шаблоны (word/invoice/contract/supply-report CRUD), `front/portal`, `provider/domain` | готово на бэке; фронт не подключён | `back/apps/konstructor/src` |
| Тесты фронта | 15 файлов / 102 кейса: ядро, цены, X-ОД, слепки, вход | `modules/**/__tests__` |

## 2. Несоответствия и дыры

### 2.1 Транспорты вне nest-konstructor (нарушение правила 1)

| Что | Куда ходит | Файл | Куда переводим |
| --- | --- | --- | --- |
| Портал (pbx-слепок) — на каждом старте | Laravel `onlineGeneralAPI` `front/portal` + AES-кэш в localStorage | `entities/portal/model/PortalThunk.ts:49` | `getFrontPortal` (`POST /api/front/portal`, уже типизирован) + `swrCache` из `@workspace/api` |
| Поставщики (налог) — на каждом старте | Laravel `onlineAPI` `konstructor/front/get/providers`, `provider` | `entities/provider/model/DocumentProviderThunk.ts:43,78,107,137` | `providerGetProviderByDomain` (бэк: ответ не типизирован — `{[key]: unknown}`) |
| Базовый шаблон письма | монолит `backAPI` `/template-base/offer` | `entities/base-template/lib/base-template.helper.ts:12` | **удалить** (правило 8; `state.baseTemplate` никто не читает) |
| HTML-шаблоны КП (`offer-template`, `offer-template-block`, `offer-template-konstructor`, `pages/offer-preview`, `widgets/offer`, `app/api/offer*`, redis + puppeteer на `localhost:5000`) | `@workspace/nest-api` → `back.april-app.ru`; `portal_id: '1'`, `code: 'test_userId_'` захардкожены | `entities/offer-template/model/OfferTemplateThunk.ts:4-5,26,107` | заморозить: оставить код, снять со старта (решение 1) |
| Word-шаблоны (`/settings`) | `@workspace/nest-api` + сырой `customAxios` | `entities/offer-template-word/lib/api/*.ts` (`template.api.ts:92,104,130,138`) | `getKonstructorWordTemplate`, `getUserSelectedTemplate`, `getKonstructorWordTemplateTags`, `getInvoiceTemplates`, `offerWordPdfPreview*` — всё уже есть на бэке konstructor |
| Реквизиты (`/requisites`) | `@workspace/bx-rq` → `event.april-app.ru` (`X-EVS-API-KEY`); listeners не зарегистрированы — данные вообще не грузятся | `entities/bx-rq`, `pages/bx-rq/BxRqPage.tsx:89` («HARD CODRE») | бэк реквизитов уже есть — `back/apps/rq`; `RqModule` → `libs/rq-lib`, монтируем в konstructor (решение 6) |
| WebSocket — на каждом старте, без единого обработчика | `@workspace/ws` → `back.april-app.ru` | `app/lib/initialize/app-init/app-init.util.ts:72-74`, `app/model/ws/Websocket.ts` | удалить |
| Сделка компании (placement COMPANY) | в легаси — hookAPI `full/document/company/deals`; у нас отсутствует (COMPANY/LEAD → `dealId = null` → `/start`) | `app/lib/services/bx-init.service.ts:34,61` | решение 5 |
| Потоки презентаций | в легаси — hookAPI `full/document/flow`, `full/contract/flow`, `full/document/init` | нет в новом коде | решение 7 |
| Прокси комплектов | Laravel `garant/complects` с `X-API-KEY`, без вызывающих | `app/api/proxy/complects/route.ts:21` | удалить |

### 2.2 Безопасность и сборка

- **`ONLINE_API_KEY` утекает в клиентский бандл**: инлайнится через
  `next.config.ts:19-23` и передаётся в `setConfig` из `'use client'`
  (`app/providers/ApiProvider.tsx:5-7`). После ухода с Laravel ключ не нужен
  вовсе — убрать вместе с транспортом.
- `docs/oldinit.json` (249 КБ) статически импортируется в прод-стор
  (`app/model/listeners/start-store-listeners.ts:31`) и `widgets/dev-core`.
- `app/api/metrics` отдаёт пустой реестр (счётчики `withMetrics` живут в
  глобальном); `app/api/admin/logs` с чужим контекстом «KPI REPORT SALES»;
  `app/api/offer`, `templates`, `proxy/complects` — без вызывающих.
- `TESTING_DEAL_ID = 168595` (`app-global.ts:17`), а фикстура слепка —
  сделка 129487; комментарий в `:12` утверждает обратное.
- Лишние зависимости: `@workspace/nest-api`, `@workspace/ws`, `puppeteer`,
  `ioredis`, `pino`, `prom-client`, `install`. Лишние env: `NEXT_PUBLIC_WS_HOST`,
  `NEXT_PUBLIC_APP_URL`, `BACK_API_URL`, `PROD_PORT`, `PDF_PREVIEW_URL`,
  `ONLINE_API_KEY`, `LOG_FILE_PATH`.

### 2.3 Бэк: пробелы init и ручек

| Нужно | Статус на бэке |
| --- | --- |
| **Тексты поставок для договоров** (`contractName`, `contractProp1/2`, `contractPropComment/Email/LoginsQuantity/SuppliesQuantity`, `lcontract*`, `acontract*`, `quantityForKp`) | в БД 7 колонок из 17, в `SupplyInitDto` — ни одной (только `description`, `saleName_1..3`); договор и отчёт о поставке без них не собрать (B2 из старого плана **не сделан**) — решение 2 |
| `document-supply-report/init-form` | возвращает пустые спецификацию, реквизиты клиента и форму договора — `init-form.service.ts:233-304` помечено «НЕ ПЕРЕНЕСЕНО из Laravel» |
| Избранное (`konstructor/front/favorites/*`, 5 ручек Laravel) | **нет**; в `bx_document_deals` есть `isFavorite`, `favoriteId`, а миграцией 2026-09-15 добавлены `kind`, `visibility`, `isActive`, `isArchived`, `parentId`, `creatorBxUserId` — ни Nest, ни Laravel их не используют — решение 12 |
| Акции (`promotion`, `promotionName`, `kind='promotion'`, `parentId`) | колонки есть, кода нет — решение 12 |
| Опции КП на пользователя (`offer/options`: стиль инфоблоков, цена-первой, печати, продающий текст) | **нет**; ближайшее — `user-selected-templates` (настройки шаблона на пользователя: `price_settings`, `infoblock_settings`, `letter_text`, `sale_text_1..5`) — проверить, покрывает ли |
| Академия (21 пакет) | **нет** ни в БД, ни в init; на фронте константа `catalog/lib/academy-data.ts` — пока так и остаётся (решение 16) |
| Меры (`measures`/`portal_measure`) | только вложенно в `contracts[].portalMeasure`; отдельной ручки нет |
| `contracts[].measureCode` | `Number(measures.code)` от строкового кода «для APP» → **0**; код Битрикса лежит в `portalMeasure.bitrixId` — баг |
| Регионы | все строки без фильтра по порталу (легаси для gsr — 13 из Firebase `getApril`, плюс коллекция Firestore `regions` для модалки), `portal_region.own_abs` не применяется (закомментировано), `weight` всегда 0.5, `name` = code — решение 3; данные на бэке обновит владелец |
| Портал (`front/portal`) | готов (владелец), но разросся из-за встроенных смартов — будущий фикс: портал без смартов, смарт по запросу (решение 15, этап 1.1b) |
| LT/пакеты LT/STAR | списки есть; цены только через строки `prices` с `garant_package_code` (фикстурный путь синтезирует их `pushServicePrices`); `six`/`eleven`/`productId` легаси отсутствуют — выяснить, нужны ли |
| Падежи получателя (`nameCase`, `positionCase`) | легаси считал Laravel `nameCase`/`wordCase`; бэк принимает готовые → бэк должен считать сам (решение 17) |
| «Описание комплекта» (docx, Laravel `getDescription`) | **нет** — решение 9 |
| Zakupki-настройки (`zakupki/*` CRUD) | только `zakupki-offer/create`; настроек поставщиков нет — решение 9 |
| `findSnapshot` (`inner-deal.prisma.repository.ts:30-41`) | фильтрует только по `serviceSmartId`, без `smartId IS NULL`: у сделки, где есть только варианты, обычный upsert/settings может **перезаписать строку варианта** — баг |
| Генерируемый клиент | устарел (клиент 14.09, бэк 12.10): нет `generate-multi`, `contract-templates/*`, `supply-report-templates/*`, `konstructor/templates/resolve/*`, `document-counter/*`, `InitSupplyDto.variants`; `init-form` сгенерирован **без body**; `offerWordGenerate` типизирован не тем DTO; `void` вместо ответа у `contract/generate`, `document-supply-report/*`, `zakupki`, `init-supply`, `provider`, `templateBase`, `user-selected` ×5 и ещё ~60 операций |
| `star`, `quantity_for_kp` в pbx-реестре | нет → deal-send отдаёт `not_on_portal` (README deal-send) |

### 2.4 Слепки и обратная совместимость

- v1-адаптер ищет сущности в каталоге по `.number`
  (`snapshot/lib/v1/map-v1.ts:40,50,75,159,195`), при этом init v2 отдаёт
  поставкам `number: null` (`from-init-v2.ts:115`) — на живом каталоге
  поставки v1-слепков **не смапятся**. Нужны таблицы `number → code` для всех
  справочников (поставки и комплекты уже есть в `legacy-codes.ts`; договоры,
  регионы, академия — нет).
- Академия в v1: `serviceCode` всегда `undefined` (`map-v1.ts:205-207`).
- `templateId` только проезжает транзитом; выбор Word-шаблона его не ставит.
- `serviceSmartId` всегда null; `innerDealList`/`innerDealVariant`/`innerDealCopy` не используются.
- Паритет цен доказан только на фикстуре `oldinit.json` и одной записи
  `legacy-deal.v1.json`; реальных прод-слепков разных типов в тестах нет.

### 2.5 Документы и deal-send на фронте

- **Deal-send не подключён**: `dealSendSend` есть в пакете, на фронте ни одного
  вызова; маппера `row-set → productRows/fields` нет. Единственная запись из
  новой модели — upsert слепка («Сохранить предложение») и вариант.
- **Документы — заглушки**: `/document/[kind]` показывает «Экран переносится»;
  `contractGenerateGenerateContract`, `getDocumentSupplyReport` не вызываются;
  `buildOfferWordTemplateGenerateRequest` целиком закомментирован и возвращает
  `null` (`offer-template-word/lib/utils/build-offer-word-template-generate-request.ts:32-149`),
  поэтому PDF-превью всегда «Недостаточно данных».
- Выбор поставщика в шапке цен меняется только локально
  (`use-table-header.ts`); легаси писал его в поле сделки `document_provider`
  и дефолт пользователя.
- DTO генерации на бэке принимают **легаси-формы** строк (`ProductRowDto` с
  вложенным `product`, `currentSupply` из 17 текстов, `complect` как группы с
  `checked`); бэк слепок не парсит — payload всегда собирал фронт.
- `ContractGenerateDto` — один договор за вызов, без `variants`;
  `OfferWordMultiGenerateDto` — варианты есть.

### 2.6 Код: типизация, FSD, мёртвый код, правила

- `tsc` чист, `strict` + `noUncheckedIndexedAccess`, но: `: any` 12,
  `as any` 3, `any[]` 1, `as unknown as` 27 (из них 6 — типизация
  `startListening` в `start-store-listeners.ts`, 5 — тесты).
- **FSD нарушения**: widgets → processes (13 файлов новых экранов импортируют
  `useKonstructorNavigation`/`FlowSummary`); entities → features
  (`bx-rq` → `client-type`, `offer-template-block` → `position`); entities →
  pages (`offer-template-konstructor` → `pages/offer-preview/consts`); shared →
  app (`ws-handlers-registry`); entities → `appActions`/консты app
  (`portal`, `client-card`, `bx-rq`, `base-template`); глубокие импорты в
  соседние сущности (`row-set/model/listeners.ts` → `provider/model/…`,
  `complect-variant` → `snapshot/model/types`); цикл
  `offer-template-block ↔ offer-template-konstructor`. Линтера границ нет
  (`eslint.config.js` = `nextJsConfig`).
- **Мёртвый код**: 34 файла недостижимы ни с одного маршрута, в т.ч. все 17
  файлов `pages/offer-template-settings` (939 LOC), `entities/deal` (кроме
  `getDealClientType`), `features/client-type/model/ClientTypeListener.ts`,
  `app/lib/thunk-error-handler.ts`, `shared/ui/{Cards,Tooltip,ModalMenu}`,
  `types/*.d.ts`, `public/logo/ChatGPT Image*.png`.
- **Правила наполнения — паритет не полный** (сверка с легаси `complect-utils.js`):
  нет зависимостей бесплатных блоков 6/7/10–12 (`fillingFreeblocksWithUncheck`),
  `noChanged` (неотключаемые блоки комплектов 18/19/20), мягкого
  `isChanging → warning`, правила тумблера региона; «Эксперт PRO держит LT #3»,
  «Офис ровно 2 пакета ЭР», «Офис/exzak ≥ 5 LT» — проверить ветки. Коды
  комплектов `office`, `exzak`, `expert`, `maximum` зашиты внутри правил, а не
  во флагах комплекта.
- Легаси-алерты (`window.alert`: нет комплекта при смене ОД, LT мин/макс,
  >7 сравнений, Офис-пакеты) — в новом UI должны стать `violations` движка и
  сообщениями, а не блокировками.
- `number` в доменных типах каталога: `KComplect.number`, `KSupply.number`,
  `KContract.number`, `KRegion.number`, `KService.number`,
  `KAcademyPackage.number`; сортировка по нему в обоих адаптерах; академия
  строит коды из `number`.

## 3. План по этапам

Каждый этап: **Бэк → `pnpm generate` (владелец) → Фронт**, «готово когда» и
тесты. Этапы 3–5 — чистые функции, бэка не ждут и идут параллельно с 1–2.

### Этап 0 — фундамент и гигиена (без новых фич)

- [x] 0.1 **Регенерация клиента.** Бэк: `@ApiOkResponse` всем `void`-операциям
      (§2.3), правильный DTO ответа `offer-word-document/generate`, body у
      `init-form`, `InitSupplyDto.variants`. Владелец: `pnpm generate`.
- [x] 0.2 **Секрет.** Убрать `ONLINE_API_KEY` из `next.config.ts` и `setConfig`
      (вместе с 1.9).
      ✔ 24.10: ONLINE_API_KEY снят из next.config/.env/ApiProvider, setConfig не зовётся.
- [x] 0.3 **Фикстура из бандла.** `oldinit.json` — только `await import()` под
      `!IS_PROD`; после 2.7 удалить фоллбэк.
- [x] 0.4 **WS** удалить: подключение, `model/ws`, `shared/lib/Websocket`,
      `@workspace/ws`.
- [x] 0.5 **Мёртвый код** по списку §2.6 + `entities/complect`,
      `entities/infoblock`, `pages/offer-template-settings`, роуты
      `app/api/{offer,templates,proxy,metrics}` (решить про `admin/logs`).
- [x] 0.6 **ENV**: оставить `NEXT_PUBLIC_KONSTRUCTOR_API_URL`,
      `NEXT_PUBLIC_IN_BITRIX`, `NEXT_PUBLIC_PBX_API_URL`,
      `NEXT_PUBLIC_BITRIX_DEBUG`; `requiredEnvVars` в `next.config.ts` под них.
      ✔ 24.10: requiredEnvVars = IN_BITRIX, LOG_FILE_PATH, PORT; ONLINE_API_KEY удалён.
- [x] 0.7 `TESTING_DEAL_ID` = 129487 (как фикстура) или обновить фикстуру.
- [x] 0.8 **FSD-границы.** `eslint-plugin-boundaries` как в kpi-sales
      (стадия 9.7). Переезды: реестр маршрутов, `useKonstructorNavigation`,
      `document-kinds` → `shared/lib/routing`; `FlowSummary` →
      `widgets/flow-summary`; `processes` оставляет `EntryGate`, `FlowLayout`
      (их потребляет только `app/`). Снять entities → features/pages/app
      импорты (§2.6).
- [x] 0.9 **`number` → `code`/`id` (фронт).** Убрать `number` из `KComplect`,
      `KSupply`, `KContract`, `KRegion`, `KService`, `KAcademyPackage`;
      сортировка — по `order` (из DTO) в адаптере; коды академии — стабильные
      строки (`academy_1m_32h`). В `legacy-codes.ts` добавить
      `CONTRACT_NUMBER_TO_CODE`, `REGION_NUMBER_TO_CODE`,
      `ACADEMY_INDEX_TO_CODE`; `map-v1.ts` ходит **только** в эти таблицы.
      Тест: v1-фикстура маппится на init v2-каталоге без `number`. Бэк:
      `number` из DTO init убираем после перевода фронта (решение 20).
- [x] 0.10 **Типизация**: `startListening` через типизированный
      `AppStartListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()`
      (убирает 6 `as unknown as`); остальные `any` по списку §2.6.

Готово когда: `pnpm typecheck`, `pnpm lint` с boundaries, тесты зелёные;
`grep -rn "any\b"` в коде (не тестах) пуст; в бандле нет `oldinit.json`.

### Этап 1 — один бэкенд: перевод транспортов

- [x] 1.1 **Портал** → `getFrontPortal` (владелец: портал на новом бэке готов)
      + `swrCache` (ключ `{name, domain, version}`, как у event-sales); убрать
      AES-кэш. Проверить состав: `company/deal/contact.bitrixfields`,
      категории, смарты `complect_variant`/`service_offer`, rpa `supply`.
      ✔ 24.10: entities/portal на getFrontPortal + resolveSwrCache (key {portal, domain, v2}).
- [x] 1.1b **Портал без смартов (нюанс владельца).** Слепок портала разросся
      из-за встроенных смартов (pbx-сущности нашей БД). Бэк (отдельная
      задача, после 1.1): `front/portal` отдаёт портал **без** смартов,
      каждый смарт — отдельной ручкой по запросу (`front/portal/smart/:code`).
      Фронт готовим сейчас: доступ к смарту только через селектор/хелпер
      (`getComplectVariantPbxSmartEntityId` и т.п.) и `swrCache` на смарт, чтобы
      переход на поштучную загрузку был локальным. Ручка —
      `GET /api/front/portal/smart/:code?domain`, на старте только
      `complect_variant` (решение 15).
      ✔ 24.10 фронт готов: смарты только через селекторы (getComplectVariantPbxSmartEntityId и т.п.). Бэк-ручка смарта по запросу — отдельная задача (Этап 2+).
- [x] 1.2 **Поставщики** → `providerGetProviderByDomain`. Бэк: типизировать
      `ProviderWithRqResponseDto` (`id`, `name`, `title`, `withTax`, `rq`);
      смонтировать `AppCacheModule` (`libs/app-cache`) — поставщик по умолчанию
      и остальные настройки пользователя (решение 10) хранятся там под
      `app='konstructor'`. Удалить 4 неиспользуемых thunk, кэш localStorage.
      ✔ 24.10: ProviderWithRqResponseDto типизирован; AppCacheModule смонтирован в konstructor; дефолт поставщика — app-cache key document-provider; сделка сильнее настройки (applyDealProvider).
- [x] 1.3 **`base-template`** удалить (сущность, listener в `setAppData`,
      `initDefaultLetter`).
      ✔ 24.10: base-template удалён вместе с listener и initDefaultLetter.
- [x] 1.4 **Word-шаблоны** → nest-konstructor-api; убрать `customAxios` и
      `@workspace/nest-api`; хардкоды `portal_id`/`code` → из портала/юзера.
      ✔ 24.10: Word-шаблоны на nest-konstructor-api (template/user-selected/tags/pdf-preview api).
- [x] 1.5 **HTML-КП стек — заморозить** (решение 1): снять `fetchOfferTemplates`
      с `setAppData`, стек грузится только внутри `/offer/**`; `nest-api`,
      redis, puppeteer остаются зависимостями этой зоны; boundaries — зона
      `legacy`, импорт из неё в новый код запрещён.
      ✔ 24.10: со старта HTML-КП не грузится; boundaries — зона legacy.
- [x] 1.6 **Реквизиты** (решение 6). Бэк: `RqModule` из `back/apps/rq/rq.module.ts`
      → пакет `back/libs/rq-lib`, монтируется в `apps/rq` и `apps/konstructor`
      (контроллер `rq/*` с Swagger, без ключа во фронте). Фронт: helper на
      `nest-konstructor-api`; `entities/bx-rq` переписать на него, listeners
      зарегистрировать, тип клиента — из pbx-поля сделки по коду; пакет
      `@workspace/bx-rq` снять.
      ✔ 24.10: back/libs/rq-lib (RqModule + rq/case для падежей на NameUtil/WordUtil), смонтирован в apps/rq и apps/konstructor; фронт entities/bx-rq на getRq() с адаптером DTO→домен, listeners (fetch по компании, выбор набора по op_client_type); пакет @workspace/bx-rq удалён.
- [x] 1.7 **Сделка компании** (решение 5): `bitrix.deal.list({ COMPANY_ID })`
      — метод дописать в `@workspace/bitrix` по образцу соседей; выбор сделки
      (открытая, свежая) — чистая функция в `entry-route.util` с тестом.
      ✔ 24.10: resolvePlacementEntity + pickCompanyDeal (app/lib/initialize/app-init/placement-entity.util.ts, тесты) → deal.getList({COMPANY_ID}); компания без сделок — NoDealScreen.
- [ ] 1.8 **Потоки документов** (решение 7): в конструкторе остаётся отметка
      презентации при КП; событие «документ сформирован» публикует бэк
      konstructor (контракт — вопрос C). hookAPI на фронте не появляется.
- [x] 1.9 Снять зависимости `@workspace/api` (после 1.1–1.2),
      `@workspace/nest-api`, `puppeteer`, `ioredis`, `pino`, `prom-client`,
      `install`.
      ✔ 24.10: ONLINE_API_KEY/setConfig/install сняты. Остаются осознанно: @workspace/api — только resolveSwrCache (общий с event-sales); nest-api, puppeteer, ioredis, pino, prom-client — зона /offer/** (1.5).

Готово когда: `grep -rn "onlineAPI\|onlineGeneralAPI\|backAPI\|nest-api\|event.april\|back.april\|garant-app\|firebase"` по `apps/konstructor` пуст; `.env.example` — четыре переменные.

### Этап 2 — каталог/init: все данные на нашем сервере

Бэк (`init/data` и справочники):
- [x] 2.1 **Поставки** (решение 2): тексты договоров — на бэке. Миграция в
      `online`: довести `supplies` до полного набора легаси (17 полей, §2.3)
      **шаблонами** с подстановкой `{quantity}` / `{quantityWords}` (число
      прописью в нужном падеже — утилита на бэке) + админ-форма. Генерация
      документов и deal-send резолвят тексты по `supplyCode` (+ `usersQuantity`
      для X-ОД), при этом принимают легаси-тексты из payload старого фронта
      (совместимость). Фронту в `SupplyInitDto` — только `quantityForKp`
      (КП `forkp`) и `contractPropSuppliesQuantity` (сводка).
      ✔ 24.10 код готов: миграция online/…/2026_10_24_100000_add_contract_text_templates_to_supplies.php (+7 колонок, prisma обновлён), шаблоны {n}/{words[:case[:gender]]}/{plural:…} — libs/garant/src/supply/lib/supply-template.util.ts; SupplyTextService.resolve(code, n) (X-ОД — ближайшая снизу справочная того же типа) и enrich(payload) с BC; подключён в contract/generate, offer-word (SupplyPayloadEnricherService); SupplyDto тексты опциональны (+code, usersQuantity); SupplyInitDto +quantityForKp, contractPropSuppliesQuantity; админка: DTO +7 и форма поставки (textarea). ВЛАДЕЛЬЦУ: php artisan migrate в online, завести supplies (коды как в legacy-codes.ts), прогнать docs/supply-text-templates.seed.sql (тексты легаси → шаблоны). Отчёт о поставке берёт forkp из payload (новый фронт шлёт quantityForKp из init).
- [x] 2.2 **Контракты**: `measureCode` = `portalMeasure.bitrixId`; документировать
      `contracts.current` (ids `portal_contracts`) или убрать.
      ✔ 24.10: measureCode = Number(portal_measure.bitrixId); contracts.current задокументирован в ApiProperty (id строк portal_contracts).
- [x] 2.3 **Академия** — пока в коде, как было (решение 16): константа
      `catalog/lib/academy-data.ts` со стабильными `code` (без `number`);
      перенос в БД/init (`services.academy`: `code`, `months`, `totalHours`,
      `hoursInMonth`, `price`, `contractLong`) — отдельной задачей позже.
      ✔ 24.10: как решено — константа catalog/lib/academy-data.ts (codes academy_<n>, number внутри адаптера); перенос в БД — отдельная задача.
- [x] 2.4 **Регионы** — по решению 3. В легаси регионы шли из **двух** источников
      Firebase: `getApril(domain).regions` (портальные: `number, title, name,
      abs, infoblock`) и коллекция Firestore `regions` (список для модалки
      регионов: `inComplect / favorite / noWidth`). Теперь единый источник —
      init v2 `regions` (`code, title, infoblock, abs, tax, tax_abs, weight`);
      данные на бэке владелец обновит по мере надобности. Сделать: фильтр по
      порталу и `own_abs` (если нужны), `weight` из БД, убрать дубль
      `name` = code; фронт: модалка регионов (`features/regions`) на том же
      списке — отдельного запроса нет.
      ✔ 24.10: регионы — только привязанные к порталу (portal_region) с own_abs/own_tax/own_tax_abs; без привязок — весь справочник; дубль name убран. weight остаётся 0.5 константой: колонки в regions нет (при необходимости — миграция). Модалка регионов на фронте — на том же списке (features/regions, этап 4).
- [x] 2.5 **Меры**: `measures` + `portal_measure.bitrixId` в init (нужны
      productRows и КП).
      ✔ 24.10: init.measures (MeasureInitDto: code, bitrixId из portal_measure, портальные имена) → catalog.measures (KPortalMeasure) на фронте.
- [ ] 2.6 **LT/STAR цены**: подтвердить покрытие строками `prices` по
      `garant_package_code` для всех LT, пакетов LT и STAR (msk/regions);
      выяснить `six`/`eleven`/`productId`.
      ◔ не проверено: локальная БД пуста (supplies/prices), покрытие prices по garant_package_code проверяется на наполненной БД вместе с 2.7.
- [ ] 2.7 **Наполнить БД** (админка) и доказать: автотест-дифф
      `catalogFromInitV2(live)` ↔ `catalogFromOldInit(oldinit.json)` по
      комплектам, поставкам, договорам, регионам, ценам PROF — расхождения
      только осознанные (список в тесте).

Фронт:
- [x] 2.8 `from-init-v2`: `descriptionForSale`, меры из init (академия — из константы); без `number`.
      ✔ 24.10: from-init-v2 — descriptionForSale у инфоблоков, supplies.quantityForKp/contractPropSuppliesQuantity, catalog.measures; from-oldinit (тесты) — те же поля из фикстуры.
- [x] 2.9 Удалить фоллбэк на фикстуру (после 2.7); `from-oldinit.ts` остаётся
      только для тестов.
      ✔ 24.10: фоллбэк снят раньше срока по требованию владельца (фикстура портало-зависима); from-oldinit.ts и oldinit.json — в __fixtures__/тестах.

### Этап 3 — поставки/ОД: паритет и X-ОД (особое внимание)

- [x] 3.1 Тест на все 19 легаси-номеров → `code` (`SUPPLY_NUMBER_TO_KEY`),
      включая «Флэш» → `contract_supply_prop_q = 1`.
      ✔ 24.10: catalog/lib/__tests__/legacy-codes.test.ts — 19 номеров → уникальные коды, Флэш/Локальная/Стандартная, contractPropSuppliesQuantity («Флэш», «5»). Маппинг Флэш → contract_supply_prop_q=1 для deal-send — в этапе 6 (бэк отдаёт «Флэш» строкой, число ставит deal-send).
- [x] 3.2 Правила показа против легаси `filterSupplies`/`filterContracts`/
      `generateGarantProducts`: PROF без Стандартной (0 ОД) и Локальной; Флэш —
      только договор услуг; универсал — всё. Тесты на фикстуре.
      ✔ 24.10: catalog/lib/__tests__/compatibility-matrix.test.ts — PROF 17/19 без std/local, универсал 19, Флэш → только proxima, абонентские — только интернет PROF, цепочка сброса.
- [x] 3.3 **X-ОД** (решение 14): цену **не вычисляем** — строке подставляется
      цена ближайшей справочной поставки того же вида (нет такой — 0) и
      ставится признак «ориентировочная, задайте вручную»; `interpolateByOd`
      и интерполяцию коэффициента из `custom-od.util.ts` убрать, тесты
      переписать. В документах и deal-send `logins_quantity`/
      `contract_supply_prop_q` = n, тексты собирает бэк из шаблона ближайшей
      справочной поставки с подстановкой n прописью (2.1); слепок v2
      переживает (есть).
      ✔ 24.10: interpolateByOd удалён; referenceSupplyForCustom (ближайшая снизу, иначе сверху; std/local/flash не участвуют) даёт коэффициент и прайс (нет — 0); RowPrice.estimated — бейдж «цена ориентировочная» в RowRefsLine, ручная правка цены/суммы снимает признак. Бэк для X-ОД берёт тот же источник (SupplyTextService.findReference), logins/prop_q = n — deal-send (этап 6).
- [x] 3.4 Restore v1: `od.currentOd.number` → code через таблицу; неизвестная
      поставка — warning, не падение (есть, закрепить тестом).
      ✔ 24.10: snapshot/lib/restore-unknown-supply.test.ts — неизвестный number → warning, supplyCode unknown, строки восстановлены.
- [x] 3.5 `OdSelect` и селекты шапки цен → `@workspace/ui` Select / `ChipSelect`.
      ✔ 24.10: OdSelect на ChipSelect/MicroSelect + Input (variant chip|micro); TableHeader — ChipSelect; RowRefsSelects/ServiceRowCard — MicroSelect (сентинел __none__ для «без выбора»).

### Этап 4 — продукты, цены, строки: паритет (особое внимание)

- [ ] 4.1 **Паритет на реальных слепках.** Снять 8–10 прод-записей
      `bx_document_deals` разных типов (PROF/универсал × abon/lic/услуги,
      LT в комплекте и пакетом, консалтинг, STAR, академия, свёрнутый сет,
      сравнение) → фикстуры (анонимизировать). Тесты: restore v1 — цены
      как в записи; `resyncSet` — цены по формуле легаси `getRowFromProduct`
      с допуском округления.
      ◔ ждёт данных владельца: нужны 8–10 прод-записей bx_document_deals (анонимизированные) → snapshot/lib/__fixtures__; тесты restore/resync пишутся по ним. Пока паритет доказан на одной реальной записи (deal 129487).
- [x] 4.2 Округление: легаси `round2` на `product.price`/`month`, `toFixed(2)` в
      documentPrice — зафиксировать в `lib/price/round.util.ts` и тестах.
      ✔ 24.10: round2 = Number(x.toFixed(2)) — как легаси parseFloat(toFixed(2)); Math.round расходился на половинках копейки (2.675). Тест lib/__tests__/round.test.ts.
- [x] 4.3 Правки коммерции: QUANTITY `0 < q < 100`, DISCOUNT %/₽ и границы,
      SUM, DEFAULT (±5 %) — сверить `commercial-input.util` с легаси
      `row-price-utils.ts`; дополнить тесты границами.
      ✔ 24.10: lib/__tests__/commercial-input.test.ts — QUANTITY целое в (0,100), PRICE ≥ 0, DISCOUNT %/₽ с границами −1500<v<500 (общими для режимов), SUM с гардом ±50 и month=current, DEFAULT ±5 % туда-обратно, подписи «Аванс»/скидка. Легаси transformToNumber (кап 24) относился к другому полю ввода — не переносим.
- [x] 4.4 Второй Гарант в general: у нас свои поставка/договор/наполнение
      (решение владельца 29.07) — тест, что v1-слепок с «голым» вторым
      Гарантом восстанавливается.
      ✔ 24.10: map-v1 — строки без своих supply/contract наследуют рефы главного товара (mainRefs; warning только при неизвестной поставке); тест snapshot/lib/restore-bare-garant.test.ts.
- [x] 4.5 **productRows → Bitrix** (для этапа 7): `priceNetto = default`,
      `price = current`, `discountSum`, `discountTypeId: 1`, `quantity`,
      `measureCode = portalMeasure.bitrixId`, `productName = name + ' ' + supply.name`,
      `customized: 'Y'`, `sort`; только general, при свёрнутом сете — одна
      строка total; `productId` = `bitrixItemId` договора (решение 4,
      проверить на тестовом портале). Чистая функция + тест.
      ✔ 24.10: row-set/lib/bitrix/build-product-rows.util.ts (toBitrixProductRow/buildProductRows: productId=bitrixItemId договора, name+supply, priceNetto/price/discountSum, measureCode=bitrixId меры, только general, свёрнутый — total) + тест. Форма = DealSendProductRowDto бэка; customized/discountTypeId ставит бэк. Проверка productId на тестовом портале — этап 7.
- [x] 4.6 `lt_other`-строки и Искра — этап 9.
      ✔ 24.10: сделано в этапе 9 (`composition.ltOther`, `lt-count.ts`).

### Этап 5 — правила формирования комплекта (утилиты/классы, типизация)

- [x] 5.1 Единый контракт правила `Rule = (composition, action, ctx) => RuleResult`
      и реестр правил; каждое правило — свой файл с тестом на фикстуре;
      `window.alert`-случаи легаси → `violations`. Тумблер «Без правил»
      доступен всем (решение 19): в `free` правила только подсвечивают.
      ✔ 24.10: контракт Rule {code, actions, apply?, validate?} (composition/model/types.ts), реестр lib/rules/registry.ts (COMPOSITION_RULES), apply.ts гоняет действие через первое правило с этим action, валидаторы — все; RuleViolation.level error|warning: error в rules-режиме блокирует (состав прежний), warning — подсветка; free-режим — applyNaive + подсветка. Тесты lib/rules/__tests__/rules.test.ts + прежние composition.test.ts.
- [x] 5.2 Сверка и добивка (легаси `complect-utils.js` ↔ `composition/lib/rules/*`):
      ✔ 24.10: добавлены free-blocks.ts (консалтинг-only, зависимость online1/online2 от инфоблоков в PROF), noChanged (infoblock/no-changed по флагу), not-changing.ts (warning complect/not-changing при отклонении от дефолта), regions.ts (регион → рутовый reg; тумблер reg ⇄ текущий регион через ctx.regionCode), LT: слоты по весу (ЧекДок ×2), Эксперт PRO keepLtCode, min/exact по флагам; СТАР/Офис/Максимум — по флагам; подбор универсала протестирован на всей линейке. Академия: contractLong ∋ quantity×coefficient — проверка при сборке строки (этап 9/pricing), у состава нет договора.

| Правило | Легаси | Новое | Действие |
| --- | --- | --- | --- |
| Связность инфоблоков (НТД/промышленник ⇄ доп. материалы; судебка ⇄ free 6/7) | `fillingInfoblocks` | `infoblock-links.ts` | проверить free 6/7 |
| Зависимости бесплатных блоков 6/7/10–12; 8/9/10 только через консалтинг | `fillingFreeblocksWithUncheck`, `CHANGE_FREE` | частично в `consalting.ts` | **добавить** `free-blocks.ts` |
| `noChanged` — неотключаемые блоки комплектов 18/19/20 | `fillingInfoblocks` | нет | **добавить**, список — флаг комплекта |
| `isChanging === false` → предупреждение | `current-complect-reducer` | нет | добавить `violation` уровня warning |
| ЭР: выключение ЭР разваливает пакет; «Офис» ровно 2 пакета | `fillingEr`, `fillingPketsEr` | `er-packets.ts` | проверить ветку Офиса |
| LT: Офис/exzak ≥ 5 бесплатно, прочие PROF ровно 2, Эксперт PRO держит один сервис, универсал всё платно, ЧекДок ×2, пакет по весу 2/5/10 | `fillingLt`, `weightLt` | `lt.ts` | проверить все ветки, «нет пакета с таким весом» → violation |
| Консалтинг: эксклюзив, free 8/10 (−9) и 8/9/10 | `fillingConsalting` | `consalting.ts` | есть |
| STAR: один; бесплатен при `withStar` | `fillingStar` | `star.ts` (free только `exzak`) | флаг комплекта из каталога (решение 11) |
| Академия: эксклюзив; допустимость `contractLong ∋ quantity × coefficient` | `fillingAcademy`, `academy.hook.ts` | `academy.ts` | проверить |
| Регионы: +0.5 каждый, рутовый `reg` +0.5, тумблер региона | `onRegionInfoblockChange`, `region-util.ts` | вес есть, правила тумблера нет | **добавить** |
| Универсал: подбор комплекта по весу (линейка 1 → 24) | `SET_WEIGHT_AND_NAME_OF_UNIVERSAL_COMPLECT` | `pickUniversalComplect` | тест на всей линейке |

- [x] 5.3 Коды комплектов из правил — во флаги комплекта (`minFreeLt`,
      `exactFreeLt`, `erPacketsRequired`, `keepLtCode`, `noChanged`,
      `withStar`, `weightAtLeast`): источник — БД/админка (решение 11; связи
      комплект ↔ инфоблоки/группы в init уже есть, флаги добавляем к ним), до
      миграции — одна таблица `catalog/lib/complect-rule-flags.ts`.
      ✔ 24.10: catalog/lib/complect-rule-flags.ts — ComplectRuleFlags {minFreeLt, exactFreeLt, erPacketsRequired, keepLtCode, noChanged, withStar, weightAtLeast}, getComplectRuleFlags(complect) (дефолт PROF exactFreeLt=2 + переопределения office/expert/exzak/exbuild/maximum); правила читают только через него — перенос в init/БД сведётся к смене источника.

### Этап 6 — слепки, избранное, акции, варианты

Бэк:
- [x] 6.1 Баг `findSnapshot` (§2.3): фильтр `smartId IS NULL` для обычного
      слепка + тест.
      ✔ 24.10: findSnapshot/findByDomainAndDealId фильтруют smartId IS NULL (inner-deal.prisma.repository.ts); сервисные спеки зелёные.
- [x] 6.2 **Избранное и акции — одна таблица** (решение 12): `bx_document_deals`,
      `kind = favorite | promotion`, `visibility = user | department | portal | global`,
      `creatorBxUserId`, `title`. Ручки: `GET /konstructor/deal/library?domain&userId&kind`
      (всё, что видно пользователю: своё + отдел + портал + global),
      `POST /konstructor/deal/library` (из текущего слепка: `kind`, `visibility`,
      `title`), `PATCH …/:id` (название/видимость), `DELETE …/:id`. Права:
      сотрудник — `user`; руководитель/суперюзер — `user | department | portal`
      и акции на портал; админка — акции `global` (управление акциями — в
      админке). Отдел пользователя — из слепка портала.
      ✔ 24.10: modules/inner-deal — library-visibility.util (kind favorite|promotion, visibility user|department|portal|global, легаси isFavorite→favorite/user, Laravel all→global; allowedVisibilities/isVisibleTo/canEdit + spec), InnerDealLibraryService (роль из BxDepartmentStructureService: isHead/суперюзер/отдел; без структуры — сотрудник), контроллер KonstructorDealLibrary: GET list?domain&userId&kind, GET rights, GET :id, POST, PATCH :id (title/visibility/isArchived), DELETE :id. global заводит админка (экран админки — отдельно).
- [x] 6.3 Загрузка из библиотеки → `restoreSnapshotRecord` → `/document`;
      внутри сделки с вариантами — набор варианта можно собрать из избранного
      или акции (вариант — смарт, привязан к сделке; библиотека — нет).
      ✔ 24.10: loadFromLibrary → restoreSnapshotRecord → /document (без сделки — /prices). Сборка ВАРИАНТА из заготовки внутри сделки с вариантами — не сделана: сейчас загрузка заменяет текущий набор; вариант затем сохраняется штатно (syncOpenComplectVariant).
- [x] 6.4 Upsert пишет `templateId`; старые `isFavorite`/`favoriteId` читаются
      как `kind='favorite'` (миграция данных Laravel-избранного).
      ✔ 24.10: upsert пишет templateId (было); старые isFavorite-строки читаются как kind=favorite (effectiveKind), при первой правке kind проставляется.

Фронт:
- [x] 6.5 `/favorites`, `/promotions` на `ActionTile` с фильтром видимости
      (своё / отдел / портал / все); «Сохранить в избранное» — в саммари с
      выбором видимости по роли.
      ✔ 24.10: widgets/library-screen (ActionTile-плитки, ChoiceChips фильтр Все/Мои/Отдела/Портала, переименование/архив/удаление для своих); /favorites и /promotions — LibraryScreen; widgets/coming-soon удалён; features/save-to-library — «В избранное» в шапке цен (диалог: вид по правам, название, видимость).
- [x] 6.6 `templateId` ставится при выборе Word-шаблона.
      ✔ 24.10: wordTemplateAC.setCurrentTemplate → snapshotActions.setTemplateId (listener) → templateId уходит в слепок сделки и в заготовки.
- [x] 6.7 v1: `serviceCode` академии; весь маппинг — через таблицы (0.9).
      ✔ 24.10: serviceCode академии в v1 — из mainComposition.academy (ACADEMY_INDEX_TO_CODE), LT-пакеты — LT_PACKAGE_BY_WEIGHT.legacyNumber; весь маппинг — таблицами legacy-codes.ts.

### Этап 6б — сервисный отдел (в объёме, решение 8)

- [x] Признак: категория сделки = `service_base` из портала (легаси
      `isServiceDepartment`); смарт `service_offer` («предложение на будущий
      период»).
      ✔ 24.10: `getIsServiceDepartment` → `app.department` (дефолт SALES, сервис выставляет initPortal; раньше дефолт был SERVICE — исправлено), смарт через `getServiceOfferPbxSmart`.
- [x] Режимы «текущий период» (слепок сделки) / «следующий период» (слепок
      со `serviceSmartId`): список — `innerDealList`, запись — upsert с
      `serviceSmartId`; создание/обновление элемента смарта и его товарных
      строк — через `@workspace/bitrix` (`item.add/update`,
      `item.productrow.set`).
      ✔ 24.10: `entities/service-offer` (initServiceOffer: innerDealList → smartId/наличие слепков; setServicePeriod: слепок периода → restoreSnapshotRecord; «следующий период» без слепка стартует с текущей сборки), слепок v2 несёт serviceSmartId в смарт-режиме; элемент смарта создаёт/обновляет бэк deal-send (target smart: crm.item.add/update + productrow.set с ownerType T{hex}) — фронт сырой Bitrix не зовёт.
- [x] Отправка: поля смарта (`complect_name`, `contract_type`, наполнение,
      `supply`) по кодам — расширение deal-send на owner-тип смарта (бэк).
      ✔ 24.10: `DealSendDto.target {kind: smart, smartType, smartId?, title}` → `DealFieldResolverService.resolveSmartFields` (bitrixCamelId по коду смарта, неоднозначность по appType) → джоба с target; ответ отдаёт smartId, фронт запоминает его.
- [ ] Поток после сохранения: сервисный отдел остаётся на `/prices`
      (легаси), остальные → `/document`. Упрощённый путь поставки без RPA —
      `supply/direct-service-deal/*` (есть на бэке).
      ◔ 24.10: после сохранения сервисный отдел остаётся на ценах (useDealSend), заявка/отчёт в смарт-режиме несут serviceSmartId и flow renewal. UI облегчённой поставки `supply/direct-service-deal/*` не сделан.
- [x] UI: переключатель периода в шапке цен; средний пакет LT-other доступен
      только здесь (этап 9).
      ◔ 24.10: `features/service-period` ServicePeriodSwitch в шапке цен и в заголовке хаба документов (виден сервисному отделу при установленном смарте). Средний пакет LT-other — Этап 9.
      ✔ 24.10: средний пакет LT-other (вес 4) — `resolveLtOtherPackage` по `ctx.serviceDepartment` (контекст row-set ставит listener на `appActions.setDepartment`); без правил доступен всем.

### Этап 7 — отправка сделки (deal-send) на фронте

- [x] 7.1 `features/deal-send`: чистый маппер `RootState → DealSendDto`:
      `fields` по кодам (`npa, la, c, sp, er, per, erinpac, lt, plt, ltinpac,
      free_blocks, consalting, star` из composition главной строки;
      `contract_type` = `contract.bitrixfield_item_id`; `complect_name`,
      `abonement_time`, `note*`, `hdd`, `way`, `supply`,
      `supply_for_contract`, `logins_quantity`, `contract_supply_prop_q`,
      `quantity_for_kp` — тексты по решение 2), `productRows` (4.5),
      `dealName`, создание сделки без `dealId` (`categoryCode`, `opened`).
      ✔ 24.10: features/deal-send/lib/build-deal-send.util.ts — buildInfoblockFields (названия блоков по группам npa/sud→la/cons→c/spec→sp, isLa-бесплатные → la, er/per/erinpac, lt/plt(пакет по весу)/ltinpac, free_blocks, consalting (hotline при withConsalting + платный), star), buildProductFields (complect_name, contract_type=bitrixItemId, abonement_time, supply, quantity_for_kp, consalting product), productRows (4.5), opened, dealName; тесты. Тексты поставки — бэк: DealSendDto.supplyCode + contractKind → DealSendSupplyTextsService (supply_for_contract/note/note_3/hdd/way/logins_quantity/contract_supply_prop_q/quantity_for_kp по виду договора; присланные поля сильнее; Флэш → 1), спека.
- [x] 7.2 Поток как в легаси: «Создать сделку / Сохранить сделку» на `/prices`
      и в хабе → `dealSendSend` → upsert слепка v2 (+ открытый вариант) →
      `/document`; `skipped` → предупреждение пользователю.
      ✔ 24.10: DealSendButton «Создать/Сохранить сделку» в шапке цен (→ /document) и в хабе; sendDeal → deal-send → appActions.setDealId при created → saveSnapshot → syncOpenComplectVariant; skipped — подсказка «не записано полей: N» (tooltip с кодами), ошибка — текстом.
- [ ] 7.3 Бэк: `star`, `quantity_for_kp` в pbx-реестр + install (README);
      тест процессора очереди на реальном payload.
      ◔ 24.10: фронтовый pbx-data канон синхронизирован с бэком (star, quantity_for_kp, contract_type уже были на бэке). ВЛАДЕЛЬЦУ: прогнать install полей на порталах (pbx-install). Тест процессора очереди на реальном payload — после первой отправки с тестового портала.
- [x] 7.4 Поставщик → поле сделки `document_provider` + дефолт пользователя
      в `app-cache` (решение 10).
      ✔ 24.10: document_provider (product) уходит в deal-send из state.documentProvider.current.name; дефолт пользователя — app-cache (1.2), сделка сильнее настройки (applyDealProvider).

### Этап 8 — документы (особое внимание)

- [x] 8.1 **Адаптер `row-set → payload документа`** — одно место
      (`entities/document-payload/lib/*`): sets general/alternative, total,
      `complect` (группы инфоблоков с `checked`), `supply`, `contract`,
      `region/regions`, `clientType`, `contractType`. Бэк принимает
      легаси-формы — адаптер на фронте сейчас, DTO v2 на бэке потом
      (решение 18). Тесты: payload из фикстурного слепка равен тому, что строил
      легаси (снять эталон с легаси на той же сделке).
      ✔ 24.10: `entities/document-payload` — legacy-numbers (code→number ТОЛЬКО здесь и в v1), buildComplectGroups, toDocContract/toDocSupply, toDocRows/toDocRowSets, buildDocBody/buildDocVariant (общая часть КП и варианта), buildOfferPayload; Swagger DTO бэка дотипизированы (ProductRow/Complect/Product/Sets) и клиент перегенерирован. Эталон с легаси на той же сделке НЕ снимался (локальная БД пуста) — тесты на фикстуре oldinit.
- [x] 8.2 **КП (Word)** `/document/offer`: шаблон (из `/settings`,
      `selected` пользователя), поставщик, получатель (ИНН/ФИО/должность —
      pbx-поля сделки/компании по кодам, не `UF_CRM_1695372881`), менеджер,
      счёт (общий/по строкам/по презентациям, дата → `first_pay_date`, номер
      из `document-counter`), PDF-превью (operation polling), «Сформировать»
      → `generate` / `generate-multi` (варианты КП) → редирект
      `window.top.location.replace` в сделку. Отметка связанной презентации
      (`presentation`, `isFromPresentation`) — остаётся (решение 7). Падежи
      считает бэк, фронт шлёт сырые имя и должность (решение 17). Опции КП
      пользователя — из `app-cache` (решение 10).
      ✔ 24.10: `entities/offer-document` (шапка: получатель по pbx-кодам op_inn/op_name/op_position сделка→компания, счёт с датой из first_pay_date, падежи через rq/case по blur, buildOfferGenerateRequest/offerRequestBlocker, buildOfferMultiGenerateRequest с variants по selectParticipants — открытый вариант печатается из живого row-set), `features/offer-form` (RecipientFields, InvoiceOptions+поставщик, OfferGenerateButton), `widgets/offer-document-screen` (WordTemplateMenu, PDF-превью с пометкой «устарело» по слушателю, диалог шаблонов); generate-multi → в Битриксе редирект в сделку, вне — ссылки. Шаблон слепка (snapshot.templateId) важнее дефолта. Не сделано: отметка презентации (решение 7) и опции КП из app-cache (решение 10) — нет полей/ручек; номер счёта — только если портал завёл поле `invoice_number`.
- [x] 8.3 **Договор** `/document/contract`. Бэк: допортировать
      `getContractGeneralForm`, `getSpecification`, `getClientRqForm` в
      `init-form` (сейчас пусто). Фронт: карточка Bitrix-полей
      (`contract_create_date`, `first_pay_date`, `contract_start/end`,
      `garant_client_assigned_name/email`, `contract_number`; обязательные —
      `contract_start`, `contract_end`, `garant_client_assigned_name`),
      реквизиты (1.6), спецификация по supply/contract/clientType, цены →
      `contract/generate` → редирект. Валидация `validatePushRq` и required
      pbx — чистые функции с тестами.
      ✔ 24.10: бэк — `contract/specification-form` (ContractSpecificationFormModule: порт getContractGeneralForm + getSpecification + getContractIBlocks на типизированном payload, тексты поставки через SupplyTextService по supply.code, фильтр по поставке/договору/клиенту; init-form отчёта о поставке делегирует туда же — дыры «НЕ ПЕРЕНЕСЕНО» закрыты, кроме getClientRqForm: реквизиты идут через rq-lib/bx-rq); Swagger дотипизирован (FormFieldDto, BxRqDto, RegionDto, спецификация), в ContractGenerateDto не читаемые бэком placement/isProd/price/region/productSet стали необязательными. Фронт — `entities/contract-document` (поля сделки по pbx-кодам с записью в Bitrix по blur, спецификация с бэка и правка строк, buildContractGenerateRequest с bxrq из текущего реквизита, missingDealFields/missingRequisites — чистые функции с тестами), `features/contract-form`, `features/provider-select`, `widgets/contract-document-screen`. Номер договора — локально (кода поля в pbx-каноне нет). Тексты ПК/ГЛ договора (contractConsaltingProp/Comment) в новой модели не хранятся — пусто; legacy-эталон на реальной сделке не снимался (локальная БД пуста).
- [x] 8.4 **Отчёт о поставке** `/document/supply-report`: `init-form`,
      поля (`first_pay_date`, `contract_start/end`, `supply_date`,
      `garant_client_email`, `contract_present_start/end`,
      `garant_client_assigned_name/phone`; на gsr — `op_*`,
      `supply_information`, `manager_op`, `manager_tmc`), контакт,
      спецификация, цены, «Запустить процесс поставки» → `generate-document`
      (по варианту) + `init-supply` (`files` base64, `variants`,
      `composition`) → редирект. `rpa.item.list`/`rpa.stage.listForType` —
      дописать в `@workspace/bitrix` (правило типизированных вызовов).
      ✔ 24.10: бэк — `document-supply-report/form` (15 полей с портальной настройкой без легаси-слепка), Swagger дотипизирован (SupplyReportDto.code/items, InitSupplyDto rpa_id/userId/companyId/dealId/serviceSmartId/bxContacts/supplyReport/supply/total), не читаемые бэком поля generate-DTO стали необязательными. Фронт — `entities/supply-report-document` (форма с зависимыми группами is_contract_done/is_invoice_done, файлы договора/счёта base64, контакты сделки через crm.contact.get, открытая заявка RPA через rpa.stage.listForType + rpa.item.list — `rpaStage` добавлен в @workspace/bitrix, bxDealItems/bxCompanyItems в форме EntityFormFieldDto по pbx-кодам), `features/supply-report-form`, `widgets/supply-report-screen`; «Сформировать отчёт» → generate-document → при галке «Запустить процесс поставки» init-supply (files, variants по selectParticipants) → редирект в сделку. Поля сделки отчёта — общий слайс с договором (SUPPLY_REPORT_DEAL_FIELDS). Не сделано: отчёт по каждому варианту (легаси buildSupplyReportRequests) — печатается живой набор, варианты уходят только в заявку; поля ОРК контактов и ARM-id клиента (UF_CRM_USER_CARDNUM) — кодов в pbx-каноне нет; предзаполнение формы из `supply_*` полей сделки — кодов в каноне нет; режим отдела сервиса (смарт) — Этап 6б; прогон на реальном портале не делался.
- [x] 8.5 Счёт — внутри КП (как легаси), отдельного экрана нет.
      ✔ 24.10: счёт — блок «Поставщик и счёт» экрана КП (features/offer-form InvoiceOptions → invoice в generate-multi), отдельного экрана нет.
- [x] 8.6 **Zakupki («3 КП для торгов»)** (решение 9): бэк — настройки
      поставщиков 1/2 на портал (`zakupki/*` CRUD из Laravel → konstructor,
      хранить в `app-cache` или таблице), фронт — переключатель в экране КП →
      `zakupki-offer/create` (есть) → редирект; видимость — флаг портала
      (легаси `withZoffer` только april-garant → в настройки портала).
      ✔ 24.10: бэк — `modules/zakupki-settings` (таблица offer_zakupki_settings, порт Laravel get/store/update/updateDefault/delete: GET/POST user/POST default/DELETE user; дефолт портала создаётся сам), `zakupki-offer/create` принимает providerId (поставщика грузит бэк), Swagger дотипизирован; флаг портала `konstructor.zakupki_enabled` в реестре app-settings + публичная ручка `app-settings/:appCode` в konstructor (зеркало event-sales). Фронт — `entities/app-settings` (swrCache), `entities/zakupki`, `features/zakupki-offer` (ZakupkiCard на экране КП при флаге: два поставщика, правка «себе»/«для портала», сброс, период договора, «Сформировать 3 КП» → очередь → редирект). Владельцу: включить zakupki_enabled в админке порталу april-garant.
- [x] 8.7 Стадии вариантов `cvar_offer/contract/supply` — по README
      lifecycle после 8.2–8.4.
      ✔ 24.10 (частично): `markStageForward` (только вперёд по sort, закрытые не трогаем) + `cvar_offer` участникам после generate-multi и `cvar_supply` после init-supply с variants. `cvar_contract`/`cvar_invoice` не ставятся: у договора и счёта нет связи с вариантом (README lifecycle, «чего не хватает»).
- [ ] 8.8 Событие «документ сформирован» — бэк публикует после 8.2–8.4
      (контракт — вопрос C).
      ◔ 24.10: контракт события C (konstructor → event-sales) открыт за владельцем; бэк пишет документы в таймлайн сделки, событие не публикует.

### Этап 9 — остатки фазы 5 (сервисы)

- [x] LT-other строки (пакет по весу 2/4/5/10; вес 4 — только сервисный отдел; без правил — mode `free`).
      ✔ 24.10: `composition.ltOther: LtOtherPacket[] {id, services, alternativeName}` + правило `rules/lt-other.ts` (действия add/remove/toggle/rename, warning-подсветка пустого/несобранного пакета); строка `lt_other` на каждый собранный пакет в `syncSetWithComposition` (ключ по id пакета, `refs.packetId`, имя — своё или пакета каталога); UI — `CompositionLtOtherBlock` в редакторе наполнения, карточка строки переименовывает/удаляет пакет через composition владельца. BC: v1 `ltOther` → `mapV1LtOther`, v2 без поля → `normalizeComposition`.
- [x] Искра: `count` в composition + «(count×20 запросов в день)» в документах.
      ✔ 24.10: count производный — `ltServiceCount` (наполнение + пакеты LT-other, легаси computeIscraCounts), подпись `ltServiceSubtitle` → `subtitle` блока LT в `buildComplectGroups` (бэк уже печатает subtitle вместо имени). Сервисы LT-other в группе LT документа без повторов (легаси handleLtByLtOther).
- [x] STAR-подсервисы для описания КП.
      ✔ 24.10: `catalog/lib/star-data.ts` (10 подсервисов легаси star.items) → в группу СТАР документа после пакета, вес 0. В БД/init подсервисов нет — константа по образцу академии; владельцу: перенос в портал (дочерние элементы garant_packages).
- [x] Академия из init (2.3).
      ✔ 24.10: закрыто решением 16 (§2.3) — пакеты остаются константой `academy-data.ts`, init их не отдаёт; при переносе в БД меняется одна строка адаптера `catalog.academy = ACADEMY_PACKAGES`.

### Этап 10 — экраны и UI

- [x] Сырые `<select>` шапки цен и карточек → `@workspace/ui`.
      ✔ 24.10: шапка (`TableHeader`) — ChipSelect/OdSelect, карточки — MicroSelect/RowRefsSelects. Сырые `<select>` остались только в замороженной зоне `/offer` (OfferTemplateSelector, FontSelector) — по решению 1 не трогаем.
- [x] Редактор ИНН в шапке — общий слой с «Звонками» (`features/Inn` → april-ui/entity).
      ✔ 24.10: общий слой — `InnChip` в `@workspace/april-ui/entity` (им пользуются и «Звонки», и шапка конструктора `ClientStrip`). В конструкторе ИНН только показывается: легаси его в шапке не правил, запись ИНН — через реквизиты (`/requisites`); редактор с валидацией остаётся фичей «Звонков».
- [x] `/requisites` — рабочая загрузка/сохранение; `/settings` — выбор текущего шаблона пишет `templateId`.
      ✔ 24.10: `/requisites` — `BxRqPage` на `RqHelper` (fetch по `setAppData`-listener, save/address/bank через nest-konstructor-api); `/settings` — `wordTemplateAC.setCurrentTemplate` → listener `setupTemplateIdListener` → `snapshotActions.setTemplateId` → слепок. Оба маршрута 200.
- [x] «Описание комплекта» в саммари (решение 9): бэк — порт Laravel
      `getDescription` (docx по комплекту/поставке/инфоблокам) в konstructor;
      фронт — кнопка в саммари шага «Комплект».
      ✔ 24.10: бэк — `modules/complect-description` (`POST complect-description/generate`: тексты блоков из БД по коду — infoblocks.description, сервисы — complects.description, фронтовый текст как запас; DOCX через `docx`, файл в public storage, ссылка `/api/files/<token>` с новой subDir `description`); фронт — `entities/complect-description` + `features/complect-description` (кнопка в саммари шага «Комплект», группы — те же `buildComplectGroups`). Шаблон Laravel `Description.docx` в репо не найден — документ собирается программно (заголовок, комплект · поставка, группы, блок жирным + абзацы).
- [x] Легаси-алерты → `CompositionMessages`/тосты.
      ✔ 24.10: `sonner` подключён (`Providers` → `<Toaster/>`), `alert/confirm` в `offer-template-word` заменены на `toast.*` (удаление шаблона — тост с действием «Удалить»). Единственный `alert` остался в замороженной зоне `offer-template-konstructor` («Страница переполнена»).

### Этап 11 — финальная зачистка и гейты

- [x] `any` = 0 в коде; `as unknown as` только в `snapshot/lib/v1` и тестах.
      ◔ 24.10: `any` — 0 (в т.ч. в легаси-зоне: `catch (e)` + `instanceof Error`, `CSSProperties`, `regions?: unknown[]`). `as unknown as` вне v1/тестов: убраны в App.tsx (глобальный `Window.store`), ClientCardThunk, supply-form (type guard), build-doc-refs (Swagger бэка: `oneOf` number|string, nullable `updated_at`). Остались осознанно: `row-set/model/listeners.ts` (структурная типизация listener без RootState), `to-contract-bx-rq.util.ts` (сужение одинаковых enum-ов rq-lib), замороженная зона `/offer` (useOffer, BlockChooseItem, offer-preview).
- [x] `eslint-plugin-boundaries` без исключений; `pnpm typecheck`, `pnpm lint`, тесты.
      ✔ 24.10: boundaries — слои FSD без исключений; тип `legacy` для `/offer/**` — не исключение, а решение 1 (зона помечена и изолирована). tsc, lint, vitest (200 тестов) зелёные.
- [x] Удалены легаси-стеки, deps, env, `app/api/*`, `docs/oldinit.json` из рантайма.
      ◔ 24.10: удалены `app/api/admin/logs` + `logClient` + `lib/server/{log,metrics,offer-style}` (копия kpi-sales), deps `pino`, `prom-client`, `crypto-js`, `framer-motion`, `date-fns`. `oldinit.json` — только фикстура тестов (`lib/__fixtures__`), в рантайме не читается. Остаются по решению 1 в зоне `/offer`: `app/api/offer/generate` (puppeteer), `app/offer/pdf` (ioredis), `@workspace/nest-api`, `uuid`, `@dnd-kit`, `react-colorful`.
- [x] `routing.md`, `dev-guide.md`, `user-guide.md` актуальны; `migration-plan.md` и `port-status` помечены историческими.
      ✔ 24.10: user-guide дополнен (LT-other, Искра, СТАР, описание комплекта, документы, сервисный период); port-status и migration-plan — с баннером «Исторический документ»; routing/dev-guide ведутся по этапам.
- [ ] Смоук во фрейме на тестовом портале: новая сделка → КП; старая сделка (v1) → договор; сделка с вариантами → multi-КП; отчёт о поставке с RPA.
      ◔ 24.10: локально — маршруты 200, бэк поднят, клиенты сгенерированы. Прогон во фрейме тестового портала — владельцу (нужны установленные поля/смарты: `complect_variant`, `service_offer`, rpa `supply`, флаг `konstructor.zakupkiEnabled`).

## 4. Решения владельца (24.10) и открытые вопросы

### 4.1 Решено

1. **HTML-КП стек и `/offer/**` — оставить, не использовать.** Код не
   удаляем (возможно, станет отдельным модулем), но из рантайма выводим:
   на старте ничего не запрашивается (`fetchOfferTemplates`,
   `fetchBaseTemplate` снимаем с `setAppData`), `nest-api`/redis/puppeteer
   живут только внутри группы `/offer` и помечены legacy-зоной для
   boundaries. `base-template` удаляем (правило 8).
2. **Тексты поставок — бэк резолвит по `supplyCode`, с совместимостью.** DTO
   генерации и deal-send принимают необязательные легаси-тексты (их шлёт
   старый фронт), при их отсутствии берут из БД. Нюанс: в текстах число
   доступов прописью («не более пяти одновременных…») → тексты хранить
   **шаблонами** с подстановкой (`{quantity}`, `{quantityWords}` в нужном
   падеже), иначе X-ОД в договор не ляжет (этапы 2.1, 3.3).
3. **Регионы:** `own_abs` на порталах бывают → фильтр по порталу и
   переопределения делаем (2.4). Данные на бэке — владелец.
4. **`productId` товарной строки** — `bitrixItemId` договора; проверить на
   тестовом портале (4.5).
5. **Сделка компании** — фронт, `bitrix.deal.list({ COMPANY_ID })` через
   `@workspace/bitrix` (1.7).
6. **Реквизиты.** Бэк уже есть отдельным приложением `back/apps/rq`
   (`RqModule` внутри приложения). Выносим в **пакет** `back/libs/rq-lib`
   (как `portal-lib`), монтируем в `apps/rq` и в `apps/konstructor`; фронт
   ходит через `nest-konstructor-api`; пакет `@workspace/bx-rq`
   (event-service, ключ `X-EVS-API-KEY` во фронте) уходит (1.6).
7. **Потоки документов (hook).** В конструкторе остаётся только отметка, с
   какой презентацией связано КП (`presentation`, `isFromPresentation`).
   «Flow документов» (запись KPI, изменения сущностей) — событие отдела
   продаж на бэке: публикует konstructor после генерации, обрабатывает
   event-sales (1.8, 8.2; контракт события — вопрос C).
8. **Сервисный отдел — в объёме переезда** (этап 6б).
9. **Zakupki («3 КП для торгов») и «Описание комплекта» — нужны**: настройки
   zakupki и `getDescription` переезжают на бэк konstructor (8.6, 10).
10. **Пользовательские настройки конструктора** (поставщик по умолчанию;
    легаси `offer/options`: стиль инфоблоков, цена первой, печати, продающий
    текст; фильтры шаблонов) — в центральный кэш настроек `libs/app-cache`
    (Redis + `app_cache`, ключ `app='konstructor' + domain + bxUserId + key`);
    konstructor монтирует `AppCacheModule` (сейчас только kpi-report-sales).
    Выбранный поставщик дополнительно — поле сделки `document_provider`
    через deal-send (1.2, 7.4).
11. **Флаги правил комплекта — в БД/админку**; связи комплект ↔
    инфоблоки/группы уже приходят в init, расширяем их флагами (5.3).
12. **Избранное и акции — одна таблица** (`bx_document_deals`,
    `kind = favorite | promotion`), видимость `user | department | portal | global`:
    - сотрудник: своё избранное; пользуется избранным и акциями отдела,
      портала и глобальными;
    - руководитель и суперюзер: избранное на себя, отдел или портал; свои
      акции на портал;
    - админка April: акции `global` для всех порталов; там же управление
      акциями;
    - на старте кнопки раздельные («Избранное», «Акции»), списки с фильтром
      по видимости.
    **Варианты комплекта — другая сущность**: смарт `complect_variant`,
    привязан к сделке, в другой сделке не воспроизводится; набор внутри
    варианта собирается вручную либо из избранного/акции (6.2–6.5).
13. Легаси `USE_NEW_SUPPLY_REPORT = true` — проверим вместе с тестом отчёта
    о поставке (8.4).

14. **Цена X-ОД не вычисляется.** Менеджер всё равно правит её руками:
    строке с X-ОД подставляется цена ближайшей справочной поставки того же
    вида (нет такой — 0) с пометкой «ориентировочная, задайте вручную»;
    интерполяцию коэффициента/цены убираем (3.3).
15. **Смарт по запросу**: `front/portal` — без смартов;
    `GET /api/front/portal/smart/:code?domain` — один смарт с полями и
    стадиями. На старте конструктору нужен только `complect_variant`;
    `service_offer` и rpa `supply` — лениво на экранах документов (1.1b).
16. **Академия — пока в коде, как было** (`catalog/lib/academy-data.ts` со
    стабильными `code`); перенос в БД/init — позже, отдельной задачей.
17. **Падежи получателя считает бэк** при генерации; фронт шлёт сырые имя и
    должность (8.2).
18. **DTO генерации**: адаптер `row-set → легаси-форма` на фронте сейчас (одно
    место, 8.1), DTO v2 на бэке — потом.
19. **Режим «Без правил» доступен всем** (5.1).
20. **`number` на бэке** убираем из DTO init после перевода фронта (0.9).

### 4.2 Открыто

- **C. Событие «документ сформирован»**: konstructor публикует в очередь,
  event-sales подписан? Нужен короткий док с полями (домен, сделка,
  компания, тип документа, презентация, суммы). Не блокирует этапы 0–7.

## 5. Порядок и гейты

```
0 (гигиена, number, границы)
└─▶ 1 (транспорты) ──▶ gate generate ──▶ 2 (init/БД) ──▶ gate generate
      ∥ параллельно: 3 (ОД), 4 (цены), 5 (правила) — чистые тесты
                                        └─▶ 6 (слепки/избранное) ──▶ gate generate
                                              └─▶ 7 (deal-send) ──▶ 8 (документы) ──▶ gate generate (init-form, DTO)
                                                                        └─▶ 9 ──▶ 10 ──▶ 11
```

Гейты `pnpm generate` (запускает владелец, бэк должен быть поднят): после
0.1; после 2.x; после 6.2–6.4; после 8.3 (init-form, типизированные ответы).
Работа идёт модуль за модулем: каждый пункт закрывается с тестом и
рефакторинг-проходом по `front-refactor`, поведение 1:1 с легаси, отличия —
осознанные и записанные здесь.
