# Рефакторинг `apps/kpi-sales` — аналитика и пошаговый план

Дата: 2026-07-23. Статус: план согласовывается.

## TL;DR

`apps/kpi-sales` — легаси-приложение отчёта KPI отдела продаж. Три несогласованных транспортных слоя, god-thunk на 250 строк, роль руководителя определяется по фамилии «Савчук», группа — по подстроке «Группа» в названии, три `next.config` одновременно, промышленные объёмы мёртвого кода.

Рефакторим **инкрементально, сущность за сущностью**, сразу в FSD-структуру (эталон — `apps/admin/modules/entities/garant`), **оставляя Redux** (TanStack Query — опционально позже; helper-классы делают этот переход локальным).

**Приоритет №1** — переход на новое department API `POST /api/bx/department/structure` из пакета `@workspace/nest-kpi-report-sales-api` с поддержкой **мультиотделов продаж** (`is_multiple` / `multiple_tag`) во всём флоу: роли, фильтры, таблицы, сохранение фильтров, excel.

---

## 1. Текущее состояние (аудит)

### 1.1 Структура

Самодельная схема `modules/{app, bitrix, entities, feature, general, shared, widgetes}` (опечатки: `widgetes`, `departament`). Внутри — непоследовательное FSD-подобное деление (`type` vs `types`, `hooks` и `lib/hooks` вперемешку). Роуты: `/report` (основной), `/report/user?userId=`, `/dev` (дубль), `/install`, `/auth/login`, `/admin/logs`, `/` — заглушка «Hello Bitrix APP» без редиректа.

### 1.2 Redux

Store: `apps/kpi-sales/modules/app/model/store.ts` (listenerMiddleware есть, но реально работает один листенер — `ReportTypeAppListener`, выбирающий тип отчёта **хардкодом по домену**: `gsr/gsirk → EVENTS`, `alfacentr/april → MERGED`).

Слайсы: `app`, `department` (items/current/groups/isHeadManager), `report` (filter, actions, date, report, detalization, currentGroup…), `callingStatistics`, `reportType`, `download`, `mergedReport` (selectedUsers/selectedActions), `userReport` (единственный на `createAsyncThunk`). Мёртвые: `PreloaderSlice` (не подключён), RTK Query `reportAPI` и `callingStatisticsApi` (зарегистрированы, но не используются).

Вся оркестрация — в god-thunk `getReportData` (`modules/entities/report/model/thunks/report-thunks.ts`, ~240 строк): департамент → роль → сохранённый фильтр → даты → отчёт → звонки.

### 1.3 Транспорт — три механизма одновременно

| Механизм | Что вызывает | Статус |
|---|---|---|
| `backAPI` (raw axios, `packages/api`, **хардкод** `https://back.april-app.ru/api/`, пустой `X-BACK-API-KEY`) | `bitrix/department/sales`, `kpi-report/get`, `kpi-report/calling-statistic`, `kpi-report/download`, `queue/ping` | боевой путь — **заменить** |
| Next API-прокси + сырые `fetch('/api/proxy/…')` | get/save фильтра через online/hook API (`/report/settings/…`, ключ `ONLINE_API_KEY`) | боевой путь для фильтров |
| RTK Query (`reportAPI`, `callingStatisticsApi`) | те же endpoints | мёртвый балласт — **удалить** |

Точечно уже используется orval: `user-report` → `@workspace/nest-api` (`salesUserReportStart/Stop`). Пакет `@workspace/nest-kpi-report-sales-api` заявлен в `transpilePackages`, но **не импортируется нигде**.

### 1.4 Department сейчас

- Запрос `bitrix/department/sales` → нормализация `normalizeDepartmentResponse` → `{allUsers, generalDepartment[], childrenDepartments[]}` — **жёсткое предположение об одном ОП**.
- Группа = подразделение, у которого `NAME.includes('Группа')` (`report-thunks.ts:88`).
- Роль руководителя: перебор `UF_HEAD` **плюс бэкдор** `LAST_NAME?.includes('Савчук')` (`report-thunks.ts:73-74`).
- Руководитель видит всех; менеджер — только себя. Понятий «руководитель территории/отдела/группы», «коллеги», «подчинённые» в модели нет.
- Фильтр сотрудников/групп — тогглы в памяти (`use-departament.ts`); сохранение — старый формат `{actions, dates, department: number[]}` JSON-строками через online API.

### 1.5 Excel / экспорт

Excel генерится на бэке: `POST /api/kpi-report/download` (exceljs, `back/apps/kpi-report-sales/.../kpi-report.service.ts`). Фронт собирает `DownLoadKpiReportDto` (плоский список `{id, userName, kpi[]}` — **без отделов/групп**) и качает Blob. PDF закомментирован, CSV — отдельный фронтовый механизм (`export-util.ts`).

### 1.6 Ключевые «ужасы» (полный список — в отчёте аудита)

1. Роль по фамилии (`Савчук`), группа по подстроке `«Группа»`, поведение по домену — хардкоды бизнес-логики.
2. Три `next.config` (`.js/.mjs/.ts`) с разными `transpilePackages` и env-логикой; активен `.mjs`.
3. `console.log(apiKey)` печатает боевой `ONLINE_API_KEY` в логи (`app/api/proxy/{hook,filter,save-filter}/route.ts`).
4. Импорт вглубь пакета: `@workspace/api/src/services/april-hook-api`.
5. Мёртвый код: закомментированные thunks (`department-thunk`, `callingStatisticsThunk`, `report/model/thunks/*`), `AppLazyContainer`, дашборды, файл `KPITotalBoard copy.tsx`.
6. WS-подписки мимо listener-паттерна (`KpiReporttListener.ts` — `socket.on` на уровне импорта модуля).
7. 185 хардкод-цветов в 22 файлах (`report/lib/colors.ts` — словарь `rgba(...)`), инлайн-tailwind (`bg-black`, `border-indigo-500`).
8. Lazy закомментирован почти везде; тяжёлые трансформации в рендере без мемоизации (`useReport.ts:64-65`, `KPIReportTable.tsx:15`).
9. ~69 `console.log` с данными пользователей.

---

## 2. Новое department API (бэк уже готов)

### 2.1 Endpoint

`POST /api/bx/department/structure` — `back/libs/bx-department/bx-department-structure.controller.ts`, сервис `bx-department-structure.service.ts`. Redis-кеш на сутки, ключ включает режим `single` / `multi_{tag}`.

**Мультирежим**: флаги живут в БД портала (prisma `departaments`: `is_multiple Boolean`, `multiple_tag String?`) — **фронт их не передаёт**, бэк сам решает. При `is_multiple` бэк собирает все ОП по всей структуре по regex из `multiple_tag` (напр. `"ОП ОС"` → `/^ОП(\s|$)/i`, `/^ОС(\s|$)/i`), строит группы по `PARENT` и родительские отделы (cup).

### 2.2 DTO ответа (сгенерировано в `@workspace/nest-kpi-report-sales-api`)

```ts
BxDepartmentStructureRequestDto  { domain; department?: 'sales'|'service'; userId }

BxDepartmentStructureResponseDto {
  department: BxDepartmentDataDto;        // legacy-совместимый смердженный формат
                                          // (в мультирежиме department.department === 0)
  salesDepartments: BxSalesDepartmentDto[]; // НОВОЕ: разбивка по ОП
  currentUser: BxCurrentUserDto;            // НОВОЕ: роль и коллеги
}

BxSalesDepartmentDto { department: BxDepartmentDto; groups: BxDepartmentDto[]; allUsers: BXUserDto[] }
BxDepartmentDto      { ID; NAME; PARENT; SORT; USERS: BXUserDto[]; UF_HEAD? }

BxCurrentUserDto {
  userId: number;
  isHead: boolean;
  headOf: 'cup' | 'op' | 'group' | null;  // территория | отдел | группа | менеджер
  headOfDepartmentIds: number[];
  colleagues: { group: BXUserDto[]; department: BXUserDto[] };  // без себя
}
```

Клиент: `getBitrixDomainDepartment().bxDepartmentStructureGetStructure(dto)`.

### 2.3 Маппинг ролей на требования

| `headOf` | Роль | Кого видит / фильтрует |
|---|---|---|
| `cup` | руководитель территории (над ОП) | все ОП, все группы, все сотрудники |
| `op` | руководитель отдела продаж | свои ОП (`headOfDepartmentIds`), их группы и сотрудники |
| `group` | руководитель группы | своя группа целиком |
| `null` | менеджер | только себя (коллеги — для отображения контекста) |

«Коллеги» — `currentUser.colleagues.group/department`. «Подчинённые» — производная: все `USERS` отделов/групп из `headOfDepartmentIds` (селектор на фронте).

### 2.4 Что уже есть в `@workspace/nest-kpi-report-sales-api`

Пакет создан (untracked), orval настроен (input `localhost:3000/docs/api-json`, prod закомментирован), баррель подключает `sales-report`, `kpi-sales-report-download`, `bitrix-domain-department`, `bitrix-domain-team`:

- `kpiReportGetReport` → `POST /api/kpi-report/get` (`ReportGetRequestDto { domain, filters: { dateFrom, dateTo, userIds[], departament: BXUserDto[], userFieldId, dateFieldId, actionFieldId, currentActions } }`)
- `kpiReportGetCallingStatistic` → `POST /api/kpi-report/calling-statistic`
- `kpiReportDownloadExcel` → `POST /api/kpi-report/download` (`DownLoadKpiReportDto { type, report: {id, userName, kpi[]}[], date }`)
- `salesUserReportStart/Stop`, `salesUserReportGetReportWithoutWs`
- `bxDepartmentStructureGetStructure` + legacy `departmentGetFullDepartment`
- `bxTeam*` (Bitrix v3 humanresources, роли `MEMBER_HEAD`/`TEAM_HEAD`/…) — задел на будущее, в этом рефакторинге не используем.

**Вывод: весь боевой контур kpi-sales покрывается одним пакетом** — `backAPI` и `@workspace/nest-api` из приложения уходят полностью.

---

## 3. Целевая архитектура

### 3.1 Принципы

- FSD по образцу `garant`: слайс = `model/` (алиасы DTO + slice + thunks) + `lib/api/*-helper.ts` (единственное место импорта `@workspace/nest-kpi-report-sales-api`) + `lib/` (utils/selectors/hooks) + `ui/` (один компонент — один файл) + `index.ts`-баррель.
- **State — Redux** (слайсы + thunks + RTK listeners). Отличие от garant: там TanStack Query; нам он сейчас не нужен. Helper-классы идентичны garant-паттерну, поэтому будущий переход thunk → `useQuery` (обновление данных при возврате на страницу) — локальная замена в `lib/hooks`, модель и UI не трогаются.
- Реакции «X случилось → сделать Y» — только через `start-store-listeners.ts`, не вложенные диспатчи из thunks.
- Данные/справочники — в `lib/`, токены тем вместо хардкод-цветов, lazy для тяжёлых виджетов.

### 3.2 Целевая карта модулей

```
apps/kpi-sales/modules/
├─ app/                      # init, store, listeners (start-store-listeners.ts), domain-config
├─ entities/
│  ├─ department/            # НОВЫЙ (переименован из departament), структура ОП + роли + selection
│  │  ├─ model/index.ts      #   алиасы: DepartmentStructure, SalesDepartment, DepartmentUser,
│  │  │                      #   CurrentUserInfo, HeadType ← BxDepartmentStructure* DTO
│  │  ├─ model/department-slice.ts   # structure, salesDepartments[], currentUser, selection, status
│  │  ├─ model/department-thunk.ts   # getDepartmentStructure
│  │  ├─ lib/api/department-helper.ts# class DepartmentHelper → bxDepartmentStructureGetStructure
│  │  ├─ lib/normalize.ts    #   mono→multi нормализация (всегда массив SalesDepartment)
│  │  ├─ lib/selectors.ts    #   visibleDepartments, subordinates, colleagues, selectedUsers,
│  │  │                      #   tri-state чекбоксов, isMultiMode
│  │  └─ ui/                 #   (фильтры уезжают в features/report-filter)
│  ├─ report/                # kpi-отчёт: slice + thunks (разрезанный god-thunk) + таблицы
│  ├─ calling-statistics/
│  └─ user-report/           # WS-поток → listeners, helper на новый пакет
├─ features/
│  ├─ report-filter/         # дерево отдел→группа→сотрудник, tri-state, чипы, save/load
│  ├─ report-tabs/           # вкладки: Сводный / По отделам / По группам (+ типы отчёта)
│  └─ download/              # excel (новый DTO), csv
├─ widgets/                  # (переименован из widgetes) chart-стек
└─ shared/
```

### 3.3 Доменная модель department (унификация mono/multi)

Ключевая идея: **фронт всегда работает со списком `SalesDepartment[]`**. Монопортал — частный случай с одним элементом; весь UI (фильтры, вкладки, excel) написан один раз против этой модели.

```ts
// model/index.ts (алиасы)
export type DepartmentStructure = BxDepartmentStructureResponseDto;
export type SalesDepartment    = BxSalesDepartmentDto;
export type DepartmentGroup    = BxDepartmentDto;
export type DepartmentUser     = BXUserDto;
export type CurrentUserInfo    = BxCurrentUserDto;
export type HeadType           = BxCurrentUserDtoHeadOf; // 'cup'|'op'|'group'|null

// state
interface DepartmentState {
  status: 'idle'|'loading'|'ready'|'error';
  isMulti: boolean;                  // см. открытый вопрос №1
  departments: SalesDepartment[];    // нормализовано: mono → [один]
  currentUser: CurrentUserInfo | null;
  selection: DepartmentSelection;    // п.3.4
}
```

Роль/видимость — только селекторы поверх `currentUser` (никаких `UF_HEAD`-переборов и фамилий в коде приложения).

### 3.4 Модель выбора (фильтр мультиотдела)

Требования: отмечать/снимать **целые отделы**; выбирать все/некоторые отделы со всеми группами; сравнивать отдельные группы из разных отделов; точечно сотрудников; полный UI-контроль; запоминание.

Источник истины — **множество выбранных сотрудников**, структурные выборы — производные (tri-state):

```ts
interface DepartmentSelection {
  userIds: number[];                 // единственный источник истины
}
// Селекторы (derived, не хранится):
//   deptCheckState(depId)  → 'all' | 'partial' | 'none'
//   groupCheckState(groupId) → то же
// Тоггл отдела/группы = добавить/убрать все её userIds; «выбрать всё» = union.
```

Так «сравнить группу А из ОП-1 с группой Б из ОП-2» — это просто выбор их сотрудников; таблицы/вкладки группируют выбранных обратно по структуре. Существующий контракт отчёта (`filters.userIds`) не меняется.

**Персист** — structural-формат (переживает кадровые перестановки), см. задание на бэк №2:

```ts
interface SavedSelectionV2 {
  version: 2;
  departments: { id: number; all: boolean;
                 groups: { id: number; all: boolean; userIds?: number[] }[];
                 userIds?: number[] }[];   // сотрудники вне групп
}
```

При загрузке: v2 → разворачиваем по актуальной структуре в `userIds`; старый формат (`department: number[]`) → миграция «как есть» + пересохранение в v2.

---

## 4. Пошаговый план

Порядок жёсткий: **этап 1 (department + мультипортал в flow) — самый первый**, FSD-структура возникает инкрементально — каждый этап оставляет свою сущность уже в целевом виде.

### Этап 0. Санитария сборки (≈0.5 дня, можно вместе с этапом 1)

- Оставить **один** `next.config.mjs`: env-валидация (по образцу `apps/event-sales/next.config.ts`), `transpilePackages` — все используемые `@workspace/*` исходники (`ui`, `theme`, `april-ui`, `nest-kpi-report-sales-api`, `api` — пока не выпилен, `ws`, `bx`/`bitrix`). Удалить `next.config.ts` и `next.config.js`.
- `configureBaseURL(env)` для `@workspace/nest-kpi-report-sales-api` в `components/api-provider.tsx` (env `NEXT_PUBLIC_KPI_SALES_API_URL`; prod `https://api.kpi-sales.april-app.ru`).
- Убрать `console.log(apiKey)` из трёх proxy-роутов. Создать `.env.example` без секретов.
- Удалить из deps пакет `install` (мусорная зависимость).

### Этап 1. ★ ПРИОРИТЕТ: entity `department` на новом API + мультипортал в ядре flow (≈2–3 дня)

1. Создать слайс `modules/entities/department/` по карте из п.3.2 (это первый образцовый FSD-слайс приложения).
2. `DepartmentHelper` → `bxDepartmentStructureGetStructure({ domain, department: 'sales', userId })`. Единственное место импорта api-пакета.
3. `normalize.ts`: если `salesDepartments` пуст (моно-ответ) — собрать один `SalesDepartment` из `department.generalDepartment/childrenDepartments`; `isMulti` — см. открытый вопрос №1.
4. Thunk `getDepartmentStructure`; listener в `start-store-listeners.ts`: `appActions.setAppData` → загрузка структуры; `departmentActions.setStructure` → применение сохранённого фильтра → `getReportData`.
5. Выпилить из `report-thunks.ts`: запрос `EBACK_ENDPOINT.DEPARTMENT`, `normalizeDepartmentResponse`, `getIsUserHead`, **хардкоды «Савчук» и «Группа»**. Роль — только `currentUser.headOf`; дефолтная видимость по таблице из п.2.3.
6. Селекторы совместимости: существующие `EmployeesFilter`/`ManagersFilter` временно питаются от новой модели (плоский список видимых сотрудников + группы), чтобы UI не ломать до этапа 4.
7. Старый слайс `departament` и `department-util.ts` удаляются.

**DoD:** оба режима (моно и мульти-портал) работают на новом endpoint; `bitrix/department/sales` из приложения не вызывается; роли определяются только по `currentUser`; менеджер видит себя, руководители — свои периметры.

### Этап 2. Redux → новый api-пакет для всех остальных запросов (≈1–2 дня)

- `entities/report/lib/api/report-helper.ts` → `kpiReportGetReport` (замена `backAPI` + `getReportDataAPI`).
- `entities/calling-statistics/lib/api/…` → `kpiReportGetCallingStatistic`.
- `features/download` → `kpiReportDownloadExcel` (раскомментировать путь через orval, `backAPI.download` удалить).
- `entities/user-report` → пересадить helper с `@workspace/nest-api` на `@workspace/nest-kpi-report-sales-api` (`salesUserReportStart/Stop`, `withoutWs`).
- Удалить: RTK Query `reportAPI` и `callingStatisticsApi` из store, мёртвые thunks, `PreloaderSlice`, `@workspace/nest-api` и `@workspace/api`-импорты из приложения (кроме фильтров — они мигрируют на этапе 5), proxy-роуты `hook`/`report`.

**DoD:** все данные отчёта идут через `@workspace/nest-kpi-report-sales-api`; в store нет незадействованных reducer'ов.

### Этап 3. Разрез god-thunk + FSD-каркас report (≈2 дня)

- `getReportData` разрезать: `getDepartmentStructure` (этап 1), `loadSavedFilter`, `loadReport`, `loadCallingStatistics` — связка через listeners (цепочка в `start-store-listeners.ts`), а не вложенные диспатчи.
- Привести `entities/report`, `entities/calling-statistics`, `entities/user-report` к целевой структуре: данные/каталоги из компонентов в `lib/`, мемоизация тяжёлых трансформаций (`getTotalData`/`getMediumData`/`getReportTableData` → селекторы/`useMemo`), WS-подписки `KpiReporttListener`/`QueueWsPingListener` — в listener-паттерн.
- Переименования: `widgetes` → `widgets`; убрать `Dashboards/* copy`, закомментированные простыни, `/dev` дубль, редирект `/` → `/report`.

### Этап 4. UI мультифильтра (≈2–3 дня)

- `features/report-filter`: дерево «Отдел → Группа → Сотрудник» с tri-state чекбоксами (модель из п.3.4): тоггл отдела целиком, группы целиком, «выбрать всё», точечный выбор; поиск по имени; чипы выбранного.
- Для монопортала дерево вырождается в текущий вид (группы + сотрудники) — один код.
- Видимость дерева ограничена ролью (менеджер фильтр не видит, group-руководитель — свою группу и т.д.).
- Lazy: фильтр и графики — `next/dynamic` со skeleton.

### Этап 5. Запоминание фильтров v2 (фронт + бэк, ≈1–2 дня фронт)

- Бэк: задание №2 (ниже). Фронт: `features/report-filter/lib/api/filter-helper.ts` на новые endpoints пакета; миграция старого формата; удаление proxy-роутов `filter`/`save-filter` и зависимости от `ONLINE_API_KEY`.
- До готовности бэка — интерим: сохранять v2-структуру строкой в существующий `/report/settings/filter` (обратно-совместимо), плюс localStorage-фоллбек.

### Этап 6. Вкладки и группировки таблиц (≈2 дня)

- `features/report-tabs`: вкладки **Сводный** (все выбранные сотрудники, как сейчас) / **По отделам** (только мульти: секция или вкладка на каждый ОП с итогами) / **По группам** (если группы есть: сотрудники сгруппированы внутри своих групп, итоги по группе).
- Таблицы (`KPIReportTable`, `MergedReportTable`) получают данные уже сгруппированными из селекторов — компоненты только рендерят.
- Итоги/средние считаются на уровень: группа → отдел → общий.

### Этап 7. Excel мульти (бэк — задание №3; фронт ≈1 день)

- Фронт шлёт новый DTO с группировкой (структура ниже); кнопка одна, бэк сам строит листы по режиму.

### Этап 8. Финальная чистка (≈1–2 дня)

- Цвета: `report/lib/colors.ts` и chart-стек → токены тем (`--fx-*`/`april-tokens.css`, `getChartColorsArray` — один util, читающий CSS-переменные); убрать инлайн `bg-black`/`border-indigo-500`.
- Убрать `console.log` (боевые логи — через существующий `logClient`/pino), `alert()`, `window.html2canvas`-глобалы.
- Старый chartjs-`*.jsx`-стек: удалить неиспользуемое, оставшееся перевести на `ui/charts/*.tsx`.
- Ревизия `.env`: боевой `ONLINE_API_KEY` после этапа 5 больше не нужен — удалить и **ротировать ключ** (он светился в логах).

---

## 5. Задания на бэкенд

### №1. Department structure: явные флаги режима (мелкое, желательно до этапа 1)

В `BxDepartmentStructureResponseDto` добавить `isMultiple: boolean` (и опционально `multipleTag: string | null`), и гарантировать, что в **моно-режиме `salesDepartments` содержит один элемент** (единый контракт для фронта). Сейчас фронту пришлось бы угадывать режим по `department.department === 0`.

### №2. Хранение фильтров отчёта v2 (к этапу 5)

Сейчас фильтры живут в старом online/hook API (`/report/settings/get/filter`, `/report/settings/filter`) в формате JSON-строк `{actions, dates, department: number[]}` — вне orval-контура, с ключом в env фронта.

Нужно в `back/apps/kpi-report-sales`:
- `POST /api/kpi-report/filter/get` `{ domain, userId }` → `SavedReportFilterDto | null`
- `POST /api/kpi-report/filter/save` `{ domain, userId, filter: SavedReportFilterDto }`

```ts
SavedReportFilterDto {
  version: 2;
  actions: string[];                       // innerCode выбранных действий
  dates: { mode: 'today'|'week'|'month'|'custom'; from?: string; to?: string };
  selection: {                             // структурный выбор, п.3.4
    departments: { id: number; all: boolean;
                   groups: { id: number; all: boolean; userIds?: number[] }[];
                   userIds?: number[] }[];
  };
}
```

Хранение per `domain + userId`. Swagger-аннотации (`@ApiTags('Sales Report')`, `@ApiOkResponse`) — чтобы попало в orval-генерацию. Опционально: одноразовая миграция старых записей.

### №3. Excel: мульти- и моно-режим, разбивка по отделам/группам (к этапу 7)

Расширить `POST /api/kpi-report/download` (`ExcelReportService.generateExcel`), сохранив обратную совместимость с плоским `report[]`:

```ts
DownLoadKpiReportDto {
  type: 'excel';
  date: DateRangeDto;
  report: DownloadKpiReportItemDto[];        // как сейчас — сводные данные всех выбранных
  structure?: {                              // НОВОЕ: если передано — группируем
    isMultiple: boolean;
    departments: {
      id: number; name: string;
      groups: { id: number; name: string; userIds: number[] }[];
      userIds: number[];                     // сотрудники отдела вне групп
    }[];
  };
}
```

Правила генерации:
- `structure` нет → текущее поведение (один лист).
- Моно с группами → один лист: секции по группам + строка «Итого по группе» + общий итог.
- Мульти → лист «Сводный» + лист на каждый ОП (внутри — секции групп с итогами), итоги по отделу и общие.
- Данные по сотруднику берутся из `report[]` по `id`; сотрудник без группы — в секцию «Без группы».

### №4 (опционально, обсудить). Calling-statistic и report: серверная группировка

Сейчас `kpi-report/get` принимает `filters.userIds` и фронт группирует сам — этого достаточно. Если появится требование серверных агрегатов по отделам (например, для тяжёлых порталов), добавить в `ReportGetFiltersDto` опциональный `groupBy: 'department'|'group'` — **не блокирует ни один этап**.

---

## 6. Открытые вопросы / риски

1. **Формат моно-ответа structure**: заполняет ли `buildSingle` массив `salesDepartments`? Если нет — закрывается заданием №1 либо нормализацией на фронте (заложена в этап 1 п.3).
2. **Права ролей** — подтвердить продуктово: видит ли `op`-руководитель чужие ОП в мультирежиме (сейчас план: нет, только свои `headOfDepartmentIds`; `cup` видит всё)? Влияет на селекторы этапа 1 и дерево этапа 4.
3. **`userFieldId`/`dateFieldId`/`actionFieldId`** в `ReportGetFiltersDto` — откуда берутся на порталах с мультиотделами (один набор полей на портал или на отдел?). Если на отдел — нужен доп. вопрос к бэку.
4. **Кеш на сутки** в structure-сервисе: после смены `is_multiple`/`multiple_tag` в админке фронт сутки видит старую структуру. Возможно, нужен endpoint инвалидации или короче TTL (вопрос к бэку, не блокер).
5. **`ONLINE_API_KEY` ротация** — ключ печатался в логи; после этапа 5 ротировать обязательно.
6. **TanStack Query** — сознательно отложен; точка подключения — заменить thunks на `useQuery` поверх готовых helper-классов (обновление при возврате на страницу через `refetchOnWindowFocus`/`staleTime`). Решение принимаем после этапа 6.

## 7. Порядок работ (сводно)

| # | Этап | Зависимости | Оценка |
|---|---|---|---|
| 0 | Санитария сборки | — | 0.5 д |
| 1 | ★ department на новом API + роли + мульти в ядре | №1 (желательно) | 2–3 д |
| 2 | Все запросы → `@workspace/nest-kpi-report-sales-api` | 1 | 1–2 д |
| 3 | Разрез god-thunk, FSD-каркас, listeners | 2 | 2 д |
| 4 | UI мультифильтра (tri-state дерево) | 1, 3 | 2–3 д |
| 5 | Персист фильтров v2 | бэк №2 | 1–2 д |
| 6 | Вкладки по отделам/группам | 4 | 2 д |
| 7 | Excel мульти | бэк №3, 6 | 1 д |
| 8 | Чистка: цвета, lazy, мёртвый код, ключи | любой момент после 2 | 1–2 д |

Перед этапами 1–2: бэк `kpi-report-sales` должен быть запущен и `pnpm generate` в `packages/nest-kpi-report-sales-api` выполнен пользователем (клиенты structure уже сгенерированы — регенерация нужна только после заданий №1/№2/№3).
