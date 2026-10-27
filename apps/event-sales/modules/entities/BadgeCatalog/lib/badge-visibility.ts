import type { EV_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-type';
import type { WorkStatusCode } from '@/modules/entities/EventReport/type/event-report-type';
import type { BadgeItem } from '../model/badge-catalog.type';

/**
 * Чистые правила показа и применения бейджиков — отдельно от стора и
 * вёрстки, чтобы их можно было проверить тестами без React.
 */

export interface CommentBadgeContext {
    workStatus: WorkStatusCode;
    /** Презентация проведена — плановая или спонтанная. */
    presentationDone: boolean;
}

/**
 * Бейджики комментария под текущий итог работы.
 *
 * Пустые привязки — показывать всегда. `presentationDone` — не статус, а
 * факт: бейджик «Провёл, думают» нужен при любом статусе после презентации.
 */
export const filterCommentBadges = (
    items: readonly BadgeItem[],
    context: CommentBadgeContext,
): BadgeItem[] =>
    items.filter(item => {
        if (item.target !== 'comment') return false;
        if (item.outcomes.length === 0) return true;
        if (item.outcomes.includes(context.workStatus)) return true;
        return context.presentationDone && item.outcomes.includes('presentationDone');
    });

/** Уточнения названия под тип события — всё, кроме основного текста типа. */
export const filterTitleBadges = (
    items: readonly BadgeItem[],
    planCode: EV_PLAN_CODE | null | undefined,
): BadgeItem[] =>
    items.filter(item => {
        if (item.target !== 'title' || item.isDefault) return false;
        if (item.planTypes.length === 0) return true;
        return !!planCode && item.planTypes.includes(planCode);
    });

/** Основной текст типа события — подставляется сам при выборе типа. */
export const findDefaultTitleBadge = (
    items: readonly BadgeItem[],
    planCode: EV_PLAN_CODE | null | undefined,
): BadgeItem | null =>
    (planCode &&
        items.find(
            item =>
                item.target === 'title' &&
                item.isDefault &&
                item.planTypes.includes(planCode),
        )) ||
    null;

/**
 * Название события из бейджика: «Звонок + имя клиента». Без клиента —
 * просто текст: пустого хвоста после тире не оставляем.
 */
export const composeEventTitle = (text: string, clientName: string): string => {
    const client = clientName.trim();
    return client ? `${text.trim()} — ${client}` : text.trim();
};

/** Конец предложения — после него точку не ставим. */
const ENDS_SENTENCE = /[.!?…]$/;

/**
 * Поставить бейджик в комментарий: пусто — текст целиком; есть текст —
 * дописать через точку; тот же текст уже стоит — ничего не менять (второй
 * клик по бейджику не должен раздувать комментарий).
 */
export const applyBadgeToComment = (current: string, text: string): string => {
    const base = current.trimEnd();
    if (!base) return text;
    if (base.toLowerCase().includes(text.toLowerCase())) return current;
    return `${base}${ENDS_SENTENCE.test(base) ? '' : '.'} ${text}`;
};
