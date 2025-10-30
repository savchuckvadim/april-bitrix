import { BXUserDto, getOrkReport } from "@workspace/nest-api"

export const getCommunicationsReport = async (
    domain: string,
    dateFrom: string,
    dateTo: string,
    departament: BXUserDto[],
    socketId: string,
) => {
    const api = getOrkReport()
    const response = await api.communicationsGet({
        domain: domain,
        filters: {
            dateFrom: dateFrom,
            dateTo: dateTo,
            departament: departament,
        },
        socketId: socketId,
    })
    return response
}
