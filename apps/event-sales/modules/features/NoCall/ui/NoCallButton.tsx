'use client';

import { FC } from 'react';
import { PhoneMissed } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getNoCallMenu } from '../model/NoCallThunk';

/**
 * Кнопка «Недозвон» в строке события — как в легаси: после отправки остаётся
 * (недозвоны идут подряд, дело в Битриксе открыто), а на ней растёт счётчик
 * отправленных недозвонов по этой задаче.
 *
 * Показывается только при включённой настройке портала «Недозвон»
 * (`withNoCall`): раньше кнопка настройку не читала и висела на порталах,
 * где недозвон выключен (garant, разбор 05.10.2026).
 */
export const NoCallButton: FC<{ taskId: number }> = ({ taskId }) => {
    const dispatch = useAppDispatch();
    const isEnabled = useAppSelector(s => s.app.config.withNoCall);
    const sentCount = useAppSelector(
        s => s.noCall.sendedTaskIds.filter(id => id === taskId).length,
    );

    if (!isEnabled) return null;

    return (
        <Button
            size="sm"
            variant="ghost"
            className="gap-1 text-muted-foreground"
            aria-label={
                sentCount
                    ? `Недозвон, отправлено: ${sentCount}`
                    : 'Недозвон'
            }
            onClick={() => dispatch(getNoCallMenu(taskId, true))}
        >
            <PhoneMissed aria-hidden className="size-3.5" />
            Недозвон
            {sentCount > 0 && (
                <span className="rounded-full bg-muted px-1.5 text-[0.65rem] font-semibold tabular-nums text-foreground">
                    {sentCount}
                </span>
            )}
        </Button>
    );
};
