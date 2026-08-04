'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { FLOW_STAGE } from '../../model/FlowStatusSlice';
import {
    FlowProgressStep,
    FlowShowcaseImage,
    getFlowProgressStep,
    getFlowShowcaseImage,
    getIsFlowSlow,
} from '../flow-progress';

interface FlowProgress {
    stage: FLOW_STAGE;
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
 */
export const useFlowProgress = (): FlowProgress => {
    const stage = useAppSelector(s => s.flowStatus.stage);
    const startedAt = useAppSelector(s => s.flowStatus.startedAt);
    const result = useAppSelector(s => s.flowStatus.result);
    const error = useAppSelector(s => s.flowStatus.error);

    const [elapsedMs, setElapsedMs] = useState(0);

    useEffect(() => {
        if (stage !== FLOW_STAGE.SENDING || !startedAt) return;

        const tick = () => setElapsedMs(Date.now() - startedAt);
        tick();

        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [stage, startedAt]);

    return {
        stage,
        step: getFlowProgressStep(elapsedMs),
        isSlow: getIsFlowSlow(elapsedMs),
        showcase:
            stage === FLOW_STAGE.SENDING ? getFlowShowcaseImage(elapsedMs) : null,
        result,
        error,
    };
};
