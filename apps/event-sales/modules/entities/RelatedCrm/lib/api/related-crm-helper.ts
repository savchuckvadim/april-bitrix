import { getDuplicates } from '@workspace/nest-event-sales-api';
import { withRetry } from '@/modules/shared/lib/with-retry';
import type { RelatedCrmDetails, RelatedCrmRequest } from '../../model';

/**
 * Единственное место импорта `@workspace/nest-event-sales-api` для связей CRM.
 *
 * Эндпоинт живёт в модуле дублей (`duplicates/details`) — это его история, а не
 * назначение: ответ описывает связи клиента, и им пользуются оба потребителя.
 */
export class RelatedCrmHelper {
    private api: ReturnType<typeof getDuplicates>;

    constructor() {
        this.api = getDuplicates();
    }

    async getDetails(dto: RelatedCrmRequest): Promise<RelatedCrmDetails> {
        return withRetry(() => this.api.duplicatesDetails(dto));
    }
}
