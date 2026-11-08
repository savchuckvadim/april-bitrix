import type { Tone } from '@workspace/april-ui/tones';
import type { SupportSignalKind } from '../model';

/** Статусы чек-листа и ссылки — общие для путеводителей админки. */
export {
    CHECK_STATUS_LABEL,
    CHECK_STATUS_TONE,
    isExternalHref,
    summarizeChecklist,
} from '@/modules/shared/ui/guide/guide-view';

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

/** «12 мин», «1 ч 5 мин», «2 ч»; 0 — ответили. */
export const formatWait = (minutes: number): string => {
    if (minutes <= 0) return 'ответили';
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) return `${rest} мин`;
    return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
};
