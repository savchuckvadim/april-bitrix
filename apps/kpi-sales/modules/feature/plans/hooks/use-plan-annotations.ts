'use client';

import { useMemo } from 'react';
import type { RTableAnnotation } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectIsPublic } from '@/modules/app';
import type { PlanFactSource } from '../model';
import { usePlansData } from './use-plans-data';
import { usePlanAchievement } from './use-plan-achievement';
import { usePlansVisibility } from './use-plans-visibility';
import {
    buildPlanAnnotations,
    mergePlanAnnotations,
} from '../lib/plan-annotations.util';

/**
 * План-аннотации для таблиц отчётов: kpi — события, calling — звонки,
 * оба — объединённый. Гейты: фича/доступ, планы настроены, блок «Планы»
 * не скрыт тумблером, не публичная страница; рядовой (без PLANS_VIEW_ALL)
 * получает аннотации только своей строки.
 */
export const usePlanAnnotations = (
    sources: PlanFactSource[],
    visibleUserIds: number[],
): Map<string, RTableAnnotation> | undefined => {
    const isPublic = useAppSelector(selectIsPublic);
    const plansVisible = usePlansVisibility();
    const plans = usePlansData();

    const scopedUserIds = useMemo(
        () =>
            plans.canViewAll
                ? visibleUserIds
                : visibleUserIds.filter(id => id === plans.currentUserId),
        [visibleUserIds, plans.canViewAll, plans.currentUserId],
    );

    const achievement = usePlanAchievement(plans.indicators, scopedUserIds);

    return useMemo(() => {
        if (
            isPublic ||
            !plansVisible ||
            !plans.canView ||
            !plans.isConfigured ||
            !achievement.rows.length
        ) {
            return undefined;
        }
        const maps = sources.map(source =>
            buildPlanAnnotations(
                source,
                plans.indicators,
                achievement.rows,
                achievement.expected,
            ),
        );
        const merged = mergePlanAnnotations(...maps);
        return merged.size ? merged : undefined;
    }, [
        isPublic,
        plansVisible,
        plans.canView,
        plans.isConfigured,
        plans.indicators,
        achievement,
        sources,
    ]);
};
