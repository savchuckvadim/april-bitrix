import { EvsRqItem } from '../type/evs-rq-type';
import { BANK_RQ_ITEM_CODE } from '../type/input-type';

export const getBankCommentValue = (rq: EvsRqItem | null | undefined): string => {
    if (!rq?.bank) return '';
    const bankItem = rq.bank.current || rq.bank.items?.[0];
    const commentField = bankItem?.fields?.find(
        field => field.code === BANK_RQ_ITEM_CODE.BANK_COMMENTS,
    );
    if (!commentField) return '';
    return typeof commentField.value === 'string' ? commentField.value : '';
};
