'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    contractDocumentActions,
    selectContractForm,
    selectContractFormStatus,
    selectContractSpecification,
} from '@/modules/entities/contract-document';
import { useSpecificationView } from './use-specification-view';

/**
 * Спецификация живого договора: основные строки, суммы общей формы и
 * подробности по разделам — инфоблоки, энциклопедии решений, Legal Tech.
 * Форма запрашивается заново на каждом входе на экран, отдельная кнопка
 * пересборки не нужна.
 */
export const useContractSpecification = () => {
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectContractFormStatus);
    const error = useAppSelector(state => state.contractDocument.formError);
    const specification = useAppSelector(selectContractSpecification);
    const contractForm = useAppSelector(selectContractForm);

    return useSpecificationView({
        status,
        error,
        specification,
        contractForm,
        onChange: (code, value) => dispatch(contractDocumentActions.setSpecificationValue({ code, value })),
    });
};
