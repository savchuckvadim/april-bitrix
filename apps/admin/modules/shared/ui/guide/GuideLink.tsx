import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { isExternalHref } from './guide-view';
import type { GuideLinkItem } from './guide.types';

/** Ссылка путеводителя: путь админки — внутри, внешний адрес — в новой вкладке. */
export const GuideLink = ({ link }: { link: GuideLinkItem }) =>
    isExternalHref(link.href) ? (
        <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2"
        >
            {link.title}
            <ExternalLink className="size-3" />
        </a>
    ) : (
        <Link
            href={link.href}
            className="text-sm text-primary underline underline-offset-2"
        >
            {link.title}
        </Link>
    );
