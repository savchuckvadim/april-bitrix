'use client';

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    collectTypeFilterOptions,
    financeActions,
    type FinanceTypeFilters,
} from '@/modules/entities/finance';
import { PBX_FIELD_CODES } from '@/modules/feature/pbx-fields';

/**
 * Глобальные фильтры вкладки «Финансы» по типу договора и типу клиента:
 * значения селектов собираются из данных отчётов (закрытые + горячие),
 * имена типов клиента — из pbx-меты. Выбор действует на оба блока.
 */
export const useFinanceTypeFilters = () => {
    const dispatch = useAppDispatch();
    const filters = useAppSelector(state => state.finance.typeFilters);
    const closedReport = useAppSelector(state => state.finance.closed.report);
    const hotReport = useAppSelector(state => state.finance.hot.report);
    const clientTypeMeta = useAppSelector(
        state => state.pbxFields.meta.byCode[PBX_FIELD_CODES.opClientType],
    );

    const options = useMemo(() => {
        const closedDeals =
            closedReport?.employees.flatMap(employee => employee.deals) ?? [];
        const metaItems = clientTypeMeta?.items ?? [];
        return collectTypeFilterOptions(
            closedDeals,
            hotReport?.deals ?? [],
            code => metaItems.find(item => item.code === code)?.name ?? code,
        );
    }, [closedReport, hotReport, clientTypeMeta]);

    const setFilter = useCallback(
        (key: keyof FinanceTypeFilters, value: string) => {
            dispatch(financeActions.setTypeFilter({ key, value }));
        },
        [dispatch],
    );

    return {
        filters,
        setFilter,
        contractTypes: options.contractTypes,
        clientTypes: options.clientTypes,
    };
};
