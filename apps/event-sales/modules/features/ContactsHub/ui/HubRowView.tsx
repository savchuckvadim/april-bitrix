'use client';

import { FC } from 'react';
import { ToneBadge } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { getCrmUrl } from '@/modules/app/lib/utills/url';
import { CURRENT_ENTITY_SOURCES, HubRow } from '../lib/contacts-hub-view';

/**
 * Телефон/почта строкой. Кнопка копирования убрана (todo2508 №8) —
 * `select-all` выделяет значение одним кликом, этого достаточно.
 */
const PointValue: FC<{ value: string }> = ({ value }) => (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <span className="select-all">{value}</span>
    </span>
);

/** Строка контакта: имя (ссылкой в CRM), должность, телефоны и почты. */
export const HubRowView: FC<{ row: HubRow; domain: string }> = ({
    row,
    domain,
}) => {
    const url = row.contactId
        ? getCrmUrl(domain, 'contact', row.contactId)
        : null;
    const isCurrentEntity = row.sources.some(source =>
        CURRENT_ENTITY_SOURCES.has(source),
    );

    return (
        <li
            className={cn(
                'group rounded-md border border-transparent px-2 py-1.5',
                // Текущая сущность контекста — заметнее остального списка.
                isCurrentEntity && 'border-border bg-muted/40',
                // Выбранный контакт плана/отчёта — акцентная кромка.
                row.current && 'border-[var(--event-current)]/40',
            )}
        >
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                {url ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={row.name}
                        className="min-w-0 truncate text-sm font-medium hover:underline"
                    >
                        {row.name}
                    </a>
                ) : (
                    <span
                        title={row.name}
                        className="min-w-0 truncate text-sm font-medium"
                    >
                        {row.name}
                    </span>
                )}
                {row.post && (
                    <span
                        title={row.post}
                        className="min-w-0 truncate text-xs text-muted-foreground"
                    >
                        {row.post}
                    </span>
                )}
                <span className="ml-auto inline-flex shrink-0 items-center gap-1">
                    {/* Ярлычки-источники («Компания»/«Сделка»…) убраны
                        (todo2508 №8): роль текущего дела остаётся, источники
                        читаются фильтрами сверху. */}
                    {row.current && (
                        <ToneBadge tone="event" variant="soft" size="sm">
                            {row.current === 'both'
                                ? 'в плане и отчёте'
                                : row.current === 'plan'
                                  ? 'в плане'
                                  : 'в отчёте'}
                        </ToneBadge>
                    )}
                </span>
            </div>
            {(row.phones.length > 0 || row.emails.length > 0) && (
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    {row.phones.map(phone => (
                        <PointValue key={`p-${phone}`} value={phone} />
                    ))}
                    {row.emails.map(email => (
                        <PointValue key={`e-${email}`} value={email} />
                    ))}
                </div>
            )}
        </li>
    );
};
