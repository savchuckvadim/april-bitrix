import { AI_CALL_TYPE_ALL } from '../lib/ai-call-types.data';
import { aiHelper } from './ai-analytics-thunks.shared';
import {
    loadQueuedSection,
    type AiQueuedLoadOptions,
} from './ai-analytics-queued.loader';

/** Раскладка среза для матриц: строка на пару менеджер × тип. */
const TYPES_MATRIX_LAYOUT = 'wide';

/**
 * Срез by-type для блоков «AI: типы звонков» и «AI: разделы оценки по
 * типу» KPI-вида: всегда все типы в широкой раскладке, в периметре
 * обзора (период глобального фильтра + выбранные менеджеры). Секция
 * `typesMatrix` независима от `byType` drawer'а: выбор подвкладки и
 * раскладки на неё не влияет. queued/processing — ждём WS
 * ai-analytics:overview:done (ключ обзора) и повторяем POST.
 */
export const fetchAiTypesMatrix = (options: AiQueuedLoadOptions = {}) =>
    loadQueuedSection(
        'typesMatrix',
        (scope, queue) =>
            aiHelper.getByType(
                scope.requester,
                scope.filters,
                AI_CALL_TYPE_ALL,
                TYPES_MATRIX_LAYOUT,
                queue,
            ),
        options,
    );
