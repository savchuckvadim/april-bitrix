'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { loadedEnabledPlanCodes } from '../lib/plan-achievement.util';

/**
 * Коды показателей, включённых в настройках планов, — только если данные
 * планов уже есть в сторе (их грузит отчёт). Загрузку хук не запускает:
 * вне отчёта (страница настроек) структура отделов может ещё не прийти,
 * и цели, загруженные без неё, остались бы пустыми и для отчёта.
 * null — неизвестно (не загружены, нет доступа, ошибка).
 */
export const useLoadedEnabledPlanCodes = (): ReadonlySet<string> | null => {
    const status = useAppSelector(state => state.plans.status);
    const catalog = useAppSelector(state => state.plans.catalog);
    const configs = useAppSelector(state => state.plans.indicators);
    return useMemo(
        () => loadedEnabledPlanCodes(status, catalog, configs),
        [status, catalog, configs],
    );
};
