import { customAxios } from '@workspace/nest-admin-api';
import type { LogRow, LogsFilter, LogsSummary } from '../../model';
import { toLogsParams } from '../logs-view';

const LOGS_API = '/api/admin/logs';

/**
 * Транспорт раздела «Журналы» (`LogsAdminController` бэка admin): журналы
 * всех приложений из ClickHouse. Вызовы ручные через `customAxios`.
 */
export class LogsHelper {
    summary(filter: LogsFilter): Promise<LogsSummary> {
        return customAxios<LogsSummary>({
            url: `${LOGS_API}/summary`,
            method: 'GET',
            params: toLogsParams(filter),
        });
    }

    async rows(filter: LogsFilter, limit: number): Promise<LogRow[]> {
        const response = await customAxios<{ rows: LogRow[] }>({
            url: LOGS_API,
            method: 'GET',
            params: { ...toLogsParams(filter), limit },
        });
        return response.rows;
    }
}
