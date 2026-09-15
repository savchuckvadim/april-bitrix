'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    aiAnalyticsActions,
    buildAiCallTypeOptions,
    isAiCallTypeSelection,
} from '@/modules/entities/ai-analytics';

/**
 * Подвкладка разбора по типам звонков: опции из карты алфавитов портала
 * (settings.callTypes), выбор персистится в ui-settings blob (ключ ai).
 */
export const useAiCallType = () => {
    const dispatch = useAppDispatch();
    const callTypes = useAppSelector(
        state => state.aiAnalytics.settings.data?.callTypes,
    );
    const selected = useAppSelector(
        state => state.aiAnalytics.selectedCallType,
    );

    const options = useMemo(
        () => buildAiCallTypeOptions(callTypes ?? []),
        [callTypes],
    );

    const select = (value: string) => {
        if (isAiCallTypeSelection(value)) {
            dispatch(aiAnalyticsActions.setSelectedCallType(value));
        }
    };

    return { options, selected, select };
};
