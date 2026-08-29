import type {
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSchema,
} from '../model';
import { QUESTIONNAIRE_CODE, pickQuestionnaireCode } from '../model';
import { uniqueItemCode } from './build-item-from-field';

/** Код-основа для пункта, у которого поля ещё нет. */
const BASE_CODE = 'comment';

/**
 * Пункт без поля: ответ уходит в комментарий события.
 *
 * Нужен для честного случая «поля пока нет»: владелец хочет собирать ответ
 * уже сегодня, а поле в CRM заведёт потом. Такой ответ никуда, кроме
 * комментария события, не пишется — зато он не теряется и виден в истории.
 *
 * Тип отображения берётся первым из реестра, а не зашитым кодом: канал
 * «Комментарий события» матрицей полей не ограничен, и владелец меняет тип
 * прямо на карточке.
 */
export const buildCommentItem = (
    schema: PortalQuestionnaireSchema | undefined,
    takenCodes: Iterable<string> = [],
): PortalQuestionnaireItemSave => ({
    code: uniqueItemCode(BASE_CODE, takenCodes),
    title: '',
    placeholder: null,
    hint: null,
    groupTitle: null,
    control:
        pickQuestionnaireCode(
            QUESTIONNAIRE_CODE.control,
            schema?.controls[0]?.code,
        ) ?? QUESTIONNAIRE_CODE.control.string,
    isMultiple: false,
    isRequired: false,
    requireChange: false,
    staleAfterDays: null,
    channel: QUESTIONNAIRE_CODE.channel.text,
    targetMode: QUESTIONNAIRE_CODE.targetMode.auto,
    targetEntity: null,
    dtoPath: null,
    isNative: false,
    fieldName: null,
    fieldBitrixId: null,
    fieldXmlId: null,
    fieldCode: null,
    fieldType: null,
    fieldStatus: QUESTIONNAIRE_CODE.fieldStatus.ok,
    meta: {},
    isActive: true,
    options: [],
});
