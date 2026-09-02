export enum CheckPresentationFieldType {
    STRING = 'string',
    BOOLEAN = 'boolean',
    DATE = 'date',
    ENUMERATION = 'enumeration',
}

/** Значение ответа по полю; массив — для enumeration с isMultiple. */
export type CheckPresentationValue = string | boolean | string[];

export interface CheckPresentationOption {
    id: string;
    code: string;
    title: string;
}

export interface CheckPresentationItem {
    id: string;
    type: CheckPresentationFieldType;
    code: string;
    title: string;
    placeholder: string;
    required: boolean;
    isMultiple?: boolean;
    options?: CheckPresentationOption[];
    order?: number;
    /**
     * Подвопросы блока «5К»/«Хвост» (переделка 02.09.2026).
     *
     * Блок — это Вопрос с несколькими подвопросами и ОДНИМ полем в CRM.
     * Подвопросы показываются тултипом на заголовке и плейсхолдером
     * пустого поля, а «развернуть подробно» делает каждый отдельным полем.
     * Шаблон вопросов в само значение больше не сеется (решение 01.09
     * отменено): поле открывается пустым, и «заполнено» снова значит
     * «менеджер что-то написал».
     */
    questions?: string[];
}
