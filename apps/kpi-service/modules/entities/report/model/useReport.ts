'use client'
import { useEffect, useMemo, useState } from 'react';
import { getReportData, changeDate, saveFilter } from './thunks/report-thunks';
import {
    ReportDateType,
    EReportDateMode,

} from './types/report/report-type';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { reportActions } from './report-slice';
import { getFiltredrReport, getMediumData, getTotalData } from '../lib/report';
import { IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';

export const useReport = () => {
    const dispatch = useAppDispatch();
    const reportState = useAppSelector(state => state.report);
    const department = useAppSelector(state => state.department.current);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }
    // const [filtredReport, setFiltredReport] = useState<ReportData[]>([]);
    useEffect(() => {
        if (!reportState.isFetched && !reportState.isLoading && isMounted) {
            dispatch(getReportData());
        }
    }, [dispatch, reportState.isFetched, isMounted]);

    const handleDateChange = (type: ReportDateType, date: string) => {
        dispatch(changeDate(type, date));
    };
    const handleDateModeChange = (mode: EReportDateMode) => {
        dispatch(reportActions.setChangedDateMode({ mode }));
    };

    const handleSaveFilter = () => {
        dispatch(saveFilter());
    };

    const handleSetCurrentReportItem = (userId: number) => {
        dispatch(reportActions.setCurrentReportItem(userId));
    };

    const handleUpdateReport = () => {
        dispatch(getReportData());
    };

    const isNoReportData = useMemo(() => {
        return reportState.report.length === 0;
    }, [reportState.report.length]);

    const filtredReport = useMemo(() => {
        return getFiltredrReport(
            reportState.report,
            department as IBXUser[],
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
        isFilterOpen: reportState.isFilterOpen,
        setIsFilterOpen: (isFilterOpen: boolean) => dispatch(reportActions.setIsFilterOpen(isFilterOpen)),
        handleDateChange,
        handleDateModeChange,
        handleUpdateReport,
        handleSaveFilter,
        handleSetCurrentReportItem,
    };
};
