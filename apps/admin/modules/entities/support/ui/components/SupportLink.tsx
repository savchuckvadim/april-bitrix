import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { isExternalHref } from '../../lib/support-view';
import type { SupportGuideLink } from '../../model';

/** Ссылка путеводителя: путь админки — внутри, портал Битрикса — в новой вкладке. */
export const SupportLink = ({ link }: { link: SupportGuideLink }) =>
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
