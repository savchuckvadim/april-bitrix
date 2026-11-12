/**
 * Ответ бэка `POST /api/event-sales/flow/takeover-preview` (TakeoverPreviewDto):
 * что сделает перехват клиента при отправке отчёта. Сгенерированный клиент
 * ещё не перегенерирован — тип зеркалит DTO бэка.
 */
export type TakeoverPreviewDealKind = 'base' | 'xo' | 'pres';

export interface TakeoverPreviewDeal {
    id: number;
    title: string;
    ownerName: string;
    kind: TakeoverPreviewDealKind;
}

export interface TakeoverPreview {
    /** Спрашивать ли менеджера; false — отправлять без вопроса. */
    ask: boolean;
    /** Сделка коллеги, которая перейдёт к менеджеру; null — у него своя. */
    takenDeal: TakeoverPreviewDeal | null;
    closeDeals: TakeoverPreviewDeal[];
    movedTasks: number;
    closedTasks: number;
    closedPresentations: number;
    closedZpr: number;
    /** Сделки коллег на защищённых стадиях — не тронутся. */
    protectedDeals: TakeoverPreviewDeal[];
}
