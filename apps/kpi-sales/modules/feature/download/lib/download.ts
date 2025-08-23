// import { ReportData } from "@/modules/entities/report/model/types/report/report-type";
// import { API_METHOD, backAPI, EBACK_ENDPOINT } from "@workspace/api"

// export enum EDownloadType {
//     EXCEL = 'excel',
//     PDF = 'pdf',
// }
// interface IGetDownload {
//     type: EDownloadType
//     report: ReportData[]
// }
// export const getDownload = async (type: EDownloadType, report: ReportData[]) => {

//     const data = {
//         report,
//         type,
//     } as IGetDownload

//     await backAPI.service(
//         EBACK_ENDPOINT.DOWNLOAD_REPORT,
//         API_METHOD.POST,
//         data)

//
// }
