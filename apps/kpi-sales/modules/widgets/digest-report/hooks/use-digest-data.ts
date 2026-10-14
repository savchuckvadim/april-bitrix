'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    buildDepartmentSections,
    buildGroupSections,
    filterSectionsByPresent,
} from '@/modules/entities/department';
import {
    buildDigestAverages,
    buildDigestRows,
    type DigestReport,
} from '@/modules/entities/digest';
import type { DigestDataValue } from '../lib/digest-data.context';

/** Производные данные дайджеста (один расчёт на отчёт/фокус). */
export const useDigestDataValue = (report: DigestReport): DigestDataValue => {
    const departments = useAppSelector(state => state.department.departments);
    const isMulti = useAppSelector(state => state.department.isMulti);
    const focusUserId = useAppSelector(state => state.digest.focusUserId);
    const date = useAppSelector(state => state.digest.date);
    const domain = useAppSelector(state => state.app.domain);

    return useMemo(() => {
        const rows = buildDigestRows(report.employees);
        const present = new Set(rows.map(row => row.userId));
        const sections = filterSectionsByPresent(
            buildDepartmentSections(departments),
            present,
        );
        const groupSections = filterSectionsByPresent(
            buildGroupSections(departments, isMulti),
            present,
        );
        const averages = buildDigestAverages(rows, sections, report.summary);
        const focusRow = rows.find(row => row.userId === focusUserId) ?? null;
        const visibleRows = focusRow ? [focusRow] : rows;
        return {
            report,
            rows,
            sections,
            groupSections,
            averages,
            focusUserId: focusRow ? focusUserId : null,
            focusRow,
            visibleRows,
            singleRow: visibleRows.length === 1 ? visibleRows[0]! : null,
            date,
            domain,
        };
    }, [report, departments, isMulti, focusUserId, date, domain]);
};
