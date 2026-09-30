import { pluralRu } from '@/modules/entities/ai-analytics';
import { AI_READINESS_REASON_CODE } from './ai-readiness-banner.util';
import { formatAiDateRu, isAiTenureUnknown } from './ai-signal.util';
import { formatAiStyleMonth } from './ai-style.util';
import {
    AI_CHECKLIST_MANUAL_SINCE,
    AI_CHECKLIST_PLAN_SNAPSHOT_MISSING,
    AI_CHECKLIST_PRE_NORMS_MODES,
    AI_CHECKLIST_PROXY_SINCE,
    AI_CHECKLIST_SCHEDULE,
    AI_MANAGER_GENITIVE,
} from './ai-setup-checklist.data';
import { AI_CHECKLIST_TEXT } from './ai-setup-checklist.texts';
import { aiNextMonthDay, aiScheduledEta } from './ai-setup-checklist.eta';
import {
    aiDoneItem,
    aiOverviewUnknownItem,
    aiSettingsAction,
    aiTextAction,
    aiTodoItem,
    aiUnknownItem,
    formatAiNameList,
    type AiChecklistContext,
} from './ai-setup-checklist.context';
import {
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    type AiChecklistItem,
} from './ai-setup-checklist.types';

/*
 * «Настроить»: планы руководителя, состав, календарь, стаж, рассылки и
 * гипотеза (цель месяца — ai-setup-checklist.targets). Что можно сделать в
 * диалоге настроек — кнопка вкладки (руководителю группы — текст),
 * остальное — текст «попросите разработчика».
 */

const T = AI_CHECKLIST_TEXT;
const CONFIGURE = AI_CHECKLIST_GROUP.CONFIGURE;

/**
 * Снимка планов руководителя за текущий месяц нет. Снимок 1-го числа в
 * 04:00 фиксирует планы НОВОГО месяца (бэк: тик plans берёт monthKey дня
 * тика), поэтому этот месяц так и останется без них — честно так и пишем.
 * Прошлый месяц не показываем: сделать с ним уже нечего.
 */
export const aiHeadPlansItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    const planFact = ctx.planFact;
    if (
        !planFact?.reasons.includes(AI_CHECKLIST_PLAN_SNAPSHOT_MISSING) ||
        planFact.period.monthKey !== ctx.today.slice(0, 7)
    ) {
        return null;
    }
    const { dayOfMonth, time } = AI_CHECKLIST_SCHEDULE.PLANS;
    const date = aiNextMonthDay(ctx.today, dayOfMonth);
    return aiTodoItem(AI_CHECKLIST_ITEM.HEAD_PLANS, CONFIGURE, {
        title: T.headPlans.title,
        detail: T.headPlans.detail(
            formatAiStyleMonth(planFact.period.monthKey),
            date ? formatAiDateRu(date) : '1-го числа',
        ),
        unlocks: T.headPlans.unlocks,
        eta: aiScheduledEta(date, time),
        actions: [aiTextAction(T.headPlans.fix)],
    });
};

/** Состав и уровни не подтверждены — режим «Нормы» закрыт. */
export const aiRosterItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    if (ctx.reasons.has(AI_READINESS_REASON_CODE.ROSTER_NOT_CONFIRMED)) {
        return aiTodoItem(AI_CHECKLIST_ITEM.ROSTER, CONFIGURE, {
            title: T.roster.title,
            detail: T.roster.detail,
            unlocks: T.roster.unlocks,
            actions: [aiSettingsAction(ctx, 'roster', T.roster.action)],
        });
    }
    const confirmed = ctx.settings.rosterConfirmedAt;
    return confirmed
        ? aiDoneItem(AI_CHECKLIST_ITEM.ROSTER, CONFIGURE, {
              title: T.roster.doneTitle(formatAiDateRu(confirmed)),
              detail: T.roster.doneDetail,
          })
        : null;
};

/** Праздники не загружены: известное ограничение — из витрины их не задать. */
export const aiCalendarItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null =>
    ctx.reasons.has(AI_READINESS_REASON_CODE.CALENDAR_NOT_IMPORTED)
        ? aiTodoItem(AI_CHECKLIST_ITEM.CALENDAR, CONFIGURE, {
              title: T.calendar.title,
              detail: T.calendar.detail,
              unlocks: T.calendar.unlocks,
              actions: [aiTextAction(T.calendar.fix)],
          })
        : null;

/**
 * До калибровки бэк праздники и состав не проверяет (причины норм приходят
 * только в descriptive), поэтому «настраивать нечего» тут было бы неправдой:
 * честно пишем «проверим после калибровки». Подтверждённый состав уже
 * показан пунктом roster — тогда говорим только о праздниках.
 */
export const aiNormsGatesItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null =>
    AI_CHECKLIST_PRE_NORMS_MODES.has(ctx.readiness.mode)
        ? aiUnknownItem(AI_CHECKLIST_ITEM.NORMS_GATES, CONFIGURE, {
              title: T.normsGates.title(!ctx.settings.rosterConfirmedAt),
              detail: T.normsGates.detail,
          })
        : null;

/**
 * Стаж не посчитан (ни стажа, ни даты — «стаж не задан» в таблице): даты
 * нет ни у РОПа, ни в паспорте — месячного снимка менеджера ещё нет.
 * Рекомендация: задать дату вручную или дождаться ночного пересчёта.
 * Готово — с разбивкой: по датам Bitrix, приблизительно (по первому
 * событию, sinceSource proxy) и вручную.
 */
export const aiTenureItem = (ctx: AiChecklistContext): AiChecklistItem => {
    const code = AI_CHECKLIST_ITEM.TENURE;
    if (!ctx.overview) {
        return aiOverviewUnknownItem(ctx, code, CONFIGURE, T.tenure.checkTitle);
    }
    const managers = ctx.overview.managers;
    const unknown = managers.filter(isAiTenureUnknown);
    if (!unknown.length) {
        const bySource = (source: string): number =>
            managers.filter(row => row.sinceSource === source).length;
        const manual = bySource(AI_CHECKLIST_MANUAL_SINCE);
        const proxy = bySource(AI_CHECKLIST_PROXY_SINCE);
        return aiDoneItem(code, CONFIGURE, {
            title: T.tenure.doneTitle,
            detail: T.tenure.doneDetail(
                managers.length - manual - proxy,
                proxy,
                manual,
            ),
        });
    }
    return aiTodoItem(code, CONFIGURE, {
        optional: true,
        title: T.tenure.title(
            unknown.length,
            pluralRu(unknown.length, AI_MANAGER_GENITIVE),
        ),
        detail: T.tenure.detail(
            formatAiNameList(
                unknown.map(row => ctx.managerName(row.managerId)),
            ),
        ),
        unlocks: T.tenure.unlocks,
        actions: [aiSettingsAction(ctx, 'levels', T.tenure.action)],
    });
};

/**
 * Push-контур: алерты, РОПы, дайджест и сводный дайджест. Без сводного
 * дайджеста витрина работает — если не хватает только его, пункт по желанию.
 */
export const aiPushItem = (ctx: AiChecklistContext): AiChecklistItem => {
    const { settings } = ctx;
    const missing = [
        { off: !settings.alertsEnabled, label: T.push.alerts, required: true },
        {
            off: !settings.ropUserIds.length,
            label: T.push.rops,
            required: true,
        },
        { off: !settings.digestEnabled, label: T.push.digest, required: true },
        {
            off: !settings.digestAllUserIds.length,
            label: T.push.digestAll,
            required: false,
        },
    ].filter(part => part.off);
    if (!missing.length) {
        return aiDoneItem(AI_CHECKLIST_ITEM.PUSH, CONFIGURE, {
            title: T.push.doneTitle,
            detail: T.push.doneDetail,
        });
    }
    const labels = missing.map(part => part.label).join(', ');
    return aiTodoItem(AI_CHECKLIST_ITEM.PUSH, CONFIGURE, {
        optional: missing.every(part => !part.required),
        title: T.push.title,
        detail: T.push.detail(labels),
        unlocks: T.push.unlocks,
        actions: [aiTextAction(T.push.fix(labels))],
    });
};

/** Гипотеза «качество → объём» не задана — по желанию: β по данным её заменит. */
export const aiHypothesisItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null =>
    ctx.reasons.has(AI_READINESS_REASON_CODE.HYPOTHESIS_NOT_SET)
        ? aiTodoItem(AI_CHECKLIST_ITEM.HYPOTHESIS, CONFIGURE, {
              optional: true,
              title: T.hypothesis.title,
              detail: T.hypothesis.detail,
              unlocks: T.hypothesis.unlocks,
              actions: [aiSettingsAction(ctx, 'hypothesis', T.hypothesis.action)],
          })
        : null;
