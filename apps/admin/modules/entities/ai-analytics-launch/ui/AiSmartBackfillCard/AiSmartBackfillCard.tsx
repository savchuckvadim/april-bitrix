'use client';

import { useEffect, useState } from 'react';
import { AButton, LiquidProgress } from '@workspace/april-ui';
import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ConfirmDialog } from '@/modules/shared';
import { LAUNCH_TEXT } from '../../consts/ai-analytics-launch.const';
import {
    SMART_BACKFILL_PERIOD_DAYS,
    SMART_BACKFILL_TEXT,
} from '../../consts/smart-backfill.const';
import { launchHelper, useLaunchAction, useSmartBackfillStatus } from '../../lib/hooks';
import { describeLaunchError } from '../../lib/launch-error';
import {
    isSmartBackfillRunning,
    smartBackfillOutcome,
    smartBackfillPeriod,
    smartBackfillRunText,
    smartBackfillShare,
} from '../../lib/smart-backfill-results';
import type { LaunchOutcome, SmartBackfillRunStatus } from '../../model';
import { LaunchOutcomeView } from '../AiLaunchPanel/components/LaunchOutcomeView';

interface AiSmartBackfillCardProps {
    domain: string | undefined;
}

type Action = 'count' | 'run';

/**
 * Карточка «Поля карточек разборов»: сколько карточек ждут записи полей,
 * последний прогон с прогрессом и две кнопки — подсчёт и запись за
 * последние 30 дней. Ночью то же делает крон для карточек с неудавшейся
 * записью; карточка это объясняет, чтобы владелец не нажимал лишний раз.
 */
export const AiSmartBackfillCard = ({ domain }: AiSmartBackfillCardProps) => {
    const now = new Date();
    const period = smartBackfillPeriod(now);
    const [awaiting, setAwaiting] = useState<Action | null>(null);
    const [outcome, setOutcome] = useState<LaunchOutcome | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirm, setConfirm] = useState<Action | null>(null);
    const action = useLaunchAction(domain);

    useEffect(() => {
        setAwaiting(null);
        setOutcome(null);
        setError(null);
    }, [domain]);

    const status = useSmartBackfillStatus(domain, period, true);
    const run: SmartBackfillRunStatus | null =
        status.data?.run ?? status.data?.latest ?? null;
    const running = isSmartBackfillRunning(run, now);
    const polling = running || awaiting !== null;
    const polled = useSmartBackfillStatus(domain, period, polling);
    const shown = polled.data ?? status.data;
    const shownRun = shown?.run ?? shown?.latest ?? null;

    useEffect(() => {
        if (awaiting !== null && shownRun?.finished) setAwaiting(null);
    }, [awaiting, shownRun?.finished, shownRun?.updatedAt]);

    const busy = action.isPending;
    const available = shown?.runAvailable !== false;
    const canPress = !!domain && !busy && available && !running;

    const start = (kind: Action) => {
        if (!domain) return;
        setError(null);
        setOutcome(null);
        action.mutate(
            async () =>
                smartBackfillOutcome(
                    await launchHelper.smartBackfill(domain, period, kind === 'count'),
                ),
            {
                onSuccess: result => {
                    setOutcome(result);
                    if (result.ok) setAwaiting(kind);
                },
                onError: cause => setError(describeLaunchError(cause)),
            },
        );
    };

    return (
        <SectionCard
            title={SMART_BACKFILL_TEXT.title}
            description={SMART_BACKFILL_TEXT.description}
            actions={
                shown ? (
                    <ToneBadge
                        tone={shown.pending > 0 ? 'warning' : 'success'}
                        variant="soft"
                    >
                        {SMART_BACKFILL_TEXT.pendingLabel}: {shown.pending}
                    </ToneBadge>
                ) : undefined
            }
        >
            <div className="space-y-4">
                {!domain && (
                    <p className="text-sm text-muted-foreground">
                        {LAUNCH_TEXT.noDomain}
                    </p>
                )}
                {status.isError && (
                    <LaunchOutcomeView
                        error={`${LAUNCH_TEXT.statusError}: ${describeLaunchError(status.error)}`}
                    />
                )}
                {shown && (
                    <p className="text-sm">
                        {shown.pending > 0
                            ? SMART_BACKFILL_TEXT.pendingSome(
                                  shown.pending,
                                  shown.pendingLookbackDays,
                              )
                            : SMART_BACKFILL_TEXT.pendingNone}{' '}
                        <span className="text-muted-foreground">
                            {SMART_BACKFILL_TEXT.nightly}
                        </span>
                    </p>
                )}
                {shown && (
                    <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                        <p className="text-sm font-medium">
                            {SMART_BACKFILL_TEXT.lastRunTitle}
                        </p>
                        {shownRun ? (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    {smartBackfillRunText(shownRun)}
                                </p>
                                {!shownRun.dryRun && (
                                    <LiquidProgress
                                        value={smartBackfillShare(shownRun)}
                                        tone={shownRun.failed > 0 ? 'warning' : 'success'}
                                    />
                                )}
                                {!shownRun.finished && !shownRun.dryRun && (
                                    <p className="text-xs text-muted-foreground">
                                        {SMART_BACKFILL_TEXT.progressHint}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {SMART_BACKFILL_TEXT.noRuns}
                            </p>
                        )}
                    </div>
                )}
                {domain && (
                    <div className="grid gap-3 md:grid-cols-2">
                        {(['count', 'run'] as const).map(kind => {
                            const text = SMART_BACKFILL_TEXT[kind];
                            return (
                                <div
                                    key={kind}
                                    className="flex flex-col gap-2 rounded-lg border bg-card p-4"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        {text.what}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {SMART_BACKFILL_TEXT.periodLabel}: {period.from} —{' '}
                                        {period.to} ({SMART_BACKFILL_PERIOD_DAYS} дн.)
                                    </p>
                                    <AButton
                                        title={
                                            busy && confirm === kind
                                                ? LAUNCH_TEXT.running
                                                : text.button
                                        }
                                        size="big"
                                        isActive={canPress}
                                        clickHendler={
                                            canPress ? () => setConfirm(kind) : undefined
                                        }
                                    />
                                    {!available && (
                                        <p className="text-xs text-muted-foreground">
                                            {SMART_BACKFILL_TEXT.notAvailable}
                                        </p>
                                    )}
                                    {running && (
                                        <p className="text-xs text-muted-foreground">
                                            {SMART_BACKFILL_TEXT.runInProgress}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                <LaunchOutcomeView outcome={outcome} error={error} />
            </div>
            <ConfirmDialog
                open={confirm !== null}
                onOpenChange={open => {
                    if (!open) setConfirm(null);
                }}
                title={confirm ? SMART_BACKFILL_TEXT[confirm].button : ''}
                description={confirm ? SMART_BACKFILL_TEXT[confirm].confirm : ''}
                onConfirm={() => {
                    if (confirm) start(confirm);
                    setConfirm(null);
                }}
                confirmLabel={LAUNCH_TEXT.confirm}
                cancelLabel={LAUNCH_TEXT.cancel}
                isLoading={busy}
            />
        </SectionCard>
    );
};
