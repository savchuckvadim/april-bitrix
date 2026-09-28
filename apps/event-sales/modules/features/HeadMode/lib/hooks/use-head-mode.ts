'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { switchHeadMode } from '../../model/HeadModeThunk';
import {
    selectActingEmployee,
    selectHeadModeEnabled,
    selectIsHead,
} from '../../model/selectors';
import { userFullName } from '../head-mode.util';

/** Состояние режима руководителя для шапки: тумблер и полоса. */
export const useHeadMode = () => {
    const dispatch = useAppDispatch();
    const isHead = useAppSelector(selectIsHead);
    const enabled = useAppSelector(selectHeadModeEnabled);
    const employee = useAppSelector(selectActingEmployee);

    const toggle = useCallback(
        (next: boolean) => {
            dispatch(switchHeadMode(next));
        },
        [dispatch],
    );

    return {
        /** Тумблер показывается только тому, у кого есть сотрудники. */
        isHead,
        enabled,
        toggle,
        /** Имя сотрудника, за которого идёт работа; '' — работа за себя. */
        employeeName: employee ? userFullName(employee) : '',
    };
};
