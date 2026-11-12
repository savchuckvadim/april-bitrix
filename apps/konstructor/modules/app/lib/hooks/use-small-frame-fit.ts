'use client';

import { useEffect } from 'react';
import { Bitrix, watchSmallFrameHeight } from '@workspace/bitrix';
import { useAppSelector } from './redux';
import { selectAppInitialized, selectIsSmallDisplay } from '../../model/selectors';

/**
 * Вкладка карточки (маленький экран): фрейм на всю ширину блока и высотой с
 * окно браузера, при изменении окна — заново. Страницу Битрикса не
 * подкручиваем (почему — см. small-frame.util в @workspace/bitrix).
 */
export const useSmallFrameFit = () => {
    const isSmall = useAppSelector(selectIsSmallDisplay);
    const initialized = useAppSelector(selectAppInitialized);

    useEffect(() => {
        if (!initialized || !isSmall) return;
        return watchSmallFrameHeight(Bitrix.getService().api);
    }, [initialized, isSmall]);
};
