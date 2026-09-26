import type {
    AiAnalyticsSettings,
    AiDailyPlan,
    AiOverview,
    AiPlanFact,
} from '@/modules/entities/ai-analytics';
import type { AiSettingsTab } from './ai-settings-form.util';

/*
 * Типы и коды чек-листа «Готовность витрины»: ответ на вопрос владельца
 * «донастроить или просто подождать?». Коды — as const, строк-литералов
 * в логике нет. Сборка — ai-setup-checklist.util.ts.
 */

/** Группа пункта: чего не хватает — данных, настройки или времени. */
export const AI_CHECKLIST_GROUP = {
    DATA: 'data',
    CONFIGURE: 'configure',
    WAIT: 'wait',
} as const;
export type AiChecklistGroup =
    (typeof AI_CHECKLIST_GROUP)[keyof typeof AI_CHECKLIST_GROUP];

/** Состояние пункта; unknown — проверить не из чего (нет обзора). */
export const AI_CHECKLIST_STATUS = {
    TODO: 'todo',
    DONE: 'done',
    UNKNOWN: 'unknown',
} as const;
export type AiChecklistStatus =
    (typeof AI_CHECKLIST_STATUS)[keyof typeof AI_CHECKLIST_STATUS];

/** Итог: что делать сейчас (приоритет data > configure > wait > ready). */
export const AI_CHECKLIST_VERDICT = {
    DATA: 'data',
    CONFIGURE: 'configure',
    WAIT: 'wait',
    READY: 'ready',
} as const;
export type AiChecklistVerdict =
    (typeof AI_CHECKLIST_VERDICT)[keyof typeof AI_CHECKLIST_VERDICT];

/** Раздел отображения: три группы, «не проверить» и свёрнутое «Готово». */
export const AI_CHECKLIST_SECTION = {
    ...AI_CHECKLIST_GROUP,
    UNKNOWN: 'unknown',
    DONE: 'done',
} as const;
export type AiChecklistSectionKey =
    (typeof AI_CHECKLIST_SECTION)[keyof typeof AI_CHECKLIST_SECTION];

/** Коды пунктов. */
export const AI_CHECKLIST_ITEM = {
    ACCESS: 'access',
    CALL_COVERAGE: 'call-coverage',
    PILOT: 'pilot',
    NOT_ANALYZED: 'not-analyzed',
    PIPELINE: 'pipeline',
    DATA_QUALITY: 'data-quality',
    TARGETS: 'targets',
    HEAD_PLANS: 'head-plans',
    ROSTER: 'roster',
    CALENDAR: 'calendar',
    /** Праздники и состав до калибровки: бэк их ещё не проверяет. */
    NORMS_GATES: 'norms-gates',
    TENURE: 'tenure',
    PUSH: 'push',
    HYPOTHESIS: 'hypothesis',
    PORTAL_MODEL: 'portal-model',
    HISTORY: 'history',
    PRESENTATIONS: 'presentations',
    NORMS_PRESENTATIONS: 'norms-presentations',
    COMPARABLE: 'comparable',
    TRENDS: 'trends',
    YOY: 'yoy',
    BETA: 'beta',
    /** Причина режима, которой фронт ещё не знает (новый код бэка). */
    REASON: 'reason',
} as const;
export type AiChecklistItemCode =
    (typeof AI_CHECKLIST_ITEM)[keyof typeof AI_CHECKLIST_ITEM];

/** Вид действия: открыть вкладку настроек витрины или текст-инструкция. */
export const AI_CHECKLIST_ACTION = {
    SETTINGS: 'settings',
    TEXT: 'text',
} as const;

export type AiChecklistAction =
    | {
          kind: typeof AI_CHECKLIST_ACTION.SETTINGS;
          tab: AiSettingsTab;
          label: string;
      }
    | { kind: typeof AI_CHECKLIST_ACTION.TEXT; text: string };

/** Прогресс «сколько набрано из нужного». */
export interface AiChecklistProgress {
    value: number;
    target: number;
}

/** Когда ждать: дата YYYY-MM-DD; rough — оценка по темпу, иначе расписание. */
export interface AiChecklistEta {
    date: string;
    rough: boolean;
    /** Время слота расписания (04:00); null — без времени. */
    time: string | null;
}

export interface AiChecklistItem {
    /** Ключ строки: код, у неизвестных причин — код и причина. */
    key: string;
    code: AiChecklistItemCode;
    group: AiChecklistGroup;
    status: AiChecklistStatus;
    /** Рекомендация, а не блокер: на итог не влияет. */
    optional: boolean;
    title: string;
    /** Одно предложение с числами. */
    detail: string;
    /** Что откроется, когда пункт закрыт; null — не указываем. */
    unlocks: string | null;
    progress: AiChecklistProgress | null;
    eta: AiChecklistEta | null;
    actions: AiChecklistAction[];
}

export interface AiChecklistSection {
    key: AiChecklistSectionKey;
    title: string;
    items: AiChecklistItem[];
}

export interface AiSetupChecklist {
    verdict: AiChecklistVerdict;
    /** Одна фраза «что делать сейчас». */
    headline: string;
    /** Непустые разделы в порядке показа. */
    sections: AiChecklistSection[];
}

/** Обзор глазами чек-листа: есть, закрыт (403) или ещё не пришёл. */
export const AI_CHECKLIST_OVERVIEW = {
    READY: 'ready',
    FORBIDDEN: 'forbidden',
    MISSING: 'missing',
} as const;
export type AiChecklistOverviewState =
    (typeof AI_CHECKLIST_OVERVIEW)[keyof typeof AI_CHECKLIST_OVERVIEW];

export interface AiChecklistInput {
    settings: AiAnalyticsSettings;
    /** Данные обзора; null — не загружен или ошибка. */
    overview: AiOverview | null;
    /** Текст ошибки секции обзора (403 → пункт доступа). */
    overviewError?: string | null;
    /**
     * План дня на сегодня — только если ответ готов и относится к сегодня;
     * лишь деталь пункта «Цель месяца», на статусы не влияет.
     */
    dailyPlan?: AiDailyPlan | null;
    /** План-факт (причина plan-snapshot-missing, снимок «Планов» этого месяца). */
    planFact?: AiPlanFact | null;
    /** Имя по Bitrix-id. */
    managerName: (managerId: string) => string;
    /** Сегодня YYYY-MM-DD. */
    today: string;
    /** Может настраивать витрину: кнопки настроек, иначе текст. */
    canConfigure: boolean;
}
