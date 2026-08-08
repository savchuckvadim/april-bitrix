'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { fetchLeadMarks } from '../../model/LeadMarksThunk';

/**
 * Догружает пометки переданных лидов (crm.lead.list с UF-полями).
 * Ключ-строка вместо массива: массив пересоздаётся каждый рендер и
 * зациклил бы эффект.
 */
export const useLeadMarks = (leadIds: number[]): void => {
    const dispatch = useAppDispatch();
    const key = [...new Set(leadIds)].sort().join(',');

    useEffect(() => {
        if (key) dispatch(fetchLeadMarks(key.split(',').map(Number)));
    }, [dispatch, key]);
};
