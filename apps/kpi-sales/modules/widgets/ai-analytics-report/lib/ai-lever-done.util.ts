import type { AiFeedbackKind } from '@/modules/entities/ai-analytics/model';
import { AI_FEEDBACK_OBJECT } from '@/modules/entities/ai-analytics/lib/ai-pulse.data';
import { formatAiDateRu, type AiRecommendation } from './ai-signal.util';

/*
 * Кнопки «Сделано» и «Не согласен» у совета в строке обзора: объект
 * реакции lever:{id менеджера}:{ключ совета}, виды recommendation_done и
 * disagree — эффект советов считает выполнение и несогласия именно по
 * объекту совета (несогласие со строкой обзора туда не попадает).
 * Отметка «сделано» — по полю done из обзора либо сразу после успешной
 * записи (не ждём перечитки обзора). Без React — vitest.
 */

/** Вид реакции «Сделано». */
export const AI_LEVER_DONE_KIND =
    'recommendation_done' as const satisfies AiFeedbackKind;

export const AI_LEVER_DONE_TEXT = {
    button: 'Сделано',
    buttonTitle: 'Отметить совет выполненным',
    badge: 'сделано',
} as const;

/** Вид реакции «Не согласен» с советом. */
export const AI_LEVER_DISAGREE_KIND =
    'disagree' as const satisfies AiFeedbackKind;

export const AI_LEVER_DISAGREE_TEXT = {
    button: 'Не согласен',
    buttonTitle: 'Совет не подходит этому менеджеру',
    badge: 'не согласен',
} as const;

/** Совет можно отметить: у него есть ключ (старый ответ бэка ключа не несёт). */
export const aiLeverCanMark = (
    recommendation: Pick<AiRecommendation, 'key'>,
): boolean =>
    typeof recommendation.key === 'string' && recommendation.key.length > 0;

/** Объект реакции «Сделано» по совету менеджера. */
export const aiLeverFeedbackObject = (
    managerId: string,
    recommendation: Pick<AiRecommendation, 'key'>,
): string => AI_FEEDBACK_OBJECT.lever(managerId, recommendation.key);

/**
 * Совет выполнен: отмечен в обзоре (done) либо отметка только что
 * записана (sent) — оптимистично, до перечитки обзора.
 */
export const isAiLeverDone = (
    recommendation: Pick<AiRecommendation, 'done'>,
    sent: AiFeedbackKind | null,
): boolean => recommendation.done === true || sent === AI_LEVER_DONE_KIND;

/** Несогласие с советом только что записано (обзор его не возвращает). */
export const isAiLeverDisagreed = (sent: AiFeedbackKind | null): boolean =>
    sent === AI_LEVER_DISAGREE_KIND;

/** Строка подсказки «Совет выдан 07.09.2026»; дня выдачи нет — null. */
export const aiLeverIssuedLine = (
    recommendation: Pick<AiRecommendation, 'issuedAt'>,
): string | null =>
    recommendation.issuedAt
        ? `Совет выдан ${formatAiDateRu(recommendation.issuedAt)}`
        : null;
