/**
 * WS-контракт сайд-очереди ЗПР (бэк:
 * back/apps/event-sales/src/zpr-flow/constants/zpr-flow.const.ts).
 *
 * Событие приходит ТОЧЕЧНО в socketId клиента, отправившего отчёт (тот же
 * механизм, что у основного flow): бэк узнаёт socketId из поля `socketId`
 * flow-запроса. По событию слайс инвалидирует свои react-query-запросы.
 */
export const ZPR_FLOW_DONE_EVENT = 'zpr-flow:done';

export type ZprFlowAction = 'created' | 'closed' | 'spontaneous' | 'skipped';

export interface ZprFlowDonePayload {
    action: ZprFlowAction;
    elementId: number | null;
    domain: string;
    operationId?: string;
    kind: 'plan' | 'report';
}
