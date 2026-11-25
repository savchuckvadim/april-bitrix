'use client';
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { reportActions } from './report-slice';
import { getFiltredrReport, getMediumData, getTotalData } from '../lib/report';

export const useReport = () => {
    const dispatch = useAppDispatch();
    const reportState = useAppSelector(state => state.report);
    const department = useAppSelector(state => state.department.current);


    // Загрузка/сохранение отчёта — в feature/report-flow (useReportFlow);
    // правка фильтра (период, сотрудники, действия) — через черновик в
    // feature/report-flow (useReportFilterDraft). Здесь только состояние
    // сущности и её чистые операции.
    const handleSetCurrentReportItem = (userId: number) => {
        dispatch(reportActions.setCurrentReportItem(userId));
    };

    const isNoReportData = useMemo(() => {
        return reportState.report.length === 0;
    }, [reportState.report.length]);

    const filtredReport = useMemo(() => {
        return getFiltredrReport(
            reportState.report,
            department,
            reportState.actions.current,
            reportState.filter,
        );
    }, [
        reportState.report,
        department,
        reportState.actions.current,
        reportState.filter,
    ]);

    const totalKPI = getTotalData(filtredReport);
    const mediumKPI = getMediumData(filtredReport, totalKPI);

    return {
        report: filtredReport,
        totalKPI,
        mediumKPI,
        isLoading: reportState.isLoading,
        isFetched: reportState.isFetched,
        isNoReportData,
        date: reportState.date,
        actions: reportState.actions,
        isFilterLoading: reportState.isFilterLoading,
        handleSetCurrentReportItem,
    };
};
