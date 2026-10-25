'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectSupplyContacts } from '@/modules/entities/supply-report-document';

/** Контакты сделки — попадают в отчёт и в заявку RPA; правятся в карточке Bitrix. */
export const SupplyContactsCard = () => {
    const contacts = useAppSelector(selectSupplyContacts);

    return (
        <SectionCard
            title="Контакты сделки"
            description="Из карточки сделки Bitrix; в отчёт идут имя, должность, телефоны и комментарий."
            tone="complect"
            density="compact"
        >
            {contacts.length ? (
                <ul className="flex flex-col gap-2 text-sm">
                    {contacts.map(contact => (
                        <li key={contact.ID} className="flex flex-col">
                            <span className="font-medium">{contact.NAME || `Контакт ${contact.ID}`}</span>
                            <span className="text-xs text-muted-foreground">
                                {[contact.POST, ...contact.PHONE].filter(Boolean).join(' · ')}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">У сделки нет контактов.</p>
            )}
        </SectionCard>
    );
};
