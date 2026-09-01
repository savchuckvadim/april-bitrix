'use client';

import { FC, useEffect } from 'react';
import { AlertCircle, CloudOff } from 'lucide-react';
import { Spinner } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { refreshEventTasks } from '@/modules/entities/EventTask/model/EventTaskThunk';
import {
    FLOW_OUTBOX_STATE,
    FLOW_STAGE,
    flowStatusActions,
} from '@/modules/processes/event';

/**
 * Состояние незавершённой отправки прямо в списке событий.
 *
 * Менеджер может уйти к списку, не дождавшись ответа, — тогда список показывает
 * старые данные и молчать об этом нельзя. Пока запрос летит — говорим об этом;
 * как только сервер ответил, список перезагружается сам (один раз). Сервер
 * молчит — честная стадия outbox: отчёт сохранён и доедет дренажем сам; ядро
 * исполнено напрямую (А4, DONE+PARTIAL) — говорим, что служебная часть
 * доедет сама (её увозит дренаж на /flow/deferred, А5); прямое исполнение
 * прошло не целиком (DONE+INCOMPLETE) — просим сверить карточку.
 */
export const FlowStatusBanner: FC = () => {
    const dispatch = useAppDispatch();

    const stage = useAppSelector(s => s.flowStatus.stage);
    const outboxState = useAppSelector(s => s.flowStatus.outboxState);
    const error = useAppSelector(s => s.flowStatus.error);
    const isTasksStale = useAppSelector(s => s.flowStatus.isTasksStale);

    /*
     * ТОЧЕЧНЫЙ рефреш задач, а не reloadApp: полный перезапуск ронял весь
     * шелл (initialized=false) — секунды ГОЛОГО фона без лоадера и жёсткий
     * перемонтаж прямо под менеджером, который смотрит список (todo3108).
     * Обновиться должен только список — он и обновляется, строки на месте.
     */
    useEffect(() => {
        if (stage !== FLOW_STAGE.DONE || !isTasksStale) return;
        dispatch(flowStatusActions.setTasksFresh());
        void dispatch(refreshEventTasks());
    }, [stage, isTasksStale, dispatch]);

    if (
        stage === FLOW_STAGE.SENDING &&
        outboxState === FLOW_OUTBOX_STATE.QUEUED
    ) {
        return (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <CloudOff className="size-4 shrink-0" />
                <span>
                    Отчёт сохранён и отправится автоматически, как только
                    появится связь с сервером.
                </span>
            </div>
        );
    }

    if (
        stage === FLOW_STAGE.DONE &&
        outboxState === FLOW_OUTBOX_STATE.PARTIAL
    ) {
        // А4+А5: ядро исполнено напрямую в Битриксе (сервер молчал), а
        // служебную часть увозит дренаж на POST /flow/deferred, когда
        // сервер оживёт. Тон прежний — фон, не тревога.
        return (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <CloudOff className="size-4 shrink-0" />
                <span>
                    Отчёт проведён напрямую: событие закрыто, карточки клиента
                    обновлены. Служебная часть (KPI, движения сделок, анкета в
                    смарте) доедет сама, когда сервер оживёт.
                </span>
            </div>
        );
    }

    if (
        stage === FLOW_STAGE.DONE &&
        outboxState === FLOW_OUTBOX_STATE.INCOMPLETE
    ) {
        // А4: отчёт проводился напрямую (сервер молчал), но часть
        // обязательных изменений не применилась, и доисполнить их нечем.
        // Тон прежний — спокойная констатация, — а вот фон предупреждающий:
        // это единственное место в списке, где менеджер узнает, что надо
        // сверить карточку.
        return (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                <AlertCircle className="size-4 shrink-0" />
                <span>
                    Отчёт проведён не полностью: сервер был недоступен, и часть
                    изменений применить не удалось. Проверьте карточку клиента —
                    отправлять отчёт заново не нужно.
                </span>
            </div>
        );
    }

    if (stage === FLOW_STAGE.SENDING) {
        return (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <Spinner size="sm" tone="muted" label="Отчёт отправляется" />
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
