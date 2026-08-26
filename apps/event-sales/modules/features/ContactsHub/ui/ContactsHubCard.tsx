'use client';

import { FC, useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { HintTooltip, MicroSkeleton, ToneBadge } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { getCrmUrl } from '@/modules/app/lib/utills/url';
import {
    CURRENT_ENTITY_SOURCES,
    HUB_SOURCE_LABEL,
    HubRow,
} from '../lib/contacts-hub-view';
import { useContactsHub } from '../lib/hooks/use-contacts-hub';

/**
 * Телефон/почта строкой. Кнопка копирования убрана (todo2508 №8) —
 * `select-all` выделяет значение одним кликом, этого достаточно.
 */
const PointValue: FC<{ value: string }> = ({ value }) => (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <span className="select-all">{value}</span>
    </span>
);

const HubRowView: FC<{ row: HubRow; domain: string }> = ({ row, domain }) => {
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

/**
 * «Все контакты» — как дозвониться до клиента вообще.
 *
 * Телефоны и почты всех контактов из всех связей (компания, сделка, лиды,
 * привязки дела), точки связи самого лида и контакты связей с бэка — одним
 * раскрывающимся списком с фильтрами-бэйджами. Свёрнут по умолчанию и грузит
 * связи только при первом раскрытии: данных много, а нужны они не всегда.
 */
export const ContactsHubCard: FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const hub = useContactsHub(isOpen);

    // Карточка рендерится и пустой: контакты связей приезжают с бэка только
    // ПО раскрытию — ранний return null запирал бы их навсегда (нельзя
    // раскрыть то, чего нет на экране).

    return (
        <SectionCard
            title={`Все контакты${hub.totalCount ? ` (${hub.totalCount})` : ''}`}
            density="compact"
            collapsible
            defaultOpen={false}
            onOpenChange={setIsOpen}
        >
            {(hub.availableSources.length > 1 || hub.totalCount > 3) && (
                <div className="mb-2 flex flex-wrap items-center gap-1">
                    {hub.availableSources.map(source => (
                        <button
                            key={source}
                            type="button"
                            className="cursor-pointer"
                            onClick={() => hub.toggleSource(source)}
                        >
                            <ToneBadge
                                tone={
                                    hub.filters.sources.has(source)
                                        ? 'event'
                                        : 'muted'
                                }
                                variant={
                                    hub.filters.sources.has(source)
                                        ? 'soft'
                                        : 'outline'
                                }
                                size="sm"
                            >
                                {HUB_SOURCE_LABEL[source]}
                            </ToneBadge>
                        </button>
                    ))}
                    <button
                        type="button"
                        className="cursor-pointer"
                        onClick={hub.toggleOnlyWithPhone}
                    >
                        <ToneBadge
                            tone={hub.filters.onlyWithPhone ? 'event' : 'muted'}
                            variant={
                                hub.filters.onlyWithPhone ? 'soft' : 'outline'
                            }
                            size="sm"
                        >
                            с телефоном
                        </ToneBadge>
                    </button>
                </div>
            )}

            {hub.rows.length > 0 ? (
                <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
                    {hub.rows.map(row => (
                        <HubRowView
                            key={row.key}
                            row={row}
                            domain={hub.domain}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground">
                    {hub.totalCount
                        ? 'Под фильтры ничего не попало.'
                        : 'Контактов пока не нашли.'}
                </p>
            )}

            {hub.isRelatedLoading && (
                <HintTooltip title="Дособираем контакты связей">
                    <div className="mt-1.5">
                        <MicroSkeleton className="h-4 w-40" />
                    </div>
                </HintTooltip>
            )}
        </SectionCard>
    );
};
