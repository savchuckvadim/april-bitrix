import type { AiRopMarkWeek } from '../model';

/*
 * Неделя слепой оценки (rop-mark) — чистые предикаты без стора и API,
 * чтобы их брали и thunks, и лёгкие утилиты виджета.
 */

/** Подбора недели ещё нет: list отвечает пустым calls и пустым generatedAt. */
export const isAiRopMarkWeekEmpty = (week: AiRopMarkWeek): boolean =>
    !week.generatedAt && week.calls.length === 0;
