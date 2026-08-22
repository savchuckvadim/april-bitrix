'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { fetchPresentationDeals } from '@/modules/entities/EventSale';

/**
 * Презентационные сделки для строки «Продажа» — подгружаются по факту выбора
 * статуса, а не на буте: список нужен единицам отчётов, а запрос к порталу
 * стоит денег и времени.
 */
export const usePresentationDeals = (enabled: boolean) => {
    const dispatch = useAppDispatch();
    const presDeals = useAppSelector(s => s.eventSale.presDeals);

    useEffect(() => {
        if (enabled) dispatch(fetchPresentationDeals());
    }, [enabled, dispatch]);

    return presDeals;
};
