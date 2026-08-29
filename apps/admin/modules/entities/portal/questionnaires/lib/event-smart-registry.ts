import type {
    PortalQuestionnaireCondition,
    QuestionnaireConditionKindCode,
    QuestionnairePortalSmart,
} from '../model';
import { QUESTIONNAIRE_CODE } from '../model';

/**
 * Связь «тип события → смарт» — единственная часть реестра бэка, которой
 * нет в `GET /questionnaires/schema`.
 *
 * Оригинал:
 * back/libs/portal-lib/pbx/event-type-registry/event-type-registry.ts
 * (поле `smart` строк реестра) и `isQuestionnaireReachableForSmartKind` из
 * back/libs/portal-lib/store/questionnaires/portal-questionnaires.schema.ts.
 *
 * Почему зеркало, а не реестр с бэка: `/schema` отдаёт справочники условий
 * без пометки о смарте, а `/questionnaire-fields/sources` — смарты портала
 * без потока события. Без этой таблицы редактор не может ни объяснить
 * владельцу, поля какого смарта ему доступны, ни повторить проверку
 * достижимости ДО отправки — оставалось бы отправлять его в 400.
 *
 * Что здесь НЕ повторяется: коды, подписи и порядок типов события. Они
 * по-прежнему приходят из `/schema`, а строки смартов портала — из
 * `GET /api/admin/pbx/smarts` (`smarts.type` / `smarts.group`). Зеркало
 * держит ровно связь между ними.
 *
 * Когда бэк начнёт отдавать поток события в реестре условий или в
 * `/questionnaire-fields/sources`, файл удаляется целиком, а вызовы
 * переезжают на ответ бэка.
 */

/** Смарт, элемент которого ведёт поток типа события. */
export interface QuestionnaireSmartBinding {
    /** `smarts.type` строки смарта портала. */
    smartType: string;
    /** `smarts.group` строки смарта портала. */
    smartGroup: string;
    /** `kind` смарта — им бэк называет поток события. */
    kind: string;
    /**
     * Коды типов события, элемент которых заводит этот поток. Ровно их
     * бэк перечисляет в отказе «анкета не привязана к типу события смарта».
     */
    eventTypes: readonly string[];
}

/**
 * Смарты, которые ведут потоки событий. Появился смарт на новый тип
 * события — на бэке правится одна строка реестра, здесь одна строка этой
 * таблицы.
 */
export const QUESTIONNAIRE_SMART_BINDINGS: readonly QuestionnaireSmartBinding[] =
    [
        {
            smartType: 'pres',
            smartGroup: 'sales',
            kind: 'presentation',
            eventTypes: ['presentation'],
        },
        {
            smartType: 'zpr',
            smartGroup: 'sales',
            kind: 'zpr',
            eventTypes: ['hot'],
        },
    ];

/**
 * Виды условий, которые и есть «тип события».
 *
 * Остальные виды реестра (целевая стадия, статус работы, «всегда») к типу
 * события отношения не имеют: анкета с ними сработает на любом типе, и
 * строки в матрице у неё быть не может. Достижимости смарта они тоже не
 * дают — исключение ровно одно, `presentationDone` (см. ниже).
 */
export const QUESTIONNAIRE_EVENT_TYPE_KINDS: readonly QuestionnaireConditionKindCode[] =
    [
        QUESTIONNAIRE_CODE.conditionKind.planType,
        QUESTIONNAIRE_CODE.conditionKind.reportType,
    ];

/** Смарт по строке `smarts` портала; `undefined` — потока события нет. */
export const findSmartBindingByTypeGroup = (
    type: string,
    group: string,
): QuestionnaireSmartBinding | undefined =>
    QUESTIONNAIRE_SMART_BINDINGS.find(
        binding => binding.smartType === type && binding.smartGroup === group,
    );

/** Смарт типа события; `undefined` — у типа события смарта нет. */
export const findSmartBindingByEventType = (
    eventType: string,
): QuestionnaireSmartBinding | undefined =>
    QUESTIONNAIRE_SMART_BINDINGS.find(binding =>
        binding.eventTypes.includes(eventType),
    );

/** Смарт портала по его строке `smarts`; `null` — смарта нет в списке. */
export const findPortalSmart = (
    smarts: QuestionnairePortalSmart[] | undefined,
    smartId: number | null | undefined,
): QuestionnairePortalSmart | null => {
    if (smartId === null || smartId === undefined) return null;
    return smarts?.find(smart => smart.id === smartId) ?? null;
};

/**
 * Доберётся ли ответ до элемента этого смарта.
 *
 * Правило бэка дословно: анкета обязана быть привязана к типу события,
 * элемент которого заводит поток смарта. Годится условие по типу
 * планируемого или отчётного события — либо «Презентация проведена»:
 * это спонтанная презентация, тип задачи там обычный звонок, а элемент
 * создаётся презентационный.
 *
 * Анкета, которой это условие не поставили, показалась бы там, где
 * элемент не рождается: ответ собрали бы, а положить его было бы некуда.
 */
export const isQuestionnaireReachableForSmart = (
    conditions: PortalQuestionnaireCondition[] | undefined,
    binding: QuestionnaireSmartBinding,
): boolean => {
    if (binding.eventTypes.length === 0) return false;

    for (const condition of conditions ?? []) {
        if (
            condition.kind ===
                QUESTIONNAIRE_CODE.conditionKind.presentationDone &&
            binding.eventTypes.includes('presentation')
        ) {
            return true;
        }
        if (!QUESTIONNAIRE_EVENT_TYPE_KINDS.includes(condition.kind)) continue;

        const values = condition.values ?? [];
        if (values.some(value => binding.eventTypes.includes(value))) {
            return true;
        }
    }
    return false;
};
