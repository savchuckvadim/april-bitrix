'use client';

import { useMemo } from 'react';
import type { ComboboxOption } from '@workspace/april-ui/fields';
import type { PortalEmployee } from '../../model';
import { employeeHint } from '../employee-ids';
import { usePortalEmployees, useRefreshPortalEmployees } from './use-portal-employees';

/**
 * Сотрудники портала в виде вариантов выбора + карта по id и обновление
 * списка. Общая основа одиночного и множественного выбора.
 */
export const useEmployeeOptions = (portalId: number) => {
    const query = usePortalEmployees(portalId);
    const refresh = useRefreshPortalEmployees(portalId);
    const employees = useMemo(() => query.data ?? [], [query.data]);

    const byId = useMemo(
        () =>
            new Map<number, PortalEmployee>(
                employees.map(employee => [employee.id, employee]),
            ),
        [employees],
    );

    const options = useMemo<ComboboxOption[]>(
        () =>
            employees.map(employee => ({
                value: String(employee.id),
                label: employee.name,
                hint: employeeHint(employee),
                keywords: [String(employee.id), ...employee.departments],
            })),
        [employees],
    );

    return {
        options,
        byId,
        isLoading: query.isLoading,
        isError: query.isError,
        refresh: () => refresh.mutate(),
        isRefreshing: refresh.isPending,
    };
};
