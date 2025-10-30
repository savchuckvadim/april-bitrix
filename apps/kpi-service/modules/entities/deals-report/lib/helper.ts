import {  getOrkReport, OrkReportDealsByCompaniesDto } from "@workspace/nest-api"

export const getDealReport = async (domain: string): Promise<OrkReportDealsByCompaniesDto[] | null> => {
    const api = getOrkReport()

    const deals = await api.dealsReportGet({ domain })

    return deals?.companies || null
}
