import { AppDispatch, AppGetState } from "@/modules/app/model/store"
import { ReportData, ReportDateType } from "@/modules/entities/report/model/types/report/report-type";
import { API_METHOD, backAPI, EBACK_ENDPOINT } from "@workspace/api"
import { setDownloadStatus } from "./download-slice";
import { logClient } from "@/modules/app/lib/helper/logClient";

export enum EDownloadType {
    EXCEL = 'excel',
    PDF = 'pdf',
}
interface IGetDownload {
    type: EDownloadType
    report: ReportData[]
    date: {
        [ReportDateType.FROM]: string
        [ReportDateType.TO]: string
    }
}

export const getDownload = (type: EDownloadType, report: ReportData[]) => async (dispatch: AppDispatch, getState: AppGetState) => {


    const isLoading = getState().download.isDownloading;
    if (isLoading) return;
    dispatch(setDownloadStatus({ status: true, type }));
    if (type === EDownloadType.PDF) {
        // const downloadPDF = () => {
        //     
        //     if (typeof window === 'undefined') return;
        //     
        //     const element = document.getElementById('report-container');
        //     
        //     const html2pdf = require('html2pdf.js');
        //     
        //     setTimeout(() => {
        //         html2pdf()
        //             .set({
        //                 margin: 0.5,
        //                 filename: 'kpi-report.pdf',
        //                 image: { type: 'jpeg', quality: 0.98 },
        //                 html2canvas: { scale: 2 },
        //                 jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        //             })
        //             .from(element)
        //             .download();
        //     }, 1000);
        // }
        // downloadPDF()
    } else {
        const date = getState().report.date
        const data = {
            report,
            type,
            date
        } as IGetDownload


        const blob = await backAPI.download<Blob>(
            EBACK_ENDPOINT.DOWNLOAD_REPORT,
            API_METHOD.POST,
            data)


        if (blob instanceof Blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } else {
            const app = getState().app
            const domain = app.domain
            const user = `${app.bitrix.user?.ID} ${app.bitrix.user?.NAME} ${app.bitrix.user?.LAST_NAME}`
            console.error('❌ Не blob:', blob);
            logClient({
                level: 'error',
                context: 'download-thunk get download',
                title: 'download report',
                message: 'Ошибка скачивания отчета getDownload: ❌ Не blob',
                domain,
                userId: user,
            },
                {
                    blob
                })
        }
    }

    dispatch(setDownloadStatus({ status: false, type }));

}

