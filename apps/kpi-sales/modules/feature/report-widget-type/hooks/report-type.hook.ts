import { useAppDispatch, useAppSelector } from "@/modules/app";
import { reportTypeActions } from "../model/ReportTypeSlice";
import { EReportType } from "../consts/report-type.consts";

export const useReportType = () => {
    const dispatch = useAppDispatch();
    const reportType = useAppSelector((state) => state.reportType);
    const setCurrentReportType = (type: EReportType) => {
        dispatch(reportTypeActions.setCurrentReportType(type));
    }
    return { current: reportType.current, setCurrentReportType }
}
