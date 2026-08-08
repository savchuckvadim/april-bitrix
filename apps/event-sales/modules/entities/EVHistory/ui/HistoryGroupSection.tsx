'use client';

import { FC } from 'react';
import { Building2, Handshake, UserRound, Contact } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { loadMoreHistoryForBinding } from '../model/EVHistoryThunk';
import {
    EHistoryBindingType,
    HistoryBindingType,
} from '../model/history-record.type';
import { HistoryEntityGroup } from '../lib/hooks/use-history-view';
import { useHistoryScroll } from '../lib/hooks/use-history-scroll';
import { HistoryResponsible } from '../lib/hooks/use-history-responsible';
import { HistoryRecordRow } from './HistoryRecordRow';

const GROUP_ICON: Record<HistoryBindingType, typeof Building2> = {
    [EHistoryBindingType.COMPANY]: Building2,
    [EHistoryBindingType.DEAL]: Handshake,
    [EHistoryBindingType.LEAD]: UserRound,
    [EHistoryBindingType.CONTACT]: Contact,
};

interface HistoryGroupSectionProps {
    item: HistoryEntityGroup;
    resolveResponsible: (id: number | null) => HistoryResponsible | null;
}

/**
 * Лента одной привязки: заголовок сущности, записи, скролл-догрузка своей
 * страницы (sentinel в конце — IntersectionObserver, никаких кнопок).
 */
export const HistoryGroupSection: FC<HistoryGroupSectionProps> = ({
    item,
    resolveResponsible,
}) => {
    const dispatch = useAppDispatch();
    const { group, records, hiddenDuplicates } = item;
    const Icon = GROUP_ICON[group.binding.type];

    const sentinelRef = useHistoryScroll(
        () => dispatch(loadMoreHistoryForBinding(group.binding.value)),
        group.next !== null && !group.isLoadingMore,
    );

    return (
        <section>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon aria-hidden className="size-3.5 shrink-0" />
                <span className="min-w-0 truncate normal-case">
                    {group.binding.title}
                </span>
                {group.binding.isSalesLead && (
                    <Badge variant="secondary" className="shrink-0 normal-case">
                        ОП
                    </Badge>
                )}
                {group.binding.isSiteRequest && (
                    <Badge variant="outline" className="shrink-0 normal-case">
                        Заявка с сайта
                    </Badge>
                )}
                <span className="shrink-0 font-normal">
                    {group.total ?? group.ids.length}
                </span>
                {hiddenDuplicates > 0 && (
                    <span
                        className="shrink-0 font-normal text-muted-foreground/60"
                        title="Записи, уже показанные в группах выше"
                    >
                        · {hiddenDuplicates} общих скрыто
                    </span>
                )}
            </h4>

            <ul className="mt-1.5 space-y-2">
                {records.map(record => (
                    <HistoryRecordRow
                        key={record.id}
                        record={record}
                        responsible={resolveResponsible(record.responsibleId)}
                    />
                ))}
            </ul>

            {group.isLoadingMore && (
                <p className="mt-1 text-xs text-muted-foreground">Загружаем…</p>
            )}
            {group.next !== null && (
                <div ref={sentinelRef} aria-hidden className="h-px" />
            )}
        </section>
    );
};
