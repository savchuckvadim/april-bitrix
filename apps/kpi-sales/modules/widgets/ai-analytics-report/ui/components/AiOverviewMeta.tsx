'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app';
import {
    selectAiMinDurationSec,
    type AiOverview,
} from '@/modules/entities/ai-analytics';
import { AI_OVERVIEW_META_TEXT } from '../../lib/ai-overview-meta.texts';
import { buildAiOverviewMetaItems } from '../../lib/ai-overview-meta.util';

interface AiOverviewMetaProps {
    overview: AiOverview;
}

const HINT_TRIGGER = 'cursor-help border-b border-dashed border-muted-foreground/60';

/**
 * Служебная сводка обзора: период, «в оценке X из Y звонков, обработанных
 * AI», «не по продажам», «сотрудник не определён», «разобраны по старым
 * правилам», несогласия, момент расчёта и «сохранённый расчёт» — у каждого
 * числа подсказка, что это и что с ним делать.
 */
export const AiOverviewMeta = ({ overview }: AiOverviewMetaProps) => {
    const minDurationSec = useAppSelector(selectAiMinDurationSec);
    const items = buildAiOverviewMetaItems(overview, { minDurationSec });
    const cache = AI_OVERVIEW_META_TEXT.cache;

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {items.map(item =>
                item.hint ? (
                    <HintTooltip
                        key={item.key}
                        title={item.hint.title}
                        lines={[...item.hint.lines]}
                    >
                        <span className={HINT_TRIGGER}>{item.text}</span>
                    </HintTooltip>
                ) : (
                    <span key={item.key}>{item.text}</span>
                ),
            )}
            {overview.meta.fromCache && (
                <HintTooltip title={cache.hint.title} lines={[...cache.hint.lines]}>
                    <span>
                        <ToneBadge tone="muted" variant="soft" size="sm">
                            {cache.label}
                        </ToneBadge>
                    </span>
                </HintTooltip>
            )}
        </div>
    );
};
