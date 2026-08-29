import type {
    PortalQuestionnaire,
    PortalQuestionnaireItem,
    QuestionnaireCheckDiff,
    QuestionnaireCheckItem,
    QuestionnaireCheckResponse,
    QuestionnairePortalSmart,
} from '../model';

/**
 * Слепок сохранённой анкеты — ТОЛЬКО для тестов.
 *
 * Повторяет ответ `GET /questionnaires/:id`: вопрос канала «Поле CRM» в
 * режиме «Автоматически», у которого `fieldSource` бэком не отдаётся —
 * именно этот случай и разбирают проверки списка. Приложение фикстуру не
 * импортирует.
 */

/** Вопрос анкеты как он приходит из БД. */
export const questionnaireItem = (
    patch: Partial<PortalQuestionnaireItem> = {},
): PortalQuestionnaireItem => ({
    id: 'item-1',
    code: 'decision_date',
    title: 'Когда решение',
    placeholder: null,
    hint: null,
    groupTitle: null,
    sort: 10,
    control: 'date',
    isMultiple: false,
    isRequired: false,
    requireChange: false,
    staleAfterDays: null,
    channel: 'crm',
    targetMode: 'auto',
    targetEntity: null,
    dtoPath: null,
    isNative: false,
    fieldName: 'UF_CRM_DECISION_DATE',
    fieldBitrixId: 1234,
    fieldXmlId: null,
    fieldCode: null,
    fieldType: 'date',
    // Адрес смарта есть только у канала «Поле элемента смарта»: у вопроса
    // канала CRM бэк отдаёт обе колонки пустыми.
    smartId: null,
    smartEntityTypeId: null,
    fieldStatus: 'ok',
    fieldCheckedAt: null,
    meta: {},
    isActive: true,
    options: [],
    ...patch,
});

/**
 * Строка `smarts` портала.
 *
 * По умолчанию — смарт презентаций: пара `pres`/`sales` есть в реестре
 * «тип события → смарт», и его элемент заводит поток события
 * «Презентация». Смарт без потока задаётся патчем `type`.
 */
export const portalSmart = (
    patch: Partial<QuestionnairePortalSmart> = {},
): QuestionnairePortalSmart => ({
    id: 7,
    type: 'pres',
    group: 'sales',
    title: 'Презентации',
    ...patch,
});

/** Анкета целиком как она приходит из БД. */
export const questionnaire = (
    patch: Partial<PortalQuestionnaire> = {},
): PortalQuestionnaire => ({
    id: 'q-1',
    portalId: 42,
    domain: 'demo.bitrix24.ru',
    appCode: 'event-sales',
    code: 'plan_basics',
    title: 'Что узнать до звонка',
    hint: null,
    purpose: 'plan',
    presentation: 'inline',
    place: 'plan',
    persist: 'onChange',
    conditions: [{ kind: 'planType', values: ['warm'] }],
    configKey: null,
    legacyChecklistId: null,
    isActive: true,
    sort: 500,
    version: 4,
    updatedBy: null,
    updatedAt: null,
    items: [questionnaireItem()],
    ...patch,
});

/**
 * Разбор расхождений одного вопроса. По умолчанию пустой: сверка нашла
 * поле и ничего в нём не разошлось — именно этот случай должен оставлять
 * панель «В Битриксе изменилось» невидимой.
 */
export const questionnaireCheckDiff = (
    patch: Partial<QuestionnaireCheckDiff> = {},
): QuestionnaireCheckDiff => ({
    title: null,
    newOptions: [],
    renamedOptions: [],
    lostOptions: [],
    ...patch,
});

/** Строка отчёта сверки по одному вопросу. */
export const questionnaireCheckItem = (
    patch: Partial<QuestionnaireCheckItem> = {},
): QuestionnaireCheckItem => ({
    itemId: 'item-1',
    itemCode: 'decision_date',
    fieldName: 'UF_CRM_DECISION_DATE',
    status: 'ok',
    changed: false,
    deactivatedOptions: 0,
    diff: null,
    ...patch,
});

/**
 * Ответ `POST /questionnaires/:id/check`.
 *
 * Анкета в ответе — та же, что вернуло бы чтение: из неё берутся
 * формулировки вопросов, поэтому в составе два вопроса, и второй —
 * список: расхождения по вариантам разбираются только у него.
 */
export const questionnaireCheckResponse = (
    patch: Partial<QuestionnaireCheckResponse> = {},
): QuestionnaireCheckResponse => ({
    questionnaire: questionnaire({
        items: [
            questionnaireItem(),
            questionnaireItem({
                id: 'item-2',
                code: 'decision',
                title: 'Что решили',
                control: 'enumeration',
                fieldName: 'UF_CRM_DECISION',
                fieldType: 'enumeration',
            }),
        ],
    }),
    items: [questionnaireCheckItem()],
    degraded: false,
    ...patch,
});
