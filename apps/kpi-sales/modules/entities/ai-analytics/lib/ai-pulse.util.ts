import type { AiPulseAlert, AiPulseManager, AiPulseXmr } from '../model';
import { AI_XMR_STATE } from './ai-pulse.data';
import { formatAiRate } from './ai-metric.util';

/** Сигналы: неотработанные сверху, затем по времени звонка (новые выше). */
export const sortAiAlerts = (alerts: AiPulseAlert[]): AiPulseAlert[] =>
    [...alerts].sort((a, b) => {
        if (a.handled !== b.handled) return a.handled ? 1 : -1;
        return b.callStartedAt.localeCompare(a.callStartedAt);
    });

export const countUnhandledAlerts = (alerts: AiPulseAlert[]): number =>
    alerts.filter(alert => !alert.handled).length;

/** Строки менеджеров по объёму разобранных звонков (больше — выше). */
export const sortAiManagers = (rows: AiPulseManager[]): AiPulseManager[] =>
    [...rows].sort((a, b) => b.analyzed - a.analyzed);

/** Подсказка к состоянию XmR: центр, границы и что значит состояние. */
export const aiXmrHintLines = (xmr: AiPulseXmr): string[] => [
    `Центр ${formatAiRate(xmr.center)}, границы ${formatAiRate(xmr.lcl)} – ${formatAiRate(xmr.ucl)}.`,
    AI_XMR_STATE[xmr.state].hint,
];
