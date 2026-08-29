import type { QuestionnaireCondition } from '../model/questionnaire.type';

/**
 * Выключатель «анкеты для типов события выключены» — настройка портала
 * `questionnaires_disabled_event_types` (реестр настроек бэка, ключ
 * `questionnairesDisabledEventTypes`).
 *
 * Правило считают ОБА конца, и оно обязано быть одним. Бэк считает его,
 * чтобы ответ старого фрейма не уехал в элемент смарта
 * (build-questionnaire-smart-answers), фрейм — чтобы погашенная анкета не
 * показалась вовсе. Пока фрейм его не знал, выключатель работал наполовину:
 * анкета оставалась на экране, обязательный вопрос по-прежнему запирал
 * отправку, ответы канала `crm` уезжали прямо в компанию/сделку/лид, а
 * ответы канала `smart` бэк молча выбрасывал — менеджер отвечал в пустоту.
 *
 * Оригинал правила:
 * back/libs/portal-lib/store/questionnaires/portal-questionnaires.schema.ts
 * (`isQuestionnaireDisabledByEventTypes`).
 */

/** Условия по ТИПУ СОБЫТИЯ: каждое такое условие — самостоятельный шлагбаум. */
const EVENT_TYPE_CONDITION_KINDS: readonly QuestionnaireCondition['kind'][] = [
    'planType',
    'reportType',
];

/**
 * Значение выключателя (CSV кодов типов события) → список кодов.
 *
 * Тип входа шире, чем обещает конфиг: то же значение доезжает из
 * браузерного кэша настроек прошлого запуска, где ключа могло не быть
 * вовсе.
 *
 * Коды по реестру НЕ сверяются (в отличие от бэка, где реестр под рукой):
 * незнакомый код совпадёт разве что с таким же незнакомым значением
 * условия, а условие с неизвестным типом события и без выключателя не
 * срабатывает никогда. Тащить сюда копию реестра ради этого — значит
 * завести второй список, который разойдётся с бэковым.
 */
export const parseQuestionnaireDisabledEventTypes = (
    raw: string | null | undefined,
): string[] => {
    if (typeof raw !== 'string') return [];
    const codes = raw
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
    return [...new Set(codes)];
};

/**
 * Погашена ли анкета выключателем.
 *
 * Правило следует из И-семантики условий: анкета погашена, если хотя бы
 * один её шлагбаум по типу события целиком состоит из выключенных типов —
 * пройти его больше нечем. Анкета без условий по типу события
 * (`workStatus`, `targetStage`, `always`) выключателем не трогается: он
 * гасит анкеты ТИПА СОБЫТИЯ, а не всё подряд.
 *
 * `presentationDone` — это спонтанная презентация: тип задачи там обычный
 * звонок, но элемент создаётся презентационный, поэтому гасит его код
 * `presentation`.
 */
export const isQuestionnaireDisabledByEventTypes = (
    conditions: readonly QuestionnaireCondition[],
    disabledEventTypes: readonly string[],
): boolean => {
    if (disabledEventTypes.length === 0) return false;
    const disabled = new Set(disabledEventTypes);

    for (const condition of conditions) {
        if (condition.kind === 'presentationDone') {
            if (disabled.has('presentation')) return true;
            continue;
        }
        if (!EVENT_TYPE_CONDITION_KINDS.includes(condition.kind)) continue;

        // Пустой список значений — это не «все типы», а сломанное условие:
        // его судьбу решает нормализатор, гасить тут нечего.
        if (condition.values.length === 0) continue;
        if (condition.values.every(value => disabled.has(value))) return true;
    }
    return false;
};
