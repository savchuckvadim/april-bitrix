'use client';

import { useMemo } from 'react';
import type { ComboboxOption } from '@workspace/april-ui/fields';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';

/**
 * Контакты компании как опции комбобокса.
 *
 * Должность идёт подписью и участвует в поиске: контактов бывает больше
 * пятидесяти, и «Иванов из бухгалтерии» ищется быстрее, чем перебором.
 */
export const useContactOptions = (): ComboboxOption[] => {
    const contacts = useAppSelector(s => s.contact.contacts);

    return useMemo(
        () =>
            contacts.map(contact => {
                const name = [contact.NAME, contact.LAST_NAME]
                    .filter(Boolean)
                    .join(' ')
                    .trim();

                return {
                    value: String(contact.ID),
                    label: name || `Контакт #${contact.ID}`,
                    hint: contact.POST || undefined,
                };
            }),
        [contacts],
    );
};
