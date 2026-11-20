'use client';

import { HintTooltip, SectionCard, ToneBadge } from '@workspace/april-ui';
import type { AiDealMovementHonestyBlock } from '@/modules/entities/ai-analytics';
import type { AiDmNameOf } from '../../hooks/use-ai-dm-name';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import { aiDmFewCallsNote } from '../../lib/deal-movement/ai-deal-movement-format.util';
import {
    aiDmHonestyHeadline,
    aiDmHonestyRest,
} from '../../lib/deal-movement/ai-deal-movement-honesty.util';
import { AiDmHonestyTable } from './AiDmHonestyTable';
import { AiDmSkeleton } from './AiDmSkeleton';

const T = AI_DEAL_MOVEMENT_TEXT.honesty;

interface AiDmHonestySectionProps {
    /** null — обзор ещё грузится. */
    block: AiDealMovementHonestyBlock | null;
    nameOf: AiDmNameOf;
}

/**
 * «Честность оценок AI»: доля звонков с продвижением 4–5, после которых
 * стадия не сдвинулась за N дней, — по отделу фразой и по менеджерам
 * таблицей; что ещё ждёт срока и что не проверено — отдельно.
 */
export const AiDmHonestySection = ({ block, nameOf }: AiDmHonestySectionProps) => {
    const department = block?.department ?? null;
    const rest = department ? aiDmHonestyRest(department) : null;
    const fewNote = department ? aiDmFewCallsNote(department, T.fewCalls) : null;

    return (
        <SectionCard surface="glass" title={T.title} description={T.description}>
            {!block || !department ? (
                <AiDmSkeleton rows={3} />
            ) : department.highProgress === 0 ? (
                <p className="py-2 text-xs text-muted-foreground">{T.noHigh}</p>
            ) : (
                <div className="space-y-3">
                    <div className="space-y-1 rounded-lg border bg-card/60 p-3">
                        <p className="text-sm font-medium">
                            {aiDmHonestyHeadline(department, block.checkDays, block.progressMin)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {rest && (
                                <HintTooltip lines={[T.pendingHint, T.uncheckedHint]}>
                                    <span className="cursor-help border-b border-dashed border-muted-foreground">
                                        {rest}
                                    </span>
                                </HintTooltip>
                            )}
                            {fewNote && (
                                <ToneBadge tone="warning" variant="soft" size="sm">
                                    {fewNote}
                                </ToneBadge>
                            )}
                        </div>
                    </div>
                    {block.managers.length > 0 && (
                        <AiDmHonestyTable block={block} nameOf={nameOf} />
                    )}
                </div>
            )}
        </SectionCard>
    );
};
