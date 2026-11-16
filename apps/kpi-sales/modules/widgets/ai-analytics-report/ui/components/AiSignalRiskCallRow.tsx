'use client';

import { ToneBadge } from '@workspace/april-ui';
import {
    aiAlertKindView,
    formatAiMoment,
    type AiRiskCall,
} from '@/modules/entities/ai-analytics';
import {
    AI_RISK_CALL_LINK_LABEL,
    AI_RISK_CALL_LINK_TITLE,
    aiRiskCallLink,
    aiRiskCallNoLinkText,
} from '../../lib/ai-risk-calls.util';
import { AiCallPageLink } from './AiCallPageLink';
import { AiCardLink } from './AiCardLink';

interface AiSignalRiskCallRowProps {
    call: AiRiskCall;
}

/**
 * Риск-звонок: вид сигнала, время звонка и ссылка «разбор» на карточку
 * в Битрикс24; карточки ещё нет — подпись обычным текстом; про ссылку
 * ничего не известно (обзор сохранён раньше) — только вид и время.
 */
export const AiSignalRiskCallRow = ({ call }: AiSignalRiskCallRowProps) => {
    // Обзор из старого кэша может нести отменённый вид — запасная подпись.
    const kind = aiAlertKindView(call.kind);
    const link = aiRiskCallLink(call);
    const noLinkText = aiRiskCallNoLinkText(call);

    return (
        <li className="flex flex-wrap items-center gap-1">
            <ToneBadge tone={kind.tone} variant="outline" size="sm">
                {kind.label}
            </ToneBadge>
            <span className="text-muted-foreground">
                {formatAiMoment(call.callStartedAt)}
            </span>
            {link ? (
                <AiCardLink
                    href={link}
                    label={AI_RISK_CALL_LINK_LABEL}
                    title={AI_RISK_CALL_LINK_TITLE}
                />
            ) : (
                noLinkText && (
                    <span className="text-muted-foreground">{noLinkText}</span>
                )
            )}
            <AiCallPageLink
                transcriptionId={call.transcriptionId}
                label="страница"
                className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
            />
        </li>
    );
};
