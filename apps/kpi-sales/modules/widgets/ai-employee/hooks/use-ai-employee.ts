'use client';

import { useMemo, useState } from 'react';
import { useAccess, useAppSelector } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import {
    AI_DOSSIER_MONTHS,
    selectAiIsLeader,
    type AiCallType,
    type AiStatus,
} from '@/modules/entities/ai-analytics';
import type { AiEmployeeContextValue } from '../lib/ai-employee.context';
import {
    aiEmployeePlanFactRows,
    aiEmployeeTrends,
    aiEmployeeYoy,
    buildAiEmployeeBrief,
} from '../lib/ai-employee-brief.util';
import { useAiEmployeeAccess } from './use-ai-employee-access';
import { useAiEmployeeSources } from './use-ai-employee-sources';

const NO_CALL_TYPES: AiCallType[] = [];

/**
 * Сборка AI-раздела страницы сотрудника: доступ, запросы (use-ai-employee-
 * sources), строка сотрудника из обзора за период отчёта, план-факт его
 * месяца (пока в сторе ответ на другой запрос — секция как loading, а не
 * чужими данными), досье и стиль, резюме и плитки «Коротко», тренды и
 * «год назад» (из строки, иначе из досье).
 */
export const useAiEmployee = (managerId: string): AiEmployeeContextValue => {
    const access = useAiEmployeeAccess(managerId);
    const [months, setMonths] = useState<number>(AI_DOSSIER_MONTHS.default);
    const sources = useAiEmployeeSources(managerId, access.allowed, months);
    const isLeader = useAppSelector(selectAiIsLeader);
    const canConfigure = useAccess(EAccessFeature.AI_CONFIGURE);
    const overview = useAppSelector(state => state.aiAnalytics.overview);
    const attention = useAppSelector(state => state.aiAnalytics.attention.data);
    const pulse = useAppSelector(state => state.aiAnalytics.pulse.data);
    const planFactSection = useAppSelector(state => state.aiAnalytics.planFact);
    const planFactQuery = useAppSelector(state => state.aiAnalytics.planFactQuery);
    const callTypes =
        useAppSelector(state => state.aiAnalytics.settings.data?.callTypes) ??
        NO_CALL_TYPES;

    const row = useMemo(
        () =>
            overview.data?.managers.find(manager => manager.managerId === managerId) ??
            null,
        [overview.data, managerId],
    );
    const planFactCurrent =
        planFactQuery?.monthKey === sources.monthKey &&
        (planFactQuery.managerIds ?? []).join(',') === managerId;
    const planFactStatus: AiStatus = planFactCurrent ? planFactSection.status : 'loading';
    const planFact =
        planFactCurrent && planFactSection.status === 'ready' ? planFactSection.data : null;
    const dossierData = sources.dossier.data;
    const styleData = sources.style.data;

    const planFactRows = useMemo(
        () => aiEmployeePlanFactRows(planFact, dossierData, managerId),
        [planFact, dossierData, managerId],
    );
    const brief = useMemo(
        () =>
            buildAiEmployeeBrief({
                managerId,
                row,
                dossier: dossierData,
                planFact,
                style: styleData,
            }),
        [managerId, row, dossierData, planFact, styleData],
    );

    return {
        managerId,
        isSelf: access.isSelf,
        isLeader,
        canViewAll: access.canViewAll,
        canConfigure,
        kpiOnly: sources.kpiOnly,
        period: sources.period,
        monthKey: sources.monthKey,
        overview: {
            status: overview.status,
            jobStatus: overview.jobStatus,
            error: overview.error,
            retry: sources.retryOverview,
        },
        row,
        rowMissing: overview.status === 'ready' && row === null,
        attention,
        pulse,
        planFact: {
            status: planFactStatus,
            error: planFactCurrent ? planFactSection.error : null,
            data: planFact,
            rows: planFactRows,
            retry: sources.retryPlanFact,
        },
        dossier: {
            status: sources.dossier.status,
            jobStatus: sources.dossier.jobStatus,
            error: sources.dossier.error,
            data: dossierData,
            months,
            setMonths,
            rebuild: sources.dossier.rebuild,
        },
        style: {
            status: sources.style.status,
            error: sources.style.error,
            data: styleData,
            retry: sources.style.retry,
        },
        brief,
        trends: aiEmployeeTrends(row, dossierData),
        yoy: aiEmployeeYoy(row, dossierData),
        callTypes,
    };
};
