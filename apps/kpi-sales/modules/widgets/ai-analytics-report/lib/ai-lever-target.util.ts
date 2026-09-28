import {
    AI_CALL_SECTION_FALLBACK,
    isAiCallSectionCode,
    aiCallSectionLabel,
} from '@/modules/entities/ai-analytics/lib/ai-call-sections.data';
import { AI_CHECKLIST_LABELS } from '@/modules/entities/ai-analytics/lib/ai-overview.data';

/*
 * Адресат рычага (recommendation.section) по-русски: раздел рубрики
 * разбора (справочник сущности ai-call-sections.data) либо пункт
 * чек-листа. Сырые коды на экран не выводим; незнакомый — нейтральная
 * подпись.
 */

/** Пункты чек-листа: ключи ячейки типа и их варианты в кодах правил. */
export const AI_LEVER_CHECKLIST_LABELS: Record<string, string> = {
    ...AI_CHECKLIST_LABELS,
    next_step_date: AI_CHECKLIST_LABELS.nextStepDateRatePct,
    next_step_date_rate: AI_CHECKLIST_LABELS.nextStepDateRatePct,
    hvost: AI_CHECKLIST_LABELS.hvostDonePct,
    hvost_done: AI_CHECKLIST_LABELS.hvostDonePct,
    five_k: AI_CHECKLIST_LABELS.fiveKDonePct,
    five_k_done: AI_CHECKLIST_LABELS.fiveKDonePct,
    handled: AI_CHECKLIST_LABELS.handledRatePct,
    handled_rate: AI_CHECKLIST_LABELS.handledRatePct,
};

/** Незнакомый адресат рычага — без кода. */
export const AI_LEVER_TARGET_OTHER = AI_CALL_SECTION_FALLBACK;

/** Подпись адресата рычага: раздел рубрики, пункт чек-листа, иначе «другой раздел». */
export const aiLeverSectionLabel = (code: string): string => {
    if (isAiCallSectionCode(code)) return aiCallSectionLabel(code);
    return AI_LEVER_CHECKLIST_LABELS[code] ?? AI_LEVER_TARGET_OTHER;
};
