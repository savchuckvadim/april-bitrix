import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format, parseISO } from 'date-fns';
import {
    // Filter,
    // FilterInnerCode,
    // KPIAction,
    // ReportData,
    ReportDate,
    EReportDateMode,
    ReportDateType,
    // ReportDetalization,
} from './types/report/report-type';
import { getDatesByMode, normalizeToISO } from '../lib/date-util';
import { OrkKpiFilter, OrkKpiFilterInnerCode, OrkReportKpiData, ReportGetFiltersDto, } from '@workspace/nest-api';
export type ReportState = typeof initialState;

const getInitialDate = () => {
    const currentDate = new Date();
    const firstDayOfMonthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
    );
    const first = format(firstDayOfMonthDate, 'yyyy-MM-dd') as string;
    const current = format(currentDate, 'yyyy-MM-dd') as string;
    return { first, current };
};

const initialState = {
    data: null,
    filter: [] as Array<OrkKpiFilterInnerCode>,
    isFilterLoading: false as boolean,
    actions: {
        items: [] as Array<OrkKpiFilter>,
        current: [] as Array<OrkKpiFilter>,
    },
    // calling: {
    //     items: null as ReportCallingData[] | null,
    //     isFetched: false,
    //     isLoading: false as boolean,
    // },
    date: {
        [ReportDateType.FROM]: getInitialDate().first as string,
        [ReportDateType.TO]: getInitialDate().current as string,
        inProcess: false as boolean,
        mode: 'range' as EReportDateMode,
    } as ReportDate,
    report: [] as Array<OrkReportKpiData>,
    // detalization: {
    //     report: null as ReportData | null,
    //     action: null as KPIAction | null,
    // } as ReportDetalization,
    isFetched: false as boolean,
    isLoading: false as boolean,
    isInitialized: false as boolean,
    currentReportItem: 0 as number,
    currentGroup: 0 as number,
    isFilterOpen: false as boolean,

};

const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        setFetchedReport: (
            state: ReportState,
            action: PayloadAction<{
                report: Array<OrkReportKpiData>;
                dateFieldId: string;
                actionFieldId: string;
            }>,
        ) => {
            state.report = action.payload.report;
            state.isFetched = true;
            state.isLoading = false;
        },
        setUserReport: (
            state: ReportState,
            action: PayloadAction<OrkReportKpiData>,
        ) => {
            const isUpdated = state.report.some(
                report => report.user.id === action.payload.user.id,
            );
            if (isUpdated) {
                state.report = state.report.map(report =>
                    report.user.id === action.payload.user.id
                        ? action.payload
                        : report,
                );
            } else {
                state.report.push(action.payload);
            }
        },
        setFetchedFilter: (
            state: ReportState,
            action: PayloadAction<{
                filter: Array<OrkKpiFilter>;
                currentFilter: Array<OrkKpiFilterInnerCode> | null;
            }>,
        ) => {
            state.filter =
                action.payload.currentFilter &&
                action.payload.currentFilter.length
                    ? action.payload.currentFilter
                    : action.payload.filter.map(f => f.innerCode);
        },
        setFilterLoadingStatus: (
            state: ReportState,
            action: PayloadAction<boolean>,
        ) => {
            state.isFilterLoading = action.payload;
        },
        setCurrentFilter: (
            state: ReportState,
            action: PayloadAction<OrkKpiFilterInnerCode>,
        ) => {
            const isNeedCut = state.filter.includes(action.payload);
            state.filter = isNeedCut
                ? state.filter.filter(f => f !== action.payload)
                : [...state.filter, action.payload];
        },
        setFetchedActions: (
            state: ReportState,
            action: PayloadAction<{
                actions: Array<OrkKpiFilter>;
                currentFilter: Array<OrkKpiFilterInnerCode> | null;
            }>,
        ) => {
            const current =
                action.payload.currentFilter &&
                action.payload.currentFilter.length
                    ? action.payload.actions.filter(act =>
                          action.payload.currentFilter?.includes(act.innerCode),
                      )
                    : action.payload.actions;

            state.actions = {
                ...state.actions,
                items: action.payload.actions,
                current,
            };
            // state.detalization.action = action.payload.actions.length ? action.payload.actions[0] : null;
        },
        // setActionDetalizationCurrent: (state, action: PayloadAction<KPIAction>) => {
        //     state.detalization.action = action.payload;
        // },
        // setReportDetalizationCurrent: (state, action: PayloadAction<ReportData | null>) => {
        //     // state.detalization.report = action.payload;
        // },
        setChangedDate: (
            state: ReportState,
            action: PayloadAction<{
                typeOfDate: ReportDateType;
                value: string;
            }>,
        ) => {
            // const formatted = dayjs(action.payload.value).format('YYYY-MM-DD');

            // const parseDate = parseISO(action.payload.value);
            //
            // const date = format(parseDate, "dd.MM.yyyy");
            const date = normalizeToISO(action.payload.value);

            if (date) {
                state.date[action.payload.typeOfDate] = date;
            }
        },
        setChangedDateMode: (
            state: ReportState,
            action: PayloadAction<{
                mode: EReportDateMode;
            }>,
        ) => {
            // const today = new Date();

            const mode = action.payload.mode;

            const { from, to } = getDatesByMode(mode);
            state.date[ReportDateType.FROM] = from;
            state.date[ReportDateType.TO] = to;
            state.date.mode = mode;
        },
        setCurrentActions: (
            state: ReportState,
            action: PayloadAction<Array<OrkKpiFilter>>,
        ) => {
            state.actions.current = action.payload;
        },
        setLoadingReportStatus: (
            state: ReportState,
            action: PayloadAction<boolean>,
        ) => {
            state.isLoading = action.payload;
        },
        setFetchedReportStatus: (
            state: ReportState,
            action: PayloadAction<boolean>,
        ) => {
            state.isFetched = action.payload;
        },
        // setIsLoadingCallings: (state: ReportState, action: PayloadAction<boolean>) => {
        //     state.calling.isLoading = action.payload;
        // },
        // setFetchedCallings: (state: ReportState, action: PayloadAction<ReportCallingData[] | null>) => {
        //     state.calling.items = action.payload;
        //     state.calling.isFetched = true;
        // },
        setCurrentReportItem: (
            state: ReportState,
            action: PayloadAction<number>,
        ) => {
            state.currentReportItem = action.payload;
        },
        setCurrentGroup: (
            state: ReportState,
            action: PayloadAction<number>,
        ) => {
            state.currentGroup = action.payload;
        },
        setIsFilterOpen: (
            state: ReportState,
            action: PayloadAction<boolean>,
        ) => {
            state.isFilterOpen = action.payload;
        },
    },
});

export const reportActions = reportSlice.actions;
export default reportSlice.reducer;
