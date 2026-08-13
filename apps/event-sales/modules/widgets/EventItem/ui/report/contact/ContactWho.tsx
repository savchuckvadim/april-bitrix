'use client';

import { FC } from 'react';
import { ExternalLink, Link2, Mail, Phone } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import type { ContactDetailsView } from '../../../lib/hooks/use-contact-card';

interface ContactWhoProps {
    details: ContactDetailsView;
    /**
     * Контакт нашёлся только в лиде, а работаем мы уже в сделке — предлагаем
     * перенести связь. Иначе в следующий раз его снова придётся искать в лиде,
     * а в сделке будет пусто.
     */
    onAttachToDeal?: () => void;
}

/** Связь человека с портальными данными: источник, телефон, почта, карточка. */
export const ContactWho: FC<ContactWhoProps> = ({
    details,
    onAttachToDeal,
}) => (
    <div className="flex min-w-0 flex-col items-start gap-1 text-xs">
        {details.source && (
            <ToneBadge variant="outline" size="sm" className="border-dashed">
                {details.source}
            </ToneBadge>
        )}
        {details.post && (
            <span className="truncate text-muted-foreground">
                {details.post}
            </span>
        )}
        {details.phone && (
            <span className="inline-flex min-w-0 items-center gap-1">
                <Phone
                    aria-hidden
                    className="size-3 shrink-0 text-muted-foreground"
                />
                <span className="truncate">{details.phone}</span>
            </span>
        )}
        {details.email && (
            <span className="inline-flex min-w-0 items-center gap-1">
                <Mail
                    aria-hidden
                    className="size-3 shrink-0 text-muted-foreground"
                />
                <span className="truncate">{details.email}</span>
            </span>
        )}
        {onAttachToDeal && (
            <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={onAttachToDeal}
            >
                <Link2 aria-hidden className="size-3" />
                Привязать к сделке
            </Button>
        )}
        {details.crmUrl && (
            <a
                href={details.crmUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
                Карточка в Битриксе
                <ExternalLink aria-hidden className="size-3" />
            </a>
        )}
    </div>
);
