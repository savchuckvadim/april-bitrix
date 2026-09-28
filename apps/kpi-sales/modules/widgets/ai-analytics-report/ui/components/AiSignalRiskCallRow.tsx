'use client';

import { ToneBadge } from '@workspace/april-ui';
import {
    AI_ALERT_KIND,
    formatAiMoment,
    type AiRiskCall,
} from '@/modules/entities/ai-analytics';
import {
    AI_RISK_CALL_LINK_LABEL,
    AI_RISK_CALL_LINK_TITLE,
    aiRiskCallLink,
    aiRiskCallNoLinkText,
} from '../../lib/ai-risk-calls.util';
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
    const kind = AI_ALERT_KIND[call.kind];
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
        </li>
    );
};
