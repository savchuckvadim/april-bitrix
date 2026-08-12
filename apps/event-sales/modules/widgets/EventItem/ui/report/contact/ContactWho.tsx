'use client';

import { FC } from 'react';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui';
import type { ContactDetailsView } from '../../../lib/hooks/use-contact-card';

/** Связь человека с портальными данными: источник, телефон, почта, карточка. */
export const ContactWho: FC<{ details: ContactDetailsView }> = ({
    details,
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
