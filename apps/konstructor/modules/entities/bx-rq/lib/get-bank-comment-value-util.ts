import { BANK_RQ_ITEM_CODE, type RqRecord } from '../model/types';

/** «Прочие реквизиты» — комментарий текущего банка (режим простого ввода). */
export const getBankCommentValue = (rq: RqRecord | null | undefined): string => {
    if (!rq?.bank) return '';
    const bankItem = rq.bank.current ?? rq.bank.items?.[0];
    const commentField = bankItem?.fields?.find(
        field => field.code === BANK_RQ_ITEM_CODE.BANK_COMMENTS,
    );
    return commentField && typeof commentField.value === 'string'
        ? commentField.value
        : '';
};
