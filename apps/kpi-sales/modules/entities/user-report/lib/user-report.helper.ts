import { getSalesReport, SalesUserReportGetRequestDto } from "@workspace/nest-api"


export const getUserReport = async (salesUserReportGetRequestDto: SalesUserReportGetRequestDto) => {


    const api = getSalesReport()
    const response = await api.salesUserReportStart(salesUserReportGetRequestDto)

    return response
}


export const stopGenerateUserReport = async (operationId: string) => {

    const api = getSalesReport()
    const response = await api.salesUserReportStop(operationId)

    return response
}
