'use client';

import {
    sortAiAlerts,
    type AiPulseAlert,
} from '@/modules/entities/ai-analytics';
import { AiPulseAlertRow } from './AiPulseAlertRow';

interface AiPulseAlertsListProps {
    alerts: AiPulseAlert[];
}

/** Сигналы окна: неотработанные сверху, затем по времени звонка. */
export const AiPulseAlertsList = ({ alerts }: AiPulseAlertsListProps) => {
    if (!alerts.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                Сигналов за окно нет.
            </p>
        );
    }

    return (
        <ul className="space-y-2">
            {sortAiAlerts(alerts).map(alert => (
                <AiPulseAlertRow key={alert.transcriptionId} alert={alert} />
            ))}
        </ul>
    );
};
