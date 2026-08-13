import { getEventServiceSkap } from '@workspace/nest-event-service-api';
import type { SkapImportRunResult, SkapImportStatus } from '../../model';

/**
 * Единственное место пакета, знающее про сгенерированный клиент.
 * Портальная поверхность импорта СКАП: запуск прогона + статус.
 * Base URL клиента настраивается приложением через configureBaseURL
 * из @workspace/nest-event-service-api (см. README пакета-клиента).
 */
export class SkapHelper {
    private api: ReturnType<typeof getEventServiceSkap>;

    constructor() {
        this.api = getEventServiceSkap();
    }

    /** «Обновить из хранилища»: поставить run-джоб импорта немедленно. */
    async runImport(domain: string): Promise<SkapImportRunResult> {
        return this.api.skapImportSkapImportRun({ domain });
    }

    /** Статус импорта: running / pendingFiles / lastRun / folderUrl / smartUrl. */
    async getStatus(domain: string): Promise<SkapImportStatus> {
        return this.api.skapImportSkapImportStatus({ domain });
    }
}
