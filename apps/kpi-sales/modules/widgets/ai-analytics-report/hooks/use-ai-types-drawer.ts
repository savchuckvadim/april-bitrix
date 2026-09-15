'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    AI_LAYOUT_OPTIONS,
    aiAnalyticsActions,
    isAiByTypeLayout,
    isAiCallTypeSelection,
} from '@/modules/entities/ai-analytics';
import { useAiCallType } from './use-ai-call-type';

/**
 * Второй уровень «Разбор по типам»: открытие (в т.ч. по ссылке карточки
 * «Внимание» с типом), подвкладки типов из карты алфавитов, раскладка
 * wide | long. Сам запрос by-type делает listener сущности по изменениям
 * (open / тип / раскладка).
 */
export const useAiTypesDrawer = () => {
    const dispatch = useAppDispatch();
    const open = useAppSelector(state => state.aiAnalytics.typesDrawerOpen);
    const layout = useAppSelector(state => state.aiAnalytics.typesLayout);
    const callType = useAiCallType();

    const setOpen = useCallback(
        (value: boolean) =>
            dispatch(aiAnalyticsActions.setTypesDrawerOpen(value)),
        [dispatch],
    );

    const openWithType = useCallback(
        (type?: string) => {
            if (type && isAiCallTypeSelection(type)) {
                dispatch(aiAnalyticsActions.setSelectedCallType(type));
            }
            dispatch(aiAnalyticsActions.setTypesDrawerOpen(true));
        },
        [dispatch],
    );

    const setLayout = (value: string) => {
        if (isAiByTypeLayout(value))
            dispatch(aiAnalyticsActions.setTypesLayout(value));
    };

    return {
        open,
        setOpen,
        openWithType,
        layout,
        layoutOptions: AI_LAYOUT_OPTIONS,
        setLayout,
        ...callType,
    };
};
