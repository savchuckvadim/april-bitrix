'use client';

import { Check } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ToneBadge } from '@workspace/april-ui';
import {
    AI_ALERT_KIND,
    AI_FEEDBACK_OBJECT,
    formatAiMoment,
    type AiPulseAlert,
} from '@/modules/entities/ai-analytics';
import { useAiFeedback } from '../../hooks/use-ai-feedback';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';

interface AiPulseAlertRowProps {
    alert: AiPulseAlert;
}

/** Сигнал руководителю: вид, менеджер, время, цитата, «Отработано». */
export const AiPulseAlertRow = ({ alert }: AiPulseAlertRowProps) => {
    const managerName = useAiManagerName();
    const kind = AI_ALERT_KIND[alert.kind];
    const { pending, markHandled } = useAiFeedback(
        AI_FEEDBACK_OBJECT.call(alert.transcriptionId),
        { managerId: alert.managerId, transcriptionId: alert.transcriptionId },
    );

    return (
        <li className="flex flex-col gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <ToneBadge tone={kind.tone} variant="soft" size="sm">
                        {kind.label}
                    </ToneBadge>
                    <span className="font-medium text-foreground">
                        {managerName(alert.managerId)}
                    </span>
                    <span className="text-muted-foreground">
                        {formatAiMoment(alert.callStartedAt)}
                    </span>
                </div>
                {alert.quote && (
                    <blockquote className="border-l-2 border-muted-foreground/40 pl-3 text-sm italic text-muted-foreground">
                        «{alert.quote}»
                    </blockquote>
                )}
            </div>
            <div className="shrink-0">
                {alert.handled ? (
                    <ToneBadge tone="success" variant="soft" size="sm">
                        <Check /> Отработан
                    </ToneBadge>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={pending}
                        onClick={markHandled}
                    >
                        Отработано
                    </Button>
                )}
            </div>
        </li>
    );
};
