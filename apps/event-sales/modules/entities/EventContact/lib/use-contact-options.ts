'use client';

import { useMemo } from 'react';
import type { ComboboxOption } from '@workspace/april-ui/fields';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { contactName, contactSourceLabel } from './contact-view';

/**
 * Контакты клиента как опции комбобокса.
 *
 * Должность и источник идут подписью и участвуют в поиске: контактов бывает
 * больше пятидесяти, «Иванов из бухгалтерии» ищется быстрее перебора, а
 * пометка «из лида сделки» объясняет, почему в списке есть человек, которого
 * в компании нет — иначе он выглядит чужим.
 */
export const useContactOptions = (): ComboboxOption[] => {
    const contacts = useAppSelector(s => s.contact.contacts);
    const sourceById = useAppSelector(s => s.contact.sourceById);

    return useMemo(
        () =>
            contacts.map(contact => {
                const source = contactSourceLabel(
                    sourceById[Number(contact.ID)],
                );

                return {
                    value: String(contact.ID),
                    label: contactName(contact),
                    hint:
                        [contact.POST, source].filter(Boolean).join(' · ') ||
                        undefined,
                };
            }),
        [contacts, sourceById],
    );
};
