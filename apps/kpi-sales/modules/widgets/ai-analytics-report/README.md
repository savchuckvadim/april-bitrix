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

## Матрицы KPI-вида (28.09.2026): `AiTypesMatrixBlock`, `AiSectionsMatrixBlock`

Два блока после таблицы сигналов, в обёртке `ReportBlockWrapper` (как блоки
KPI-отчёта) и на секции `typesMatrix` сущности (срез «все типы × wide» в
периметре глобального фильтра: период + выбранные менеджеры; очередь + WS,
общий источник — `hooks/use-ai-types-matrix-source`). Таблицы — `RTable`
april-ui (`components/AiMatrixTable`, аннотации-подстроки «↳ оценка 6,4» /
«↳ мало данных»), вкладки Сводный / По отделам / По группам — `ReportGroupTabs`,
рейтинги — `components/AiMatrixRatingFooter`: победители по счётчикам
(`EntityRatingChart` фичи report-rating) и по оценке
(`components/AiScoreRatingChart` — взвешенное по n среднее
`weightedAiScoreRating` сущности, ось 0..10, скрыт при < 2 сущностях с
оценкой; оценки никогда не суммируются). CSV — `exportTableToCSV` поверх
`buildAiMatrixCsvTable` (колонки оценок рядом со счётчиками).

- **«AI: типы звонков»** (`hooks/use-ai-types-matrix`): менеджер × тип
  (разборов + оценка типа) и хвост продаж «Продажи, шт. / Аванс, ₽ / Мес. чек, ₽»;
  чипы-фильтр типов (`components/AiTypesFilterChips`, localStorage
  `ai-types-matrix-hidden`, коды через запятую) — скрытые типы исключены из
  таблицы, итогов, CSV и рейтингов; под сводной таблицей — «Итоги по типам»
  (`AiTypeTotalsList` по видимым типам).
- **«AI: разделы оценки по типу»** (`hooks/use-ai-sections-matrix`):
  `MicroSegmented` по типам со звонками за период (localStorage
  `ai-sections-matrix-type`, протухший выбор → первый тип), менеджер × разделы
  рубрики типа (оценённых звонков + средняя) и сводная колонка «Все разборы».
- Чистая логика вида — `lib/ai-types-matrix-view.util.ts` (чипы, менеджеры со
  звонками, итоги, выбор типа, показатели графиков) и
  `lib/ai-score-rating-chart.util.ts` (график оценок); тесты в `lib/__tests__/`.
  Импорты сущности в утилитах точечные (model / lib) — баррел тянет UI.

## Состояния тяжёлых секций — `components/AiQueuedState`

`idle/loading` — `Spinner` + текст («в очереди» / «сервер считает») и
`MicroSkeleton`; `error` — `Alert` с сообщением и «Повторить» (force).

## Хуки (`hooks/`)

`use-ai-analytics-report` (mount-загрузка, Обновить/Пересчитать, диалог уровней),
`use-ai-section` (секция + retry), `use-ai-overview-groups`, `use-ai-types-drawer`,
`use-ai-types-matrix-source` / `use-ai-types-matrix` / `use-ai-sections-matrix`
(матрицы KPI-вида),
`use-ai-levels-form`, `use-ai-feedback`, `use-ai-disagree`, `use-ai-call-type`,
`use-ai-call-type-badge`, `use-ai-manager-name`, `use-ai-manager-link`.

## Известные ограничения

- `RTable` из april-ui рисует только числовые ячейки — таблицы вкладки
  собраны на shadcn `Table` в той же `Card`-обёртке, что и `RTable`.
- Ссылок на транскрипции опорных звонков по `transcriptionId` бэк пока не
  отдаёт. У риск-звонков таблицы сигналов ссылка на карточку разбора есть
  (`riskCalls[].link`).

## Волна D (22.09.2026): новые секции и диалоги

- `AiBriefCard` — итоги периода (очередь + WS `ai-analytics:brief:done|error`, «Пересобрать» руководителю); состав карточки — см. «Итоги периода: вторая версия» ниже.
- `AiRopMarkCard` — слепая оценка: три звонка недели, форма метки (`AiRopMarkForm`), сохранённая метка с раскрытой оценкой AI (`AiRopMarkSaved`); только руководителям, ссылки на разборы из `link`.
- `AiDailyPlanCard` — план дня по менеджеру и дате (гейт `dailyPlanEnabled`), цель, прогресс, таблица активностей, объяснение и блок «только руководителю».
- `AiStyleDialog` — стиль менеджера (кнопка «Стиль» в строке таблицы сигналов): оси, подписи, заметки few_data/opt_out/stale.
- `AiHowWeCountDialog` + `AiHowWeCountButton({ endpoint })` — «Как считаем» для overview (шапка вкладки), brief, plan/daily, manager/style.
- `AiLevelsDialog` — теперь диалог настроек витрины с вкладками «Уровни», «Цели по уровням», «Отсутствия», «Состав» (`initialTab`; баннер готовности открывает «Состав» через `onConfirmRoster`), подтверждение breaksSeries, сводка после сохранения.
- `AiReadinessBanner` — русские подписи причин, подсказки «что делать», счётчик β (`formatBetaCountdown`).
- `AiSectionState` / `AiQueuedState` — текст сервера и подсказки для 403 (`lib/ai-section-error.util.ts`), «Повторить».
- Таблица сигналов: колонка «Рычаги» (`AiSignalLeversCell`), риск-звонки (`AiSignalRiskCalls`), стаж `since`, чипы стиля; «Не согласен» с причиной и комментарием.
- «Внимание»: ссылки «открыть разбор» по `link.calls` (бэк подставляет по transcriptionIds).
- Чистая логика — `lib/*.util.ts`, тесты в `lib/__tests__/` и `__tests__/` (vitest, node).

## Отзыв владельца по «Пульсу» и ссылки на теорию (28.09.2026)

- Сигналы пульса (`components/AiPulseAlertsList` + `AiPulseAlertRow`):
  `MicroSegmented` «Не отработано (N) / Все (M)» (по умолчанию —
  неотработанные, пока они есть), свёрнуто 5 строк, «Показать все N /
  Свернуть» (локальное состояние, при смене фильтра не сбрасывается);
  в строке — подсказка бэйджа «что значит / что сделать», строка «Что
  сделать: …», ссылка «Открыть разбор» либо «разбор ещё не создан»,
  подсказка у «Отработано». Логика — `ai-pulse-list.util` сущности.
- «Внимание»: подсказка бэйджа — смысл сигнала, «Что сделать», основание;
  строка «Что сделать» под заголовком карточки (`AI_SIGNAL.action`).
- Ссылки на сайт теории (`lib/ai-theory-link.ts`, `components/AiTheoryLink`):
  база `NEXT_PUBLIC_AI_THEORY_BASE_URL` (по умолчанию боевой сайт), тема →
  страница#якорь; иконка в шапках карточек и диалогов, текст в подвале
  «Как считаем» (`AI_ABOUT_THEORY_TOPIC`), над матрицами KPI-вида и в
  пунктах чек-листа (`AI_CHECKLIST_ITEM_THEORY`).
- Разделы рубрики — из `ai-call-sections.data` сущности: рычаги — полные
  названия, метка руководителя — короткие (`AI_ROP_MARK_SECTIONS`).

## Итоги периода: вторая версия и ссылки риск-звонков (28.09.2026)

Отзыв владельца о карточке резюме: «непонятно, для чего нужна и какую
ценность даёт» — она пересказывала итоговые числа и показывала служебные
строки. Теперь карточка отвечает на три вопроса.

- `AiBriefCard` — заголовок «Итоги периода: что изменилось и что сделать»;
  подпись — период и «в сравнении с 01.07–31.07» либо «сравнения с прошлым
  периодом пока нет» (`comparable` / `previousPeriod`).
- `AiBriefHeadline` — главный вывод одной фразой и бэйдж тона.
- `AiBriefBullets` → `AiBriefGroupSection` → `AiBriefBulletRow` +
  `AiBriefBulletMeta` — три группы по полю `group` пункта (не по месту в
  списке): «Что изменилось» (слово «больше / меньше / без изменений» по
  знаку `delta`, нейтральный цвет), «На кого смотреть» (имя менеджера,
  тип звонка, «Открыть разбор»), «Что сделать на неделе» (список дел).
  Пустая группа не показывается; пункт без группы (итоги, собранные
  раньше) и с незнакомой группой — в «Что изменилось».
- `AiBriefMeta` — «собрано <дата>» (стоимость подготовки — в подсказке) и
  причина шаблона, только когда итоги собраны по шаблону. Строк «факты»,
  «источник», расхода и версии на карточке нет.
- `AiSignalRiskCalls` → `AiSignalRiskCallRow` — вид сигнала, время и
  ссылка «разбор» (`AiCardLink`, новая вкладка); сервер ответил, что
  карточки нет (`link: null`), — «разбор ещё не создан»; поля нет совсем
  (обзор сохранён до появления ссылок) — только вид и время, про разбор
  ничего не утверждаем. Свёрнуто три звонка, «ещё N» раскрывает,
  «свернуть» возвращает.
- В группе «На кого смотреть» имя менеджера стоит над текстом, поэтому
  чипа менеджера под текстом нет (`showsAiBriefManagerChip`), и пустая
  строка под пунктом не рисуется.
- Ошибка карточки итогов без понятной причины от сервера — «Не удалось
  собрать итоги периода» (`AiQueuedState`, свойство `errorFallback`), а
  не текст про обзор.
- Логика — `lib/ai-brief-view.util.ts` (группы, подпись, слово изменения),
  `lib/ai-brief.util.ts` (тон, причина шаблона, стоимость),
  `lib/ai-risk-calls.util.ts`, `lib/ai-card-link.util.ts` (ссылкой считаем
  только адрес страницы); тесты — `lib/__tests__/ai-brief-view.util.test.ts`,
  `ai-brief.util.test.ts`, `ai-risk-calls.util.test.ts`.
