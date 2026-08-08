'use client';

import { FC } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { EVHistoryRecord } from '../model/history-record.type';
import { HistoryResponsible } from '../lib/hooks/use-history-responsible';

interface HistoryRecordRowProps {
    record: EVHistoryRecord;
    responsible: HistoryResponsible | null;
}

/**
 * Одна запись истории: бэйджи типа/события/результата, дата, ответственный,
 * комментарий. Чужой ответственный подсвечен — менеджеру важно сразу видеть,
 * что по клиенту работал не он.
 */
export const HistoryRecordRow: FC<HistoryRecordRowProps> = ({
    record,
    responsible,
}) => (
    <li className="border-l-2 border-border pl-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {record.eventType && (
                <Badge variant="secondary" className="shrink-0">
                    {record.eventType.name}
                </Badge>
            )}
            {record.eventAction && (
                <Badge variant="outline" className="shrink-0">
                    {record.eventAction.name}
                </Badge>
            )}
            {record.resultStatus && (
                <Badge variant="outline" className="shrink-0 text-muted-foreground">
                    {record.resultStatus.name}
                </Badge>
            )}
            <span className="min-w-0 truncate text-sm text-foreground">
                {record.title}
            </span>
            {record.date && (
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {record.date}
                </span>
            )}
        </div>
        {responsible && (
            <div className="mt-0.5 text-xs">
                <span
                    className={
                        responsible.isCurrentUser
                            ? 'text-muted-foreground'
                            : 'font-medium text-[var(--event-current,theme(colors.foreground))]'
                    }
                >
                    {responsible.name}
                </span>
            </div>
        )}
        {record.comment && (
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                {record.comment}
            </p>
        )}
    </li>
);
