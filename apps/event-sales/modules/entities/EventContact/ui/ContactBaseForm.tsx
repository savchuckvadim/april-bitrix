'use client';

import { FC, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Spinner } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { updateContactBaseFields } from '../model/EventContactThunk';
import { EV_CONTACT_PROP } from '../type/event-contact-type';
import { contactEmail, contactPhone } from '../lib/contact-view';

interface ContactBaseFormProps {
    contactId: number;
    /** Что делать после удачного сохранения (закрыть окно и т.п.). */
    onSaved?: () => void;
    submitLabel?: string;
}

const BASE_FIELDS: Array<{ prop: EV_CONTACT_PROP; label: string }> = [
    { prop: EV_CONTACT_PROP.NAME, label: 'ФИО' },
    { prop: EV_CONTACT_PROP.PHONE, label: 'Телефон' },
    { prop: EV_CONTACT_PROP.EMAIL, label: 'Email' },
    { prop: EV_CONTACT_PROP.POST, label: 'Должность' },
];

/**
 * Основные данные человека: ФИО, телефон, почта, должность.
 *
 * Форма одна на два места — окно только что созданного контакта и правку
 * существующего: поля и правила у них одинаковые, а расходящиеся копии
 * означали бы, что где-то телефон сохраняется, а где-то нет.
 *
 * Сохранение пессимистичное (updateContactBaseFields): значения на экране
 * меняются по ответу портала, а не по нажатию, — иначе «сохранил» и
 * «сохранилось» разъезжаются.
 */
export const ContactBaseForm: FC<ContactBaseFormProps> = ({
    contactId,
    onSaved,
    submitLabel = 'Сохранить',
}) => {
    const dispatch = useAppDispatch();
    const contact = useAppSelector(s =>
        s.contact.contacts.find(item => Number(item.ID) === contactId),
    );

    const [values, setValues] = useState<Record<EV_CONTACT_PROP, string>>({
        [EV_CONTACT_PROP.ID]: String(contactId),
        [EV_CONTACT_PROP.NAME]: contact?.NAME ?? '',
        [EV_CONTACT_PROP.PHONE]: contactPhone(contact) ?? '',
        [EV_CONTACT_PROP.EMAIL]: contactEmail(contact) ?? '',
        [EV_CONTACT_PROP.POST]: contact?.POST ?? '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const save = async () => {
        setIsSaving(true);
        setError(null);
        const failure = await dispatch(
            updateContactBaseFields(contactId, values),
        );
        setIsSaving(false);
        if (failure) {
            setError(failure);
            return;
        }
        onSaved?.();
    };

    return (
        <div className="flex min-w-0 flex-col gap-3">
            {BASE_FIELDS.map(field => (
                <div key={field.prop} className="space-y-1.5">
                    <Label htmlFor={`contact-base-${field.prop}`}>
                        {field.label}
                    </Label>
                    <Input
                        id={`contact-base-${field.prop}`}
                        value={values[field.prop]}
                        disabled={isSaving}
                        onChange={e =>
                            setValues(prev => ({
                                ...prev,
                                [field.prop]: e.target.value,
                            }))
                        }
                    />
                </div>
            ))}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* min-w: ширина кнопки не должна зависеть от текста на ней —
                иначе при сохранении форма ходит ходуном. */}
            <Button
                className="min-w-36 self-end"
                onClick={save}
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        <Spinner size="sm" tone="neutral" />
                        Сохраняем…
                    </>
                ) : (
                    submitLabel
                )}
            </Button>
        </div>
    );
};
