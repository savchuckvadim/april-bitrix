'use client';

import { FC } from 'react';
import { AlertCircle, CheckCircle2, CloudOff } from 'lucide-react';
import { Spinner } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { refreshEventTasks } from '@/modules/entities/EventTask/model/EventTaskThunk';
import {
    FLOW_OUTBOX_STATE,
    FLOW_STAGE,
    FlowShowcase,
    eventActions,
    flowStatusActions,
    retrySendEvent,
    useEventNavigation,
    useFinishErrorRedirect,
    useFlowProgress,
} from '@/modules/processes/event';

/**
 * Экран после отправки. Открывается сразу по нажатию «Отправить», не дожидаясь
 * ответа: пока запрос летит — показывает, чем занят сервер; по ответу —
 * подтверждение либо ошибку с повтором. Сервер молчит — честная стадия
 * outbox: отчёт сохранён конвертом и доедет дренажем автоматически; если
 * ядро исполнил прямой путь (А4) — «проведён напрямую», при непустом хвосте
 * досылки (DONE+PARTIAL) добавляем, что служебная часть доедет сама:
 * её увозит дренаж на POST /flow/deferred (А5). Прямое исполнение прошло
 * НЕ ЦЕЛИКОМ (DONE+INCOMPLETE) — говорим об этом прямо и просим сверить
 * карточку: доисполнить такой отчёт нечем, «Повторить» тут бессилен.
 */
const FinishPage: FC = () => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();
    const { stage, outboxState, step, isSlow, showcase, result, error } =
        useFlowProgress();
    const redirect = useFinishErrorRedirect(stage === FLOW_STAGE.ERROR);
    const isQueued = outboxState === FLOW_OUTBOX_STATE.QUEUED;
    // А4: ядро исполнено напрямую в Битриксе, хвост ждёт эндпоинта А5.
    const isPartial = outboxState === FLOW_OUTBOX_STATE.PARTIAL;
    // А4: прямое исполнение прошло не целиком — часть изменений не легла.
    const isIncomplete = outboxState === FLOW_OUTBOX_STATE.INCOMPLETE;

    const backToList = () => {
        dispatch(eventActions.setFinishStatus({ status: false, result: '' }));
        // Список обновляем ТОЧЕЧНО и только когда сервер уже отработал.
        // Если ещё летит — обновит баннер в самом списке по ответу.
        // Полный reload() здесь ронял весь шелл: серый экран без лоадера
        // и жёсткий перемонтаж на возврате (todo3108).
        if (stage === FLOW_STAGE.DONE) {
            dispatch(flowStatusActions.setTasksFresh());
            void dispatch(refreshEventTasks());
        }
        nav.toList();
    };

    return (
        <div className="flex min-h-svh items-center justify-center bg-background p-4">
            <div className="max-w-sm space-y-4 text-center">
                {stage === FLOW_STAGE.SENDING && isQueued && (
                    <>
                        <CloudOff className="mx-auto size-12 text-muted-foreground" />
                        <h1 className="text-lg font-semibold text-foreground">
                            Отчёт сохранён — отправим автоматически
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Сервер сейчас не отвечает. Отчёт лежит на этом
                            устройстве и уйдёт сам, как только появится связь —
                            можно продолжать работу.
                        </p>
                        <Button onClick={backToList}>К списку событий</Button>
                    </>
                )}

                {stage === FLOW_STAGE.SENDING && !isQueued && (
                    <>
                        <FlowShowcase image={showcase} />
                        {/* Кольцевой спиннер дизайн-системы: ровная окружность
                            с целым размером. Дуга lucide на дробном масштабе
                            (32px при viewBox 24) давала субпиксельный штрих —
                            вращение читалось «кривым». */}
                        <Spinner
                            size="lg"
                            tone="event"
                            label="Отправляем отчёт"
                            className="mx-auto"
                        />
                        <h1 className="text-lg font-semibold text-foreground">
                            {step.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {step.hint}
                        </p>
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

                {stage === FLOW_STAGE.DONE && isIncomplete && (
                    <>
                        {/* А4: сервер молчал, отчёт проводился прямо из
                            браузера — и часть обязательных изменений не
                            применилась. Повторить нечем: отметка в задаче
                            блокирует повторную попытку, а серверу отдавать
                            отчёт заново нельзя (провёл бы всё второй раз).
                            Поэтому — спокойная констатация и просьба
                            сверить карточку, без «Повторить», который тут
                            ничего не сделает. */}
                        <AlertCircle className="mx-auto size-12 text-warning" />
                        <h1 className="text-lg font-semibold text-foreground">
                            Отчёт проведён не полностью
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Сервер был недоступен, поэтому отчёт проводился
                            прямо из браузера — и часть изменений применить не
                            удалось. Откройте карточку клиента и событие: видно,
                            что легло, а что нет. Отправлять отчёт заново не
                            нужно.
                        </p>
                        {result && (
                            <p className="text-sm text-muted-foreground">
                                {result}
                            </p>
                        )}
                        <Button onClick={backToList}>К списку событий</Button>
                    </>
                )}

                {stage === FLOW_STAGE.DONE && isPartial && (
                    <>
                        {/* А4+А5: сервер молчал — ядро отчёта выполнено
                            прямо в Битриксе. Служебную часть браузер провести
                            не может (прав нет), её увозит дренаж на
                            POST /flow/deferred, как только сервер оживёт —
                            обещание снова честное. */}
                        <CheckCircle2 className="mx-auto size-12 text-success" />
                        <h1 className="text-lg font-semibold text-foreground">
                            Отчёт проведён напрямую
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Сервер сейчас недоступен, поэтому отчёт проведён
                            прямо из браузера: событие закрыто, карточки клиента
                            обновлены. Служебная часть — KPI, движения сделок,
                            анкета в смарте — доедет сама, как только сервер
                            оживёт. Ждать не нужно.
                        </p>
                        {result && (
                            <p className="text-sm text-muted-foreground">
                                {result}
                            </p>
                        )}
                        <Button onClick={backToList}>К списку событий</Button>
                    </>
                )}

                {stage === FLOW_STAGE.DONE && !isPartial && !isIncomplete && (
                    <>
                        <CheckCircle2 className="mx-auto size-12 text-success" />
                        <h1 className="text-lg font-semibold text-foreground">
                            Отчёт отправлен
                        </h1>
                        {result && (
                            <p className="text-sm text-muted-foreground">
                                {result}
                            </p>
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

                        {redirect.secondsLeft !== null && (
                            <p className="text-sm text-muted-foreground">
                                Через {redirect.secondsLeft} с откроем карточку
                                клиента — там видно, что реально применилось.
                            </p>
                        )}

                        <div className="flex flex-wrap justify-center gap-2">
                            <Button
                                onClick={() => {
                                    redirect.cancel();
                                    dispatch(retrySendEvent());
                                }}
                            >
                                Повторить
                            </Button>
                            <Button variant="outline" onClick={redirect.goNow}>
                                Открыть карточку
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    redirect.cancel();
                                    backToList();
                                }}
                            >
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
                            Отчёт отсюда не отправлялся — вернитесь к списку
                            событий.
                        </p>
                        <Button onClick={backToList}>К списку событий</Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FinishPage;
