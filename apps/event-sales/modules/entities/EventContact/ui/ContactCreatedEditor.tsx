'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { PbxContactFieldItem } from '@/modules/features/PbxContact';
import { editableTraits } from '@/modules/features/PbxContact/lib/contact-field-view';
import { ContactBaseForm } from './ContactBaseForm';

interface ContactCreatedEditorProps {
    contactId: number;
    onDone: () => void;
}

/**
 * Этап «создан»: то же окно, но теперь оно правит нового человека.
 *
 * Слева его данные инпутами (общая форма ContactBaseForm — та же, что и при
 * правке существующего), справа характеристики шкалами и селектами:
 * дозаполнить можно сразу, не открывая ничего второй раз. Уйти тоже можно —
 * контакт уже создан и подставлен в форму, окно ничего не держит.
 */
export const ContactCreatedEditor: FC<ContactCreatedEditorProps> = ({
    contactId,
    onDone,
}) => {
    const contact = useAppSelector(s =>
        s.contact.contacts.find(item => Number(item.ID) === contactId),
    );
    const traits = editableTraits(contact?.fields);

    return (
        <div className="grid gap-4 sm:grid-cols-[15rem_1fr]">
            <div className="flex min-w-0 flex-col gap-2">
                <ContactBaseForm contactId={contactId} onSaved={onDone} />
                <Button variant="outline" onClick={onDone}>
                    Готово
                </Button>
            </div>

            <div className="min-w-0">
                {traits.length ? (
                    <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                        {traits.map(field => (
                            <PbxContactFieldItem
                                key={field.bitrixId}
                                contactId={contactId}
                                field={field}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        У контакта нет заполняемых характеристик: на портале не
                        установлены поля ОРК.
                    </p>
                )}
            </div>
        </div>
    );
};
