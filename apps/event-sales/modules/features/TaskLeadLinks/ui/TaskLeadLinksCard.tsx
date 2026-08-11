'use client';

import { FC } from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { taskLeadLinksActions } from '../model/TaskLeadLinksSlice';
import { useTaskLeadLinks } from '../lib/hooks/use-task-lead-links';
import { TASK_LEAD_LINKS_TEXT } from '../consts/task-lead-links.const';

/**
 * Чекбоксы «связать новую задачу с заявками»: видны только когда текущей
 * задачи нет (создаётся новая) и у клиента есть открытые лиды. Отмеченные
 * уезжают в plan.relatedLeadIds → UF_CRM_TASK (L_{id}).
 */
export const TaskLeadLinksCard: FC = () => {
    const dispatch = useAppDispatch();
    const { visible, candidates, selectedIds } = useTaskLeadLinks();

    if (!visible) return null;

    return (
        <div className="space-y-1.5 rounded-md border border-border p-2">
            <p className="text-xs font-semibold">
                {TASK_LEAD_LINKS_TEXT.title}
            </p>
            <p className="text-xs text-muted-foreground">
                {TASK_LEAD_LINKS_TEXT.hint}
            </p>
            <ul className="space-y-1">
                {candidates.map(lead => (
                    <li key={lead.id}>
                        <label className="flex cursor-pointer items-center gap-2 text-xs">
                            <Checkbox
                                checked={selectedIds.includes(lead.id)}
                                onCheckedChange={() =>
                                    dispatch(
                                        taskLeadLinksActions.toggle(lead.id),
                                    )
                                }
                            />
                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
                                {lead.questUrl || lead.regNumber
                                    ? TASK_LEAD_LINKS_TEXT.requestBadge
                                    : TASK_LEAD_LINKS_TEXT.leadBadge}
                            </span>
                            <span className="min-w-0 truncate">
                                {lead.title}
                            </span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};
