/**
 * Как называется место работы менеджера при текущей конфигурации.
 * Одна формулировка на схему, детальный процесс и регламент.
 */

import type { CallsAppPlacement } from '../types';

/** Родительный падеж для подстановки: «Перешёл в карточку {…}». */
export const callsPlacementLabel = (
    placement: CallsAppPlacement,
): string | null => {
    if (placement.isSplit) return 'лида или сделки';
    if (placement.inLead) return 'лида';
    if (placement.inDeal) return 'сделки';
    return null;
};

/** Именительный падеж для заголовков и регламента. */
export const callsPlacementName = (placement: CallsAppPlacement): string => {
    if (placement.isSplit) return 'карточка лида и карточка сделки';
    if (placement.inLead) return 'карточка лида';
    if (placement.inDeal) return 'карточка сделки';
    return 'рабочего места нет';
};
