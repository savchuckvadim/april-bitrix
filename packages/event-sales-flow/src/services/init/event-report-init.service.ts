import { AppLogger as Logger } from '../../shared/lib/logger';
import { FlowTransport as BitrixService } from '../../ports/flow-transport.port';
import { FlowPortalSource as PortalModel } from '../../ports/flow-portal.port';
import { EventSalesFlowDto } from '../../dto/event-sale-flow/event-sales-flow.dto';
import { IEventReportInitContext } from './event-report-init.types';
import { queueInitReads } from './load-context.query';
import { flattenResults, resolveInitContext } from './resolve-context';

/**
 * Фасад init-фазы. Бэковый `event-report-init.service.ts` разъят планом А2
 * на I/O-сборку читающего батча (`load-context.query.ts`) и чистый резолв
 * (`resolve-context.ts`); здесь остаётся класс с бэковой сигнатурой
 * `loadContext` — ctx собирается тем же порядком: постановка чтений →
 * отправка накопленного батча (`flush` ≡ бэковый
 * `api.callBatchWithConcurrency(1)`) → плоский ответ → сборка контекста.
 */

// Спеки и use-case берут select с фасада — как на бэке.
export { buildDealListSelect } from './resolve-context';

/**
 * Загружает все нужные event-report flow сущности одним HTTP-batch:
 *  - company (по entityId компании),
 *  - все её активные deals по 4 категориям,
 *  - lead (если связан),
 *  - currentTask (если был отчёт по задаче),
 *  - tmcDeal через UF_CRM_TO_PRESENTATION_SALES (для синхронизации с pres).
 *
 * Возвращает {@link IEventReportInitContext} — снимок состояния, на котором
 * дальше работает `EventReportContext` (вычисляет флаги).
 *
 * NB: не держит `this.bitrix` — инстанс передаётся параметром (бэковая
 * конвенция, см. CLAUDE.md race condition).
 */
export class EventReportInitService {
    private readonly logger = new Logger(EventReportInitService.name);

    async loadContext(
        dto: EventSalesFlowDto,
        bitrix: BitrixService,
        portal: PortalModel,
    ): Promise<IEventReportInitContext> {
        const read = await queueInitReads(dto, bitrix, portal, this.logger);

        const batchResults = await bitrix.flush();
        const flat = flattenResults(batchResults);

        return resolveInitContext(dto, read, flat, portal, this.logger);
    }
}
