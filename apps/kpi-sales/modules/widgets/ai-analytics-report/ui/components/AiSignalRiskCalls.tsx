'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import type { AiRiskCall } from '@/modules/entities/ai-analytics';
import {
    aiRiskCallsToggleLabel,
    buildAiRiskCallsView,
} from '../../lib/ai-risk-calls.util';
import { AiSignalRiskCallRow } from './AiSignalRiskCallRow';

interface AiSignalRiskCallsProps {
    calls: AiRiskCall[] | null | undefined;
}

/**
 * Риск-звонки строки: вид сигнала, время и ссылка на разбор (свежие
 * первыми). Свёрнуто — первые три, «ещё N» раскрывает остальные,
 * «свернуть» возвращает обратно.
 */
export const AiSignalRiskCalls = ({ calls }: AiSignalRiskCallsProps) => {
    const [expanded, setExpanded] = useState(false);
    const view = buildAiRiskCallsView(calls, expanded);

    if (!view.rows.length) return null;

    return (
        <ul className="mt-1 space-y-0.5 text-[0.6875rem]">
            {view.rows.map(call => (
                <AiSignalRiskCallRow
                    key={`${call.transcriptionId}-${call.kind}`}
                    call={call}
                />
            ))}
            {view.canToggle && (
                <li>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1 text-[0.6875rem] text-muted-foreground"
                        aria-expanded={expanded}
                        onClick={() => setExpanded(current => !current)}
                    >
                        {aiRiskCallsToggleLabel(view, expanded)}
                    </Button>
                </li>
            )}
        </ul>
    );
};
