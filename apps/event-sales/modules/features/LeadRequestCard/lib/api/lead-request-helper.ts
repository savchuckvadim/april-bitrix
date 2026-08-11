import {
    getEventSalesLeadRequest,
    getSalesHooks,
} from '@workspace/nest-event-sales-api';
import { withRetry } from '@/modules/shared/lib/with-retry';
import type {
    LeadRequestAcceptResult,
    LeadRequestCard,
    LeadRequestUpdate,
    LeadRequestUpdateResult,
} from '../../model';

/**
 * Единственное место импорта `@workspace/nest-event-sales-api` для
 * карточки заявки (card/update/accept + передача через lead-to-work хук).
 */
export class LeadRequestHelper {
    private api: ReturnType<typeof getEventSalesLeadRequest>;
    private hooks: ReturnType<typeof getSalesHooks>;

    constructor() {
        this.api = getEventSalesLeadRequest();
        this.hooks = getSalesHooks();
    }

    async getCard(domain: string, leadId: number): Promise<LeadRequestCard> {
        return withRetry(() => this.api.leadRequestCard(leadId, { domain }));
    }

    async update(dto: LeadRequestUpdate): Promise<LeadRequestUpdateResult> {
        // Без retry: обновление не идемпотентно по истории (append-запись).
        return this.api.leadRequestUpdate(dto);
    }

    /** Принятие заявки менеджером (идемпотентно на бэке). */
    async accept(
        domain: string,
        leadId: number,
        userId?: number,
    ): Promise<LeadRequestAcceptResult> {
        return this.api.leadRequestAccept({ domain, leadId, userId });
    }

    /**
     * «Передать другому»: повторный ХО без responsible — бэк выберет
     * следующего round-robin в отделе передающего, исключив его самого,
     * и подсветит самопередачу в истории заявки.
     */
    async transfer(
        domain: string,
        leadId: number,
        transferredBy: number,
    ): Promise<unknown> {
        return this.hooks.leadToWorkRun({
            domain,
            leadId,
            isXo: 'Y',
            stageMode: 'new',
            taskMode: 'close',
            transferredBy,
            excludeResponsible: transferredBy,
        });
    }

    /**
     * «Преобразовать в работу»: лид без живой основной сделки → хук
     * lead-to-work (сделка по зеркалу стадии лида, задачи переносятся,
     * без ХО-части). Reuse-гейт бэка делает повтор безопасным.
     */
    async convertToWork(
        domain: string,
        leadId: number,
        responsible?: number,
    ): Promise<unknown> {
        return this.hooks.leadToWorkRun({
            domain,
            leadId,
            isXo: 'N',
            stageMode: 'from_lead',
            taskMode: 'move',
            responsible,
        });
    }

    /** Глубокая проверка дублей с итогом в timeline лида (6-й хук). */
    async deepDuplicateCheck(
        domain: string,
        leadId: number,
    ): Promise<unknown> {
        return this.hooks.duplicateCheckRun({
            domain,
            entityType: 'lead',
            entityId: leadId,
            level: 'deep',
            writeTimeline: 'Y',
        });
    }
}
