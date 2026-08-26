'use client';

import { FC } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { EVHistoryRecord } from '../model/history-record.type';
import { HistoryResponsible } from '../lib/hooks/use-history-responsible';
import type { HistoryStatusView } from '../lib/history-status';
import { HistoryStatusDot } from './HistoryStatusDot';

interface HistoryRecordRowProps {
    record: EVHistoryRecord;
    responsible: HistoryResponsible | null;
    /** Исход записи: кружок слева от бэйджей. */
    status: HistoryStatusView;
}

/**
 * Одна запись истории: бэйджи типа/события/результата, дата, ответственный,
 * комментарий. Чужой ответственный подсвечен — менеджеру важно сразу видеть,
 * что по клиенту работал не он.
 */
export const HistoryRecordRow: FC<HistoryRecordRowProps> = ({
    record,
    responsible,
    status,
}) => (
    <li className="border-l-2 border-border pl-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <HistoryStatusDot status={status} />
            {/* Имена типов/действий — из словарей портала: потолок ширины на
                бэйдже, многоточие внутренним span'ом (на inline-flex бэйдже
                truncate не работает). */}
            {record.eventType && (
                /* Лёгкая обводка цвета события: тип узнаётся до чтения. */
                <Badge
                    variant="secondary"
                    data-event-type={record.eventType.code}
                    title={record.eventType.name}
                    className="max-w-48 shrink-0 border border-[var(--event-current)]/40"
                >
                    <span className="truncate">{record.eventType.name}</span>
                </Badge>
            )}
            {record.eventAction && (
                <Badge
                    variant="outline"
                    title={record.eventAction.name}
                    className="max-w-48 shrink-0"
                >
                    <span className="truncate">{record.eventAction.name}</span>
                </Badge>
            )}
            {record.resultStatus && (
                <Badge
                    variant="outline"
                    title={record.resultStatus.name}
                    className="max-w-48 shrink-0 text-muted-foreground"
                >
                    <span className="truncate">
                        {record.resultStatus.name}
                    </span>
                </Badge>
            )}
            <span
                title={record.title}
                className="min-w-0 truncate text-sm text-foreground"
            >
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
