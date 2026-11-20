'use client';

import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import { AiQueuedState } from '../components/AiQueuedState';

interface AiDmSkeletonProps {
    /** Сколько строк-скелетонов. */
    rows?: number;
}

/** Скелет блока подвкладки, пока идёт ответ. */
export const AiDmSkeleton = ({ rows = 4 }: AiDmSkeletonProps) => (
    <AiQueuedState
        status="loading"
        jobStatus={null}
        error={null}
        loadingText={AI_DEAL_MOVEMENT_TEXT.state.loading}
        skeletonRows={rows}
    />
);
