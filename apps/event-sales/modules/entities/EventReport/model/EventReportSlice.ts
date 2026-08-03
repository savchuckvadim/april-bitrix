import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
    EV_REPORT_PROP,
    EventReportSelectProp,
    EventReportStateReport,
} from '../type/event-report-type';
import { buildInitialReport, WORK_STATUS_ITEMS } from '../lib/report-catalog';
import { applyReportProp } from '../lib/event-report-util';

export type EventReportState = typeof initialState;

/** Комментарий принимает текст, справочники — id элемента (число или строка из Select). */
export type SetReportPropProps =
    | { propName: EV_REPORT_PROP.COMMENT; value: string }
    | { propName: EventReportSelectProp; value: number | string };

const initialState = {
    isNewEvent: false,
    report: buildInitialReport(false) as EventReportStateReport,
};

const eventReportSlice = createSlice({
    name: 'eventReport',
    initialState,
    reducers: {
        setReportProp: (
            state: EventReportState,
            action: PayloadAction<SetReportPropProps>,
        ) => {
            state.report = applyReportProp(
                state.report,
                action.payload.propName,
                action.payload.value,
            );
        },
        /** Режим отдела: ТМЦ (id=1) — без статуса «Продажа». */
        setMode: (
            state: EventReportState,
            action: PayloadAction<{ depModeId: number }>,
        ) => {
            const isTmc = action.payload.depModeId === 1;
            const items = isTmc
                ? WORK_STATUS_ITEMS.filter(item => item.code !== 'success')
                : WORK_STATUS_ITEMS;
            state.report[EV_REPORT_PROP.WORK_STATUS].items = items;
            state.report[EV_REPORT_PROP.WORK_STATUS].current = items[0]!;
        },
        clean: (
            state: EventReportState,
            action: PayloadAction<{ isTmc: boolean }>,
        ) => {
            state.isNewEvent = false;
            state.report = buildInitialReport(action.payload.isTmc);
        },
    },
});

export const eventReportReducer = eventReportSlice.reducer;
export const eventReportActions = eventReportSlice.actions;
