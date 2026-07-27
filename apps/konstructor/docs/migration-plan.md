# План переноса ядра конструктора (React/JS → Next/TS, новое API)

Рамки (зафиксированы с владельцем):
- **Init — полностью новый**, свой формат на code/id-джойнах. Совместимость со старым init-форматом не нужна.
- **Единственная обратная совместимость — сохранённые слепки сделок** (remembered deals, см. [legacy-persistence.md](./legacy-persistence.md) §5).
- Ядро переноса: **комплект + ОД + договор → product → productRow**, сеты, дополнительные сервисы (LT, LT-other, консалтинг, star, академия).
- Новые требования: **наполнение у любого товара** (главный, дополнительные, сравнение), **режим «по правилам / без правил»**.
- Всё по конвенциям монорепы: FSD, orval-пакеты, RTK + listeners, токены тем, нативный Next-роутинг. Эталоны: `apps/event-sales`, `apps/kpi-sales/modules/widgets/report`.

Контекст: [legacy-core.md](./legacy-core.md) (домен и правила), [legacy-persistence.md](./legacy-persistence.md) (слепки, Bitrix), [oldinit.json](./oldinit.json) (эталонные данные для тестов).

---

## 1. Gap-анализ нового API (что нужно от бэка ДО фронта)

Бэк: `back/apps/konstructor` (порт 3007), пакет `@workspace/nest-konstructor-api` (уже сгенерирован, используется пока только в admin). Workflow монорепы: сначала бэк + Swagger-аннотации → `pnpm generate` (запускает пользователь) → фронт.

### 1.1 Что уже есть

- `POST /api/konstructor/init/data` → `KonstructorInitDataDto { complects{prof,universal}, infoblocks: InfoGroupsDto[], regions, contracts{current,items} }`. Комплекты уже с наполнением (`filling/ers/packetsEr/ersInPacket` + `codes{}` — code-джойны).
- Справочники транзитом из libs: `/api/complect`, `/api/infoblock/all`, `/api/infogroup`, `/api/region`, `/api/supply`, `/api/contracts`, `/api/portal/domain/:domain`, `/api/provider/domain/:domain`.
- Генерация документов: offer-word (+PDF-превью через очередь), contract/generate, zakupki-offer, invoice/word/offer-шаблоны.
- `inner-deal` сервис над таблицей `bx_document_deals` — колонки в точности повторяют формат старого слепка.
- Данные админятся в `apps/admin` (9 слайсов garant: complect, infoblock, info-groups, package, prof-price, supplies, regions, measures, contracts) — джойны по `code`/`id`.

### 1.2 Чего не хватает (задачи на бэк)

| # | Задача | Детали |
|---|---|---|
| B1 | **Расширить init** | Вернуть в `KonstructorInitDataDto`: `supplies` (SupplyService уже инжектирован, вызов закомментирован), `prices` (prof-таблица + правило расчёта universal), `services` (LT-продукты, LT-пакеты, консалтинг, star из `complects`/`garant_packages` по `productType`), `abs` комплектов (пропал из ComplectDto). Всё на code-джойнах |
| B2 | **Договорные тексты поставок** | В старом init у supply были `acontract*`, `contractProp1/2`, `quantityForKp` — в новой БД этих полей нет. Решить: добавить поля в `supplies` (+admin-форма) или перенести тексты в шаблоны договоров на бэке (предпочтительно — фронту они не нужны, если договоры генерит бэк) |
| B3 | **HTTP для inner-deal (слепки)** | `GET /api/konstructor/deal?domain&dealId[&serviceSmartId]`, `POST /api/konstructor/deal` (upsert), список по сделке. Поддержка: несколько слепков на dealId (serviceSmartId), `templateId`, `isFavorite`/favorites. Проверить, что Laravel `garant-app.ru` пишет в ту же `bx_document_deals` — тогда старые слепки читаются сразу; иначе — миграция данных |
| B4 | **Карта UF-полей Bitrix** | Старый init отдавал `bitrix{add,update,product,productRows,rq,forContract,forCalculation}`. Теперь это PortalModel (`bitrixfields`) — нужен эндпоинт/включение в init того подмножества, которое нужно фронту (или полностью увести запись UF-полей на бэк — предпочтительно) |
| B5 | **Отправка сделки** | Аналог Laravel `konstructor/bitrix/deal/update`: принять состояние → deal fields + UF + productrows одним вызовом. Дефекты легаси не воспроизводить (measureCode=id, supplyName=undefined) |
| B6 | Мелочи | `RegionInitDto.name` содержит code (семантика изменилась — задокументировать или починить), `weight` не заполняется; `@ApiResponse` типы для `contract/generate`, `offer/create`, `zakupki-offer/create`, `init-supply` (сейчас orval даёт `void`); enum `CONTRACT_CODE` объявлен дважды; порт в `orval.config.ts` пакета (3000 → 3007) |

**Правки init согласуем отдельно перед реализацией** (какой пакет/эндпоинты — по workflow из CLAUDE.md).

---

## 2. Целевая доменная модель

### 2.1 Ключевые изменения против легаси

| Легаси | Новое |
|---|---|
| Наполнение — синглтон `state.currentComplect`; у второго Гаранта и альтернатив состава нет | **`composition` — свойство строки**. У каждой garant-строки любого сета свой состав |
| Главный товар = магия `id === 0` | Явное поле `role: 'main' \| 'additional' \| 'comparison'` |
| Правила зашиты в мутирующие функции с `window.alert` | **Чистый rules-engine**: `applyRule(composition, action) → { composition, violations[], autoFixes[] }`. UI решает, как показать |
| Правила всегда включены | **`composition.mode: 'rules' \| 'free'`**. В `rules` — автокоррекции и запреты; в `free` — только валидация/подсветка расхождений (вес, LT-лимиты), без принуждения. Прецедент в легаси: `withoutRules` у LT-other |
| Матрица продуктов предгенерится тройным циклом на старте | Продукт — **чистая функция** `buildProduct(complect, supply, contract, region, priceTable)` по требованию |
| Совместимость комплект×поставка×договор в 3 местах | Одна декларативная **`compatibility-matrix`** |
| Джойны по `number` | Джойны по `code` (number остаётся только в snapshot-v1-адаптере) |
| 2 источника комплектов (хардкод + init) | Один источник — init (админка), наполнение приходит в комплекте (`filling/ers/... + codes`) |

### 2.2 Доменные типы (эскиз)

```ts
// composition — состав, привязан к строке
type CompositionMode = 'rules' | 'free';
interface Composition {
  complectCode: string;
  mode: CompositionMode;
  infoblocks: string[];          // codes
  ers: string[]; erPackets: string[];
  lt: string[]; ltInPacket: string[];
  freeBlocks: string[];
  consalting: string | null;     // эксклюзивный выбор
  star: boolean;
  academy: string | null;
  regions: string[];             // codes регионов в комплекте
}

interface KRow {                  // бывший ProductRowType
  key: string;                    // uuid строки
  setId: string;
  role: 'main' | 'additional' | 'comparison';
  productType: 'garant'|'lt'|'lt_other'|'consalting'|'star'|'academy';
  refs: { complectCode?: string; supplyCode: string; contractCode: string };
  composition?: Composition;      // у garant-строк ЛЮБОГО сета
  price: RowPrice;                // денормализованная, как в легаси
  names: { name; shortName; alternativeName };
}

interface RowSet { id: string; kind: 'general' | 'alternative'; rows: KRow[]; collapsed: boolean }
```

### 2.3 Чистое ядро (без React/Redux, покрывается unit-тестами)

Модуль `modules/entities/*/lib` + общая логика в `modules/entities/complect/lib/rules/`:

1. `weight.ts` — расчёт веса состава (инфоблоки + ЭР + регионы ×0.5), сверка с эталоном, подбор универсального комплекта по весу.
2. `rules/*.ts` — перенос `complect-utils.js` по правилу на файл: infoblock-links (НТД/промышленник ⇄ доп.материалы, суд.практика ⇄ freeblocks 6/7), er-packets (развал пакета, «Офис = 2 пакета ЭР»), lt (мин 5 / ровно 2 / Универсал всё платно / подбор пакета по весу 2/5/10), consalting (эксклюзив + freeblocks 8/9/10), star, academy. Все — чистые `(composition, ctx) → RuleResult`.
3. `compatibility-matrix.ts` — комплект × поставка × договор (единственный источник, легаси §5.8).
4. `pricing.ts` — формула из legacy-core §6.2 (prof-таблица / `abs × region.abs × coeff` / LT/star msk-regions / академия) + `calculateTotalPrice` режимы (price/quantity/discount/sum/tax).
5. `row-set.ts` — операции над сетами явными функциями вместо `getUpdatedSetFromNewRow` с 6 флагами: `createGeneralSet`, `addRow`, `updateRowPrice`, `collapseToTotal`, `addComparisonSet` (лимит 7).
6. **Тесты на эталонных данных [oldinit.json](./oldinit.json)**: цены строк для выборки комплект×ОД×договор×регион должны совпасть с легаси-расчётом (включая 1.05 налога, скидки 0.9/0.8/0.7, бесплатный star, академию).

---

## 3. Целевая структура FSD (`apps/konstructor/modules`)

Существующие рабочие модули (offer-template-word, offer-template-konstructor, deal, bx-rq, portal, base-template) **не трогаем** до отдельного рефакторинг-этапа. Ядро строим рядом:

```
modules/
  app/                          # привести к эталону event-sales (см. фазу 1)
  entities/
    complect/                   # реестр + Composition + rules/ (чистое ядро)
    infoblock/                  # переписать заглушку под новый init (InfoGroupsDto)
    supply/                     # ОД (виды поставки)
    contract/                   # типы договоров
    region/
    price/                      # прайс-таблицы + pricing.ts
    kservice/                   # LT, LT-пакеты, LT-other, консалтинг, star, академия (справочники)
    row-set/                    # KRow, RowSet, row-set.ts, слайс сетов
    snapshot/                   # слепки: v2-формат + v1-адаптер + helper API (inner-deal)
  features/
    composition-editor/         # редактор наполнения (чекбоксы) для ВЫБРАННОЙ строки; тумблер rules/free
    row-builder/                # мастер добавления строки (второй Гарант, альтернатива, сервисы)
    comparison/                 # альтернативные сеты
    deal-send/                  # отправка в Bitrix + сохранение слепка
  processes/
    konstructor/                # конвейер: state шага, typed nav hook (native Next-роуты
                                #   /global → /constructor → /products → /document), гейты
  widgets/                      # (переименовать widgetes → widgets в рефакторинг-этап)
    global-settings/            # шаг GLOBAL
    complect-builder/           # шаг KONSTRUCTOR (комплекты + наполнение + ОД)
    price-table/                # шаг PRODUCTS (general + сравнение)
```

Правила слайса — по CLAUDE.md/скиллу: `model/index.ts` (алиасы generated DTO), `lib/api/*-helper.ts` (единственный импорт `@workspace/nest-konstructor-api`), slice+thunk, данные вне UI, listeners в `app/model/listeners/start-store-listeners.ts`, компонент = вёрстка + хук.

---

## 4. Фазы

### Фаза 0 — бэкенд и пакет (блокирует всё)
- Задачи B1–B6 из §1.2 (сначала согласовать состав init).
- Выровнять порт в `packages/nest-konstructor-api/orval.config.ts`, регенерация (`pnpm generate`, запускает пользователь; баррель `src/generated/index.ts` — ручной, дополнить новыми тегами).
- **Выход**: пакет с init v2, snapshot API, deal-send API.

### Фаза 1 — каркас приложения
- Подключить в `apps/konstructor`: `@workspace/nest-konstructor-api` (+`transpilePackages`), `ApiProvider` с `configureBaseURL(NEXT_PUBLIC_KONSTRUCTOR_API_URL)`, `@workspace/april-ui` + `@workspace/theme` (миграцию с `april-theme` можно отложить на рефакторинг-этап, но новые экраны — сразу на токенах).
- `modules/app` к эталону event-sales: тонкий `AppThunk.initial()` → `app-init.util.ts` (Bitrix.start → placement → dealId/companyId), `konstructor-init.util.ts` переключить на новый init (убрать localStorage-кэш 420КБ или оставить с версионированием), listeners на уровне store.
- Роуты `/global`, `/constructor`, `/products`, `/document` + `processes/konstructor` с typed nav.
- **Выход**: приложение стартует во фрейме сделки, тянет init v2, раскладывает справочники по слайсам.

### Фаза 2 — чистое доменное ядро
- Типы §2.2 + модули §2.3 + unit-тесты на oldinit.json-эталонах.
- Никакого UI/Redux — только `lib/`. Это самая рискованная часть переноса (правила), тесты обязательны.
- **Выход**: зелёные тесты паритета цен и правил с легаси.

### Фаза 3 — состояние и шаги GLOBAL/KONSTRUCTOR
- Слайсы: справочники (из init), `konstructor-process` (линейка/доступ/регион), выбранная строка, `row-set` (general-сет с main-строкой).
- `composition-editor` для main-строки: чекбоксы = проекция `composition` выбранной строки (не синглтона!), тумблер rules/free, WeightAlert (переиспользовать идею из admin `complect-infoblocks/weight.utils`).
- Цепочка: смена комплекта/ОД/договора → **listener** пересчитывает строку (аналог `changeCurrentProductAndPrice`, но через чистое ядро).
- **Выход**: сборка главного товара с наполнением и живой ценой.

### Фаза 4 — PRODUCTS: сеты, сравнение, наполнение для всех
- `price-table` виджет: general-сет (main + additional), альтернативные сеты (лимит 7), тумблер свёртки total.
- `row-builder`: добавление второго Гаранта (**теперь с собственными supply/contract и composition** — снятие легаси-ограничения), альтернатив, сервисных строк.
- `composition-editor` открывается для **любой** garant-строки любого сета (требование «наполнение для всех товаров»).
- Редактирование коммерции: price/quantity/discount/sum, налог поставщика, LIC-исключения.
- **Выход**: полный паритет с легаси-таблицей + новые возможности.

### Фаза 5 — сервисы
- LT (бесплатные в комплекте / пакет по весу), LT-other (`withoutRules` → общий `mode`), консалтинг, star, академия — справочники в `kservice`, правила уже в ядре (фаза 2), строки через `row-builder`.
- Искра-конфиг (count) — как часть composition/строки LT.
- **Выход**: все шесть `productType` собираются и считаются.

### Фаза 6 — персистентность (обратная совместимость!)
- `entities/snapshot`: формат v2 (`schemaVersion: 2`, code-джойны, composition в строках, `templateId`), сериализация текущего состояния.
- **v1-адаптер**: чтение старых слепков — защищённый parse, миграции (academy, contract.code, iskraConfig/ltOther опциональны), маппинг `number → code` по справочникам, `role` из `id===0`, composition главной строки из `currentComplect`, остальным garant-строкам — composition по умолчанию их комплекта.
- Restore на старте (есть слепок → шаг DOCUMENT), save при отправке сделки; сервисный смарт (serviceSmartId) и избранное — на том же snapshot-контракте.
- Тест-фикстуры: реальные v1-записи из прод-БД (запросить дампы).
- **Выход**: старые сделки открываются в новом приложении.

### Фаза 7 — отправка в Bitrix и документы
- `deal-send`: состояние → бэк (B5) → deal + UF-поля + productRows (только general; total при свёрнутом сете) + сохранение слепка v2.
- Стыковка с уже перенесёнными модулями документов (offer-word DTO `sets/rows/total/complect` — собирать из новой модели; альтернативы в КП отдельной секцией).
- **Выход**: полный цикл сделка → КП/договор/счёт.

### Фаза 8 — рефакторинг-проход и зачистка
- По скиллу `front-refactor`: `widgetes` → `widgets`, дубли `pages/offer-template-settings` ↔ `entities/offer-template-konstructor`, `AppThunkOld.ts`, серверный DAL из `app/api/*`, миграция на `april-ui`+`theme`, eslint-plugin-boundaries (как в kpi-sales стадия 9.7).
- Удалить legacy: `complect`-заглушку, мёртвые ветки, localStorage-кэш старого init.

---

## 5. Открытые вопросы (решить до/в ходе фазы 0)

1. Пишет ли Laravel `garant-app.ru` слепки в ту же `bx_document_deals`? (Если нет — миграция данных из Laravel-БД и/или Firebase.)
2. Где живут договорные тексты supplies (B2): БД+админка или шаблоны на бэке?
3. Universal-цены: оставить расчёт `abs × region.abs × coefficient` (тогда в init нужны только regions.abs и abs комплектов) или отдавать готовую таблицу как в старом init? Прайс-слайс админки (`prof-price`) намекает на таблицу и для universal (`garant_package_code`).
4. Академия: хардкод `academy-data.ts` — заводить в админку (`productType`-расширение) или переносить хардкодом в `kservice/lib`?
5. `customFields`/`filtredClientFields` (шаблонные поля документов) — нужны ли фронту вообще, если генерация документов полностью на бэке?
6. Судьба режимов REPORT/CALLING/TRANSKRIBATION старого приложения — не переносим (в монорепе есть kpi-sales и др.)?
