import { isAnyOf, ListenerMiddlewareInstance, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState, ThunkExtraArgument } from "@/modules/app/model/store";
import { appActions } from "@/modules/app";
import { EReportType } from "../consts/report-type.consts";
import { reportTypeActions } from "./ReportTypeSlice";


export const startReportTypeAppListener = (listener: ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>) => {

    listener.startListening({
        matcher: isAnyOf(
            appActions.setAppData,
        ),
        effect: async (action: PayloadAction<{ domain: string }>, { extra, dispatch, getState, }) => {
            const domain = action.payload.domain;

            let initWidgetStyle = EReportType.All

            if (domain.includes('gsr') || domain.includes('gsirk')) {
                initWidgetStyle = EReportType.EVENTS;
            } else if (domain.includes('alfacenter') || domain.includes('april')) {

                initWidgetStyle = EReportType.MERGED;
            }

            dispatch(reportTypeActions.setCurrentReportType(initWidgetStyle));
        },
    });
}
