import {
    isAiKpiOnly,
    type AiAnalyticsSettings,
    type AiDailyPlan,
    type AiOverview,
    type AiPlanFact,
    type AiReadiness,
} from '@/modules/entities/ai-analytics';
import {
    detectAiSectionErrorKind,
    type AiSectionErrorKind,
} from './ai-section-error.util';
import type { AiSettingsTab } from './ai-settings-form.util';
import {
    AI_CHECKLIST_NAMES_MAX,
    AI_CHECKLIST_TAB_LABELS,
} from './ai-setup-checklist.data';
import { AI_CHECKLIST_TEXT } from './ai-setup-checklist.texts';
import {
    AI_CHECKLIST_ACTION,
    AI_CHECKLIST_OVERVIEW,
    AI_CHECKLIST_STATUS,
    type AiChecklistAction,
    type AiChecklistGroup,
    type AiChecklistInput,
    type AiChecklistItem,
    type AiChecklistItemCode,
    type AiChecklistOverviewState,
} from './ai-setup-checklist.types';

/*
 * Контекст сборки чек-листа (входы, нормализованные один раз) и фабрики
 * пунктов/действий — общие для coverage / configure / wait.
 */

export interface AiChecklistContext {
    settings: AiAnalyticsSettings;
    readiness: AiReadiness;
    /** Причины режима без дублей. */
    reasons: ReadonlySet<string>;
    /** Обзор только в состоянии ready, иначе null. */
    overview: AiOverview | null;
    overviewState: AiChecklistOverviewState;
    dailyPlan: AiDailyPlan | null;
    planFact: AiPlanFact | null;
    managerName: (managerId: string) => string;
    today: string;
    canConfigure: boolean;
}

/** 403 «как менеджер» / «доступ запрещён» — обзор закрыт для роли. */
const ACCESS_ERROR_KINDS: ReadonlySet<AiSectionErrorKind> =
    new Set<AiSectionErrorKind>(['selfView', 'forbidden']);

/** Обзор глазами чек-листа: закрыт (403), есть или ещё не пришёл. */
export const aiChecklistOverviewState = (
    overview: AiOverview | null,
    error: string | null | undefined,
): AiChecklistOverviewState => {
    const kind = detectAiSectionErrorKind(error);
    if (kind && ACCESS_ERROR_KINDS.has(kind)) {
        return AI_CHECKLIST_OVERVIEW.FORBIDDEN;
    }
    return overview
        ? AI_CHECKLIST_OVERVIEW.READY
        : AI_CHECKLIST_OVERVIEW.MISSING;
};

export const buildAiChecklistContext = (
    input: AiChecklistInput,
): AiChecklistContext => {
    const overviewState = aiChecklistOverviewState(
        input.overview,
        input.overviewError,
    );
    return {
        settings: input.settings,
        readiness: input.settings.readiness,
        reasons: new Set(input.settings.readiness.reasons),
        overview:
            overviewState === AI_CHECKLIST_OVERVIEW.READY
                ? input.overview
                : null,
        overviewState,
        dailyPlan: input.dailyPlan ?? null,
        planFact: input.planFact ?? null,
        managerName: input.managerName,
        today: input.today,
        canConfigure: input.canConfigure,
    };
};

type ItemFields = Pick<AiChecklistItem, 'title' | 'detail'> &
    Partial<
        Pick<
            AiChecklistItem,
            'key' | 'optional' | 'unlocks' | 'progress' | 'eta' | 'actions'
        >
    >;

const item = (
    code: AiChecklistItemCode,
    group: AiChecklistGroup,
    status: AiChecklistItem['status'],
    fields: ItemFields,
): AiChecklistItem => ({
    key: fields.key ?? code,
    code,
    group,
    status,
    optional: fields.optional ?? false,
    title: fields.title,
    detail: fields.detail,
    unlocks: fields.unlocks ?? null,
    progress: fields.progress ?? null,
    eta: fields.eta ?? null,
    actions: fields.actions ?? [],
});

/** Пункт «надо сделать / подождать». */
export const aiTodoItem = (
    code: AiChecklistItemCode,
    group: AiChecklistGroup,
    fields: ItemFields,
): AiChecklistItem => item(code, group, AI_CHECKLIST_STATUS.TODO, fields);

/** Закрытый пункт — в свёрнутый раздел «Готово». */
export const aiDoneItem = (
    code: AiChecklistItemCode,
    group: AiChecklistGroup,
    fields: ItemFields,
): AiChecklistItem => item(code, group, AI_CHECKLIST_STATUS.DONE, fields);

/** Пункт, который сейчас не проверить: не «готово» и не «надо». */
export const aiUnknownItem = (
    code: AiChecklistItemCode,
    group: AiChecklistGroup,
    fields: ItemFields,
): AiChecklistItem => item(code, group, AI_CHECKLIST_STATUS.UNKNOWN, fields);

/** Почему пункт без обзора не проверить: нет доступа, нет разборов (kpi-only) или обзор ещё считается. */
const overviewUnknownDetail = (ctx: AiChecklistContext): string => {
    if (ctx.overviewState === AI_CHECKLIST_OVERVIEW.FORBIDDEN) {
        return AI_CHECKLIST_TEXT.unknown.forbidden;
    }
    return isAiKpiOnly(ctx.readiness.mode)
        ? AI_CHECKLIST_TEXT.unknown.kpiOnly
        : AI_CHECKLIST_TEXT.unknown.missing;
};

/** Пункт, который без обзора не проверить. */
export const aiOverviewUnknownItem = (
    ctx: AiChecklistContext,
    code: AiChecklistItemCode,
    group: AiChecklistGroup,
    title: string,
): AiChecklistItem =>
    aiUnknownItem(code, group, { title, detail: overviewUnknownDetail(ctx) });

export const aiTextAction = (text: string): AiChecklistAction => ({
    kind: AI_CHECKLIST_ACTION.TEXT,
    text,
});

/**
 * Открыть вкладку настроек — только тому, кто настраивает; остальным
 * (руководителю группы) — текст «кто и где это делает».
 */
export const aiSettingsAction = (
    ctx: Pick<AiChecklistContext, 'canConfigure'>,
    tab: AiSettingsTab,
    label: string,
): AiChecklistAction =>
    ctx.canConfigure
        ? { kind: AI_CHECKLIST_ACTION.SETTINGS, tab, label }
        : aiTextAction(
              AI_CHECKLIST_TEXT.viaLeader(AI_CHECKLIST_TAB_LABELS[tab]),
          );

/** «Иванов, Петров и ещё 3» — не больше max имён. */
export const formatAiNameList = (
    names: readonly string[],
    max: number = AI_CHECKLIST_NAMES_MAX,
): string => {
    const shown = names.slice(0, max).join(', ');
    const rest = names.length - max;
    return rest > 0 ? `${shown} и ещё ${rest}` : shown;
};
