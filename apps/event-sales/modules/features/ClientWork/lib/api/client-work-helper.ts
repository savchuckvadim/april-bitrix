import { getSalesHooks } from '@workspace/nest-event-sales-api';
import { withRetry } from '@/modules/shared/lib/with-retry';
import { waitForOperation } from '@/modules/shared/lib/wait-operation';
import type {
    ClientWork,
    ClientWorkJoinRequest,
    ClientWorkRequest,
    SalesHookOperation,
} from '../../model';

/**
 * Опрос операции присоединения: раз в две секунды, до четырёх минут — пачка
 * сделок идёт по одной (контакты, лиды, задачи, дела у каждой).
 */
const OPERATION_POLL_MS = 2000;
const OPERATION_POLL_LIMIT = 120;

/**
 * Единственное место импорта `@workspace/nest-event-sales-api` для
 * блока «Открытые сделки по клиенту». Список — с ретраями (стартует сам при открытии
 * сделки); постановка присоединения — без: повтор POST в момент сбоя дал
 * бы 409 «уже выполняется».
 */
export class ClientWorkHelper {
    private hooks = getSalesHooks();

    async load(dto: ClientWorkRequest): Promise<ClientWork> {
        return withRetry(() => this.hooks.clientWorkDeals(dto));
    }

    async join(dto: ClientWorkJoinRequest): Promise<SalesHookOperation> {
        const started = await this.hooks.clientWorkJoin(dto);
        return waitForOperation(
            () =>
                withRetry(() =>
                    this.hooks.salesHookOperationsGetOperation(
                        started.operationId,
                        { domain: dto.domain },
                    ),
                ),
            {
                intervalMs: OPERATION_POLL_MS,
                attempts: OPERATION_POLL_LIMIT,
                timeoutMessage:
                    'Присоединение ещё идёт — обновите приложение через пару минут и проверьте сделки',
            },
        );
    }
}
