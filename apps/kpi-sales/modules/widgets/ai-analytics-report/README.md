# widgets/ai-analytics-report — вкладка «AI аналитика»

Композиция вкладки (грузится лениво из `report-view/blocks/lazy`). Данные и
логика — в `entities/ai-analytics`; здесь только хуки-адаптеры и вёрстка.

## Экран

`ui/AiAnalyticsReport.tsx` → `AiTabHeader` (Уровни · Пересчитать · Обновить)
→ `AiReadinessBanner` → `AiPulseCard` → `AiAttentionList` → `AiAgendaCard`
→ `AiSignalTable` → `AiTypesDrawer` (второй уровень) → `AiLevelsDialog`.
В kpi-only вместо секций с оценками — `components/AiKpiOnlyNote`.

- **Внимание** (`AiAttentionList` + `components/AiAttentionCard`): ≤ 7
  карточек, `ToneBadge` сигнала с `HintTooltip «Основание»` из `basis`,
  «полезно / не полезно» (`feedback` object `attention:<managerId>:<signal>`),
  переход к менеджеру (ссылка на user-report) и к типу (открывает drawer).
- **Таблица сигналов** (`AiSignalTable` + `components/AiSignal*`, `AiKeyMetricCell`,
  `AiBucketCell`, `AiPlanCell`, `AiLevelBadge`, `AiDisagreeButton`): группировка
  по отделам/группам структуры (`useAiOverviewGroups`), ключевая цифра —
  `LiquidProgress`, при `confidence none` — бэйдж «мало данных (n = …)»,
  «Не согласен» (`AiDisagreeButton`) → popover с необязательной причиной
  (≤ 300 символов, счётчик) и «Отправить» → `feedback disagree`
  (`overview:<managerId>`, `reason`); логика — `use-ai-disagree`,
  обрезка/нормализация причины — `ai-feedback.util` сущности.
- **Разбор по типам** (`AiTypesDrawer`, `GlassDialog`): `MicroSegmented` —
  «Все» первой, типы из `settings.callTypes`, «Возражения» последней;
  раскладка широкий / длинный; `AiScoreTable` (wide, строки `AiScoreRow`),
  `AiLongTable` (long, строки `AiLongRow`), `AiObjectionsTable`. При «Все»
  (`callType = all`) бэк отдаёт строку на пару менеджер × тип: таблицы
  группируют строки по менеджеру (`groupAiRowsByManager`, имя один раз),
  показывают колонку «Тип» (`AiCallTypeBadge`) и вместо итога по типу
  (`AiScoreTotals`) — блок «Итоги по типам» из `totalsByType`
  (`AiTypeTotalsList`: тип | n | оценка). В «Все» пары менеджер × тип и
  чипы типов без звонков за период (n = 0, в т. ч. other / irrelevant)
  отсеиваются (`applyAiByTypeVisibility` + `pickAiByTypeVisible*` в lib
  сущности), под таблицей — подпись «Типы без звонков за период скрыты»;
  при обычном типе строки с n = 0 остаются. Выбор персистится в ui-settings
  blob (`ai.selectedCallType`, `ai.typesLayout`).
- **Уровни** (`AiLevelsDialog`, только `AI_CONFIGURE`): форма по строкам
  обзора → `settings/save`; после успеха listener перечитывает обзор с
  `forceRefresh`.

## Состояния тяжёлых секций — `components/AiQueuedState`

`idle/loading` — `Spinner` + текст («в очереди» / «сервер считает») и
`MicroSkeleton`; `error` — `Alert` с сообщением и «Повторить» (force).

## Хуки (`hooks/`)

`use-ai-analytics-report` (mount-загрузка, Обновить/Пересчитать, диалог уровней),
`use-ai-section` (секция + retry), `use-ai-overview-groups`, `use-ai-types-drawer`,
`use-ai-levels-form`, `use-ai-feedback`, `use-ai-disagree`, `use-ai-call-type`,
`use-ai-call-type-badge`, `use-ai-manager-name`, `use-ai-manager-link`.

## Известные ограничения

- `RTable` из april-ui рисует только числовые ячейки — таблицы вкладки
  собраны на shadcn `Table` в той же `Card`-обёртке, что и `RTable`.
- Ссылок на транскрипции по `transcriptionId` (опорные звонки, риск-звонки)
  бэк пока не отдаёт — показываем id.
