export interface IBaseTemplate {
    id: number;
    letter: string;
}

export interface IResponseBaseTemplate {
    id: number;
    code: 'offer' | string;
    fields: IBaseTemplateField[];
}

interface IBaseTemplateField {
    code: 'letter' | string;
    description: string;
}
