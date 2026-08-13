'use client';

import { FC } from 'react';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { eventContactActions } from '../model/EventContactSlice';
import { EV_CONTACT_TYPE } from '../type/event-contact-type';
import { useContactOptions } from '../lib/use-contact-options';

interface ContactFieldProps {
    type: EV_CONTACT_TYPE;
    label?: string;
}

/**
 * Выбор контакта с поиском и созданием нового.
 *
 * Полей таких в форме ДВА и они независимы: разговор мог идти с секретарём,
 * а встречу назначают с директором. Общий контакт склеил бы две роли
 * и сделал историю общения бесполезной.
 *
 * Список собирается из всех связей клиента (компания, сделка, лид, лид сделки,
 * привязки задачи) — см. collectRelatedContacts. Компания не обязательна:
 * созданный контакт привязывается к текущей сущности (bindContactToCurrentEntity).
 */
export const ContactField: FC<ContactFieldProps> = ({ type, label }) => {
    const dispatch = useAppDispatch();
    const options = useContactOptions();
    const current = useAppSelector(s =>
        type === EV_CONTACT_TYPE.REPORT
            ? s.contact.current.report
            : s.contact.current.plan,
    );
    // Подпись отчётного контакта зависит от того, дозвонились ли вообще.
    const isNoCallMenu = useAppSelector(s => s.noCall.menu.isActive);

    const fieldLabel =
        label ??
        (type === EV_CONTACT_TYPE.REPORT
            ? isNoCallMenu
                ? 'С кем не получилось пообщаться'
                : 'С кем велись переговоры'
            : 'Контакт');

    return (
        <FieldCombobox
            id={`contact-${type}`}
            label={fieldLabel}
            options={options}
            value={current ? String(current.ID) : undefined}
            placeholder={
                options.length ? 'Выберите контакт' : 'Контактов пока нет'
            }
            searchPlaceholder="Имя или должность…"
            emptyText="Контакт не найден"
            createLabel="Создать контакт"
            onCreate={() =>
                dispatch(
                    eventContactActions.setCreatingContact({
                        isCreating: true,
                        type,
                    }),
                )
            }
            onChange={value =>
                dispatch(
                    eventContactActions.setCurrentContact({
                        type,
                        contactId: Number(value),
                    }),
                )
            }
        />
    );
};
