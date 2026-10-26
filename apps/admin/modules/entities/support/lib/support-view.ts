import type { Tone } from '@workspace/april-ui/tones';
import type {
    SupportGuideCheck,
    SupportGuideCheckStatus,
    SupportSignalKind,
} from '../model';

/** Цвет пункта чек-листа: сделано, не сделано, проверить руками. */
export const CHECK_STATUS_TONE: Record<SupportGuideCheckStatus, Tone> = {
    done: 'success',
    todo: 'warning',
    manual: 'muted',
};

export const CHECK_STATUS_LABEL: Record<SupportGuideCheckStatus, string> = {
    done: 'готово',
    todo: 'не сделано',
    manual: 'проверить вручную',
};

export const SIGNAL_KIND_LABEL: Record<SupportSignalKind, string> = {
    new_dialog: 'Новый диалог',
    waiting: 'Ждёт ответа',
    escalation: 'Ждёт долго',
};

export const SIGNAL_KIND_TONE: Record<SupportSignalKind, Tone> = {
    new_dialog: 'info',
    waiting: 'warning',
    escalation: 'destructive',
};

/** Ссылка ведёт наружу (портал Битрикса), а не на страницу админки. */
export const isExternalHref = (href: string): boolean =>
    /^https?:\/\//i.test(href);

/** Итог чек-листа для шапки: сколько сделано из того, что видно по настройкам. */
export const summarizeChecklist = (
    checks: readonly SupportGuideCheck[],
): { done: number; todo: number; manual: number } => ({
    done: checks.filter(check => check.status === 'done').length,
    todo: checks.filter(check => check.status === 'todo').length,
    manual: checks.filter(check => check.status === 'manual').length,
});

/** «12 мин», «1 ч 5 мин», «2 ч»; 0 — ответили. */
export const formatWait = (minutes: number): string => {
    if (minutes <= 0) return 'ответили';
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) return `${rest} мин`;
    return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
};
