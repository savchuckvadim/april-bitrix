'use client';

import { ToneBadge } from '@workspace/april-ui';
import {
    formatAiCount,
    formatAiDay,
    formatAiMoment,
    type AiOverview,
} from '@/modules/entities/ai-analytics';

interface AiOverviewMetaProps {
    overview: AiOverview;
}

/** Служебная сводка обзора: период, объём, доля «прочего», кэш и момент расчёта. */
export const AiOverviewMeta = ({ overview }: AiOverviewMetaProps) => {
    const { period, meta } = overview;
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
                {formatAiDay(period.from)} – {formatAiDay(period.to)} ·{' '}
                {period.workdays} раб. дн.
            </span>
            <span>
                разобрано {formatAiCount(meta.analyzedCalls)} из{' '}
                {formatAiCount(meta.totalCalls)}
            </span>
            <span>прочее {Math.round(meta.otherSharePct)} %</span>
            {meta.skippedNoManager > 0 && (
                <span>
                    без менеджера {formatAiCount(meta.skippedNoManager)}
                </span>
            )}
            {meta.disagreementsCount > 0 && (
                <span>несогласий {meta.disagreementsCount}</span>
            )}
            <span>расчёт {formatAiMoment(meta.generatedAt)}</span>
            {meta.fromCache && (
                <ToneBadge tone="muted" variant="soft" size="sm">
                    из кэша
                </ToneBadge>
            )}
        </div>
    );
};
