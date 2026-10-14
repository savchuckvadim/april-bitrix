'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { fetchDigest } from '@/modules/entities/digest';

/**
 * Загрузка дайджеста: запрос уходит при смене дня или выборки сотрудников
 * (thunk-гард не даёт дублей по requestKey), «Пересчитать» — forceRefresh.
 */
export const useDigestReport = () => {
    const dispatch = useAppDispatch();
    const { status, data, error, date } = useAppSelector(state => state.digest);
    const domain = useAppSelector(state => state.app.domain);
    const departmentStatus = useAppSelector(state => state.department.status);
    const currentUsers = useAppSelector(state => state.department.current);
    const allUsers = useAppSelector(state => state.department.items);

    const idsKey = useMemo(
        () =>
            (currentUsers.length ? currentUsers : allUsers)
                .map(user => Number(user.ID))
                .sort((a, b) => a - b)
                .join('_'),
        [currentUsers, allUsers],
    );

    useEffect(() => {
        if (domain && departmentStatus === 'ready' && date && idsKey) {
            dispatch(fetchDigest());
        }
    }, [dispatch, domain, departmentStatus, date, idsKey]);

    const refresh = useCallback(
        () => dispatch(fetchDigest({ forceRefresh: true })),
        [dispatch],
    );

    return {
        status,
        data,
        error,
        refresh,
        isLoading: status === 'loading' || status === 'idle',
        isQueued: status === 'queued',
        isError: status === 'error',
    };
};
