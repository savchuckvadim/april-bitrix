'use client';

import { Check, ExternalLink } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app';
import {
    AI_ALERT_NO_LINK_TEXT,
    AI_ALERT_OPEN_LINK_LABEL,
    AI_FEEDBACK_OBJECT,
    AI_PULSE_TEXT,
    aiAlertActionLine,
    aiAlertHintLines,
    aiAlertKindView,
    aiAlertLink,
    formatAiMoment,
    selectAiIsLeader,
    type AiPulseAlert,
} from '@/modules/entities/ai-analytics';
import { useAiFeedback } from '../../hooks/use-ai-feedback';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';
import { AiFeedbackError } from './AiFeedbackError';
import { AiManagerName } from './AiManagerName';
import { AiReadOnlyHint } from './AiReadOnlyHint';

interface AiPulseAlertRowProps {
    alert: AiPulseAlert;
}

/** Ссылка на карточку разбора; пока элемента разбора нет — приглушённая подпись. */
const AlertLink = ({ alert }: { alert: AiPulseAlert }) => {
    const link = aiAlertLink(alert);
    return link ? (
        <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
        >
            <ExternalLink className="h-3 w-3" />
            {AI_ALERT_OPEN_LINK_LABEL}
        </a>
    ) : (
        <span className="text-xs text-muted-foreground">
            {AI_ALERT_NO_LINK_TEXT}
        </span>
    );
};

/**
 * Сигнал руководителю: вид (подсказка — что значит и что сделать),
 * менеджер, время, цитата, строка «Что сделать», ссылка на разбор и
 * «Отработано» (свой канал реакции — не мешает «полезно» по тому же
 * звонку в повестке). Отмечает только руководитель: менеджеру вместо
 * кнопки — подпись. Ошибка записи — под кнопкой, повтор — тот же клик.
 */
export const AiPulseAlertRow = ({ alert }: AiPulseAlertRowProps) => {
    const managerName = useAiManagerName();
    const isLeader = useAppSelector(selectAiIsLeader);
    // Старый кэш может нести вид, которого в словаре больше нет.
    const kind = aiAlertKindView(alert.kind);
    const { disabled, readOnlyHint, error, send } = useAiFeedback(
        'alert_handled',
        AI_FEEDBACK_OBJECT.call(alert.transcriptionId),
        { managerId: alert.managerId, transcriptionId: alert.transcriptionId },
    );

    const H = AI_PULSE_TEXT.handled;
    const handledButton = (
        <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            disabled={disabled}
            onClick={() => void send('alert_handled')}
        >
            {H.button}
        </Button>
    );

    return (
        <li className="flex flex-col gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <HintTooltip
                        title={kind.label}
                        lines={aiAlertHintLines(alert.kind)}
                    >
                        <span>
                            <ToneBadge tone={kind.tone} variant="soft" size="sm">
                                {kind.label}
                            </ToneBadge>
                        </span>
                    </HintTooltip>
                    {alert.managerId ? (
                        <AiManagerName managerId={alert.managerId} tab="calls" />
                    ) : (
                        <span className="font-medium text-foreground">
                            {managerName(alert.managerId)}
                        </span>
                    )}
                    <span className="text-muted-foreground">
                        {formatAiMoment(alert.callStartedAt)}
                    </span>
                </div>
                {alert.quote && (
                    <blockquote className="border-l-2 border-muted-foreground/40 pl-3 text-sm italic text-muted-foreground">
                        «{alert.quote}»
                    </blockquote>
                )}
                <p className="text-xs text-muted-foreground">
                    {aiAlertActionLine(alert.kind)}
                </p>
                <AlertLink alert={alert} />
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                {alert.handled ? (
                    <HintTooltip title={H.badgeHint.title} lines={[...H.badgeHint.lines]}>
                        <span>
                            <ToneBadge tone="success" variant="soft" size="sm">
                                <Check /> {H.badge}
                            </ToneBadge>
                        </span>
                    </HintTooltip>
                ) : !isLeader ? (
                    <HintTooltip
                        title={H.managerWaitHint.title}
                        lines={[...H.managerWaitHint.lines]}
                    >
                        <span className="cursor-help text-xs text-muted-foreground">
                            {H.managerWait}
                        </span>
                    </HintTooltip>
                ) : readOnlyHint ? (
                    <AiReadOnlyHint hint={readOnlyHint}>
                        {handledButton}
                    </AiReadOnlyHint>
                ) : (
                    <HintTooltip title={H.hint.title} lines={[...H.hint.lines]}>
                        {handledButton}
                    </HintTooltip>
                )}
                <AiFeedbackError error={alert.handled ? null : error} />
            </div>
        </li>
    );
};
