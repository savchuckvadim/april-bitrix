'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { FLOW_OUTBOX_STATE, FLOW_STAGE } from '../../model/FlowStatusSlice';
import {
    FlowProgressStep,
    FlowShowcaseImage,
    getFlowProgressStep,
    getFlowShowcaseImage,
    getIsFlowSlow,
} from '../flow-progress';

interface FlowProgress {
    stage: FLOW_STAGE;
    /** Судьба конверта outbox: QUEUED — «сохранено, отправим автоматически». */
    outboxState: FLOW_OUTBOX_STATE;
    step: FlowProgressStep;
    /** Идёт дольше обычного — предлагаем не ждать. */
    isSlow: boolean;
    /** Кадр-заставка; null, пока ожидание короткое. */
    showcase: FlowShowcaseImage | null;
    result: string;
    error: string;
}

/**
 * Прогресс отправки для экрана финиша: тикает, только пока запрос в полёте.
 * Тик — раз в секунду: шаги переключаются секундами, чаще считать незачем.
 * Конверт ушёл в очередь дренажа (QUEUED) — ждать больше нечего, тик стоит.
 */
export const useFlowProgress = (): FlowProgress => {
    const stage = useAppSelector(s => s.flowStatus.stage);
    const outboxState = useAppSelector(s => s.flowStatus.outboxState);
    const startedAt = useAppSelector(s => s.flowStatus.startedAt);
    const result = useAppSelector(s => s.flowStatus.result);
    const error = useAppSelector(s => s.flowStatus.error);

    const [elapsedMs, setElapsedMs] = useState(0);

    const isFlying =
        stage === FLOW_STAGE.SENDING &&
        outboxState !== FLOW_OUTBOX_STATE.QUEUED;

    useEffect(() => {
        if (!isFlying || !startedAt) return;

        const tick = () => setElapsedMs(Date.now() - startedAt);
        tick();

        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [isFlying, startedAt]);

    return {
        stage,
        outboxState,
        step: getFlowProgressStep(elapsedMs),
        isSlow: getIsFlowSlow(elapsedMs),
        showcase: isFlying ? getFlowShowcaseImage(elapsedMs) : null,
        result,
        error,
    };
};
