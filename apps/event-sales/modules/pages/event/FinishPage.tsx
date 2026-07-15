'use client';

import { FC } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useReload } from '@/modules/app/lib/hooks/app';
import { eventActions, useEventNavigation } from '@/modules/processes/event';

/** Финиш: подтверждение отправки + возврат к списку (с перезагрузкой данных). */
const FinishPage: FC = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();
    const { reload } = useReload();
    const result = useAppSelector(s => s.event.result);

    const backToList = () => {
        dispatch(eventActions.setFinishStatus({ status: false, result: '' }));
        reload();
        nav.toList();
    };

    return (
        <div className="flex min-h-svh items-center justify-center bg-background p-4">
            <div className="space-y-4 text-center">
                <CheckCircle2 className="mx-auto size-12 text-success" />
                <h1 className="text-lg font-semibold text-foreground">
                    Отчёт отправлен
                </h1>
                {result && <p className="text-sm text-muted-foreground">{result}</p>}
                <Button onClick={backToList}>К списку событий</Button>
            </div>
        </div>
    );
};

export default FinishPage;
