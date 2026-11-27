'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useClientType } from '@/modules/entities/deal/lib/hooks/use-client-type';
import { bxrqActions } from '../../model/BxRqSlice';
import { filterFieldItems, isFieldsEmpty } from '../field-items-util';
import { getBankCommentValue } from '../get-bank-comment-value-util';
import { getRqFillPercent } from '../rq-util';

/**
 * Карточка «Основная информация»: поля текущего реквизита под тип клиента и
 * запуск правки. Текущий реквизит может быть шаблоном (bx_id -1): тогда
 * карточка предлагает заполнить его. Черновик, окно и сохранение живут в
 * `useDraftModals`.
 */
export const useBaseCard = () => {
    const dispatch = useAppDispatch();
    const { resolved: clientType } = useClientType();
    const state = useAppSelector(s => s.bxrq);
    const current = state.current.item;
    const fields = current ? filterFieldItems(current.fields, clientType) : [];
    const bankComment = getBankCommentValue(current);

    return {
        fields,
        isEmpty: isFieldsEmpty(fields),
        isTemplate: !current || current.bx_id <= 0,
        percent: getRqFillPercent(current, clientType).base,
        isSaving: state.isCreatingLoading,
        isLoading: state.isLoading,
        isSimpleBankCommentMode: state.settings.isSimpleBankCommentMode,
        bankComment,
        startEdit: () => {
            dispatch(bxrqActions.setSimpleBankComment({ value: bankComment }));
            dispatch(bxrqActions.initBaseCreating({ currentClientType: clientType }));
        },
    };
};
