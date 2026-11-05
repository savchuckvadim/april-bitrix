'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useApp } from '@/modules/app/lib/hooks/app';
import { useClientType } from '@/modules/entities/deal/lib/hooks/use-client-type';
import { bxrqActions } from '../../model/BxRqSlice';
import { blurCase, saveBXRQ } from '../../model/BxRqThunk';
import { filterFieldItems, isFieldsEmpty } from '../field-items-util';
import { getBankCommentValue } from '../get-bank-comment-value-util';
import { getRqFillPercent } from '../rq-util';

/**
 * Карточка «Основная информация»: поля текущего реквизита под тип клиента,
 * черновик правки (модалка) и сохранение. Текущий реквизит может быть
 * шаблоном (bx_id -1): тогда карточка предлагает заполнить его.
 */
export const useBaseCard = () => {
    const dispatch = useAppDispatch();
    const { domain, companyId } = useApp();
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
        creating: state.creating.base,
        isSaving: state.isCreatingLoading,
        isLoading: state.isLoading,
        saveError: state.errors?.save ?? null,
        simpleBankComment: state.creating.simpleBankComment,
        isSimpleBankCommentMode: state.settings.isSimpleBankCommentMode,
        bankComment,
        startEdit: () => {
            dispatch(bxrqActions.setSimpleBankComment({ value: bankComment }));
            dispatch(bxrqActions.initBaseCreating({ currentClientType: clientType }));
        },
        cancel: () => dispatch(bxrqActions.cancelBaseCreating()),
        save: () => dispatch(saveBXRQ(domain, companyId, clientType)),
        setField: (code: string, value: string) =>
            dispatch(bxrqActions.setBaseProp({ code, value })),
        blurField: (code: string, value: string) => dispatch(blurCase(code, value)),
        setSimpleBankComment: (value: string) =>
            dispatch(bxrqActions.setSimpleBankComment({ value })),
    };
};
