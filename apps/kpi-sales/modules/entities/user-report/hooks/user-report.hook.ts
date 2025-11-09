'use client'
import { useAppDispatch, useAppSelector } from "@/modules/app";
import { getUserReportThunk, stopLoadingUserReportThunk } from "../model/thunk/UserReportThunk";
import { getWSClient } from "@/modules/app/model/store";
import { useEffect } from "react";
import {  SalesUserReportFiltersDto } from "@workspace/nest-api";

export const useUserReport = () => {
    const dispatch = useAppDispatch();
    const userReport = useAppSelector((state) => state.userReport);
    const soket = getWSClient();
    const socketId = soket.socket.id as string;

    const app = useAppSelector((state) => state.app);
    const domain = app.domain;

    const from = useAppSelector((state) => state.report.date.from);
    const to = useAppSelector((state) => state.report.date.to);
    const baseReportState = useAppSelector((state) => state.report);
    const actions = baseReportState.actions.current;


    const getUserReport = (userId: number) => {
        const isLoading = userReport.isLoading;
        if (isLoading) return;
        dispatch(getUserReportThunk({
            domain,
            socketId,
            userId,

            filters: {

                actions,
                dateFrom: from,
                dateTo: to,
            } as SalesUserReportFiltersDto,
        }));
    }
    useEffect(() => {
        return () => {

            dispatch(
                stopLoadingUserReportThunk()
            );
        }
    }, []);
    return {
        getUserReport,
        report: userReport.reports,
        isFetched: userReport.isFetched,

        stopLoadingUserReport: () => {
            dispatch(stopLoadingUserReportThunk());
        }
    }
}
