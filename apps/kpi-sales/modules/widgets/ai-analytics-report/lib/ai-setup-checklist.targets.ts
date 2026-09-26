import {
    AI_LEVEL,
    type AiAnalyticsSettings,
    type AiManagerLevel,
    type AiOverview,
    type AiPlanFact,
} from '@/modules/entities/ai-analytics';
import {
    AI_CHECKLIST_PLAN_SNAPSHOT_MISSING,
    AI_CHECKLIST_SALES_INDICATOR,
    AI_CHECKLIST_TARGET_EMPTY,
} from './ai-setup-checklist.data';
import { AI_CHECKLIST_TEXT } from './ai-setup-checklist.texts';
import {
    aiDoneItem,
    aiSettingsAction,
    aiTextAction,
    aiTodoItem,
    type AiChecklistContext,
} from './ai-setup-checklist.context';
import {
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    type AiChecklistItem,
} from './ai-setup-checklist.types';

/*
 * Пункт «Цель месяца» — по порталу целиком, а не по менеджеру, выбранному
 * в карточке «План дня». Ступени каскада цели плана дня (бэк): снимок
 * «Планов» CRM этого месяца → личная цель → цель уровня. Цели уровней
 * берём только для уровней, которые есть в строках обзора; «Планы» — только
 * по снимку в план-факте текущего месяца. План дня на сегодня — лишь
 * деталь к пункту, на его статус не влияет.
 */

const T = AI_CHECKLIST_TEXT.targets;

/** Где на портале задана цель продаж (> 0). */
export interface AiTargetPresence {
    /** Уровни отдела (по строкам обзора; без обзора — все) с целью уровня. */
    levels: AiManagerLevel[];
    /** Уровни из строк обзора без цели уровня; обзора нет — пусто. */
    levelsWithout: AiManagerLevel[];
    /** Сколько личных целей задано. */
    personal: number;
    /**
     * В снимке «Планов» CRM этого месяца есть план продаж; null — не
     * проверить: план-факт не за этот месяц или в его периметре нет менеджеров.
     */
    crmPlans: boolean | null;
}

const positive = (value: number | null | undefined): boolean =>
    (value ?? 0) > 0;

/**
 * «Планы» CRM этого месяца зафиксированы снимком с планом продаж > 0.
 * Снимка нет — false (он общий на портал); снимок есть, но менеджеров в
 * периметре план-факта нет — null: «планов нет» тут было бы догадкой.
 */
export const aiCrmPlansFixed = (
    planFact: AiPlanFact | null,
    monthKey: string,
): boolean | null => {
    if (!planFact || planFact.period.monthKey !== monthKey) return null;
    if (planFact.reasons.includes(AI_CHECKLIST_PLAN_SNAPSHOT_MISSING)) {
        return false;
    }
    if (!planFact.rows.length) return null;
    return planFact.rows.some(manager =>
        manager.rows.some(
            row =>
                row.indicator === AI_CHECKLIST_SALES_INDICATOR &&
                positive(row.plan),
        ),
    );
};

export const aiTargetPresence = (
    settings: Pick<AiAnalyticsSettings, 'targets'>,
    overview: Pick<AiOverview, 'managers'> | null,
    planFact: AiPlanFact | null,
    monthKey: string,
): AiTargetPresence => {
    const { byLevel, overrides = [] } = settings.targets;
    const withTarget = new Set<AiManagerLevel>(
        byLevel.filter(target => positive(target.sales)).map(t => t.level),
    );
    const present = overview?.managers.length
        ? [...new Set<AiManagerLevel>(overview.managers.map(row => row.level))]
        : null;
    return {
        levels: present
            ? present.filter(level => withTarget.has(level))
            : [...withTarget],
        levelsWithout: present
            ? present.filter(level => !withTarget.has(level))
            : [],
        personal: overrides.filter(override => positive(override.sales)).length,
        crmPlans: aiCrmPlansFixed(planFact, monthKey),
    };
};

/** Цель есть хоть на одной ступени каскада. */
export const hasAiTargetPresence = (presence: AiTargetPresence): boolean =>
    presence.levels.length > 0 ||
    presence.personal > 0 ||
    presence.crmPlans === true;

const levelLabels = (levels: readonly AiManagerLevel[]): string =>
    levels.map(level => AI_LEVEL[level].label).join(', ');

/** «цель уровня (Мидл), личные цели — 2, «Планы» CRM…» — где цель задана. */
const sourcesText = (presence: AiTargetPresence): string =>
    [
        presence.levels.length
            ? T.sourceLevels(levelLabels(presence.levels))
            : null,
        presence.personal > 0 ? T.sourcePersonal(presence.personal) : null,
        presence.crmPlans ? T.sourceCrm : null,
    ]
        .filter((part): part is string => part !== null)
        .join(', ');

/** Деталь из плана дня на сегодня: у менеджера карточки цели нет. */
const dailyPlanGap = (ctx: AiChecklistContext): string => {
    const plan = ctx.dailyPlan;
    return plan?.target.warnings.includes(AI_CHECKLIST_TARGET_EMPTY)
        ? T.dailyPlanGap(ctx.managerName(plan.managerId))
        : '';
};

/** Цель месяца: есть ли она где-нибудь на портале, и откуда. */
export const aiTargetsItem = (ctx: AiChecklistContext): AiChecklistItem => {
    const code = AI_CHECKLIST_ITEM.TARGETS;
    const group = AI_CHECKLIST_GROUP.CONFIGURE;
    const presence = aiTargetPresence(
        ctx.settings,
        ctx.overview,
        ctx.planFact,
        ctx.today.slice(0, 7),
    );
    if (!hasAiTargetPresence(presence)) {
        return aiTodoItem(code, group, {
            title: T.title,
            detail: presence.crmPlans === null ? T.detailCrmUnknown : T.detail,
            unlocks: T.unlocks,
            actions: [
                aiSettingsAction(ctx, 'targets', T.tab),
                aiTextAction(T.plans),
            ],
        });
    }
    const without = presence.levelsWithout.length
        ? T.levelsWithout(levelLabels(presence.levelsWithout))
        : '';
    return aiDoneItem(code, group, {
        title: T.doneTitle,
        detail: `${T.doneDetail(sourcesText(presence))}${without}${dailyPlanGap(ctx)}`,
    });
};
