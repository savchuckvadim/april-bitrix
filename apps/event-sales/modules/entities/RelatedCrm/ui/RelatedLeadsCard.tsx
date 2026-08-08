'use client';

import { FC, useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { RelatedLead } from '../model';
import { getLeadStatusView, isLeadOpen } from '../lib/lead-status-view';
import { SectionState, type SectionStatus } from '@/modules/shared/SectionState';
import { LeadMarkRow } from '@/modules/features/LeadMarks';
import { useLeadMarks } from '@/modules/features/LeadMarks/lib/hooks/use-lead-marks';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';


interface RelatedLeadsCardProps {
    leads: RelatedLead[];
    status: SectionStatus;
    onRetry: () => void;
}

/**
 * Связанные лиды. По умолчанию — только те, что в работе: у давнего клиента
 * закрытые лиды исчисляются десятками и топят собой актуальные. Остальные
 * доступны по кнопке.
 */
export const RelatedLeadsCard: FC<RelatedLeadsCardProps> = ({
    leads,
    status,
    onRetry,
}) => {
    const [showAll, setShowAll] = useState(false);
    // Пометки заявок (статус, «не ЦА», атрибуция продажи) живут в UF-полях
    // лида — их нет в связях клиента, поэтому догружаем отдельно.
    useLeadMarks(leads.map(lead => lead.id));
    const markById = useAppSelector(s => s.leadMarks.byId);

    const openLeads = useMemo(
        () => leads.filter(lead => isLeadOpen(lead.statusSemanticId)),
        [leads],
    );
    const visible = showAll ? leads : openLeads;
    const hiddenCount = leads.length - openLeads.length;

    return (
        <Card className="flex min-h-0 flex-col">
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-base">
                    Лиды{status === 'ready' ? ` (${visible.length})` : ''}
                </CardTitle>
                {status === 'ready' && hiddenCount > 0 && (
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto shrink-0 p-0 text-xs"
                        onClick={() => setShowAll(value => !value)}
                    >
                        {showAll
                            ? 'Только в работе'
                            : `Показать все (+${hiddenCount})`}
                    </Button>
                )}
            </CardHeader>

            <CardContent className="min-h-0 flex-1 overflow-y-auto">
                <SectionState
                    status={status}
                    isEmpty={!visible.length}
                    onRetry={onRetry}
                    emptyText={
                        leads.length
                            ? 'Лидов в работе нет — есть только отработанные.'
                            : 'Лидов по клиенту ещё нет.'
                    }
                >
                    <ul className="space-y-1.5">
                        {visible.map(lead => {
                            const statusView = getLeadStatusView(
                                lead.statusSemanticId,
                            );
                            return (
                                <li
                                    key={lead.id}
                                    className="rounded-md border border-border px-2 py-1.5"
                                >
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="min-w-0 truncate text-sm text-foreground">
                                            {lead.title}
                                        </span>
                                        {lead.responsible?.name && (
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {lead.responsible.name}
                                            </span>
                                        )}
                                    </div>
                                    {markById[lead.id] ? (
                                        <LeadMarkRow
                                            mark={markById[lead.id]!}
                                            saleDealId={null}
                                        />
                                    ) : (
                                        <span
                                            className={cn(
                                                'mt-1 inline-block rounded px-1.5 py-0.5 text-xs',
                                                statusView.className,
                                            )}
                                        >
                                            {statusView.label}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </SectionState>
            </CardContent>
        </Card>
    );
};

export default RelatedLeadsCard;
