'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getNoCallMenu } from '../model/NoCallThunk';

/** Кнопка «Недозвон» в строке события; скрывается после отправки по задаче. */
export const NoCallButton: FC<{ taskId: number }> = ({ taskId }) => {
    const dispatch = useAppDispatch();
    const isSended = useAppSelector(s =>
        s.noCall.sendedTaskIds.includes(taskId),
    );

    if (isSended) return null;

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
