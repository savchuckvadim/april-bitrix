'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { DEAL_MOVEMENT_TEXT } from '../../../consts/deal-movement.const';
import {
    dealMovementChangesLine,
    dealMovementCountsText,
    dealMovementSnapshotHeadline,
} from '../../../lib/deal-movement-results';
import type { DealMovementSnapshot } from '../../../model';
import { DealMovementChangesList } from './DealMovementChangesList';
import { DealMovementNotesView } from './DealMovementNotesView';
import { DealMovementWarnings } from './DealMovementWarnings';

interface DealMovementSnapshotViewProps {
    domain: string;
    snapshot: DealMovementSnapshot | null;
}

/**
 * Последний сохранённый счёт: день, открыто и оценено, счёт по статусам,
 * смены и впервые увиденные, записи в ленту, пометка «точка отсчёта»,
 * предупреждения и список смен статуса.
 */
export const DealMovementSnapshotView = ({
    domain,
    snapshot,
}: DealMovementSnapshotViewProps) => (
    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
        <p className="text-sm font-medium">{DEAL_MOVEMENT_TEXT.lastCountTitle}</p>
        {snapshot ? (
            <>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm">{dealMovementSnapshotHeadline(snapshot)}</p>
                    {snapshot.baseline && (
                        <ToneBadge
                            tone="info"
                            variant="soft"
                            size="sm"
                            title={DEAL_MOVEMENT_TEXT.baselineHint}
                        >
                            {DEAL_MOVEMENT_TEXT.baselineBadge}
                        </ToneBadge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    {dealMovementCountsText(snapshot.byStatus)}
                </p>
                <p className="text-sm text-muted-foreground">
                    {dealMovementChangesLine({
                        baseline: snapshot.baseline,
                        firstSeen: snapshot.firstSeen,
                        changed: snapshot.changesTotal,
                    })}
                </p>
                <DealMovementNotesView
                    notes={snapshot.notes}
                    mode={snapshot.mode}
                />
                {snapshot.baseline && (
                    <p className="text-xs text-muted-foreground">
                        {DEAL_MOVEMENT_TEXT.baselineHint}
                    </p>
                )}
                <DealMovementWarnings warnings={snapshot.warnings} />
                {!snapshot.baseline && (
                    <DealMovementChangesList domain={domain} snapshot={snapshot} />
                )}
            </>
        ) : (
            <p className="text-sm text-muted-foreground">
                {DEAL_MOVEMENT_TEXT.noSnapshot}
            </p>
        )}
    </div>
);
