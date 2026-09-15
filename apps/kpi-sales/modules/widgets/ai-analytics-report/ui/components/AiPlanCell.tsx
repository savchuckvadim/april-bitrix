'use client';

import { LiquidProgress } from '@workspace/april-ui';
import {
    aiPlanShare,
    aiPlanTone,
    formatAiPlanDone,
} from '@/modules/entities/ai-analytics';

interface AiPlanCellProps {
    done: number;
    plan: number;
}

/** План CRM: «сделано / запланировано» и полоса выполнения (без плана — только число). */
export const AiPlanCell = ({ done, plan }: AiPlanCellProps) => {
    const share = aiPlanShare(done, plan);
    return (
        <div className="flex min-w-24 flex-col gap-1">
            <span className="text-sm tabular-nums">
                {formatAiPlanDone(done, plan)}
            </span>
            {share !== null && (
                <LiquidProgress
                    value={share}
                    tone={aiPlanTone(share)}
                    size="sm"
                />
            )}
        </div>
    );
};
