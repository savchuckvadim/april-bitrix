'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';
import { toUserOptions } from '@/modules/features/Departament/lib/user-options';
// Прямые пути: барель режима руководителя тянет UI.
import { selectIsSuperUser } from '@/modules/features/HeadMode/model/selectors';
import { userFullName } from '@/modules/features/HeadMode/lib/head-mode.util';
import {
    startImpersonation,
    stopImpersonation,
} from '../../model/ImpersonationThunk';
import { selectImpersonationTarget } from '../../model/selectors';

export type ImpersonationStatus = 'idle' | 'working' | 'error';

/**
 * «Работать как» для шапки: кнопка с выбором сотрудника и полоса режима.
 *
 * `onSwitched` — что сделать после смены пользователя (шапка уводит на
 * список дел: открытое дело принадлежало прежнему пользователю).
 */
export const useImpersonation = (onSwitched?: () => void) => {
    const dispatch = useAppDispatch();
    const isSuperUser = useAppSelector(selectIsSuperUser);
    const target = useAppSelector(selectImpersonationTarget);
    const users = useAppSelector(selectAllDepartmentUsers);
    const myId = useAppSelector(state => Number(state.app.bitrix.user?.ID));

    const [userId, setUserId] = useState('');
    const [status, setStatus] = useState<ImpersonationStatus>('idle');

    const candidates = useMemo(
        () => toUserOptions(users, [myId]),
        [users, myId],
    );

    const reset = useCallback(() => {
        setUserId('');
        setStatus('idle');
    }, []);

    /** true — режим включён, окно можно закрыть. */
    const start = useCallback(async (): Promise<boolean> => {
        setStatus('working');
        const ok = await dispatch(startImpersonation(Number(userId)));
        setStatus(ok ? 'idle' : 'error');
        if (ok) onSwitched?.();
        return ok;
    }, [dispatch, userId, onSwitched]);

    const stop = useCallback(async () => {
        await dispatch(stopImpersonation());
        onSwitched?.();
    }, [dispatch, onSwitched]);

    return {
        /** Кнопка — суперпользователю, пока режим не включён. */
        canStart: isSuperUser && !target,
        /** Имя сотрудника, от имени которого идёт работа; '' — режима нет. */
        targetName: target ? userFullName(target) : '',
        candidates,
        userId,
        setUserId,
        status,
        reset,
        start,
        stop,
    };
};
