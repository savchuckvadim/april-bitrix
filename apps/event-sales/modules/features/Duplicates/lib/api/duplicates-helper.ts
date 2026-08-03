import { getDuplicates } from '@workspace/nest-event-sales-api';
import type {
    DuplicateDetails,
    DuplicateDetailsRequest,
    DuplicateSearchRequest,
    DuplicateSearchResponse,
} from '../../model';

/** Сколько раз повторяем запрос, прежде чем признать поиск неудачным. */
const RETRY_ATTEMPTS = 3;
/** База экспоненциальной паузы: 400мс → 800мс. */
const RETRY_BASE_DELAY_MS = 400;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Единственное место импорта `@workspace/nest-event-sales-api` для дублей.
 *
 * Ретраи живут здесь, а не в thunk'ах: поиск дублей запускается сам при каждом
 * открытии фрейма, и разовый сетевой сбой не должен показывать менеджеру
 * ошибку там, где достаточно повторить запрос.
 */
export class DuplicatesHelper {
    private api: ReturnType<typeof getDuplicates>;

    constructor() {
        this.api = getDuplicates();
    }

    async search(
        dto: DuplicateSearchRequest,
    ): Promise<DuplicateSearchResponse> {
        return this.withRetry(() => this.api.duplicatesSearch(dto));
    }

    async getDetails(
        dto: DuplicateDetailsRequest,
    ): Promise<DuplicateDetails> {
        return this.withRetry(() => this.api.duplicatesDetails(dto));
    }

    /**
     * Повтор с нарастающей паузой. 4xx не повторяем: неверный домен или
     * несуществующая сущность от повторения не исправятся.
     */
    private async withRetry<T>(request: () => Promise<T>): Promise<T> {
        let lastError: unknown;

        for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
            try {
                return await request();
            } catch (error) {
                lastError = error;
                if (!this.isRetryable(error)) break;
                if (attempt < RETRY_ATTEMPTS - 1) {
                    await wait(RETRY_BASE_DELAY_MS * 2 ** attempt);
                }
            }
        }
        throw lastError;
    }

    private isRetryable(error: unknown): boolean {
        const status = (error as { response?: { status?: number } })?.response
            ?.status;
        // Нет ответа — сеть или таймаут, это повторяем.
        if (status === undefined) return true;
        return status >= 500 || status === 429;
    }
}
