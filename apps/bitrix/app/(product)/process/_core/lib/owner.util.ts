/**
 * Кодирование владельца стадии — какая сущность её держит при текущих крутилках.
 * Одно место на весь движок: станция, карточка и модалка обязаны выглядеть
 * согласованно, иначе схема начинает противоречить сама себе.
 */

import type { StageOwner } from '../types';

/** Кольцо станции на рельсе. */
export const OWNER_RING_CLASS: Record<StageOwner, string> = {
    lead: 'border-event-lead',
    deal: 'border-primary',
    both: 'border-transparent',
    none: 'border-muted-foreground/40 border-dashed',
};

/** Рамка карточки стадии. */
export const OWNER_CARD_CLASS: Record<StageOwner, string> = {
    lead: 'border-event-lead/50',
    deal: 'border-primary/50',
    both: 'border-transparent',
    none: 'border-dashed border-muted-foreground/30 opacity-60',
};

/** Плашка владельца в модалке. */
export const OWNER_TONE_CLASS: Record<StageOwner, string> = {
    lead: 'border-event-lead/50 bg-event-lead/10 text-event-lead',
    deal: 'border-primary/50 bg-primary/10 text-primary',
    both: 'border-warning/50 bg-warning/10 text-warning',
    none: 'border-destructive/50 bg-destructive/10 text-destructive',
};

export const OWNER_NOTE: Record<StageOwner, string> = {
    lead: 'При текущих настройках этот шаг менеджер делает в карточке лида.',
    deal: 'При текущих настройках этот шаг менеджер делает в сделке.',
    both: 'При текущих настройках шаг живёт сразу в лиде и в сделке: форма одна, но открыть её можно из обоих мест.',
    none: 'При текущих настройках этот шаг не ведёт ни лид, ни сделка — он выпадает из учёта.',
};

/**
 * Полосатая заливка «оба контура»: два токен-цвета под 45°. Кладётся оверлеем
 * ПОВЕРХ карточки, а не в её background: иначе inline-стиль перебьёт
 * `.april-glass-card` и стекло пропадёт.
 */
export const BOTH_STRIPES_BACKGROUND =
    'repeating-linear-gradient(45deg, color-mix(in oklab, var(--event-lead) 20%, transparent) 0 8px, color-mix(in oklab, var(--primary) 20%, transparent) 8px 16px)';

/** Двухцветная станция для «обоих контуров» — на 28 px читается лучше полос. */
export const BOTH_RING_BACKGROUND =
    'linear-gradient(135deg, var(--event-lead) 0 50%, var(--primary) 50% 100%)';
