'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { assignPlanTo } from '../../model/HeadModeThunk';
import {
    selectHeadModeActive,
    selectPlanAssigneeOptions,
    selectPlanResponsible,
    selectTaskOwnerId,
} from '../../model/selectors';

/** Выбор «кому дело» в плане — только руководителю с включённым режимом. */
export const usePlanAssignee = () => {
    const dispatch = useAppDispatch();
    const isAvailable = useAppSelector(selectHeadModeActive);
    const options = useAppSelector(selectPlanAssigneeOptions);
    const responsible = useAppSelector(selectPlanResponsible);
    const isActing = useAppSelector(state => selectTaskOwnerId(state) !== null);

    const assign = useCallback(
        (value: string) => {
            dispatch(assignPlanTo(Number(value)));
        },
        [dispatch],
    );

    return {
        isAvailable,
        options,
        value: responsible ? String(responsible.ID) : undefined,
        /** Открыто дело сотрудника — себе его записать нельзя. */
        isActing,
        assign,
    };
};
