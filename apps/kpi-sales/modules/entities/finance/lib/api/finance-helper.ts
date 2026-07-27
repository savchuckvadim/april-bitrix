import {
    getSalesFinance,
    ClosedSalesRequestDto,
    ClosedSalesResponseDto,
    HotClientsRequestDto,
    HotClientsResponseDto,
    SalesFinanceCacheResetRequestDtoScope,
    SalesFinanceCacheResetResponseDto,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Финансовая аналитика ОП — единственное место импорта generated-клиента
 * sales-finance. Ответ ready|queued: при queued результат приходит по WS
 * (sales-finance:*:done на socketId запроса).
 */
export class FinanceHelper {
    private api: ReturnType<typeof getSalesFinance>;

    constructor() {
        this.api = getSalesFinance();
    }

    async getClosedSales(
        dto: ClosedSalesRequestDto,
    ): Promise<ClosedSalesResponseDto> {
        return await this.api.salesFinanceGetClosedSales(dto);
    }

    async getHotClients(
        dto: HotClientsRequestDto,
    ): Promise<HotClientsResponseDto> {
        return await this.api.salesFinanceGetHotClients(dto);
    }

    async resetCache(
        domain: string,
        scope?: SalesFinanceCacheResetRequestDtoScope,
    ): Promise<SalesFinanceCacheResetResponseDto> {
        return await this.api.salesFinanceResetCache({ domain, scope });
    }
}
