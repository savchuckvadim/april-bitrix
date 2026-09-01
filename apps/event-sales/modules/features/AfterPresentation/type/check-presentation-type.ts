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
     * Текст, которым поле открывается: пронумерованные подвопросы.
     *
     * Не плейсхолдер, а настоящее значение — решение владельца 01.09.2026:
     * вопросы должны уехать в CRM вместе с ответами, чтобы их видел и тот,
     * кто открыл карточку мимо приложения. Отсюда же следует, что «поле
     * пустое» больше не значит «не отвечали»: нетронутый шаблон отсеивает
     * isSurveyTemplateOnly из пакета флоу.
     *
     * Нет шаблона — позиция обычная (сводный «Хвост», даты, галочки).
     */
    template?: string;
}
