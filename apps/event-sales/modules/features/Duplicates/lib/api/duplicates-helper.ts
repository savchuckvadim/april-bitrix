import { getDuplicates, getSalesHooks } from '@workspace/nest-event-sales-api';
import { withRetry } from '@/modules/shared/lib/with-retry';
import { RelatedCrmHelper } from '@/modules/entities/RelatedCrm/lib/api/related-crm-helper';
import type {
    DuplicateDetails,
    DuplicateDetailsRequest,
    DuplicateSearchRequest,
    DuplicateSearchResponse,
    JoinToMainRequest,
    SalesHookOperation,
} from '../../model';

/** Опрос операции хука: раз в полторы секунды, не дольше минуты. */
const OPERATION_POLL_MS = 1500;
const OPERATION_POLL_LIMIT = 40;

const FINAL_OPERATION_STATUSES = new Set<string>(['done', 'failed']);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    private hooks: ReturnType<typeof getSalesHooks>;
    private related = new RelatedCrmHelper();

    constructor() {
        this.api = getDuplicates();
        this.hooks = getSalesHooks();
    }

    /**
     * «Присоединить сюда»: ставит операцию хука join-to-main и ждёт её
     * завершения. Без retry на постановке — операция идемпотентна на бэке,
     * но повторный POST в момент сетевого сбоя дал бы 409 «уже выполняется».
     */
    async joinToMain(dto: JoinToMainRequest): Promise<SalesHookOperation> {
        const started = await this.hooks.joinToMainRun(dto);
        return this.waitOperation(dto.domain, started.operationId);
    }

    /**
     * Поллинг статуса: фрейм без WS-подписки, поэтому спрашиваем сами.
     * Первый запрос — сразу: короткая операция к этому моменту уже done.
     */
    private async waitOperation(
        domain: string,
        operationId: string,
    ): Promise<SalesHookOperation> {
        for (let attempt = 0; attempt < OPERATION_POLL_LIMIT; attempt += 1) {
            if (attempt > 0) await sleep(OPERATION_POLL_MS);
            const current = await withRetry(() =>
                this.hooks.salesHookOperationsGetOperation(operationId, {
                    domain,
                }),
            );
            if (FINAL_OPERATION_STATUSES.has(String(current.status))) {
                return current;
            }
        }
        throw new Error(
            'Операция ещё выполняется — обновите приложение через минуту и проверьте сделку',
        );
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
