import {
    getSalesHooks,
    type SalesHookOperationDto,
    type TransferWorkRunDto,
} from '@workspace/nest-event-sales-api';
import { withRetry } from '@/modules/shared/lib/with-retry';
import { waitForOperation } from '@/modules/shared/lib/wait-operation';

/** Опрос операции хука: раз в полторы секунды, не дольше двух минут. */
const OPERATION_POLL_MS = 1500;
const OPERATION_POLL_LIMIT = 80;

/**
 * Единственное место транспорта «Передать работу»: ставит операцию хука
 * transfer-work и ждёт её итога. Без retry на постановке — повторный POST в
 * момент сетевого сбоя дал бы 409 «уже выполняется».
 */
export class TransferWorkHelper {
    private hooks = getSalesHooks();

    async transfer(
        action: 'give' | 'take',
        dto: TransferWorkRunDto,
    ): Promise<SalesHookOperationDto> {
        const started =
            action === 'give'
                ? await this.hooks.transferWorkGive(dto)
                : await this.hooks.transferWorkTake(dto);
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
                    'Передача ещё выполняется — обновите приложение через минуту',
            },
        );
    }
}
