'use client';

import { FC, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { reloadApp } from '@/modules/app/model/thunk/AppThunk';
import { FLOW_STAGE, flowStatusActions } from '@/modules/processes/event';

/**
 * Состояние незавершённой отправки прямо в списке событий.
 *
 * Менеджер может уйти к списку, не дождавшись ответа, — тогда список показывает
 * старые данные и молчать об этом нельзя. Пока запрос летит — говорим об этом;
 * как только сервер ответил, список перезагружается сам (один раз).
 */
export const FlowStatusBanner: FC = () => {
    const dispatch = useAppDispatch();

    const stage = useAppSelector(s => s.flowStatus.stage);
    const error = useAppSelector(s => s.flowStatus.error);
    const isTasksStale = useAppSelector(s => s.flowStatus.isTasksStale);

    // reloadApp диспатчим напрямую, а не через useReload: хук возвращает новую
    // функцию на каждый рендер, и в зависимостях эффекта она дала бы цикл.
    useEffect(() => {
        if (stage !== FLOW_STAGE.DONE || !isTasksStale) return;
        dispatch(flowStatusActions.setTasksFresh());
        dispatch(reloadApp());
    }, [stage, isTasksStale, dispatch]);

    if (stage === FLOW_STAGE.SENDING) {
        return (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 shrink-0 animate-spin" />
                <span>
                    Отчёт ещё отправляется. Список обновится, как только сервер
                    ответит.
                </span>
            </div>
        );
    }

    if (stage === FLOW_STAGE.ERROR) {
        return (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error || 'Отчёт не отправлен.'}</span>
                <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    onClick={() => dispatch(flowStatusActions.reset())}
                >
                    Скрыть
                </Button>
            </div>
        );
    }

    return null;
};
