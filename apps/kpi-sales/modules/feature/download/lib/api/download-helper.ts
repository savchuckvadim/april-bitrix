import { customAxios } from '@workspace/nest-kpi-report-sales-api';
import type { ExcelReportRequest } from '../../model/excel-report.types';

/**
 * Скачивание Excel с нового бэка. Идём через customAxios пакета напрямую,
 * потому что generated-клиент не проставляет responseType: 'blob'
 * (у эндпоинта нет binary-схемы в Swagger — задача бэку на этап excel).
 * Тело — DownLoadKpiReportDto с плановыми колонками строк (ExcelReportRequest).
 */
export class DownloadHelper {
    async downloadExcel(dto: ExcelReportRequest): Promise<Blob> {
        return await customAxios<Blob>({
            url: '/api/kpi-report/download',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: dto,
            responseType: 'blob',
        });
    }
}
