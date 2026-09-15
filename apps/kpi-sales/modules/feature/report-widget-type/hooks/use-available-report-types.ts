'use client';

import { useEffect, useMemo } from 'react';
import { selectIsPublic, useAccess, useAppSelector } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { EReportType } from '../consts/report-type.consts';
import { useReportType } from './report-type.hook';

/**
 * Доступные вкладки отчёта для текущего (эффективного) пользователя.
 * Видимость «Финансов» и «AI аналитики» решает центральная таблица прав
 * (shared/access/access.rules.ts — FINANCE_TAB / AI_TAB). «AI аналитика»
 * дополнительно скрыта на публичной странице /share (снимка её данных нет).
 * Новые ограничения вкладок добавлять по тому же образцу: ключ в
 * EAccessFeature + правило + фильтр здесь.
 */
export const useAvailableReportTypes = (): EReportType[] => {
    const canFinance = useAccess(EAccessFeature.FINANCE_TAB);
    const canAi = useAccess(EAccessFeature.AI_TAB);
    const isPublic = useAppSelector(selectIsPublic);
    const showAi = canAi && !isPublic;
    return useMemo(
        () =>
            Object.values(EReportType).filter(type => {
                if (type === EReportType.FINANCE) return canFinance;
                if (type === EReportType.AI) return showAi;
                return true;
            }),
        [canFinance, showAi],
    );
};

/**
 * Страховка: если текущая вкладка стала недоступной (сохранённый
 * reportType, вход в viewAs, смена прав) — тихо уводим на «Все».
 */
export const useEnsureAvailableReportType = (): EReportType[] => {
    const available = useAvailableReportTypes();
    const { current, setCurrentReportType } = useReportType();

    useEffect(() => {
        if (!available.includes(current)) {
            setCurrentReportType(EReportType.All);
        }
        // setCurrentReportType стабилен (bound action creator)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [available, current]);

    return available;
};
