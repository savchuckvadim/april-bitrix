import { useEffect } from 'react';
import { getReportData, changeDate, saveFilter } from './report-thunks';
import { ReportDateType, Filter } from './types/report/report-type';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { reportActions } from './report-slice';
import { getFiltredrReport, getMediumData, getTotalData } from '../lib/report';

export const useReport = () => {
    const dispatch = useAppDispatch();
    const reportState = useAppSelector(state => state.report);
    const department = useAppSelector(state => state.department.current);
    useEffect(() => {
        if (!reportState.isFetched && !reportState.isLoading) {
            dispatch(getReportData());
        }
    }, [dispatch, reportState.isFetched]);

    const handleDateChange = (type: ReportDateType, date: string) => {
        dispatch(changeDate(type, date));
        // dispatch(getReportData());
    };

    // const handleActionChange = (actionCode: FilterInnerCode) => {
    //     dispatch(setCurrentActions(actionCode));
    //     dispatch(getReportData());
    // };

    const handleSaveFilter = () => {
        dispatch(saveFilter());
    };

    const handleSetCurrentReportItem = (userId: number) => {
        dispatch(reportActions.setCurrentReportItem(userId));
        // dispatch(getReportData());
    };

    // const handleSetCurrentGroup = (groupId: number) => {
    //     dispatch(reportActions.setCurrentGroup(groupId));
    //     // dispatch(getReportData());
    // };

    const handleUpdateReport = () => {
        dispatch(getReportData());
    };

    const filtredReport = getFiltredrReport(
        reportState.report,
        department,
        reportState.actions.current,
        reportState.filter
    )
    const totalKPI = getTotalData(filtredReport)
    const mediumKPI = getMediumData(filtredReport, totalKPI)

 
    return {
        report: filtredReport,
        totalKPI,
        mediumKPI,
        isLoading: reportState.isLoading,
        isFetched: reportState.isFetched,
        date: reportState.date,
        actions: reportState.actions,
        isFilterLoading: reportState.isFilterLoading,
        handleDateChange,
        handleUpdateReport,
        handleSaveFilter,
        handleSetCurrentReportItem,
        // handleSetCurrentGroup,

    };
}; 