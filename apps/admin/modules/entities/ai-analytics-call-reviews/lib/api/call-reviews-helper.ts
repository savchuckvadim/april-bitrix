import { getSalesAiAnalyticsAdmin } from '@workspace/nest-admin-api';
import type { CallReviewsPage, CallReviewsQuery } from '../../model';

/**
 * Единственное место импорта `@workspace/nest-admin-api` для раздела
 * «Отзывы о разборах» (`Sales AI Analytics Admin`): страница отзывов
 * руководителей и сводка за период. Только чтение.
 */
export class CallReviewsHelper {
    private api: ReturnType<typeof getSalesAiAnalyticsAdmin>;

    constructor() {
        this.api = getSalesAiAnalyticsAdmin();
    }

    /** Страница отзывов под фильтрами и сводка за весь период. */
    page(query: CallReviewsQuery): Promise<CallReviewsPage> {
        return this.api.aiAnalyticsCallReviewsAdminList(query);
    }
}
