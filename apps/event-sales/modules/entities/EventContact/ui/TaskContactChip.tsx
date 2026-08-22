'use client';

import { FC } from 'react';
import { UserRound } from 'lucide-react';
import { HintTooltip } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getCrmUrl } from '@/modules/app/lib/utills/url';
import { contactEmail, contactName, contactPhone } from '../lib/contact-view';

interface TaskContactChipProps {
    /** Привязки C_xxx задачи; берём первый найденный в сторе контакт. */
    contactIds: number[];
    className?: string;
}

/**
 * Контакт задачи — чипом в карточке дела и в шапке отчёта.
 *
 * Задача планировалась НА человека, но карточки дел показывали только тип и
 * связи — с кем разговор, было видно лишь изнутри отчёта. Имя кликабельно в
 * карточку контакта Битрикса (через getCrmUrl — единственный разрешённый
 * способ собрать ссылку), саммари — в тултипе.
 *
 * Контакты приезжают фоном (collectRelatedContacts по задачам); пока их нет
 * в сторе — чипа нет, без спиннеров: это украшение, а не блокер.
 */
export const TaskContactChip: FC<TaskContactChipProps> = ({
    contactIds,
    className,
}) => {
    const domain = useAppSelector(s => s.app.domain);
    const contact = useAppSelector(s => {
        for (const id of contactIds) {
            const found = s.contact.contacts.find(
                item => Number(item.ID) === id,
            );
            if (found) return found;
        }
        return null;
    });

    if (!contact) return null;

    const name = contactName(contact);
    const url = getCrmUrl(domain, 'contact', contact.ID);
    const phone = contactPhone(contact);
    const email = contactEmail(contact);
    const lines = [
        contact.POST || null,
        phone && `Телефон: ${phone}`,
        email && `Почта: ${email}`,
    ].filter((line): line is string => Boolean(line));

    const body = (
        <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <UserRound aria-hidden className="size-3 shrink-0" />
            <span className="min-w-0 truncate">{name}</span>
        </span>
    );

    return (
        <HintTooltip title={name} lines={lines}>
            {url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    onClick={event => event.stopPropagation()}
                >
                    {body}
                </a>
            ) : (
                <span className={className}>{body}</span>
            )}
        </HintTooltip>
    );
};
