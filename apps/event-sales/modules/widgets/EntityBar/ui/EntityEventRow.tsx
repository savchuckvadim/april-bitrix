'use client';

import { FC } from 'react';
import { ArrowLeft } from 'lucide-react';
import { EventTypeBadge, IconAction } from '@workspace/april-ui';
import { TaskContactChip } from '@/modules/entities/EventContact';
import { RelatedLinksBadge } from '@/modules/widgets/EventItem/ui/header/RelatedLinksBadge';
import { useEntityEventRow } from '../lib/hooks/use-entity-event-row';

/**
 * Текущее дело в общей шапке: возврат к списку, название, тип, связи задачи
 * и контакт разговора.
 *
 * Раньше это была отдельная шапка внутри формы отчёта — на экране их
 * получалось две, одна под другой. Теперь строка живёт в общей шапке и просто
 * появляется на экране дела: заголовки клиента остаются на месте, добавляется
 * ровно то, что относится к самому делу.
 */
export const EntityEventRow: FC = () => {
    const { title, typeLabel, eventTypeAttr, contactIds, backToList } =
        useEntityEventRow();

    return (
        <div
            data-event-type={eventTypeAttr}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l-4 border-[var(--event-current)] pl-2"
        >
            {/* Назад = отмена: форма сбрасывается так же, как кнопкой
                «Отмена» внизу — два разных «назад» с разным поведением
                путали бы. Черновик комментария живёт в localStorage и не
                пропадает. */}
            <IconAction
                icon={ArrowLeft}
                label="К списку дел"
                hint="Отчёт не отправится, черновик комментария сохранится"
                side="bottom"
                align="start"
                onClick={backToList}
            />

            <h2 className="min-w-0 max-w-72 truncate text-sm font-semibold text-foreground">
                {title}
            </h2>

            {typeLabel && <EventTypeBadge type={typeLabel} />}
            <RelatedLinksBadge />
            <TaskContactChip contactIds={contactIds} />
        </div>
    );
};
