'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getUserAirtime } from '../../model/airtime-thunks';
import type { AirtimeUserRow } from '../../model';

export interface UserAirtimeData {
    status: string;
    row: AirtimeUserRow | undefined;
}

/**
 * Эфирное время конкретного менеджера: грузит user-airtime при готовом
 * периоде и достаёт его строку из результата. Логика для AirtimeUserCard.
 */
export const useUserAirtime = (userId: number): UserAirtimeData => {
    const dispatch = useAppDispatch();
    const initialized = useAppSelector(state => state.app.initialized);
    const from = useAppSelector(state => state.report.date.from);
    const to = useAppSelector(state => state.report.date.to);
    const { status, data } = useAppSelector(state => state.airtime.user);

    useEffect(() => {
        if (initialized && from && to) {
            dispatch(getUserAirtime(userId));
        }
    }, [dispatch, initialized, userId, from, to]);

    return {
        status,
        row: data?.users.find(item => Number(item.user.ID) === userId),
    };
};
