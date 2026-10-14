'use client';

import Link from 'next/link';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    formatDateTimeShort,
    timeOfDateTime,
    type DigestRecord,
} from '@/modules/entities/digest';
import { companyLink, listElementLink } from '../../lib/digest-links.util';
import type { CatalogNames } from '../../lib/catalog-names.util';
import { actionTone, isPlanRecord } from '../lib/digest-feed.util';

interface DigestRecordRowProps {
    record: DigestRecord;
    names: CatalogNames;
    domain: string;
    listId: string;
    /** Время берётся из дедлайна (срез «план на день»), а не из записи. */
    timeFrom?: 'eventDate' | 'planDate';
}

/** Строка события: время · тип · действие · название · компания · комментарий. */
export const DigestRecordRow = ({
    record,
    names,
    domain,
    listId,
    timeFrom = 'eventDate',
}: DigestRecordRowProps) => {
    const elementHref = listElementLink(domain, listId, record.id);
    const companyHref = companyLink(domain, record.companyId);
    const reason = record.noresultReason
        ? (names.reasons[record.noresultReason] ?? record.noresultReason)
        : null;
    const actionLabel =
        record.actionName ??
        (record.actionCode ? (names.actions[record.actionCode] ?? record.actionCode) : '—');

    return (
        <li className="grid grid-cols-[3.25rem_1fr] gap-x-2 border-b border-border/60 py-1.5 text-xs last:border-0">
            <span className="tabular-nums text-muted-foreground">
                {timeOfDateTime(record[timeFrom])}
            </span>
            <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <ToneBadge tone="muted" variant="outline" size="sm">
                        {record.typeName ??
                            (record.typeCode ? (names.types[record.typeCode] ?? record.typeCode) : '—')}
                    </ToneBadge>
                    <ToneBadge tone={actionTone(record.actionCode)} variant="soft" size="sm">
                        {actionLabel}
                    </ToneBadge>
                    {reason && (
                        <span className="text-muted-foreground">причина: {reason}</span>
                    )}
                    {isPlanRecord(record) && record.planDate && (
                        <span className="text-muted-foreground">
                            → {formatDateTimeShort(record.planDate)}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2">
                    {elementHref ? (
                        <Link
                            href={elementHref}
                            target="_blank"
                            className="font-medium text-foreground hover:text-primary"
                        >
                            {record.name || `#${record.id}`}
                        </Link>
                    ) : (
                        <span className="font-medium">{record.name || `#${record.id}`}</span>
                    )}
                    {companyHref && (
                        <Link
                            href={companyHref}
                            target="_blank"
                            className="text-muted-foreground hover:text-primary"
                        >
                            компания #{record.companyId}
                        </Link>
                    )}
                </div>
                {record.comment && (
                    <HintTooltip lines={[record.comment]}>
                        <p className="line-clamp-2 cursor-help text-muted-foreground">
                            {record.comment}
                        </p>
                    </HintTooltip>
                )}
            </div>
        </li>
    );
};
