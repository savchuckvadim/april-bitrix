import { getEventSales } from '@workspace/nest-event-sales-api';
import type {
    EventReportDeferredRequestDto,
    EventReportDeferredResultDto,
} from '@workspace/nest-event-sales-api';
import type { OutboxDeferredStep } from '../outbox-envelope';

/**
 * Досылка хвоста прямого исполнения: `POST /api/event-sales/flow/deferred`
 * (этап А5).
 *
 * Браузер, исполнивший отчёт напрямую, сам делает только то, на что у
 * менеджера есть права. Остальное — KPI-записи, движения сделок воронок
 * «Презентации»/«ХО», элементы смартов с ответами анкеты, синхронизация
 * заявки, уведомление о переносе — копится семантическими шагами в
 * конверте и уезжает сюда, когда сервер оживает.
 *
 * ИСХОДНЫЙ payload отправлять обычной ручкой `/flow` после прямого
 * исполнения НЕЛЬЗЯ (сервер прямого исполнения не видел и выполнил бы
 * отчёт второй раз) — эта ручка исполняет ТОЛЬКО перечисленные шаги.
 * Сервер пересобирает данные шагов из payload, поэтому payload едет
 * целиком, а шаги остаются семантическими.
 *
 * Повтор безопасен: у KPI собственный дедуп, у сайд-джобов детерминированный
 * jobId, сверх того сервер держит отметку исполненных шагов по operationId.
 *
 * Единственное место импорта @workspace/nest-event-sales-api для досылки
 * (паттерн репо: DAL-хелпер на слайс, сырой orval в тханках запрещён).
 */

export type DeferredTailRequest = EventReportDeferredRequestDto;
export type DeferredTailResponse = EventReportDeferredResultDto;

/**
 * Ключ шага в терминах ответа сервера (`pending`): `kind`, а у сайд-flow —
 * `side-flow:{поток}`. Разойдись он с серверным — конверт либо потерял бы
 * неисполненный шаг, либо вечно вёз исполненный.
 */
export const deferredStepKey = (step: OutboxDeferredStep): string =>
    step.kind === 'side-flow' ? `${step.kind}:${step.flow}` : step.kind;

export class DeferredTailHelper {
    private api: ReturnType<typeof getEventSales>;

    constructor() {
        this.api = getEventSales();
    }

    async send(request: DeferredTailRequest): Promise<DeferredTailResponse> {
        return this.api.eventReportDeferredDeferred(request);
    }
}
