import { getAdminTranscriptionSpend } from '@workspace/nest-admin-api';

/** Расход на распознавание: сводка по порталам и подробности портала. */
export class TranscriptionSpendHelper {
    private api: ReturnType<typeof getAdminTranscriptionSpend>;

    constructor() {
        this.api = getAdminTranscriptionSpend();
    }

    /** Все порталы за месяц (YYYY-MM; не задан — текущий). */
    async summary(month?: string) {
        return this.api.adminTranscriptionSpendSummary(month ? { month } : undefined);
    }

    /** Один портал за месяц. */
    async portal(domain: string, month?: string) {
        return this.api.adminTranscriptionSpendPortal(domain, month ? { month } : undefined);
    }
}
