import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserReport, stopGenerateUserReport } from "../../lib/user-report.helper";
import { SalesUserReportGetRequestDto, OrkUserReportStartResponseDto, SalesUserReportStartResponseDto } from "@workspace/nest-api";
import { RootState } from "@/modules/app/model/store";
import { getUserReportDate } from "../../lib/date.util";


export const getUserReportThunk =
    createAsyncThunk<
        SalesUserReportStartResponseDto | null,
        SalesUserReportGetRequestDto,
        { rejectValue: string }
    >('userReport/getUserReport',
        async (dto: SalesUserReportGetRequestDto, { getState, rejectWithValue }) => {
            try {

                const { dateFrom, dateTo } = getUserReportDate(dto.filters.dateFrom, dto.filters.dateTo);
                const response = await getUserReport({ ...dto, filters: { ...dto.filters, dateFrom, dateTo } }) as SalesUserReportStartResponseDto;
                debugger
                if (!response) {
                    return rejectWithValue('Ошибка загрузки данных');
                }

                return response;
            } catch (error) {
                return rejectWithValue('Ошибка загрузки данных');
            }
        }
    )


export const stopLoadingUserReportThunk =
    createAsyncThunk<
        OrkUserReportStartResponseDto,
        void,
        { rejectValue: string }
    >('userReport/stopLoadingUserReport',
        async (_, { getState, rejectWithValue }) => {
            try {
                const operationId = (getState() as RootState).userReport.operationId;
                if (!operationId) {
                    return rejectWithValue('Ошибка загрузки данных');
                }

                const response = await stopGenerateUserReport(operationId) as OrkUserReportStartResponseDto;
                if (!response) {
                    return rejectWithValue('Ошибка загрузки данных');
                }

                return response;
            } catch (error) {
                return rejectWithValue('Ошибка загрузки данных');
            }
        }
    )
