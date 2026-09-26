'use client';

import { Check } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ToneBadge } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app';
import {
    AI_ALERT_KIND,
    AI_FEEDBACK_OBJECT,
    formatAiMoment,
    selectAiIsLeader,
    type AiPulseAlert,
} from '@/modules/entities/ai-analytics';
import { useAiFeedback } from '../../hooks/use-ai-feedback';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';
import { AiFeedbackError } from './AiFeedbackError';
import { AiReadOnlyHint } from './AiReadOnlyHint';

interface AiPulseAlertRowProps {
    alert: AiPulseAlert;
}

/**
 * Сигнал руководителю: вид, менеджер, время, цитата, «Отработано»
 * (свой канал реакции — не мешает «полезно» по тому же звонку в
 * повестке). Отмечает только руководитель: бэк отвечает менеджеру 403,
 * поэтому менеджеру вместо кнопки — подпись. Ошибка записи — под
 * кнопкой, повтор — тот же клик.
 */
export const AiPulseAlertRow = ({ alert }: AiPulseAlertRowProps) => {
    const managerName = useAiManagerName();
    const isLeader = useAppSelector(selectAiIsLeader);
    const kind = AI_ALERT_KIND[alert.kind];
    const { disabled, readOnlyHint, error, send } = useAiFeedback(
        'alert_handled',
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
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                {alert.handled ? (
                    <ToneBadge tone="success" variant="soft" size="sm">
                        <Check /> Отработан
                    </ToneBadge>
                ) : !isLeader ? (
                    <span className="text-xs text-muted-foreground">
                        Отмечает руководитель
                    </span>
                ) : (
                    <AiReadOnlyHint hint={readOnlyHint}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={disabled}
                            onClick={() => void send('alert_handled')}
                        >
                            Отработано
                        </Button>
                    </AiReadOnlyHint>
                )}
                <AiFeedbackError error={alert.handled ? null : error} />
            </div>
        </li>
    );
};
