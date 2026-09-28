'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { MicroSegmented } from '@workspace/april-ui';
import {
    aiPulseAlertsEmptyText,
    aiPulseAlertsFilterOptions,
    aiPulseAlertsToggleLabel,
    buildAiPulseAlertsView,
    defaultAiPulseAlertsFilter,
    isAiPulseAlertsFilter,
    type AiPulseAlert,
    type AiPulseAlertsFilter,
} from '@/modules/entities/ai-analytics';
import { AiPulseAlertRow } from './AiPulseAlertRow';

interface AiPulseAlertsListProps {
    alerts: AiPulseAlert[];
}

/**
 * Сигналы окна: фильтр «Не отработано / Все» (по умолчанию — неотработанные,
 * пока они есть), неотработанные сверху, затем по времени звонка; свёрнуто —
 * первые пять строк, «Показать все N» / «Свернуть». Состояние «развёрнуто»
 * при смене фильтра не сбрасывается.
 */
export const AiPulseAlertsList = ({ alerts }: AiPulseAlertsListProps) => {
    const [filter, setFilter] = useState<AiPulseAlertsFilter>(() =>
        defaultAiPulseAlertsFilter(alerts),
    );
    const [expanded, setExpanded] = useState(false);
    const view = buildAiPulseAlertsView(alerts, { filter, expanded });

    if (!alerts.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                {aiPulseAlertsEmptyText(alerts, filter)}
            </p>
        );
    }

    return (
        <div className="space-y-2">
            <MicroSegmented
                ariaLabel="Какие сигналы показывать"
                size="xs"
                options={aiPulseAlertsFilterOptions(alerts)}
                value={filter}
                onChange={value => {
                    if (isAiPulseAlertsFilter(value)) setFilter(value);
                }}
            />
            {view.rows.length ? (
                <ul className="space-y-2">
                    {view.rows.map(alert => (
                        <AiPulseAlertRow
                            key={alert.transcriptionId}
                            alert={alert}
                        />
                    ))}
                </ul>
            ) : (
                <p className="py-2 text-xs text-muted-foreground">
                    {aiPulseAlertsEmptyText(alerts, filter)}
                </p>
            )}
            {view.canToggle && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => setExpanded(current => !current)}
                >
                    {expanded ? (
                        <ChevronUp className="h-3 w-3" />
                    ) : (
                        <ChevronDown className="h-3 w-3" />
                    )}
                    {aiPulseAlertsToggleLabel(view, expanded)}
                </Button>
            )}
        </div>
    );
};
