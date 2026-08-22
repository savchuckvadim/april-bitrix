'use client';

import { FC } from 'react';
import { UserRound } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import {
    EV_CONTACT_TYPE,
    eventContactActions,
} from '@/modules/entities/EventContact';
import { useTaskLinkTools } from '../../lib/hooks/use-task-link-tools';
import { TOOL_LINKED_CLASS } from './tool-rail-style';

/**
 * Контакт дела — вторая иконка панели пульта.
 *
 * Светится, когда контакт привязан к самой задаче: по экрану сразу видно,
 * с кем разговор, без чтения карточек. Клик открывает карточку контакта,
 * а когда контакта нет — выбор из связей клиента.
 */
export const ContactToolButton: FC = () => {
    const dispatch = useAppDispatch();
    const { isContactLinked, hasReportContact } = useTaskLinkTools();

    const open = () =>
        dispatch(
            hasReportContact
                ? eventContactActions.openContactDialog({
                      mode: 'view',
                      side: EV_CONTACT_TYPE.REPORT,
                  })
                : eventContactActions.openQuickPick({
                      side: EV_CONTACT_TYPE.REPORT,
                  }),
        );

    return (
        <IconAction
            icon={UserRound}
            label={hasReportContact ? 'Контакт разговора' : 'Выбрать контакт'}
            hint={
                isContactLinked
                    ? 'Контакт прикреплён к делу — откроется его карточка'
                    : hasReportContact
                      ? 'Контакт выбран для отчёта, но к делу не прикреплён'
                      : 'Поиск по контактам всех связей клиента'
            }
            onClick={open}
            className={isContactLinked ? TOOL_LINKED_CLASS : undefined}
        />
    );
};
