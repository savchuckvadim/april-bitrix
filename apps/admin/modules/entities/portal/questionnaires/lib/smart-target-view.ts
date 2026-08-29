import type {
    PortalQuestionnaireCondition,
    PortalQuestionnaireSchema,
    QuestionnairePortalSmart,
} from '../model';
import {
    QUESTIONNAIRE_EVENT_TYPE_KINDS,
    findPortalSmart,
    findSmartBindingByTypeGroup,
    isQuestionnaireReachableForSmart,
} from './event-smart-registry';

/**
 * Куда уедет ответ смарт-вопроса — и уедет ли вообще.
 *
 * Здесь повторена цепочка, которую бэк проходит на сохранении
 * (`requireEventSmart` в PortalQuestionnairesService): смарт принадлежит
 * порталу → у смарта есть поток события → анкета привязана к типу события
 * этого потока. Формулировки взяты дословно: владелец не должен читать в
 * админке одно, а в отказе сохранения другое.
 *
 * Разбор нужен в двух местах и потому живёт отдельно: пикер гасит по нему
 * поля недостижимого смарта ДО выбора, а проверка черновика — повторяет
 * его перед сохранением, когда владелец успел снять условие показа.
 */

/** Название типа события из реестра: код владельцу ничего не говорит. */
const eventTypeNames = (
    schema: PortalQuestionnaireSchema | undefined,
    codes: readonly string[],
): string[] =>
    codes.map(code => {
        for (const kind of schema?.conditions ?? []) {
            if (!QUESTIONNAIRE_EVENT_TYPE_KINDS.includes(kind.kind)) continue;
            const value = kind.values.find(option => option.code === code);
            if (value) return value.name;
        }
        return code;
    });

/** Смарт-носитель глазами анкеты. */
export interface QuestionnaireSmartTarget {
    /** Строка `smarts` портала; `null` — смарта в списке портала нет. */
    smart: QuestionnairePortalSmart | null;
    /** Почему ответу до элемента не добраться; `null` — доберётся. */
    blockReason: string | null;
    /** Куда уедет ответ, когда всё сходится; `null` — говорить нечего. */
    hint: string | null;
}

/**
 * Разбор смарт-носителя.
 *
 * `smarts === undefined` означает «список смартов портала ещё не
 * прочитан»: молчать в этот момент нельзя — поля показались бы
 * выбираемыми, а разрешение на них никто не проверял.
 */
export const describeSmartTarget = (
    smartId: number | null | undefined,
    smarts: QuestionnairePortalSmart[] | undefined,
    conditions: PortalQuestionnaireCondition[] | undefined,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireSmartTarget => {
    if (smartId === null || smartId === undefined) {
        return {
            smart: null,
            blockReason:
                'Не указан смарт, из которого выбрано поле (smartId из ' +
                'GET /questionnaire-fields/sources) — без него неизвестно, ' +
                'в элемент какого смарта писать ответ',
            hint: null,
        };
    }

    const smart = findPortalSmart(smarts, smartId);
    if (!smart) {
        return {
            smart: null,
            blockReason:
                smarts === undefined
                    ? 'Смарты портала ещё не прочитаны — какой поток ' +
                      'события ведёт элементы этого смарта, пока неизвестно'
                    : `Смарт ${smartId} не установлен на этом портале`,
            hint: null,
        };
    }

    const binding = findSmartBindingByTypeGroup(smart.type, smart.group);
    if (!binding) {
        return {
            smart,
            blockReason:
                `У смарта «${smart.title}» нет потока события, который ` +
                'создавал бы элемент, — ответ было бы некуда писать',
            hint: null,
        };
    }

    const names = eventTypeNames(schema, binding.eventTypes);
    if (!isQuestionnaireReachableForSmart(conditions, binding)) {
        return {
            smart,
            blockReason:
                `Анкета не привязана к типу события смарта «${smart.title}»` +
                ' — элемент, в который уехал бы ответ, просто не создаётся. ' +
                'Добавьте условие показа по типу планируемого или отчётного ' +
                `события (${names.join(', ')})` +
                (binding.eventTypes.includes('presentation')
                    ? ' либо условие «Презентация проведена»'
                    : ''),
            hint: null,
        };
    }

    return {
        smart,
        blockReason: null,
        hint:
            `Ответ уедет в элемент смарта «${smart.title}»: его создаёт ` +
            `поток события ${names.join(', ')}. Сущность-носитель выбирать ` +
            'не нужно — вопрос адресуется этим смартом.',
    };
};
