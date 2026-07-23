'use client';
import { useMemo } from 'react';
import { changeDate } from './report-thunks';
import {
    ReportDateType,
    Filter,
    EReportDateMode,
    ReportData,
} from './types/report/report-type';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { reportActions } from './report-slice';
import { getFiltredrReport, getMediumData, getTotalData } from '../lib/report';

export const useReport = () => {
    const dispatch = useAppDispatch();
    const reportState = useAppSelector(state => state.report);
    const department = useAppSelector(state => state.department.current);


    // Загрузка/сохранение отчёта — в feature/report-flow (useReportFlow);
    // здесь только состояние сущности и её чистые операции.
    const handleDateChange = (type: ReportDateType, date: string) => {
        dispatch(changeDate(type, date));
    };
    const handleDateModeChange = (mode: EReportDateMode) => {
        dispatch(reportActions.setChangedDateMode({ mode }));
    };

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
        handleDateChange,
        handleDateModeChange,
        handleSetCurrentReportItem,
    };
};
