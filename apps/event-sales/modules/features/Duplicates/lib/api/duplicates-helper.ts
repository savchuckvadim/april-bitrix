import { getDuplicates, getSalesHooks } from '@workspace/nest-event-sales-api';
import { withRetry } from '@/modules/shared/lib/with-retry';
import { waitForOperation } from '@/modules/shared/lib/wait-operation';
import { RelatedCrmHelper } from '@/modules/entities/RelatedCrm/lib/api/related-crm-helper';
import type {
    DuplicateDetails,
    DuplicateDetailsRequest,
    DuplicateSearchRequest,
    DuplicateSearchResponse,
    JoinToMainRequest,
    MergeCardsRequest,
    SalesHookOperation,
} from '../../model';

/** Опрос операции хука: раз в полторы секунды, не дольше минуты. */
const OPERATION_POLL_MS = 1500;
const OPERATION_POLL_LIMIT = 40;

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
     * «Объединить карточки»: план (dryRun) или слияние (dryRun=false +
     * planHash) хуком merge-duplicates. Без retry на постановке — как у
     * присоединения: повтор POST при сбое дал бы 409.
     */
    async mergeCards(dto: MergeCardsRequest): Promise<SalesHookOperation> {
        const started = await this.hooks.mergeDuplicatesRun(dto);
        return this.waitOperation(dto.domain, started.operationId);
    }

    /** Поллинг статуса операции (shared/lib/wait-operation). */
    private async waitOperation(
        domain: string,
        operationId: string,
    ): Promise<SalesHookOperation> {
        return waitForOperation(
            () =>
                withRetry(() =>
                    this.hooks.salesHookOperationsGetOperation(operationId, {
                        domain,
                    }),
                ),
            {
                intervalMs: OPERATION_POLL_MS,
                attempts: OPERATION_POLL_LIMIT,
                timeoutMessage:
                    'Операция ещё выполняется — обновите приложение через минуту и проверьте сделку',
            },
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
