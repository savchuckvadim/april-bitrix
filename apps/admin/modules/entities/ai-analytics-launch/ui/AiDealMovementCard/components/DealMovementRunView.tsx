'use client';

import { DEAL_MOVEMENT_TEXT } from '../../../consts/deal-movement.const';
import {
    dealMovementChangesLine,
    dealMovementCountsText,
    dealMovementPhaseText,
    dealMovementRunHeadline,
    dealMovementRunTotalsText,
    isDealMovementRunning,
} from '../../../lib/deal-movement-results';
import type { DealMovementRunStatus } from '../../../model';
import { DealMovementNotesView } from './DealMovementNotesView';
import { DealMovementWarnings } from './DealMovementWarnings';

interface DealMovementRunViewProps {
    run: DealMovementRunStatus | null;
    now: Date;
}

/**
 * Последний прогон: режим, кто и когда поставил, фаза словами (идёт,
 * закончен, не удался с текстом ошибки); у законченного — счёт. Итог
 * «Посчитать» виден только здесь — он не сохраняется.
 */
export const DealMovementRunView = ({ run, now }: DealMovementRunViewProps) => {
    const running = isDealMovementRunning(run, now);
    return (
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
            <p className="text-sm font-medium">{DEAL_MOVEMENT_TEXT.runTitle}</p>
            {run ? (
                <>
                    <p className="text-sm">{dealMovementRunHeadline(run)}</p>
                    <p
                        className={
                            run.phase === 'failed'
                                ? 'text-sm text-destructive'
                                : 'text-sm text-muted-foreground'
                        }
                    >
                        {dealMovementPhaseText(run, now)}
                    </p>
                    {run.finished && run.phase !== 'failed' && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                {dealMovementRunTotalsText(run)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {dealMovementCountsText(run.byStatus)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {dealMovementChangesLine(run)}
                            </p>
                            <DealMovementNotesView
                                notes={run.notes}
                                mode={run.mode}
                            />
                        </>
                    )}
                    <DealMovementWarnings warnings={run.warnings} />
                    {running && (
                        <p className="text-xs text-muted-foreground">
                            {DEAL_MOVEMENT_TEXT.progressHint}
                        </p>
                    )}
                </>
            ) : (
                <p className="text-sm text-muted-foreground">
                    {DEAL_MOVEMENT_TEXT.noRun}
                </p>
            )}
        </div>
    );
};
