import type { WorkStatusCode } from '../type/event-report-type';

/**
 * Как красить статус работы. Данные отдельно от вёрстки.
 *
 * Тон несёт смысл, а не украшает: «Продажа» и «Отказ» — исходы, и менеджер
 * должен видеть, что выбрал именно исход, а не промежуточное состояние.
 */
export interface WorkStatusView {
    /** Класс выбранного сегмента. */
    activeClass: string;
}

const VIEW: Record<WorkStatusCode, WorkStatusView> = {
    inJob: { activeClass: 'bg-foreground text-background' },
    setAside: { activeClass: 'bg-warning text-warning-foreground' },
    success: { activeClass: 'bg-success text-success-foreground' },
    fail: { activeClass: 'bg-destructive text-destructive-foreground' },
};

const FALLBACK: WorkStatusView = {
    activeClass: 'bg-foreground text-background',
};

export const getWorkStatusView = (code: WorkStatusCode): WorkStatusView =>
    VIEW[code] ?? FALLBACK;
