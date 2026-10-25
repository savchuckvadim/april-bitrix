# Конструктор — маршруты, экраны, каркас (2026-10-23)

Карта экранов нового конструктора и раскладка папок под неё. Легаси-флоу
(redux-«роутер» `ROUTE.GLOBAL → KONSTRUCTOR → PRODUCTS → DOCUMENT`, без шапки
и степпера) перенесён на нативные маршруты Next. Redux маршрут не хранит.

## 1. Сценарии

**Новая сделка** (слепка нет):

```
/start ── Избранное ──▶ /favorites ──загрузить──┐
       ── Акции ──────▶ /promotions ──загрузить─┤
       ── Создать ────▶ /params ▶ /complect ▶ /prices ▶ /document ▶ /document/<вид>
                                                         ▲
                                     (загрузка = как существующая сделка)
```

**Существующая сделка** (слепок восстановлен):

```
есть варианты КП ──▶ /variants ── открыть вариант ──▶ /document
                               ── создать новый ────▶ /start
вариантов нет ─────────────────────────────────────▶ /document
```

`/document` — хаб сделки и одновременно шаг 4 новой сборки (решение владельца
23.10, «пока так»): сводка комплекта с переходами «Комплект» и «Цены», ниже
плитки КП / Договор / Отчёт о поставке. Разделить на два экрана — заменить
один маршрут.

## 2. Маршруты

| URL | Экран | Где лежит |
| --- | --- | --- |
| `/` | вход: решает, куда вести (EntryGate) | `processes/konstructor` |
| `/start` | Избранное · Акции · Создать | `widgets/start-screen` |
| `/favorites` | избранное: своё / отдела / портала, загрузить → `/document` | `widgets/library-screen` (`entities/library`) |
| `/promotions` | акции портала и April, загрузить → `/document` | `widgets/library-screen` (`entities/library`) |
| `/variants` | варианты КП сделки | `widgets/variant-picker` |
| `/params` | шаг 1: регион · линейка · доступ | `widgets/build-params` |
| `/complect` | шаг 2: комплект + наполнение (инфоблоки, ЭР, LT, доп. пакеты LT-other, консалтинг/СТАР/академия); в итоге — «Описание комплекта» (DOCX) | `widgets/complect-builder`, `features/complect-description` |
| `/prices` | шаг 3: цены, товары, сравнение | `widgets/price-table` |
| `/prices` (сервисный отдел) | в шапке — период «Текущий / Следующий»: второй ведёт слепок со смартом service_offer, сохранение пишет поля и строки в элемент смарта (deal-send target) | `features/service-period` |
| `/document` | шаг 4 / хаб: выбор документа | `widgets/document-hub` |
| `/document/[kind]` | шаг 5: `offer` → `widgets/offer-document-screen` (КП: шаблон, получатель, счёт, PDF-превью, «Сформировать» → generate-multi → редирект в сделку); `contract` → `widgets/contract-document-screen` (поля сделки, реквизиты, спецификация с бэка, contract/generate); `supply-report` → `widgets/supply-report-screen` (поля сделки и поставки, форма для отдела сервиса, контакты, generate-document + init-supply/RPA) | `widgets/document-screen` |
| `/settings` | шаблоны документов (Word) | `entities/offer-template-word` |
| `/requisites` | реквизиты | `pages/bx-rq` |
| `/offer/**` | не используется, **не удалять** (решение владельца) | как было |

Шапка (`widgets/app-shell`) есть на всех экранах группы `(shell)`; степпер
шагов, цвет комплекта и саммари шага с переходом «Далее / Назад» — у процесса
(`processes/konstructor`: `FlowLayout`, `FlowSummary`), только в группе
`(flow)`. Порядок шагов знает только процесс — экраны соседей не считают.

**Раскладка шага (24.10, как в легаси Konstructor):** основная колонка слева,
саммари справа (`shared/ui/Screen/ScreenSplit`) — итог сборки
(`features/build-summary`) и главная кнопка. Саммари липнет под степпером:
список наполнения может уходить далеко вниз, итог и переход остаются на месте.
Ширина рабочих экранов — до `max-w-screen-2xl`.

**Шапка — родственная «Звонкам» (event-sales), на тех же компонентах:**
`@workspace/april-ui/entity` (`EntityTitle`, `EntityLinkText`,
`ProspectScaleBar` + `buildProspectScaleView`, `InnChip`) и
`@workspace/april-ui/fields` (`ChipSelect`). «Звонки» переведены на них 1:1.
Данные конструктора — `entities/client-card` (поля компании по pbx-коду через
слепок портала; ссылки на CRM — `getCrmUrl` из `@workspace/bitrix`, общий с
«Звонками»). Прогноз и статус правятся из шапки (`updateClientChoice`,
оптимистично с откатом); ИНН пока только показывается — редактор ИНН живёт в
«Звонках» (`features/Inn`), перенос в общий слой — отдельная задача.

**Наполнение по категориям:** группы каталога (+ Legal Tech) сворачиваются,
свёрнутая категория показывает только отмеченное
(`features/composition-editor`, `composition-sections.util.ts`). Редактор
работает с ПЕРЕДАННОЙ строкой (глобальный «выбранный ряд» больше не нужен):
- шаг «Комплект» — панель для главной строки; комплекты — узкой полосой чипов
  (`ChoiceChips` из `april-ui/fields`, на узком экране — один селект),
  экран во всю ширину фрейма;
- шаг «Цены» — у каждого Гаранта своё наполнение: кнопка «Наполнение» в
  карточке товара открывает окно (`RowCompositionButton` →
  `CompositionEditorDialog`). Колонка карточек держит ширину 64rem
  (`ScreenSplit mainWidth="content"`) — карточки не расползаются.

```
app/
  layout.tsx            html · ThemeInitScript · BootPreloader · Providers · App-гейт
  (shell)/
    layout.tsx          AppShell (шапка: компания · сделка · прогноз · статус · ИНН · действия)
    page.tsx            /  → EntryGate
    (entry)/            start · favorites · promotions · variants
    (flow)/
      layout.tsx        FlowNav (Параметры · Комплект · Цены · Документ)
      params · complect · prices · document · document/[kind]
    settings · requisites
  offer/**  dev/**  api/**
```

## 3. Где что живёт

- **Справочник маршрутов** — `processes/konstructor/lib/routes.ts`: коды,
  пути, шаги степпера, виды документов. Строковых путей в коде больше нет —
  только через него и через `useKonstructorNavigation()`.
- **Решение на входе** — чистая функция `resolveEntryTarget`
  (`processes/konstructor/lib/entry-route.util.ts`, покрыта тестом). Ждёт
  restore слепка, портал и, если на портале есть смарт вариантов, их список.
  Заменила `SnapshotNavWatcher`, который силой уводил с любого экрана на
  `/products`.
- **Варианты КП грузятся слушателем**, а не эффектом панели: портал готов ×
  `dealId` есть → `fetchComplectVariants`
  (`start-store-listeners.ts`).
- **Дизайн-система.** Тема — `@workspace/theme` (вместо `april-theme`),
  загрузка — один экран `BootPreloader` + `BootPreloaderGate`. Новые
  переиспользуемые куски — в `@workspace/april-ui`: `StepNav`
  (`./navigation`), `ActionTile` (`./actions`), `EmptyState`
  (`./feedback`). Карточки — `SectionCard`. Колонка и заголовок экрана —
  `shared/ui/Screen` (`Screen`, `ScreenHeader`, `ScreenSplit`).
- **Главная строка собирается в одном месте** —
  `row-set/lib/row/rebuild-row-refs.util.ts` (`buildMainRowWithRefs`,
  `MAIN_ROW_KEY`); параметры шага 1 → рефы — `resolveRefsForBuildParams`
  в матрице совместимости каталога.
- **«Создать» не сбрасывает сборку**: для новой сделки она пуста, для нового
  варианта служит отправной точкой. Открытый вариант при «Новый вариант»
  закрывается, чтобы сохранение не легло поверх него.

## 4. Что осталось (по экранам)

- [x] `/favorites`, `/promotions` — библиотека заготовок
      (`GET/POST/PATCH/DELETE /api/konstructor/deal/library`, одна таблица
      `bx_document_deals`, `kind` favorite|promotion, `visibility`
      user|department|portal|global). «В избранное» — в шапке цен; загрузка
      → `restoreSnapshotRecord` → `/document`. Акции `global` заводит админка
      April (экран админки — отдельная задача).
- [ ] `/document/offer` — экран КП по шаблону (опции документа, превью,
      «Сформировать»); `/document/contract`, `/document/supply-report` —
      перенос легаси `DocumentContract` / `DocumentSupplyReport`.
- [ ] `/prices` — перевести шапку таблицы с сырых `<select>` на
      `@workspace/ui` Select (виджет старше дизайн-системы).
- [ ] Варианты КП: «Сохранить как вариант» пока живёт панелью на `/prices`.
- [ ] Редактор ИНН в шапке: вынести `features/Inn` «Звонков» (валидация,
      склад кандидатов) в общий слой и подключить в конструкторе.
