'use client';

import { useEffect } from 'react';
import { Bitrix, watchSmallFrameHeight } from '@workspace/bitrix';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { isSmallFramePlacement } from '@/modules/app/lib/utills/placement-util';

/**
 * Вкладка карточки CRM: фрейм на всю ширину блока и высотой с окно
 * браузера, при изменении окна — заново (как в конструкторе). Скролл у
 * приложения свой, под контент фрейм не растягиваем.
 */
export const useSmallFrameFit = () => {
    const placement = useAppSelector(s => s.app.bitrix.placement);
    const initialized = useAppSelector(s => s.app.initialized);
    const isSmall = isSmallFramePlacement(placement);

    useEffect(() => {
        if (!initialized || !isSmall) return;
        return watchSmallFrameHeight(Bitrix.getService().api);
    }, [initialized, isSmall]);
};
