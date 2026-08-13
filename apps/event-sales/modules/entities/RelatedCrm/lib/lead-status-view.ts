/**
 * Как показывать статус лида. Данные отдельно от вёрстки.
 *
 * Битрикс отдаёт две вещи: `statusId` — код стадии портала (у каждого клиента
 * свой набор), и `statusSemanticId` — её смысл: P (в работе), S (успех),
 * F (провал). Красим по семантике: она одинакова на всех порталах, а коды
 * стадий — нет.
 */
export type LeadSemantic = 'P' | 'S' | 'F';

export interface LeadStatusView {
    label: string;
    className: string;
}

const SEMANTIC_VIEW: Record<LeadSemantic, LeadStatusView> = {
    P: { label: 'В работе', className: 'bg-warning/15 text-warning' },
    S: { label: 'Успех', className: 'bg-success/15 text-success' },
    F: { label: 'Провал', className: 'bg-destructive/15 text-destructive' },
};

const UNKNOWN_VIEW: LeadStatusView = {
    label: 'Статус неизвестен',
    className: 'bg-muted text-muted-foreground',
};

export const getLeadStatusView = (
    semantic: string | null | undefined,
): LeadStatusView => SEMANTIC_VIEW[semantic as LeadSemantic] ?? UNKNOWN_VIEW;

/** Лид в работе — такие показываем всегда, остальные прячем под кнопку. */
export const isLeadOpen = (semantic: string | null | undefined): boolean =>
    semantic === 'P' || !semantic;

/**
 * Как назвать лид в списке.
 *
 * У лида с портала название бывает пустым (создан роботом, без TITLE), и
 * строка списка превращалась в пустую рамку: заголовка нет, ответственного
 * нет, стадия скрыта — карточка «Лиды (1)» с ничем внутри. Номер здесь —
 * не украшение, а единственное, за что можно зацепиться глазом.
 */
export const leadDisplayTitle = (lead: {
    id: number;
    title?: string | null;
}): string => lead.title?.trim() || `Заявка №${lead.id}`;
