'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { useContactsHub } from '../lib/hooks/use-contacts-hub';
import { HubRowView } from './HubRowView';

/**
 * Контакты клиента короткой колонкой — рядом с карточками дел.
 *
 * Показывает то, что УЖЕ есть в приложении: контакты компании, сделки и
 * лида загружены на старте, потому что нужны отчёту. Своих запросов карточка
 * не делает и связи клиента не заказывает (`useContactsHub(false)`) — иначе
 * на каждое открытие фрейма уходил бы тяжёлый запрос, от которого уходили.
 * Полный список с контактами связей и фильтрами — во вкладке «контакты».
 */
export const ContactsBriefCard: FC = () => {
    const hub = useContactsHub(false);

    return (
        <SectionCard
            title={`Контакты${hub.totalCount ? ` (${hub.totalCount})` : ''}`}
            density="compact"
        >
            {hub.rows.length > 0 ? (
                <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
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
                    Контактов у клиента пока нет.
                </p>
            )}
        </SectionCard>
    );
};
