import type { Tone } from '@workspace/april-ui/tones';
import type { GuideCheck, GuideCheckStatus } from './guide.types';

/** Цвет пункта чек-листа: сделано, не сделано, проверить руками. */
export const CHECK_STATUS_TONE: Record<GuideCheckStatus, Tone> = {
    done: 'success',
    todo: 'warning',
    manual: 'muted',
};

export const CHECK_STATUS_LABEL: Record<GuideCheckStatus, string> = {
    done: 'готово',
    todo: 'не сделано',
    manual: 'проверить вручную',
};

/** Ссылка ведёт наружу (портал Битрикса, сайт), а не на страницу админки. */
export const isExternalHref = (href: string): boolean =>
    /^https?:\/\//i.test(href);

/** Итог чек-листа для шапки: сколько сделано из того, что видно по настройкам. */
export const summarizeChecklist = (
    checks: readonly GuideCheck[],
): { done: number; todo: number; manual: number } => ({
    done: checks.filter(check => check.status === 'done').length,
    todo: checks.filter(check => check.status === 'todo').length,
    manual: checks.filter(check => check.status === 'manual').length,
});
