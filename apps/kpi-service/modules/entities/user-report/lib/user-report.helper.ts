import { getOrkReport, OrkUserReportGetRequestDto } from "@workspace/nest-api"


export const getUserReport = async (orkUserReportGetRequestDto: OrkUserReportGetRequestDto) => {


    const api = getOrkReport()
    const response = await api.userReportStart(orkUserReportGetRequestDto)

    return response
}


export const stopGenerateUserReport = async (operationId: string) => {

    const api = getOrkReport()
    const response = await api.userReportStop(operationId)

    return response
}
