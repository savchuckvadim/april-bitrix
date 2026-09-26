'use client';

import { ToneBadge } from '@workspace/april-ui';
import {
    AI_ALERT_KIND,
    formatAiMoment,
    type AiRiskCall,
} from '@/modules/entities/ai-analytics';
import {
    aiRiskCallsRestLabel,
    pickAiRiskCalls,
} from '../../lib/ai-signal.util';

interface AiSignalRiskCallsProps {
    calls: AiRiskCall[];
}

/**
 * Риск-звонки строки: вид сигнала, время, id разбора (свежие первыми,
 * не больше трёх, остальное — «ещё N»). Ссылок на карточку разбора бэк
 * пока не отдаёт — показываем id.
 */
export const AiSignalRiskCalls = ({ calls }: AiSignalRiskCallsProps) => {
    if (!calls.length) return null;
    const shown = pickAiRiskCalls(calls);
    const rest = aiRiskCallsRestLabel(calls.length);

    return (
        <ul className="mt-1 space-y-0.5 text-[0.6875rem]">
            {shown.map(call => {
                const kind = AI_ALERT_KIND[call.kind];
                return (
                    <li
                        key={call.transcriptionId}
                        className="flex flex-wrap items-center gap-1"
                    >
                        <ToneBadge tone={kind.tone} variant="outline" size="sm">
                            {kind.label}
                        </ToneBadge>
                        <span className="text-muted-foreground">
                            {formatAiMoment(call.callStartedAt)}
                        </span>
                        <span
                            className="text-muted-foreground"
                            title="Id разбора звонка"
                        >
                            #{call.transcriptionId}
                        </span>
                    </li>
                );
            })}
            {rest && <li className="text-muted-foreground">{rest}</li>}
        </ul>
    );
};
