/**
 * Deal-field model, ported off the removed `@alfa/entities` package.
 *
 * These are intentionally loose, deal-specific shapes (a bitrix field carrying a
 * `bitrixId` used to index `IBXDeal`, plus an optional select `list`). They are
 * close to `@workspace/pbx-data`'s `PbxFieldEntity`, but NOT drop-in compatible
 * (pbx uses `items`/number ids and has no `value`), so they live here locally.
 */

export interface TFieldItem {
    bitrixId: string | number;
    name?: string;
    code?: string;
    sort?: string | number;
    value?: string | number;
}

export interface TField {
    code: string;
    name?: string;
    title?: string;
    /** Bitrix user-field id (e.g. `UF_CRM_...`), used to index the deal. */
    bitrixId: string;
    type: string;
}

export interface TFieldSelect extends TField {
    type: 'enumeration';
    list: TFieldItem[];
}

export type IDealField = TFieldSelect | TField;

export type IDealFieldsData = IDealField & {
    value: string | string[] | number | number[] | boolean | TFieldItem | TFieldItem[];
};

/** A single seminar participant's set of fields. */
export type TParticipantData = Record<string, TField | TFieldSelect>;

/** Full deal-field configuration keyed by field code (+ a `participants` group). */
export type TDealData = Record<string, TField | TFieldSelect | unknown>;
