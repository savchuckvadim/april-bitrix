'use client';

import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    ContactField,
    EV_CONTACT_TYPE,
    eventContactActions,
} from '@/modules/entities/EventContact';
import { ContactActions } from '../report/contact/ContactActions';
import { ContactRemoveAction } from '../report/contact/ContactRemoveAction';

/**
 * Контакт запланированного события: выбор плюс те же приборы, что у контакта
 * отчёта.
 *
 * Раньше здесь был голый комбобокс: посмотреть характеристики человека,
 * которому назначаешь встречу, или создать нового было негде — приходилось
 * идти в отчётную карточку и там переключаться. Окно одно на оба контакта,
 * открывается сразу на нужной стороне.
 */
export const PlanContactRow: FC = () => {
    const dispatch = useAppDispatch();
    const hasContact = useAppSelector(s => Boolean(s.contact.current.plan));

    const open = (mode: 'view' | 'edit') =>
        dispatch(
            eventContactActions.openContactDialog({
                mode,
                side: EV_CONTACT_TYPE.PLAN,
            }),
        );

    return (
        <div className="flex items-end gap-1">
            <div className="min-w-0 flex-1">
                <ContactField type={EV_CONTACT_TYPE.PLAN} />
            </div>
            <span className="mb-0.5 inline-flex shrink-0 items-center gap-0.5">
                <ContactActions
                    hasContact={hasContact}
                    onView={() => open('view')}
                    onEdit={() => open('edit')}
                    onCreate={() =>
                        dispatch(
                            eventContactActions.setCreatingContact({
                                isCreating: true,
                                type: EV_CONTACT_TYPE.PLAN,
                            }),
                        )
                    }
                />
                {/* Снять контакт с плана (todo3108): встреча может быть и
                    без конкретного человека — раньше выбранного было не
                    убрать, только заменить. Тот же приём с переспросом,
                    что у отчёта. */}
                {hasContact && (
                    <ContactRemoveAction type={EV_CONTACT_TYPE.PLAN} />
                )}
            </span>
        </div>
    );
};
