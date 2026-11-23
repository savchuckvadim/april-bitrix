'use client';

import { useCallback } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { hasComplectSections } from '../../../../document-payload';
import { OFFER_COMPLECTS_MODE_OPTIONS } from '../../../model/types';
import { useOfferPdfSettingsForm } from './use-offer-pdf-settings-form';

/**
 * Выбор способа печати наполнения: виден, когда в общем наборе два и больше
 * комплекта с наполнением, то есть есть что печатать по комплектам.
 */
export const useComplectsModeField = () => {
    const { settings, setSetting } = useOfferPdfSettingsForm();
    const visible = useAppSelector(state => hasComplectSections(state.rowSet.general));

    const select = useCallback(
        (value: string) => {
            // значение из чипов сверяем с вариантами: приведение типа не нужно
            const option = OFFER_COMPLECTS_MODE_OPTIONS.find(item => item.value === value);
            if (option) setSetting('complectsMode', option.value);
        },
        [setSetting],
    );

    return { visible, value: settings.complectsMode, options: OFFER_COMPLECTS_MODE_OPTIONS, select };
};
