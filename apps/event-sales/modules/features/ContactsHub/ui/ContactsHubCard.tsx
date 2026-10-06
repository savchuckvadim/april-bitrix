'use client';

import { FC, useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { HintTooltip, MicroSkeleton, ToneBadge } from '@workspace/april-ui';
import { HUB_SOURCE_LABEL } from '../lib/contacts-hub-view';
import { useContactsHub } from '../lib/hooks/use-contacts-hub';
import { HubRowView } from './HubRowView';

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
