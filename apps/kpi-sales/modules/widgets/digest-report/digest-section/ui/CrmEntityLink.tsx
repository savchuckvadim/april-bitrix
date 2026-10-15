'use client';

import Link from 'next/link';
import type { DigestEntityRef } from '@/modules/entities/digest';
import { crmLink, type CrmEntityKind } from '../../lib/digest-links.util';

interface CrmEntityLinkProps {
    domain: string;
    kind: CrmEntityKind;
    entity: DigestEntityRef;
    /** Подпись перед названием («лид: »). */
    prefix?: string;
}

/** Название сущности CRM ссылкой на её карточку (без домена — текстом). */
export const CrmEntityLink = ({ domain, kind, entity, prefix }: CrmEntityLinkProps) => {
    const href = crmLink(domain, kind, entity.id);
    const text = `${prefix ?? ''}${entity.title}`;
    return href ? (
        <Link href={href} target="_blank" className="hover:text-primary">
            {text}
        </Link>
    ) : (
        <span>{text}</span>
    );
};
