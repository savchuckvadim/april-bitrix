'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getNoCallMenu } from '../model/NoCallThunk';

/**
 * Кнопка «Недозвон» в строке события; скрывается после отправки по задаче.
 *
 * Показывается только при включённой настройке портала «Недозвон»
 * (`withNoCall`): раньше кнопка настройку не читала и висела на порталах,
 * где недозвон выключен (garant, разбор 05.10.2026).
 */
export const NoCallButton: FC<{ taskId: number }> = ({ taskId }) => {
    const dispatch = useAppDispatch();
    const isEnabled = useAppSelector(s => s.app.config.withNoCall);
    const isSended = useAppSelector(s =>
        s.noCall.sendedTaskIds.includes(taskId),
    );

    if (!isEnabled || isSended) return null;

    return (
        <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => dispatch(getNoCallMenu(taskId, true))}
        >
            Недозвон
        </Button>
    );
};
