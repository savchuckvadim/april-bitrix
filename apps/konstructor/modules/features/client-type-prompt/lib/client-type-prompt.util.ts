import type { RQ_TYPE } from '@/modules/entities/bx-rq/model/types';

/** Текст в окне, когда запись типа клиента в компанию не удалась. */
export const CLIENT_TYPE_SAVE_ERROR =
    'Не удалось записать тип клиента в Битрикс. Попробуйте ещё раз или выберите «Позже».';

export interface ClientTypeDetectReadyInput {
    /** Компания сделки известна: запись типа клиента идёт в неё. */
    hasCompany: boolean;
    /** Слепок портала загружен: по нему находится поле и пункты. */
    portalLoaded: boolean;
    /** Реквизиты компании запрошены и ответ (или ошибка) пришёл. */
    rqSettled: boolean;
}

/** Всё нужное для автоопределения и вопроса о типе клиента загружено. */
export const isClientTypeDetectReady = (
    input: ClientTypeDetectReadyInput,
): boolean => input.hasCompany && input.portalLoaded && input.rqSettled;

export interface ClientTypePromptInput {
    /** Данные загружены и автоопределение по реквизитам отработало. */
    detectDone: boolean;
    /** Менеджер нажал «Позже». */
    deferred: boolean;
    /** Поле «Тип клиента» есть у компании на портале. */
    hasField: boolean;
    /** Тип клиента, заданный в компании или сделке; null — неизвестен. */
    clientType: RQ_TYPE | null;
}

/**
 * Окно «Укажите тип клиента» нужно, когда всё загружено, тип по-прежнему
 * неизвестен, поле есть на портале (иначе писать некуда) и менеджер не
 * отложил вопрос.
 */
export const isClientTypePromptVisible = (
    input: ClientTypePromptInput,
): boolean =>
    input.detectDone &&
    !input.deferred &&
    input.hasField &&
    input.clientType === null;
