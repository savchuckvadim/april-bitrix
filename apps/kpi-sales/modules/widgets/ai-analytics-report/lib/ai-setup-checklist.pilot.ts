import { aiPilotIds, pluralRu } from '@/modules/entities/ai-analytics';
import { AI_EMPLOYEE_GENITIVE } from './ai-setup-checklist.data';
import { AI_CHECKLIST_TEXT } from './ai-setup-checklist.texts';
import {
    aiTextAction,
    aiTodoItem,
    formatAiNameList,
    type AiChecklistContext,
} from './ai-setup-checklist.context';
import {
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    type AiChecklistItem,
} from './ai-setup-checklist.types';

/*
 * «Сотрудник из разбора не виден витрине»: он в списке разбора, а строки
 * в обзоре нет. Фронт не различает две причины — сотрудник не выбран в
 * фильтре отчёта или не состоит в отделе продаж (конвейер разбирает только
 * ОП), — поэтому пункт «к сведению» с обоими «что сделать».
 */

/** Bitrix-id сотрудников пилота, которых нет среди строк обзора. */
export const aiPilotHiddenIds = (ctx: AiChecklistContext): string[] => {
    if (!ctx.overview) return [];
    const ids = aiPilotIds(ctx.settings.callReport);
    if (!ids.length) return [];
    const shown = new Set(ctx.overview.managers.map(row => row.managerId));
    return ids.filter(id => !shown.has(id));
};

export const aiPilotHiddenItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    const hidden = aiPilotHiddenIds(ctx);
    if (!hidden.length) return null;
    const T = AI_CHECKLIST_TEXT.pilotHidden;
    return aiTodoItem(AI_CHECKLIST_ITEM.PILOT_HIDDEN, AI_CHECKLIST_GROUP.DATA, {
        optional: true,
        title: T.title(
            hidden.length,
            pluralRu(hidden.length, AI_EMPLOYEE_GENITIVE),
        ),
        detail: T.detail(formatAiNameList(hidden.map(ctx.managerName))),
        unlocks: T.unlocks,
        actions: [aiTextAction(T.fixFilter), aiTextAction(T.fixSales)],
    });
};
