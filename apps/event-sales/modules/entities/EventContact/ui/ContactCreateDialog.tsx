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

/**
 * Порядок и обязательность полей.
 *
 * Обязательны только ФИО и телефон — контакт заводят посреди разговора, и
 * почта с должностью в этот момент чаще всего неизвестны. Раньше требовались
 * все три, и менеджер либо бросал форму, либо выдумывал почту.
 */
const FIELDS: Array<{
    prop: EV_CONTACT_PROP;
    label: string;
    placeholder: string;
    errorCode?: EV_ERROR_CODE;
    inputType?: string;
    isRequired?: boolean;
}> = [
    {
        prop: EV_CONTACT_PROP.NAME,
        label: 'ФИО',
        placeholder: 'Иван Петров',
        errorCode: EV_ERROR_CODE.CONTACT_NAME,
        isRequired: true,
    },
    {
        prop: EV_CONTACT_PROP.PHONE,
        label: 'Телефон',
        placeholder: '+7 900 000-00-00',
        errorCode: EV_ERROR_CODE.CONTACT_PHONE,
        inputType: 'tel',
        isRequired: true,
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
 * Окно смонтировано ОДНО на экран и открывается состоянием, а не пропсом.
 * Раньше оно жило внутри поля выбора контакта — и когда контакта не было,
 * поля на экране тоже не было: нажатие «создать» просто проваливалось в
 * пустоту, потому что показывать окно было некому.
 *
 * Куда подставится готовый контакт (в отчёт или в план), помнит сам стор:
 * откуда начали создавать, туда и вернётся.
 */
export const ContactCreateDialog: FC = () => {
    const dispatch = useAppDispatch();
    const isCreating = useAppSelector(s => s.contact.isCreating);
    const type = useAppSelector(s => s.contact.creating.type);
    const contact = useAppSelector(s => s.contact.creating.contact);
    const isPending = useAppSelector(s => s.contact.creating.isFetched);
    const errors = useAppSelector(s => s.event.errors.current);

    const close = () =>
        dispatch(
            eventContactActions.setCreatingContact({
                isCreating: false,
                type: null,
            }),
        );

    return (
        <GlassDialog
            open={isCreating}
            onOpenChange={open => {
                if (!open) close();
            }}
            size="sm"
        >
            <DialogHeader>
                <DialogTitle>Новый контакт</DialogTitle>
                <DialogDescription>
                    Достаточно ФИО и телефона. Контакт привяжется к тому, с чем
                    вы работаете сейчас — компании, сделке или лиду.
                </DialogDescription>
            </DialogHeader>

            {FIELDS.map(field => {
                const error = field.errorCode ? errors[field.errorCode] : '';
                const id = `contact-new-${field.prop}`;

                return (
                    <div key={field.prop} className="space-y-1.5">
                        <Label htmlFor={id}>
                            {field.label}
                            {field.isRequired ? (
                                <span
                                    aria-hidden
                                    className="ml-0.5 text-destructive"
                                >
                                    •
                                </span>
                            ) : (
                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                    необязательно
                                </span>
                            )}
                        </Label>
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
                    onClick={() =>
                        dispatch(
                            saveCreatedContact(
                                (type as EV_CONTACT_TYPE) ??
                                    EV_CONTACT_TYPE.REPORT,
                            ),
                        )
                    }
                    disabled={isPending}
                >
                    {isPending ? 'Сохранение…' : 'Создать'}
                </Button>
            </div>
        </GlassDialog>
    );
};
