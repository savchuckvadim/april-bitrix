# Дизайн-система: выпиливание легаси и централизация UI

Статус на 2026-07-31. Родительский план — «Дизайн-система April: перевод event-sales на april-ui».
Эталон компонента: `packages/april-ui/src/surfaces/SectionCard/`.

## Зачем

Цель — **везде централизованно, без легаси и самодеятельности**: правка вида карточки,
модалки или поля происходит в одном файле пакета и мгновенно видна во всех восьми
приложениях. Сегодня это невозможно: одну и ту же карточку собирают руками в 189 файлах,
рядом живут четыре конкурирующие реализации, а цвета в 137 файлах захардкожены мимо токенов.

Три источника проблемы, в порядке масштаба:

1. **Самодеятельность** — приложения собирают композиции из сырых примитивов shadcn на месте.
2. **Легаси-компоненты** — параллельные реализации того же самого (`ACard`, `EVCard`, `SimpleCard`, `A*`).
3. **Локальные копии** пакетных компонентов внутри приложений.

---

## Часть 1. Инвентарь (измерено, не на глаз)

### 1.1 Самодеятельность: сырые примитивы в приложениях

Файлов, импортирующих примитив напрямую:

| Примитив | admin | bitrix | event-sales | event-service | konstructor | kpi-sales | kpi-service | Итого |
|---|---|---|---|---|---|---|---|---|
| `components/card` | 59 | 60 | 13 | 3 | 9 | 32 | 13 | **189** |
| `components/dialog` | 18 | 2 | 4 | 1 | 3 | 6 | — | **34** |
| `components/select` | 26 | — | 8 | — | 7 | 8 | 2 | **51** |

Каждый такой файл — это вручную повторённая связка
`<Card><CardHeader><CardTitle>…` или `<div className="space-y-1.5"><Label/><Select/></div>`.

### 1.2 Легаси-компоненты: кто их держит

| Компонент | Где объявлен | Потребители (файлов) |
|---|---|---|
| `ACard` | `packages/ui/src/shared/card/card.tsx` | **admin 12**, bitrix 1, konstructor 1 |
| `EVCard` | april-ui | **event-service 14** |
| `EventCardAction` | april-ui | event-service 2 |
| `SimpleCard` | april-ui | **0** (konstructor и kpi-service используют свои копии) |
| `ASelect` | april-ui | event-service 11, bitrix 1 |
| `ABadge` | april-ui | event-service 8, bitrix 2 |
| `AInput` | april-ui | event-service 5, admin 1, bitrix 1 |
| `AButton` | april-ui | event-service 3, bitrix 3, admin 1 |
| `AModal` | april-ui | bitrix 3, event-service 2, admin 1 |
| `AText` | april-ui | event-service 3, admin 1, bitrix 1 |
| `ADate` / `ATogglerColor` | april-ui | event-service 3 / 3 |
| `AIcon` | april-ui | bitrix 1, event-service 1 |
| `ALabel` / `APhoneInput` | april-ui | event-service 1 / 1 |
| `ACheckboxGroup` / `ALink` | april-ui | **0 — удалять сразу** |
| `intents.ts` (`solid/soft/bg`) | april-ui | `AAButton`, `ABadge`, `ATogglerColor` |

**Вывод:** легаси-долг сконцентрирован. `event-service` — держатель `EVCard` и почти всего
`A*`-семейства; `admin` — держатель `ACard`. Мигрировав эти два приложения, снимаем
почти весь список.

### 1.3 Локальные копии пакетных компонентов

| Копия | В каких приложениях |
|---|---|
| `Cards/SimpleCard`, `Cards/Rating`, `Cards/SimpleStatiscs` | konstructor, kpi-service |
| `table/ui/RTable` | kpi-service |
| `ui/Tooltip` | konstructor, kpi-service |
| `ModalMenu` / `ModalConfirm` / `ModalScreen` | event-sales, event-service, konstructor |
| `shared/Table/Table` | event-sales, event-service |
| `ColorPicker` | event-sales, event-service, konstructor |

В `event-sales` 11 из этих файлов **байт-идентичны** файлам `event-service` (~914 строк дубля)
и там мертвы.

### 1.4 Хардкод цветов

- `bg-white` / `text-gray-*` / `bg-gray-*` — **137 файлов**
- hex-литералы — **27 файлов** (часть законна: параметры WebGL/градиентов)

---

## Часть 1.5. Поверхности: solid / glass / liquid

Одна шкала на всю дизайн-систему, чтобы «стеклянность» не разъезжалась по компонентам.

| Значение | Чем рисуется | Когда брать |
|---|---|---|
| `solid` / `flat` | обычная непрозрачная подложка | дефолт, плотные формы, таблицы |
| `glass` | утилита `.glass` (`backdrop-filter` на токенах `--fx-glass-*`) | дёшево, работает во всех браузерах; списки, шапки, боковые панели |
| `liquid` | reactbits `GlassSurface` — рефракция фона как у iOS | акцентные поверхности: модалки, ключевые карточки отчёта, плеер |

Правила:

- **`liquid` стоит SVG-фильтра на каждый экземпляр.** Для одиночной карточки или
  модалки это нормально; для списка бэйджей или строк таблицы — нет, там `glass`.
- Оба стеклянных варианта подчиняются общему выключателю (`data-glass` на `<html>`):
  выключили — поверхность становится обычной, а `GlassSurface` **не рендерится вовсе**.
- Стеклу нужен фон под собой: на странице должен быть `GlassAmbient`, иначе размывать нечего.
- В Safari/Firefox рефракции нет — `GlassSurface` сам откатывается на читаемое стекло.

Поддерживают шкалу: `SectionCard` (`surface`), `ToneBadge` (`surface`), `GlassCard`
(`intensity`). Плеер и `GlassDialog` получат её в Ф1.

## Часть 2. Что уже сделано

- `SectionCard` (april-ui) — единственная карточка для приложений: `tone`, `state` + `message`,
  `accent`, `collapsible` (controlled/uncontrolled), `surface` (solid/glass/liquid),
  `density`, слот `actions`.
- `ToneBadge` (april-ui) — единственный бэйдж: `tone`, `variant` (solid/soft/outline),
  `surface`, `size`. `EventTypeBadge` и `EventStatusBadge` переведены на него.
- Реестр тонов `lib/tones.ts` — заменил три параллельные таблицы «значение → className».
- Выключатель стекла: `data-glass` + токены `--fx-glass-*` + `useGlass()` / `GlassToggle`.
- `feedback/`: `Spinner`, `BootPreloader` + `BootPreloaderGate`, `ProcessingScreen`.
- Exports map april-ui (`.`, `./surfaces`, `./feedback`, `./tones`, `./glass`) — закрыт deep-import.
- Помечены `@deprecated`: `ACard`, `EVCard`, `SimpleCard`.

---

## Часть 3. Задачи

### Ф1. Достроить дизайн-систему (блокирует всё остальное)

Без этих компонентов мигрировать приложения некуда.

- [ ] **`GlassDialog`** + `DialogActions` + `ConfirmDialog` (`april-ui/src/overlays/`).
      Поглощает 34 файла с сырым `dialog` и дублирующуюся «инкантацию» стеклянного
      диалога из kpi-sales (`ViewAsDialog`, `CreateShareLinkDialog`).
- [ ] **`Field*`** (`april-ui/src/fields/`): `FieldSelect`, `FieldInput`, `FieldTextarea`,
      `FieldSwitch`, `FieldDateTime`. Композируют существующий `Field` из
      `@workspace/ui/shared` — не дублируют его. Поглощают 51 файл с сырым `select`.
- [ ] **`Skeleton`** — в монорепе его нет вообще, скелетоны пишут строкой
      `h-N animate-pulse rounded-* bg-muted`.
- [ ] **`StatTile`** + консолидация `SimpleStatisticsCard` / `RatingCard` / `UserStatTile`
      (kpi-sales) в одно семейство плиток.
- [ ] **`domain/`**: `EventTitle` (пара «название + бэйдж типа», сейчас отрисована
      по-разному в двух местах), `ComplectBadge` (токены `--complect-*` готовы,
      потребитель — `kpi-service/DealsReportCompact`), `StatusDot`.
- [ ] **Плеер**: `use-audio-player` (логика в хук), пропсы `surface`/`shape`/`variant`,
      круглая транспортная кнопка, `step={0.1}` вместо целых секунд; поверх —
      `AudioRecordCard` / `AudioRecordList` в april-ui.

### Ф2. Убрать самодеятельность в приложениях

Порядок — по убыванию плотности легаси.

- [ ] **event-sales** (13 card / 4 dialog / 8 select) — эталонное приложение, идёт первым.
      9 секций `EventItem` → `SectionCard`; 3 модалки → `GlassDialog`; 11 дублей
      с `event-service` удалить; починить `use-layout-mode.ts` (два `debugger` и
      `return 'full'` делают ветку `CompactLayout` недостижимой).
- [ ] **kpi-sales** (32 / 6 / 8) — 6 диалогов → `GlassDialog`; поднять в april-ui
      `GlassActionStatus`, `CompanyColorBadge`, `UserStatTile`.
- [ ] **admin** (59 / 18 / 26) — самое крупное. Заодно снимает **12 из 14** потребителей `ACard`.
- [ ] **bitrix** (60 card) — самое крупное по карточкам; 77 вхождений `text-white`/`bg-black`.
- [ ] **kpi-service** (13 / — / 2) — удалить локальные копии `Cards/*`, `RTable`, `Tooltip`.
- [ ] **konstructor** (9 / 3 / 7) — удалить локальные копии `Cards/*`, `Tooltip`, `ModalMenu`, `ColorPicker`.
- [ ] **event-service** (3 / 1 / —) — карточек мало, но это держатель `EVCard` (14) и
      почти всего `A*`. Мигрируется последним и снимает бóльшую часть Ф3.

### Ф3. Выпилить легаси

Строго после Ф2 — пока есть потребители, удалять нельзя.

- [ ] **Удалить немедленно, потребителей нет:** `ACheckboxGroup`, `ALink`,
      `SimpleCard` (april-ui), локальные `Cards/SimpleCard` в konstructor и kpi-service.
- [ ] **После миграции admin:** удалить `ACard` (`packages/ui/src/shared/card/card.tsx`)
      и его экспорт из `packages/ui/src/shared/index.ts`.
- [ ] **После миграции event-service:** удалить `EVCard`, `EventCardAction` и всё
      `A*`-семейство (`AModal`, `ASelect`, `AInput`, `AText`, `ADate`, `ABadge`,
      `AButton`, `ALabel`, `APhoneInput`, `ATogglerColor`, `AIcon`).
- [ ] **Вместе с `A*`** — удалить `lib/intents.ts` целиком (он существует только ради
      `AAButton`/`ABadge`/`ATogglerColor`); реестр тонов остаётся единственным.
- [ ] Сузить барель `packages/april-ui/src/index.ts` до актуального состава; убедиться,
      что каждый экспорт имеет потребителя (`grep` по монорепе).

**Критерий готовности Ф3:** `grep -rn "@deprecated" packages/april-ui/src packages/ui/src`
не находит ничего, кроме осознанно оставленного.

### Ф4. Токены вместо хардкода

- [ ] 137 файлов с `bg-white` / `text-gray-*` / `bg-gray-*` → токены тем. Начать с
      bitrix (77 вхождений `text-white`/`bg-black`).
- [ ] 27 файлов с hex → токены; оставить только параметры WebGL/градиентов, пометив
      их комментарием (образец — `kpi-sales/modules/shared/processing/lib/processing-fx.ts`).
- [ ] Цвета графиков на токены: `CHART_SERIES` + хук `useChartTokens()` (Ф2 из
      `design-system.tasks.md`) — снимает бóльшую часть оставшегося hex.

### Ф5. Консолидация theme-пакетов

Перенесено из родительского плана без изменений.

- [ ] `packages/theme/src/{provider,components,hook}` → `packages/ui/src/theme/`,
      экспорт `"./theme"`; туда же `GlassToggle`.
- [ ] Переключить потребителей: event-sales 3, kpi-sales 4, admin 3, bitrix 3,
      kpi-service 5 файлов + `@workspace/april-theme` в event-service 1, konstructor 2.
- [ ] Удалить `packages/theme` и `packages/april-theme`, вычистить из `package.json`
      и `transpilePackages` восьми приложений.
- [ ] Удалить мёртвые `packages/ui/src/styles/{original,violite}.css`.

### Ф6. Закрепить стандартом

- [ ] `.claude/skills/design-system/SKILL.md`: границы слоёв, запрет на сборку
      карточек/модалок/полей из примитивов в приложениях, API-конвенция
      (`tone`, `state`, `surface`, `density`, `collapsible`, слот `actions`),
      правила стекла, чек-лист правки пакета.
- [ ] Строка делегирования в `CLAUDE.md`; `front-refactor` §4 → ссылка на новый скилл.
- [ ] Переписать `packages/april-ui/DESIGN_SYSTEM.md` (ссылается на удаляемый
      `@workspace/april-theme` и описывает только легаси-инвентарь `A*`).
- [ ] Отметить закрытыми в `docs/design-system.tasks.md`: Ф1, п. 5.2 (`useFxToken`), часть Ф3.

---

## Часть 4. Долги, найденные по дороге

Не относятся к дизайн-системе напрямую, но всплыли и требуют решения владельца.

- [ ] **kpi-service: два конфига Next.** `next.config.mjs` и `next.config.ts` лежат рядом;
      Next резолвит `.js → .mjs → .ts`, значит работает `.mjs`, а `.ts` вместе с его
      проверкой обязательных env (`ONLINE_API_KEY`, `IN_BITRIX`, `LOG_FILE_PATH`) мёртв.
      Решить, какой оставить.
- [ ] **`react-countdown-circle-timer`** больше не используется нигде — убрать из зависимостей.
- [ ] **event-sales:** неиспользуемые `@dnd-kit/*`, `react-colorful` в `package.json`.
- [ ] **`eslint` не установлен** в `packages/april-ui` и `packages/ws` — `turbo lint`
      по ним падает/не запускается. Либо добавить зависимость, либо явно исключить.
- [ ] **`App.tsx` в kpi-service нигде не смонтирован** — мёртвый файл с закомментированным
      хвостом на 80 строк.

---

## Верификация

```bash
pnpm typecheck                      # turbo, задача заведена
cd apps/<app> && pnpm lint && npx next build --no-lint
```

Инварианты после Ф3–Ф4 (в чек-лист скилла):

```bash
# в приложениях не должно остаться ручной сборки композиций
grep -rn "components/card'\|components/dialog'" apps --include=*.tsx | grep -v node_modules

# ноль хардкода цветов
grep -rn "bg-white\|text-gray-\|bg-gray-" apps --include=*.tsx | grep -v node_modules

# легаси выпилено
grep -rn "EVCard\|ACard\|SimpleCard\|AModal\|ASelect" apps packages | grep -v node_modules

# theme-пакетов больше нет
grep -rn "@workspace/theme\|@workspace/april-theme" apps packages | grep -v node_modules
```

Визуально после каждой миграции: 3–4 темы × light/dark × `data-scale` compact/xl,
плюс `document.documentElement.dataset.glass = 'off'` — стеклянные поверхности
обязаны становиться обычными, а не прозрачными.
