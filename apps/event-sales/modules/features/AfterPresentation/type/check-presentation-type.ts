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
}
