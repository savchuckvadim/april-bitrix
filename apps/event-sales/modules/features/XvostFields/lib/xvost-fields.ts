import { PBX_SALES_EVENT_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';

/**
 * Хвост-поля сделки (опросник после презентации) — данные и преобразования,
 * без UI.
 *
 * Штатно эти поля пишет CheckPresentation после проведённой презентации;
 * ручная карточка в модалке «Поля сущности» — для исключений (презентацию
 * закрыли мимо опросника, договорённость изменилась задним числом). Коды —
 * из реестра pbx-data; по владельческой таблице install (todo2508) весь
 * блок стоит ТОЛЬКО на сделке, поэтому и запись deal-only.
 */

export const XVOST_DATE_FIELDS = [
    {
        code: PBX_SALES_EVENT_FIELD_CODES.op_xvost_decision_call_date,
        label: 'Дата звонка по решению',
    },
    {
        code: PBX_SALES_EVENT_FIELD_CODES.op_xvost_decision_date_agreement,
        label: 'Согласование даты по решению',
    },
    {
        code: PBX_SALES_EVENT_FIELD_CODES.op_manager_approach_date,
        label: 'Дата похода к руководителю',
    },
] as const;

export const XVOST_FLAG_FIELDS = [
    {
        code: PBX_SALES_EVENT_FIELD_CODES.op_xvost_is_offer,
        label: 'Предложено КП',
    },
    {
        code: PBX_SALES_EVENT_FIELD_CODES.op_xvost_is_complect,
        label: 'Озвучено наполнение',
    },
    {
        code: PBX_SALES_EVENT_FIELD_CODES.op_xvost_is_price,
        label: 'Озвучена цена',
    },
] as const;

export type XvostDateCode = (typeof XVOST_DATE_FIELDS)[number]['code'];
export type XvostFlagCode = (typeof XVOST_FLAG_FIELDS)[number]['code'];
export type XvostFieldCode = XvostDateCode | XvostFlagCode;

/** `YYYY-MM-DD` для `<input type=date>` из того, что отдал портал. */
export const toInputDate = (raw: unknown): string => {
    if (typeof raw !== 'string' || !raw.trim()) return '';
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const crm = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    if (crm) return `${crm[3]}-${crm[2]}-${crm[1]}`;
    return '';
};

/**
 * Boolean-UF читается из CRM как `'1'/'0'`, а опросник пишет `'Y'/'N'` —
 * принимаем оба диалекта (плюс честные boolean/number).
 */
const TRUTHY_FLAGS = new Set(['1', 'y', 'true']);

export const toFlag = (raw: unknown): boolean =>
    TRUTHY_FLAGS.has(String(raw ?? '').trim().toLowerCase());

/** В том же диалекте, что персист опросника (`check-presentation.persist`). */
export const flagToPortalValue = (value: boolean): string =>
    value ? 'Y' : 'N';

/**
 * Портальное значение ручной правки → значение ответа опросника
 * (id вопроса = код поля): флаги в опроснике живут boolean'ом, даты —
 * той же строкой `YYYY-MM-DD`. Нужен для синхронизации ручной записи в
 * стор опросника, чтобы повторный submit не откатывал правку.
 */
export const xvostToAnswerValue = (
    code: XvostFieldCode,
    portalValue: string,
): string | boolean =>
    XVOST_FLAG_FIELDS.some(field => field.code === code)
        ? toFlag(portalValue)
        : portalValue;
