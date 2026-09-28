import type { AiRopMarkWeek } from '@/modules/entities/ai-analytics/model';
import type { AiStatus } from '@/modules/entities/ai-analytics/model/ai-analytics-slice';
import { isAiRopMarkWeekEmpty } from '@/modules/entities/ai-analytics/lib/ai-rop-mark-week.util';
import { aiUserErrorText } from '@/modules/entities/ai-analytics/lib/ai-error.util';
import { isAiSectionAccessError } from './ai-section-error.util';

/*
 * Что показывает карточка слепой оценки (чистая логика): загрузку, ошибку
 * (понятный текст сервера; служебный — запасной), «подбора нет»,
 * «звонков нет» или звонки. Импорты сущности точечные, чтобы vitest не
 * тянул UI-кит через барель.
 */

export type AiRopMarkCardView =
    | 'loading'
    | 'error'
    | 'noPick'
    | 'noCalls'
    | 'calls';

/**
 * Режим карточки. Пока перечитываем неделю (после метки или «Подобрать
 * заново»), прежние данные остаются на экране.
 */
export const aiRopMarkCardView = (
    status: AiStatus,
    week: AiRopMarkWeek | null,
): AiRopMarkCardView => {
    if (status === 'error') return 'error';
    if (!week) return 'loading';
    if (isAiRopMarkWeekEmpty(week)) return 'noPick';
    return week.calls.length ? 'calls' : 'noCalls';
};

/** Подбор недели сделан, но звонков-кандидатов в нём нет. */
export const AI_ROP_MARK_NO_CALLS_TEXT = 'Звонков для оценки пока нет';

/** Запас, если сервер не прислал текст ошибки. */
export const AI_ROP_MARK_LOAD_ERROR = 'Не удалось загрузить звонки недели';

/** Подсказка к неактивным «Сохранить метку», «Подобрать», «Подобрать заново». */
export const AI_ROP_MARK_VIEW_AS_HINT =
    'В режиме просмотра подбор и метки не сохраняются';

/** Упоминание доступа в тексте 403 («недоступна…», «доступна только…»). */
const ACCESS_TEXT = /доступ/i;

export interface AiRopMarkErrorView {
    /** Понятный текст сервера (например, отказ сотруднику April); служебный — запасной. */
    text: string;
    /** Повтор имеет смысл: не отказ в доступе и не выключенный раздел. */
    canRetry: boolean;
}

export const aiRopMarkErrorView = (
    error: string | null | undefined,
): AiRopMarkErrorView => {
    const raw = error?.trim() ?? '';
    return {
        text: aiUserErrorText(raw, AI_ROP_MARK_LOAD_ERROR),
        canRetry: !isAiSectionAccessError(raw) && !ACCESS_TEXT.test(raw),
    };
};
