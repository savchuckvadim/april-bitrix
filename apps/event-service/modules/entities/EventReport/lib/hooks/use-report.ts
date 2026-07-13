import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_REPORT_PROP, EventReportStateReport } from '../../type/event-report-type';
import { eventReportActions } from '../../model/EventReportSlice';

/** Report process state + handlers (replaces the old ReportContainer). */
export const useReport = () => {
    const dispatch = useAppDispatch();
    const report = useAppSelector(state => state.eventReport.report) as EventReportStateReport;

    const handleChange = (type: EV_REPORT_PROP, value: string) => {
        dispatch(eventReportActions.setReportProp({ propName: type, value }));
    };

    return { report, handleChange };
};
