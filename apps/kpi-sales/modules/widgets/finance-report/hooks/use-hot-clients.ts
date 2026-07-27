'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    computeHotTotals,
    filterHotDealsByTypes,
    financeActions,
    getHotClients,
    type FinanceHotDeal,
    type FinanceHotThreshold,
} from '@/modules/entities/finance';
import { exportTableToCSV } from '@/modules/entities/report';
import { financeHotCsvData } from '../lib/finance-csv.util';
import {
    OfferFilter,
    PERSPECTIVE_ALL,
    STAGE_ALL,
} from '../lib/hot-clients.data';
import {
    collectPerspectiveColors,
    collectStages,
    filterHotDeals,
    isHotFilterActive,
} from '../lib/hot-clients-filter.util';

/**
 * Вся логика горячих клиентов: загрузка (один раз), клиентские фильтры
 * (перспектива/стадия/предложение) и пересчёт сводки из отфильтрованных
 * сделок. `userId` → user-scoped (только сделки менеджера). UI только
 * ветвится по статусу и рендерит.
 */
export const useHotClients = (userId?: number) => {
    const dispatch = useAppDispatch();
    const departmentItems = useAppSelector(state => state.department.items);
    const { threshold, status, report } = useAppSelector(
        state => state.finance.hot,
    );

    // Подтягиваем один раз, если ещё не грузилось (в т.ч. на user-report).
    useEffect(() => {
        if (status === 'idle') dispatch(getHotClients());
    }, [dispatch, status]);

    const [perspective, setPerspective] = useState<string>(PERSPECTIVE_ALL);
    const [stage, setStage] = useState<string>(STAGE_ALL);
    const [offer, setOffer] = useState<OfferFilter>('all');

    // База: все сделки или только конкретного менеджера.
    const baseDeals = useMemo<FinanceHotDeal[]>(() => {
        const deals = report?.deals ?? [];
        return userId
            ? deals.filter(deal => deal.assignedId === userId)
            : deals;
    }, [report, userId]);

    const perspectiveColors = useMemo(
        () => collectPerspectiveColors(baseDeals),
        [baseDeals],
    );
    const stages = useMemo(() => collectStages(baseDeals), [baseDeals]);

    // Глобальные фильтры вкладки (тип договора/клиента) + локальные;
    // на user-report глобальные не действуют (их контролов там нет).
    const typeFilters = useAppSelector(state => state.finance.typeFilters);
    const visibleDeals = useMemo(() => {
        const local = filterHotDeals(baseDeals, { perspective, stage, offer });
        return userId ? local : filterHotDealsByTypes(local, typeFilters);
    }, [baseDeals, perspective, stage, offer, typeFilters, userId]);
    const totals = useMemo(
        () => computeHotTotals(visibleDeals),
        [visibleDeals],
    );

    const filterActive =
        isHotFilterActive({ perspective, stage, offer }) ||
        visibleDeals.length !== baseDeals.length;

    const setThreshold = useCallback(
        (value: FinanceHotThreshold) =>
            dispatch(financeActions.setHotThreshold(value)),
        [dispatch],
    );

    /** Пересчитать список, игнорируя кэш (промежуточный кэш строк
     * дотянет только изменённые сделки — быстрее полного пересбора). */
    const refresh = useCallback(
        () => dispatch(getHotClients(true)),
        [dispatch],
    );

    const resetStage = useCallback(() => setStage(STAGE_ALL), []);
    const toggleStage = useCallback(
        (code: string) =>
            setStage(prev => (prev === code ? STAGE_ALL : code)),
        [],
    );
    const resetPerspective = useCallback(
        () => setPerspective(PERSPECTIVE_ALL),
        [],
    );

    // Скачивание — только командный вариант (по одному менеджеру не выгружаем).
    const download = useCallback(() => {
        if (report?.deals.length) {
            exportTableToCSV(
                financeHotCsvData(report, departmentItems),
                'finance-hot-clients.csv',
            );
        }
    }, [report, departmentItems]);

    return {
        status,
        hasReport: !!report,
        threshold,
        setThreshold,
        refresh,
        perspective,
        setPerspective,
        resetPerspective,
        stage,
        setStage,
        resetStage,
        toggleStage,
        offer,
        setOffer,
        perspectiveColors,
        stages,
        baseCount: baseDeals.length,
        visibleDeals,
        totals,
        filterActive,
        download: userId ? undefined : download,
    };
};
