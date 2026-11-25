'use client';

import { useEffect, useMemo } from 'react';
import { selectIsPublic, useAccess, useAppSelector } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
// Прямой путь, не index фичи: нужен один хук настроек (без UI-кнопок шапки).
import { useHiddenTabs } from '@/modules/feature/portal-view/hooks/use-portal-view';
import { EReportType } from '../consts/report-type.consts';
import {
    fallbackReportType,
    withoutHiddenReportTypes,
} from '../lib/report-tabs-visibility';
import { useReportType } from './report-type.hook';

/**
 * Доступные вкладки отчёта для текущего (эффективного) пользователя.
 * Видимость «Финансов» и «AI аналитики» решает центральная таблица прав
 * (shared/access/access.rules.ts — FINANCE_TAB / AI_TAB). «AI аналитика» и
 * «Дайджест» скрыты на публичной странице /share (снимка их данных нет).
 * Поверх прав портал может скрыть вкладки настройками отчёта, «Все» тоже.
 * Новые ограничения вкладок добавлять по тому же образцу: ключ в
 * EAccessFeature + правило + фильтр здесь.
 */
export const useAvailableReportTypes = (): EReportType[] => {
    const canFinance = useAccess(EAccessFeature.FINANCE_TAB);
    const canAi = useAccess(EAccessFeature.AI_TAB);
    const isPublic = useAppSelector(selectIsPublic);
    const hiddenTabs = useHiddenTabs();
    const showAi = canAi && !isPublic;
    return useMemo(
        () =>
            withoutHiddenReportTypes(
                Object.values(EReportType).filter(type => {
                    if (type === EReportType.FINANCE) return canFinance;
                    if (type === EReportType.AI) return showAi;
                    if (type === EReportType.DIGEST) return !isPublic;
                    return true;
                }),
                hiddenTabs,
            ),
        [canFinance, showAi, isPublic, hiddenTabs],
    );
};

/**
 * Страховка: если текущая вкладка стала недоступной (сохранённый
 * reportType, вход в viewAs, смена прав, вкладку скрыл портал) — тихо
 * уводим на первую доступную. Раньше запасной была «Все», но её тоже
 * можно скрыть.
 */
export const useEnsureAvailableReportType = (): EReportType[] => {
    const available = useAvailableReportTypes();
    const { current, setCurrentReportType } = useReportType();

    useEffect(() => {
        if (available.includes(current)) return;
        const fallback = fallbackReportType(available);
        if (fallback !== null) setCurrentReportType(fallback);
        // setCurrentReportType стабилен (bound action creator)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [available, current]);

    return available;
};
