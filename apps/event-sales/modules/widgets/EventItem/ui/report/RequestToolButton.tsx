'use client';

import { FC } from 'react';
import { FileText } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getReadinessBadge,
    leadRequestActions,
} from '@/modules/features/LeadRequestCard';
import { useRequestLeadIds } from '@/modules/features/LeadRequestCard/lib/hooks/use-request-lead-ids';
import { useTaskLinkTools } from '../../lib/hooks/use-task-link-tools';
import { TOOL_LINKED_CLASS } from './tool-rail-style';

/**
 * Заявка — иконкой в панели пульта; сама карточка открывается окном
 * (RequestDialog, состояние в сторе — окно общее с миниатюрой отчёта).
 *
 * Иконка на месте ВСЕГДА и зажигается, когда заявка прикреплена к самой
 * задаче: её исчезновение раньше читалось как «у дела заявки нет», хотя
 * означало «данных пока нет». Открывать нечего — иконка глохнет.
 *
 * Признак берётся по ПРИВЯЗКАМ дела, а не по слоту карточки в сторе: слот
 * один на приложение, и в нём может лежать чужой лид — рисовать по нему
 * бэйдж значило бы врать. Статус в подсказке показывается только когда слот
 * держит именно нашего лида.
 */
export const RequestToolButton: FC = () => {
    const dispatch = useAppDispatch();
    const leadIds = useRequestLeadIds();
    const card = useAppSelector(s => s.leadRequest.card);
    const loadedLeadId = useAppSelector(s => s.leadRequest.leadId);
    const hasCompany = useAppSelector(s => Boolean(s.app.bitrix.company));
    const { isLeadLinked } = useTaskLinkTools();

    const hasLeads = leadIds.length > 0;
    const isCardOurs =
        card !== null && loadedLeadId !== null && loadedLeadId === leadIds[0];
    const badge = isCardOurs ? getReadinessBadge(card, { hasCompany }) : null;

    return (
        <IconAction
            icon={FileText}
            label={card?.isRequest === false && isCardOurs ? 'Лид' : 'Заявка'}
            hint={
                hasLeads
                    ? (badge?.label ??
                      (isLeadLinked
                          ? 'Заявка прикреплена к делу — открыть карточку'
                          : 'Открыть карточку заявки'))
                    : 'У клиента нет заявок и лидов'
            }
            disabled={!hasLeads}
            onClick={() => dispatch(leadRequestActions.setDialogOpen(true))}
            className={isLeadLinked ? TOOL_LINKED_CLASS : undefined}
        />
    );
};
