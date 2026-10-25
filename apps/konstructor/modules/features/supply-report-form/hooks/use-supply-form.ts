'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    fetchSupplyForm,
    pickSupplyFile,
    selectItemToValue,
    selectSupplyFiles,
    selectSupplyFormStatus,
    selectSupplyItems,
    setSupplyValue,
    supplyFormScope,
    visibleSupplyItems,
    type SupplyFormItem,
} from '@/modules/entities/supply-report-document';

/** Форма отчёта о поставке: видимые поля по области, значения, файлы. */
export const useSupplyForm = () => {
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectSupplyFormStatus);
    const error = useAppSelector(state => state.supplyReport.formError);
    const items = useAppSelector(selectSupplyItems);
    const files = useAppSelector(selectSupplyFiles);
    const scope = useAppSelector(supplyFormScope);

    const visible = useMemo(() => (scope ? visibleSupplyItems(items, scope) : []), [items, scope]);

    return {
        isLoading: status === 'loading' || status === 'idle',
        error: status === 'error' ? error : null,
        items: visible,
        files,
        setText: (code: string, value: string) => dispatch(setSupplyValue(code, value)),
        setSelect: (item: SupplyFormItem, optionCode: string) => {
            const option = item.items?.find(candidate => candidate.code === optionCode) ?? null;
            dispatch(setSupplyValue(item.code, selectItemToValue(option)));
        },
        pickFile: (code: string, file: File | null) => void dispatch(pickSupplyFile(code, file)),
        reload: () => void dispatch(fetchSupplyForm()),
    };
};
