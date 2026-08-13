'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { ensureBitrixUsers } from '../../model/BitrixUserThunk';

/**
 * Догрузить имена сотрудников, встреченных на экране.
 *
 * Ключ по отсортированным id, а не по массиву: список приходит новым объектом
 * на каждый рендер ленты, и без этого эффект бегал бы кругами.
 */
export const useEnsureUsers = (userIds: Array<number | null | undefined>) => {
    const dispatch = useAppDispatch();
    const key = [...new Set(userIds.filter(Boolean))].sort().join(',');

    useEffect(() => {
        if (!key) return;
        dispatch(ensureBitrixUsers(key.split(',').map(Number)));
    }, [dispatch, key]);
};
