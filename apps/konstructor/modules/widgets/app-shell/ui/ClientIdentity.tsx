'use client';

import { EntityLinkText, EntityTitle } from '@workspace/april-ui/entity';

export interface ClientIdentityProps {
    title: string;
    href: string | null;
    kindLabel: string;
    deal: { label: string; href: string | null } | null;
}

/** Кто открыт: компания крупно ссылкой на CRM, рядом — сделка. */
export const ClientIdentity = ({
    title,
    href,
    kindLabel,
    deal,
}: ClientIdentityProps) => (
    <EntityTitle
        size="lg"
        title={title}
        href={href}
        kindLabel={kindLabel}
        meta={
            deal ? <EntityLinkText title={deal.label} href={deal.href} /> : null
        }
    />
);
