'use client';

import { FC } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useLeadMarks } from '../lib/hooks/use-lead-marks';
import { LeadMarkRow } from './LeadMarkRow';

interface LeadMarksListProps {
    /** Какие лиды показывать: все связи клиента или привязки текущей задачи. */
    leadIds: number[];
    /** Сделка продажи — включает пометку «участвовал в продаже». */
    saleDealId?: number | null;
    emptyText?: string;
}

/**
 * Список лидов/заявок с пометками. Один компонент на вкладку «Лиды/Заявки»
 * (полноэкранная карточка — все лиды клиента; карточка дела — только
 * привязанные к задаче) и на обязательный шаг при продаже/отказе.
 */
export const LeadMarksList: FC<LeadMarksListProps> = ({
    leadIds,
    saleDealId = null,
    emptyText = 'Связанных лидов и заявок нет.',
}) => {
    useLeadMarks(leadIds);
    const byId = useAppSelector(s => s.leadMarks.byId);
    const status = useAppSelector(s => s.leadMarks.status);

    const marks = leadIds
        .map(id => byId[id])
        .filter((mark): mark is NonNullable<typeof mark> => Boolean(mark));

    if (!marks.length) {
        return (
            <p className="text-xs text-muted-foreground">
                {status === 'loading' ? 'Загружаем лиды…' : emptyText}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            {marks.map(mark => (
                <LeadMarkRow
                    key={mark.id}
                    mark={mark}
                    saleDealId={saleDealId}
                />
            ))}
        </div>
    );
};
