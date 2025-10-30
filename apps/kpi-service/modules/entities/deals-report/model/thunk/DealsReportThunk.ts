import { createAsyncThunk } from "@reduxjs/toolkit"
import { OrkReportDealsByCompaniesDto } from "@workspace/nest-api"
import { getDealReport } from "../../lib/helper"



export const getDealsReport = createAsyncThunk<
    OrkReportDealsByCompaniesDto[],
    string,
    { rejectValue: string }
>(
    'dealsReport/getDealsReport',
    async (domain: string, { rejectWithValue }) => {
        try {
            const deals = await getDealReport(domain)

            if (!deals) {
                return rejectWithValue('Ошибка загрузки данных')
            }
            return deals
        } catch (error) {
            return rejectWithValue('Ошибка загрузки данных')
        }
    }
)
