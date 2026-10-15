'use client';

import type { DigestEntityRef } from '@/modules/entities/digest';
import { CrmEntityLink } from './CrmEntityLink';

interface CrmClientLinksProps {
    domain: string;
    company: DigestEntityRef | null;
    contact: DigestEntityRef | null;
    lead: DigestEntityRef | null;
}

/** Клиент: компания, контакт, лид — ссылками в CRM. */
export const CrmClientLinks = ({ domain, company, contact, lead }: CrmClientLinksProps) => {
    if (!company && !contact && !lead) {
        return <span className="text-muted-foreground">без клиента</span>;
    }
    return (
        <span className="flex flex-col">
            {company && <CrmEntityLink domain={domain} kind="company" entity={company} />}
            {contact && (
                <span className="text-muted-foreground">
                    <CrmEntityLink domain={domain} kind="contact" entity={contact} prefix="контакт: " />
                </span>
            )}
            {lead && (
                <span className="text-muted-foreground">
                    <CrmEntityLink domain={domain} kind="lead" entity={lead} prefix="лид: " />
                </span>
            )}
        </span>
    );
};
