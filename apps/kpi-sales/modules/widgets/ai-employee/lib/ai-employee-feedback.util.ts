import { addMonths, format, startOfMonth } from 'date-fns';
import type {
    AiFeedbackItem,
    AiFeedbackList,
    AiRopMarkCall,
    AiRopMarkWeek,
} from '@/modules/entities/ai-analytics/model';
import {
    AI_DOSSIER_FEEDBACK_KIND_LABELS,
    aiDossierFeedbackKindLabel,
} from '@/modules/entities/ai-analytics/lib/ai-dossier.util';
import { aiFeedbackObjectLabel } from '@/modules/entities/ai-analytics/lib/ai-feedback.util';

/*
 * Подвкладка «Обратная связь»: период списка реакций (период отчёта, иначе
 * текущий и два прошлых месяца), группировка реакций по видам, последние
 * записи словами, звонки подбора недели по сотруднику.
 */

/** Сколько месяцев назад начинать период без фильтра отчёта (текущий и два прошлых). */
export const AI_EMPLOYEE_FEEDBACK_MONTHS_BACK = 2;

export const AI_EMPLOYEE_FEEDBACK_ITEMS_MAX = 10;

const DAY = 'yyyy-MM-dd';

/** Период списка реакций: период обзора, иначе от первого дня позапрошлого месяца до сегодня. */
export const aiEmployeeFeedbackPeriod = (
    scope: { from: string; to: string } | null,
    today: string,
): { from: string; to: string } => {
    if (scope) return { from: scope.from, to: scope.to };
    const from = startOfMonth(
        addMonths(new Date(`${today}T00:00:00`), -AI_EMPLOYEE_FEEDBACK_MONTHS_BACK),
    );
    return { from: format(from, DAY), to: today };
};

export interface AiEmployeeFeedbackGroup {
    kind: string;
    label: string;
    count: number;
}

/** Счётчики по видам реакций в порядке справочника; незнакомые виды — в конце. */
export const aiEmployeeFeedbackGroups = (
    list: AiFeedbackList | null,
): AiEmployeeFeedbackGroup[] => {
    if (!list) return [];
    const counts = new Map<string, number>();
    for (const item of list.items) {
        counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1);
    }
    const known = Object.keys(AI_DOSSIER_FEEDBACK_KIND_LABELS);
    const order = [
        ...known.filter(kind => counts.has(kind)),
        ...[...counts.keys()].filter(kind => !known.includes(kind)),
    ];
    return order.map(kind => ({
        kind,
        label: aiDossierFeedbackKindLabel(kind),
        count: counts.get(kind) ?? 0,
    }));
};

export interface AiEmployeeFeedbackView {
    id: string;
    kindLabel: string;
    objectLabel: string;
    createdAt: string;
    reason: string | null;
}

const byNewest = (a: AiFeedbackItem, b: AiFeedbackItem) =>
    b.createdAt.localeCompare(a.createdAt);

/** Последние реакции словами (вид, объект, когда, причина), новые первыми. */
export const aiEmployeeFeedbackItems = (
    list: AiFeedbackList | null,
    max: number = AI_EMPLOYEE_FEEDBACK_ITEMS_MAX,
): { items: AiEmployeeFeedbackView[]; hidden: number } => {
    const sorted = [...(list?.items ?? [])].sort(byNewest);
    return {
        items: sorted.slice(0, max).map(item => ({
            id: item.id,
            kindLabel: aiDossierFeedbackKindLabel(item.kind),
            objectLabel: aiFeedbackObjectLabel(item.object),
            createdAt: item.createdAt,
            reason: item.reason?.trim() || null,
        })),
        hidden: Math.max(0, sorted.length - max),
    };
};

/** Звонки подбора недели по сотруднику (подбора нет — пусто). */
export const aiEmployeeRopMarkCalls = (
    week: AiRopMarkWeek | null,
    managerId: string,
): AiRopMarkCall[] =>
    (week?.calls ?? []).filter(call => call.managerId === managerId);
