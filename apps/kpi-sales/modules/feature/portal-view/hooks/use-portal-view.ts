'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    selectCanEditPortalView,
    selectChartsEnabledSetting,
    selectHiddenTabs,
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
