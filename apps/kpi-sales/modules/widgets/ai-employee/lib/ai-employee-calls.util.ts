import type {
    AiAttention,
    AiManagerRow,
    AiPulse,
    AiPulseAlertKind,
} from '@/modules/entities/ai-analytics/model';
import { aiCardLink } from '@/modules/widgets/ai-analytics-report/lib/ai-card-link.util';

/*
 * Подвкладка «Звонки»: риск-звонки с цитатами (сигналы пульса по
 * сотруднику плюс риск-звонки строки обзора без дублей, свежие первыми),
 * звонки с низкой оценкой (факты качества строки обзора) и карта ссылок
 * на карточки разбора по id транскрипции — из всех ответов, где ссылка
 * есть. Старый кэш без полей — пустые списки с честной подписью.
 */

export type AiEmployeeLinkMap = Map<string, string>;

/** Ссылки на карточки разбора по id транскрипции из строки, «Внимания» и пульса. */
export const buildAiEmployeeLinkMap = (input: {
    row: AiManagerRow | null;
    attention: AiAttention | null;
    pulse: AiPulse | null;
    managerId: string;
}): AiEmployeeLinkMap => {
    const map: AiEmployeeLinkMap = new Map();
    const put = (id: string, link: unknown) => {
        const address = aiCardLink(link);
        if (address && !map.has(id)) map.set(id, address);
    };
    for (const call of input.row?.riskCalls ?? []) put(call.transcriptionId, call.link);
    for (const item of input.attention?.items ?? []) {
        if (item.managerId !== input.managerId) continue;
        for (const call of item.link.calls ?? []) put(call.transcriptionId, call.link);
    }
    for (const alert of input.pulse?.alerts ?? []) {
        if (alert.managerId === input.managerId) put(alert.transcriptionId, alert.link);
    }
    return map;
};

export interface AiEmployeeRiskCall {
    transcriptionId: string;
    kind: AiPulseAlertKind;
    callStartedAt: string;
    /** Цитата из сигнала пульса; у риск-звонков обзора цитаты нет. */
    quote: string | null;
    link: string | null;
    /** Отработан ли сигнал (известно только у сигналов пульса). */
    handled: boolean | null;
}

const byNewest = (a: { callStartedAt: string }, b: { callStartedAt: string }) =>
    b.callStartedAt.localeCompare(a.callStartedAt);

/** Риск-звонки сотрудника: сигналы пульса (с цитатой) и риск-звонки обзора без дублей. */
export const buildAiEmployeeRiskCalls = (input: {
    row: AiManagerRow | null;
    pulse: AiPulse | null;
    managerId: string;
    links: AiEmployeeLinkMap;
}): AiEmployeeRiskCall[] => {
    const seen = new Set<string>();
    const calls: AiEmployeeRiskCall[] = [];
    for (const alert of input.pulse?.alerts ?? []) {
        if (alert.managerId !== input.managerId || seen.has(alert.transcriptionId)) continue;
        seen.add(alert.transcriptionId);
        calls.push({
            transcriptionId: alert.transcriptionId,
            kind: alert.kind,
            callStartedAt: alert.callStartedAt,
            quote: alert.quote.trim() || null,
            link: input.links.get(alert.transcriptionId) ?? null,
            handled: alert.handled,
        });
    }
    for (const call of input.row?.riskCalls ?? []) {
        if (seen.has(call.transcriptionId)) continue;
        seen.add(call.transcriptionId);
        calls.push({
            transcriptionId: call.transcriptionId,
            kind: call.kind,
            callStartedAt: call.callStartedAt,
            quote: null,
            link: input.links.get(call.transcriptionId) ?? null,
            handled: null,
        });
    }
    return calls.sort(byNewest);
};

export interface AiEmployeeLowCall {
    transcriptionId: string;
    callType: string | null;
    score: number;
    link: string | null;
}

/** Звонки с низкой оценкой из фактов качества строки, худшие первыми. */
export const buildAiEmployeeLowCalls = (
    row: AiManagerRow | null,
    links: AiEmployeeLinkMap,
): AiEmployeeLowCall[] =>
    [...(row?.quality?.lowScoreCalls ?? [])]
        .sort((a, b) => a.score - b.score)
        .map(call => ({
            transcriptionId: call.transcriptionId,
            callType: call.callType,
            score: call.score,
            link: links.get(call.transcriptionId) ?? null,
        }));

/** Порог «низкой оценки» из ответа; старый кэш без фактов качества — null. */
export const aiEmployeeLowScoreMax = (row: AiManagerRow | null): number | null =>
    row?.quality?.thresholds.lowScoreCallMax ?? null;

/** Строка обзора без блока качества — обзор сохранён до появления поля. */
export const isAiEmployeeQualityMissing = (row: AiManagerRow | null): boolean =>
    row !== null && row.quality === undefined;
