'use client'
import { useAppDispatch, useAppSelector } from "@/modules/app";
import { getUserReportThunk, stopLoadingUserReportThunk } from "../model/thunk/UserReportThunk";
import { getWSClient } from "@/modules/app/model/store";
import { useEffect } from "react";

export const useUserReport = () => {
    const dispatch = useAppDispatch();
    const userReport = useAppSelector((state) => state.userReport);
    const soket = getWSClient();
    const socketId = soket.socket.id as string;

    const app = useAppSelector((state) => state.app);
    const domain = app.domain;

    const from = useAppSelector((state) => state.report.date.from);
    const to = useAppSelector((state) => state.report.date.to);
    const getUserReport = (userId: number) => {
        dispatch(getUserReportThunk({
            domain,
            socketId,
            userId,
            dateFrom: from,
            dateTo: to,
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
