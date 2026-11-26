'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    createIndicatorLabeler,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import {
    selectCanEditPortalView,
    selectChartsEnabledSetting,
    selectHiddenTabs,
    selectIndicatorLabels,
    selectPortalView,
    selectSupportUrl,
} from '../model/portal-view.selectors';
import type { PortalViewState } from '../model/portal-view-slice';

/** Настройки вида отчёта портала целиком (для страницы настроек). */
export const usePortalView = (): PortalViewState => useAppSelector(selectPortalView);

/** Коды скрытых вкладок: `events`, `callings`, …, `call_reviews`. */
export const useHiddenTabs = (): string[] => useAppSelector(selectHiddenTabs);

/** Портал разрешил графики (на телефоне их прячут отдельно и всегда). */
export const useChartsEnabledSetting = (): boolean =>
    useAppSelector(selectChartsEnabledSetting);

/** Ссылка на чат поддержки; null — не настроена. */
export const useSupportUrl = (): string | null => useAppSelector(selectSupportUrl);

/** Можно менять настройки: бэк разрешил и это не режим «Смотреть как…». */
export const useCanEditPortalView = (): boolean =>
    useAppSelector(selectCanEditPortalView);

/**
 * Функция названий показателей для показа: своё название портала по ключу
 * (`ev:`/`call:`/`plan:`), иначе исходное без лишних пробелов. Новая
 * функция — только когда поменялись свои названия.
 */
export const useIndicatorLabeler = (): IndicatorLabeler => {
    const labels = useAppSelector(selectIndicatorLabels);
    return useMemo(() => createIndicatorLabeler(labels), [labels]);
};
