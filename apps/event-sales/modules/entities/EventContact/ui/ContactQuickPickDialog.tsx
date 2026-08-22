'use client';

import { FC } from 'react';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { GlassDialog } from '@workspace/april-ui';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_CONTACT_TYPE } from '../type/event-contact-type';
import { useContactOptions } from '../lib/use-contact-options';
import { eventContactActions } from '../model/EventContactSlice';
import { bindContactToCurrentEntity } from '../model/EventContactThunk';

/**
 * Быстрый выбор/замена контакта плана или отчёта.
 *
 * Задачу планировали на одного человека — он и попадает в отчёт текущим.
 * Но дозвониться могли до другого: тогда контакт меняют здесь в два клика —
 * поиск по всем собранным контактам, внизу «создать нового» (уходит в то же
 * окно создания, созданный сам станет текущим выбранной стороны).
 *
 * Выбранный существующий сразу привязывается к текущей сущности
 * (bindContactToCurrentEntity) — как и созданный.
 */
export const ContactQuickPickDialog: FC = () => {
    const dispatch = useAppDispatch();
    const side = useAppSelector(s => s.contact.quickPickSide);
    const options = useContactOptions();

    const close = () => dispatch(eventContactActions.closeQuickPick());

    const sideLabel = side === EV_CONTACT_TYPE.PLAN ? 'в план' : 'в отчёт';

    return (
        <GlassDialog
            open={side !== null}
            onOpenChange={open => !open && close()}
            size="xs"
            intensity="soft"
            cardClassName="gap-4"
        >
            <DialogHeader>
                <DialogTitle>Контакт {sideLabel}</DialogTitle>
                <DialogDescription>
                    Дозвонились другому человеку? Выберите его — или создайте
                    нового.
                </DialogDescription>
            </DialogHeader>

            <FieldCombobox
                options={options}
                onChange={value => {
                    if (!side) return;
                    const contactId = Number(value);
                    dispatch(
                        eventContactActions.setCurrentContact({
                            type: side,
                            contactId,
                        }),
                    );
                    void dispatch(bindContactToCurrentEntity(contactId));
                    close();
                }}
                placeholder="Найти контакт"
                searchPlaceholder="Имя, должность, источник"
                emptyText="Никого не нашли — создайте нового."
                createLabel="Создать нового"
                onCreate={() => {
                    if (!side) return;
                    close();
                    dispatch(
                        eventContactActions.setCreatingContact({
                            isCreating: true,
                            type: side,
                        }),
                    );
                }}
            />
        </GlassDialog>
    );
};
