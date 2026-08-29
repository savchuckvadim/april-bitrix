/**
 * Портальный каталог анкет: состав вопросов плана и отчёта задаётся в
 * админке из полей, заведённых на портале руками, и приезжает во фрейм с
 * бэка (`GET /api/questionnaires`).
 *
 * Раскладка слайса:
 * - `lib/api/questionnaire-helper.ts` — единственное место, знающее транспорт;
 * - `lib/questionnaire-normalize.ts` — DTO → доменный тип с отсевом
 *   неисполнимого («нераспознанное не показываем»);
 * - `lib/questionnaire-wait.ts` — ожидание с дедлайном (fail-open);
 * - `lib/answer-key.ts` — ключ ответа `код анкеты:код вопроса` (его строят и
 *   движок чек-листов, и сборка payload отправки);
 * - `lib/questionnaire-disabled.ts` — рубильник «анкеты выключены для типов
 *   события» (настройка портала), правило дословно как на бэке;
 * - `data/fallback-catalog.ts` — встроенный набор на случай, когда каталога
 *   нет: он же основной сценарий, пока миграция не накатана;
 * - `model/*` — слайс, thunk, селекторы, типы.
 *
 * Загружает каталог листенер на `appActions.setAppData`
 * (`ensureQuestionnaireCatalog` — самая ранняя точка, где известен домен);
 * состав перечитывается только при смене портала или расхождении хэша,
 * поэтому ⟳ лишнего запроса не даёт. Отправку каталог не задерживает:
 * политика ожидания — `processes/event/lib/questionnaire-gate.ts`.
 *
 * Действующий состав отдаёт `selectQuestionnaireDefs`: портальные анкеты
 * ПЛЮС встроенные наборы, которых портал не замещал (`legacyChecklistId`
 * или совпадение кодов) — иначе первая портальная анкета отменила бы шесть
 * работающих наборов, а замещённый набор задвоил бы вопросы.
 *
 * UI у слайса нет: вопросы рисует движок чек-листов.
 */
export * from './model';
export * from './model/QuestionnaireCatalogSlice';
export * from './model/QuestionnaireCatalogThunk';
export * from './model/selectors';
export { FALLBACK_CATALOG } from './data/fallback-catalog';
export {
    normalizeQuestionnaireCatalog,
    type QuestionnaireNormalizeResult,
} from './lib/questionnaire-normalize';
export { waitForQuestionnaireCatalog } from './lib/questionnaire-wait';
export { answerKey } from './lib/answer-key';
export {
    isQuestionnaireDisabledByEventTypes,
    parseQuestionnaireDisabledEventTypes,
} from './lib/questionnaire-disabled';
export { QuestionnaireHelper } from './lib/api/questionnaire-helper';
