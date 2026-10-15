'use client';

import { useMemo, useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    bucketPresentationsByHour,
    complectStats,
    EMPTY_PRES_FILTER,
    filterPresentations,
    summarizePresentations,
    visibleHourRange,
    type DigestPresDayStatus,
    type PresCompanyFilter,
    type PresFilter,
    type PresInitiativeFilter,
} from '@/modules/entities/digest';
import { usePlansData } from '@/modules/feature/plans';
import { useDigestData } from '../../lib/digest-data.context';
import {
    buildPresEmployeeRows,
    buildPresRatings,
    presentationsIndicator,
    totalPresRow,
} from '../lib/presentations-view.util';
import { buildPresTiles } from '../lib/presentations-tiles.util';

export type PresHistoryView = 'chart' | 'table';

/**
 * Презентации дня: фильтры-бейджи, сводка, строки по сотрудникам с планом
 * руководителя, рейтинги, комплекты, часы. План руководителя видят те, кому
 * доступны «Планы» (рядовой — свой).
 */
export const useDigestPresentations = () => {
    const { report, rows, date, domain } = useDigestData();
    const { indicators, canView, canViewAll, currentUserId } = usePlansData();
    const targetsByUser = useAppSelector(state => state.plans.targetsByUser);
    const [filter, setFilter] = useState<PresFilter>(EMPTY_PRES_FILTER);
    const [view, setView] = useState<PresHistoryView>('chart');

    const all = useMemo(() => report.presentations?.items ?? [], [report.presentations]);
    const names = useMemo(() => new Map(rows.map(row => [row.userId, row.name])), [rows]);
    const nameOf = (userId: number) => names.get(userId) ?? `#${userId}`;
    const indicator = canView ? presentationsIndicator(indicators) : null;
    const visibleTargets = useMemo(
        () =>
            canViewAll
                ? targetsByUser
                : { [currentUserId]: targetsByUser[currentUserId] },
        [canViewAll, currentUserId, targetsByUser],
    );

    const derived = useMemo(() => {
        const items = filterPresentations(all, filter);
        // Таблица и рейтинг — по всем сотрудникам выборки (без фильтра по сотруднику).
        const forEmployees = filterPresentations(all, { ...filter, userId: null });
        const userIds = rows.map(row => row.userId);
        const employeeRows = buildPresEmployeeRows(
            forEmployees,
            userIds,
            id => names.get(id) ?? `#${id}`,
            indicator,
            visibleTargets,
            date,
        );
        const scopeRows =
            filter.userId === null
                ? employeeRows
                : employeeRows.filter(row => row.userId === filter.userId);
        const total = totalPresRow(scopeRows);
        const hourly = bucketPresentationsByHour(items);
        return {
            items,
            employeeRows,
            summaryTiles: buildPresTiles(summarizePresentations(items), total.managerPlan, total.planExecution),
            ratings: buildPresRatings(employeeRows),
            complects: complectStats(items),
            hourly,
            hourRange: visibleHourRange([hourly.buckets]),
        };
    }, [all, filter, rows, names, indicator, visibleTargets, date]);

    const toggleStatus = (status: DigestPresDayStatus) =>
        setFilter(current => {
            const statuses = new Set(current.statuses);
            if (statuses.has(status)) statuses.delete(status);
            else statuses.add(status);
            return { ...current, statuses };
        });

    return {
        available: report.presentations !== null,
        hasAny: all.length > 0,
        domain,
        filter,
        setUser: (value: string) =>
            setFilter(current => ({ ...current, userId: value === 'all' ? null : Number(value) })),
        toggleStatus,
        setCompany: (value: string) =>
            setFilter(current => ({ ...current, company: value as PresCompanyFilter })),
        setInitiative: (value: string) =>
            setFilter(current => ({ ...current, initiative: value as PresInitiativeFilter })),
        resetFilter: () => setFilter(EMPTY_PRES_FILTER),
        employeeOptions: [
            { value: 'all', label: 'Все сотрудники' },
            ...rows
                .filter(row => all.some(item => item.assignedId === row.userId))
                .map(row => ({ value: String(row.userId), label: row.name })),
        ],
        view,
        setView: (value: string) => setView(value as PresHistoryView),
        nameOf,
        ...derived,
    };
};
