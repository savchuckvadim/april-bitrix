import type { AppDispatch } from '@/modules/app/model/store';
import { Bitrix } from '@workspace/bitrix';
import { BXLead } from '@workspace/bx';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { getCrmLinksFromRaw } from '@/modules/entities/EventTask/lib/task-links';
import { eventLeadActions } from './EVLeadSlice';

/**
 * Лид по id. Удалённый лид Битрикс отдаёт ошибкой 400 — это не сбой, а
 * «лида больше нет», поэтому null, а не исключение.
 */
const loadLead = async (leadId: number): Promise<BXLead | null> => {
    try {
        const response = await Bitrix.getService().lead.get(leadId);
        return (response?.result as unknown as BXLead | null) ?? null;
    } catch (error) {
        console.warn(`fetchLead: лид ${leadId} не загружен`, error);
        return null;
    }
};

/**
 * Лид из crm-привязок задачи (L_xxx) — лид-контекст виджета.
 *
 * Берётся первый ЖИВОЙ лид задачи. Раньше брался первый по списку, и если
 * его удалили, ошибка уходила необработанной и роняла весь экран в «Что-то
 * пошло не так» при открытии задачи (garant 06.11.2026, сделка 33467).
 * Живых лидов нет — лид-контекста нет, задача открывается как обычно.
 */
export const fetchLead =
    (task: EventTask | null) => async (dispatch: AppDispatch) => {
        const leadIds = task?.ufCrmTask
            ? getCrmLinksFromRaw(task.ufCrmTask).leadIds
            : [];

        for (const leadId of leadIds) {
            const lead = await loadLead(leadId);
            if (lead) {
                dispatch(eventLeadActions.setCurrentLead({ lead }));
                return;
            }
        }

        dispatch(eventLeadActions.clean());
    };
