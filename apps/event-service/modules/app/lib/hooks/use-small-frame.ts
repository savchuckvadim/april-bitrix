'use client';

import { useEffect } from 'react';
import {
    Bitrix,
    isDetailTabPlacement,
    watchSmallFrameHeight,
} from '@workspace/bitrix';
import { useAppSelector } from './redux';

/**
 * Вкладка карточки CRM («маленький экран»): фрейм на всю ширину блока и
 * высотой с окно браузера, скролл внутри приложения, скруглённая рамка —
 * как в конструкторе и event-sales. Возвращает, включён ли этот режим.
 */
export const useSmallFrame = (): boolean => {
    const placement = useAppSelector(state => state.app.bitrix.placement);
    const initialized = useAppSelector(state => state.app.initialized);
    const isSmall = isDetailTabPlacement(placement?.placement);

    useEffect(() => {
        if (!initialized || !isSmall) return;
        return watchSmallFrameHeight(Bitrix.getService().api);
    }, [initialized, isSmall]);

    return isSmall;
};
