'use client';

import { FC } from 'react';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_ERROR_CODE } from '@/modules/processes/event/types/event-types';
import { eventContactActions } from '../model/EventContactSlice';
import { saveCreatedContact } from '../model/EventContactThunk';
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from '../type/event-contact-type';

interface ContactCreateDialogProps {
    /** Для какого поля создаём — план или отчёт: туда контакт и подставится. */
    type: EV_CONTACT_TYPE;
}

const FIELDS: Array<{
    prop: EV_CONTACT_PROP;
    label: string;
    placeholder: string;
    errorCode?: EV_ERROR_CODE;
    inputType?: string;
}> = [
    {
        prop: EV_CONTACT_PROP.NAME,
        label: 'Имя',
        placeholder: 'Иван Петров',
        errorCode: EV_ERROR_CODE.CONTACT_NAME,
    },
    {
        prop: EV_CONTACT_PROP.PHONE,
        label: 'Телефон',
        placeholder: '+7 900 000-00-00',
        errorCode: EV_ERROR_CODE.CONTACT_PHONE,
        inputType: 'tel',
    },
    {
        prop: EV_CONTACT_PROP.EMAIL,
        label: 'Email',
        placeholder: 'ivan@company.ru',
        errorCode: EV_ERROR_CODE.CONTACT_EMAIL,
        inputType: 'email',
    },
    {
        prop: EV_CONTACT_PROP.POST,
        label: 'Должность',
        placeholder: 'Директор',
    },
];

/**
 * Создание контакта, не уходя из формы отчёта.
 *
 * Контакт заводится в компании (COMPANY_ID в saveCreatedContact), поэтому
 * без компании создавать нечего — вызывающий это учитывает.
 */
export const ContactCreateDialog: FC<ContactCreateDialogProps> = ({ type }) => {
    const dispatch = useAppDispatch();
    const isCreating = useAppSelector(s => s.contact.isCreating);
    const creatingType = useAppSelector(s => s.contact.creating.type);
    const contact = useAppSelector(s => s.contact.creating.contact);
    const isPending = useAppSelector(s => s.contact.creating.isFetched);
    const errors = useAppSelector(s => s.event.errors.current);

    const isOpen = isCreating && creatingType === type;

    const close = () =>
        dispatch(
            eventContactActions.setCreatingContact({ isCreating: false, type }),
        );

    return (
        <GlassDialog
            open={isOpen}
            onOpenChange={open => {
                if (!open) close();
            }}
            size="sm"
        >
            <DialogHeader>
                <DialogTitle>Новый контакт</DialogTitle>
                <DialogDescription>
                    Контакт будет привязан к компании и подставлен в форму.
                </DialogDescription>
            </DialogHeader>

            {FIELDS.map(field => {
                const error = field.errorCode ? errors[field.errorCode] : '';
                const id = `contact-${type}-${field.prop}`;

                return (
                    <div key={field.prop} className="space-y-1.5">
                        <Label htmlFor={id}>{field.label}</Label>
                        <Input
                            id={id}
                            type={field.inputType}
                            value={contact[field.prop]}
                            placeholder={field.placeholder}
                            aria-invalid={!!error}
                            onChange={e =>
                                dispatch(
                                    eventContactActions.setContactProp({
                                        type: field.prop,
                                        value: e.target.value,
                                    }),
                                )
                            }
                        />
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </div>
                );
            })}

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={close} disabled={isPending}>
                    Отмена
                </Button>
                <Button
                    onClick={() => dispatch(saveCreatedContact(type))}
                    disabled={isPending}
                >
                    {isPending ? 'Сохранение…' : 'Создать'}
                </Button>
            </div>
        </GlassDialog>
    );
};
