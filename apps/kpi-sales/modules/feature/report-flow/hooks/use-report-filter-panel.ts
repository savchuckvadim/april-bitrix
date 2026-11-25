'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    closeFilterDraft,
    openFilterDraft,
} from '../model/filter-draft/report-filter-draft.thunks';

/**
 * Открытость панели фильтров отчёта. Открытие делает снимок действующего
 * фильтра в черновик, закрытие без «Применить» черновик выбрасывает.
 */
export const useReportFilterPanel = () => {
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(state => state.reportFilterDraft.isOpen);

    const setOpen = useCallback(
        (open: boolean) => {
            dispatch(open ? openFilterDraft() : closeFilterDraft());
        },
        [dispatch],
    );

    return { isOpen, setOpen };
};
