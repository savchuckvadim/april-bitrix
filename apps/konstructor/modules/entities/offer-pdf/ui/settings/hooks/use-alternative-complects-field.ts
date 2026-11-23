'use client';

import { useCallback } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { hasAlternativeComplects } from '../../../../document-payload';
import { ALTERNATIVE_COMPLECTS_FIELD } from '../../../lib/offer-pdf-alternative-complects';
import { useOfferPdfSettingsForm } from './use-offer-pdf-settings-form';

/**
 * Переключатель наполнения наборов для сравнения: виден, когда в сделке есть
 * набор для сравнения с наполнением, то есть есть что печатать. Скрытый
 * переключатель настройку не стирает: она вернётся вместе с такими наборами.
 */
export const useAlternativeComplectsField = () => {
    const { settings, setSetting } = useOfferPdfSettingsForm();
    const visible = useAppSelector(state => hasAlternativeComplects(state.rowSet.alternative));

    const change = useCallback((value: boolean) => setSetting('alternativeComplects', value), [setSetting]);

    return { visible, checked: settings.alternativeComplects, change, ...ALTERNATIVE_COMPLECTS_FIELD };
};
