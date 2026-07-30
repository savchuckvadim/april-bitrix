'use client';

import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Phone, PhoneIncoming, PhoneOutgoing, Timer } from 'lucide-react';
import {
    formatDurationClock,
    formatDurationHuman,
} from '../lib/airtime-format.util';
import { useUserAirtime } from '../lib/hooks/use-user-airtime';

interface AirtimeUserCardProps {
    userId: number;
}

/** Компактная карточка эфирного времени менеджера в user report. */
export const AirtimeUserCard: React.FC<AirtimeUserCardProps> = ({
    userId,
}) => {
    const { status, row, progress } = useUserAirtime(userId);

    return (
        <Card className="bg-popover">
            <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5" />
                    Эфирное время
                </p>
                {(status === 'loading' || status === 'idle') && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Считаем…
                    </p>
                )}
                {status === 'queued' && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Собираем
                        {progress?.totalMonths
                            ? ` · ${progress.readyMonths} из ${progress.totalMonths} мес`
                            : '…'}
                    </p>
                )}
                {status === 'error' && (
                    <p className="mt-2 text-sm text-destructive">
                        Не удалось получить данные
                    </p>
                )}
                {status === 'ready' && row && (
                    <>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-xl font-bold">
                                {formatDurationHuman(row.airtimeSeconds)}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {row.callsCount} зв.
                                {row.callsCount > 0 && (
                                    <>
                                        {' · ср '}
                                        {formatDurationClock(
                                            row.airtimeSeconds /
                                                row.callsCount,
                                        )}
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                            <p className="flex items-center gap-1">
                                <PhoneIncoming className="h-3 w-3 shrink-0" />
                                Вх. {row.incoming.count} ·{' '}
                                {formatDurationHuman(row.incoming.seconds)}
                            </p>
                            <p className="flex items-center gap-1">
                                <PhoneOutgoing className="h-3 w-3 shrink-0" />
                                Исх. {row.outgoing.count} ·{' '}
                                {formatDurationHuman(row.outgoing.seconds)}
                            </p>
                        </div>
                    </>
                )}
                {status === 'ready' && !row && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Звонков за период не найдено
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
