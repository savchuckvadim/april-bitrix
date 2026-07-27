/**
 * Согласованная подсветка стадий сделки — единые токены --deal-stage-*
 * (april-tokens.css). Используется бэйджами стадий в таблицах горячих
 * клиентов и кнопками порога (threshold) — чтобы «Презентация»,
 * «Документы», «В решении», «В оплате» подсвечивались одинаково везде.
 *
 * Классы записаны СТАТИЧЕСКИ (полными строками) — динамические
 * `bg-deal-stage-${token}` не попадают в Tailwind-purge.
 */
export type DealStageToken =
    | 'pres'
    | 'docs'
    | 'decision'
    | 'payment'
    | 'supply';

/** sales_base ladder code → визуальный токен стадии. */
const STAGE_CODE_TOKEN: Record<string, DealStageToken> = {
    sales_pres: 'pres',
    sales_offer_create: 'docs',
    sales_document_send: 'docs',
    sales_in_progress: 'decision',
    sales_money_await: 'payment',
    sales_supply: 'supply',
};

/** threshold-порог горячих клиентов → токен (для подсветки кнопок). */
export const THRESHOLD_TOKEN: Record<string, DealStageToken> = {
    presentation: 'pres',
    document: 'docs',
};

/** Мягкий бэйдж стадии (заливка/текст/бордер токеном, читаемо в обеих темах). */
const BADGE_CLASS: Record<DealStageToken, string> = {
    pres: 'bg-deal-stage-pres/15 text-deal-stage-pres border-deal-stage-pres/40',
    docs: 'bg-deal-stage-docs/15 text-deal-stage-docs border-deal-stage-docs/40',
    decision:
        'bg-deal-stage-decision/15 text-deal-stage-decision border-deal-stage-decision/40',
    payment:
        'bg-deal-stage-payment/15 text-deal-stage-payment border-deal-stage-payment/40',
    supply: 'bg-deal-stage-supply/15 text-deal-stage-supply border-deal-stage-supply/40',
};

const BUTTON_ACTIVE_CLASS: Record<DealStageToken, string> = {
    pres: 'bg-deal-stage-pres text-deal-stage-pres-foreground border-deal-stage-pres',
    docs: 'bg-deal-stage-docs text-deal-stage-docs-foreground border-deal-stage-docs',
    decision:
        'bg-deal-stage-decision text-deal-stage-decision-foreground border-deal-stage-decision',
    payment:
        'bg-deal-stage-payment text-deal-stage-payment-foreground border-deal-stage-payment',
    supply: 'bg-deal-stage-supply text-deal-stage-supply-foreground border-deal-stage-supply',
};

const BUTTON_IDLE_CLASS: Record<DealStageToken, string> = {
    pres: 'text-deal-stage-pres border-deal-stage-pres/50',
    docs: 'text-deal-stage-docs border-deal-stage-docs/50',
    decision: 'text-deal-stage-decision border-deal-stage-decision/50',
    payment: 'text-deal-stage-payment border-deal-stage-payment/50',
    supply: 'text-deal-stage-supply border-deal-stage-supply/50',
};

export const dealStageToken = (
    stageCode: string | null | undefined,
): DealStageToken | null =>
    stageCode ? (STAGE_CODE_TOKEN[stageCode] ?? null) : null;

/** Классы бэйджа стадии; неизвестная стадия — нейтраль. */
export const dealStageBadgeClass = (
    stageCode: string | null | undefined,
): string => {
    const token = dealStageToken(stageCode);
    return token ? BADGE_CLASS[token] : 'border-border text-muted-foreground';
};

/** Классы threshold-кнопки по её токену и состоянию. */
export const thresholdButtonClass = (
    token: DealStageToken,
    active: boolean,
): string => (active ? BUTTON_ACTIVE_CLASS[token] : BUTTON_IDLE_CLASS[token]);
