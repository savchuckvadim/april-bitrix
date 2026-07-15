import { AppDispatch } from '@/modules/app/model/store';
import { Bitrix } from '@workspace/bitrix';
import { BXLead } from '@workspace/bx';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { eventLeadActions } from './EVLeadSlice';
import { getLeadIdByTaskUF } from '../lib/event-lead-util';

/** Лид из crm-привязок задачи (L_xxx) — лид-контекст виджета. */
export const fetchLead =
    (task: EventTask | null) => async (dispatch: AppDispatch) => {
        const leadId = task?.ufCrmTask ? getLeadIdByTaskUF(task.ufCrmTask) : null;

        if (!leadId) {
            dispatch(eventLeadActions.clean());
            return;
        }

        const lead = (await Bitrix.getService().api.call('crm.lead.get', {
            id: leadId,
        })) as BXLead | null;

        if (lead) {
            dispatch(eventLeadActions.setCurrentLead({ lead }));
        }
    };
