import { getDuplicates } from '@workspace/nest-event-sales-api';
import { withRetry } from '@/modules/shared/lib/with-retry';
import { RelatedCrmHelper } from '@/modules/entities/RelatedCrm/lib/api/related-crm-helper';
import type {
    DuplicateDetails,
    DuplicateDetailsRequest,
    DuplicateSearchRequest,
    DuplicateSearchResponse,
} from '../../model';

/**
 * Единственное место импорта `@workspace/nest-event-sales-api` для поиска дублей.
 *
 * Детали кандидата — это связи клиента, общая сущность: их отдаёт
 * `RelatedCrmHelper`, чтобы полноэкранная карточка и панель дублей ходили
 * одним путём. Ретраи общие (`shared/lib/with-retry`): поиск стартует сам при
 * каждом открытии фрейма, и разовый сетевой сбой не должен показывать
 * менеджеру ошибку там, где достаточно повторить запрос.
 */
export class DuplicatesHelper {
    private api: ReturnType<typeof getDuplicates>;
    private related = new RelatedCrmHelper();

    constructor() {
        this.api = getDuplicates();
    }

    async search(
        dto: DuplicateSearchRequest,
    ): Promise<DuplicateSearchResponse> {
        return withRetry(() => this.api.duplicatesSearch(dto));
    }

    async getDetails(dto: DuplicateDetailsRequest): Promise<DuplicateDetails> {
        return this.related.getDetails(dto);
    }
}
