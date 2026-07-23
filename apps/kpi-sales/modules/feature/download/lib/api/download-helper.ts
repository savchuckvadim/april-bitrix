import {
    customAxios,
    DownLoadKpiReportDto,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Скачивание Excel с нового бэка. Идём через customAxios пакета напрямую,
 * потому что generated-клиент не проставляет responseType: 'blob'
 * (у эндпоинта нет binary-схемы в Swagger — задача бэку на этап excel).
 */
export class DownloadHelper {
    async downloadExcel(dto: DownLoadKpiReportDto): Promise<Blob> {
        return await customAxios<Blob>({
            url: '/api/kpi-report/download',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: dto,
            responseType: 'blob',
        });
    }
}
