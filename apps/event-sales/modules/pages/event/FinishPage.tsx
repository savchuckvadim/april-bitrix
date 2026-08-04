'use client';

import { FC } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { useReload } from '@/modules/app/lib/hooks/app';
import {
    FLOW_STAGE,
    FlowShowcase,
    eventActions,
    flowStatusActions,
    retrySendEvent,
    useEventNavigation,
    useFlowProgress,
} from '@/modules/processes/event';

/**
 * Экран после отправки. Открывается сразу по нажатию «Отправить», не дожидаясь
 * ответа: пока запрос летит — показывает, чем занят сервер; по ответу —
 * подтверждение либо ошибку с повтором.
 */
const FinishPage: FC = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();
    const { reload } = useReload();
    const { stage, step, isSlow, showcase, result, error } = useFlowProgress();

    const backToList = () => {
        dispatch(eventActions.setFinishStatus({ status: false, result: '' }));
        // Список перезагружаем, только когда сервер уже отработал. Если ещё
        // летит — обновит баннер в самом списке, когда придёт ответ.
        if (stage === FLOW_STAGE.DONE) {
            dispatch(flowStatusActions.setTasksFresh());
            reload();
        }
        nav.toList();
    };

    return (
        <div className="flex min-h-svh items-center justify-center bg-background p-4">
            <div className="max-w-sm space-y-4 text-center">
                {stage === FLOW_STAGE.SENDING && (
                    <>
                        <FlowShowcase image={showcase} />
                        <Loader2 className="mx-auto size-8 animate-spin text-event-current" />
                        <h1 className="text-lg font-semibold text-foreground">
                            {step.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">{step.hint}</p>
                        {isSlow && (
                            <p className="text-sm text-warning">
                                Это дольше обычного. Можно не ждать — отправка
                                продолжится, а список обновится сам.
                            </p>
                        )}
                        <Button variant="outline" onClick={backToList}>
                            К списку событий
                        </Button>
                    </>
                )}

                {stage === FLOW_STAGE.DONE && (
                    <>
                        <CheckCircle2 className="mx-auto size-12 text-success" />
                        <h1 className="text-lg font-semibold text-foreground">
                            Отчёт отправлен
                        </h1>
                        {result && (
                            <p className="text-sm text-muted-foreground">{result}</p>
                        )}
                        <Button onClick={backToList}>К списку событий</Button>
                    </>
                )}

                {stage === FLOW_STAGE.ERROR && (
                    <>
                        <AlertCircle className="mx-auto size-12 text-destructive" />
                        <h1 className="text-lg font-semibold text-foreground">
                            Отчёт не отправлен
                        </h1>
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Button onClick={() => dispatch(retrySendEvent())}>
                                Повторить
                            </Button>
                            <Button variant="outline" onClick={backToList}>
                                К списку событий
                            </Button>
                        </div>
                    </>
                )}

                {/*
                    IDLE на этой странице значит «сюда пришли не через отправку»
                    — перезагрузили фрейм, открыли ссылку напрямую. Показывать
                    «Отчёт отправлен» здесь нельзя: ничего не отправлялось.
                */}
                {stage === FLOW_STAGE.IDLE && (
                    <>
                        <h1 className="text-lg font-semibold text-foreground">
                            Активной отправки нет
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Отчёт отсюда не отправлялся — вернитесь к списку событий.
                        </p>
                        <Button onClick={backToList}>К списку событий</Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FinishPage;
