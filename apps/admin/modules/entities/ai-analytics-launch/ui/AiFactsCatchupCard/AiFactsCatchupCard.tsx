'use client';

import { useEffect, useState } from 'react';
import { AButton, LiquidProgress } from '@workspace/april-ui';
import { MicroSelect } from '@workspace/april-ui/fields';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ConfirmDialog } from '@/modules/shared';
import { LAUNCH_TEXT } from '../../consts/ai-analytics-launch.const';
import { FACTS_CATCHUP_TEXT } from '../../consts/facts-catchup.const';
import {
    factsCatchupDefaultMonth,
    factsCatchupMonthOptions,
    factsCatchupOutcome,
    factsCatchupPeriod,
    factsCatchupRunText,
    factsCatchupShare,
    isFactsCatchupRunning,
} from '../../lib/facts-catchup-results';
import { launchHelper, useFactsCatchupStatus, useLaunchAction } from '../../lib/hooks';
import { describeLaunchError } from '../../lib/launch-error';
import type { FactsCatchupRunStatus, LaunchOutcome } from '../../model';
import { LaunchOutcomeView } from '../AiLaunchPanel/components/LaunchOutcomeView';

interface AiFactsCatchupCardProps {
    domain: string | undefined;
}

type Action = 'count' | 'run';

/**
 * Карточка «Признаки для отчётов в старых разборах»: выбор месяца,
 * последний прогон с прогрессом и две кнопки — подсчёт без модели и
 * догон признаков. Статус опрашивается раз в 30 секунд, пока идёт догон
 * или ждём начатый отсюда подсчёт.
 */
export const AiFactsCatchupCard = ({ domain }: AiFactsCatchupCardProps) => {
    const now = new Date();
    const [month, setMonth] = useState(() => factsCatchupDefaultMonth(now));
    const period = factsCatchupPeriod(month, now);
    const [awaiting, setAwaiting] = useState<Action | null>(null);
    const [outcome, setOutcome] = useState<LaunchOutcome | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirm, setConfirm] = useState<Action | null>(null);
    const action = useLaunchAction(domain);

    useEffect(() => {
        setAwaiting(null);
        setOutcome(null);
        setError(null);
    }, [domain, month]);

    const status = useFactsCatchupStatus(domain, period, true);
    const run: FactsCatchupRunStatus | null = status.data?.run ?? null;
    const running = isFactsCatchupRunning(run, now);
    const polling = running || awaiting !== null;
    const polled = useFactsCatchupStatus(domain, period, polling);
    const shown = polled.data ?? status.data;
    const shownRun = shown?.run ?? null;

    useEffect(() => {
        if (awaiting !== null && (shownRun?.finished || shownRun?.stopped)) {
            setAwaiting(null);
        }
    }, [awaiting, shownRun?.finished, shownRun?.stopped, shownRun?.updatedAt]);

    const busy = action.isPending;
    const available = shown?.runAvailable !== false;
    const canPress = !!domain && !busy && available && !running;

    const start = (kind: Action) => {
        if (!domain) return;
        setError(null);
        setOutcome(null);
        action.mutate(
            async () =>
                factsCatchupOutcome(
                    await launchHelper.factsCatchup(domain, period, kind === 'count'),
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
            title={FACTS_CATCHUP_TEXT.title}
            description={FACTS_CATCHUP_TEXT.description}
        >
            <div className="space-y-4">
                {!domain && (
                    <p className="text-sm text-muted-foreground">
                        {LAUNCH_TEXT.noDomain}
                    </p>
                )}
                {domain && (
                    <div className="space-y-1.5">
                        <MicroSelect
                            ariaLabel={FACTS_CATCHUP_TEXT.monthLabel}
                            value={month}
                            options={factsCatchupMonthOptions(now)}
                            onChange={setMonth}
                            disabled={busy || running}
                        />
                        <p className="text-xs text-muted-foreground">
                            {LAUNCH_TEXT.periodLabel}: {period.from} — {period.to}
                        </p>
                    </div>
                )}
                {status.isError && (
                    <LaunchOutcomeView
                        error={`${LAUNCH_TEXT.statusError}: ${describeLaunchError(status.error)}`}
                    />
                )}
                {shown && (
                    <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                        <p className="text-sm font-medium">
                            {FACTS_CATCHUP_TEXT.lastRunTitle}
                        </p>
                        {shownRun ? (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    {factsCatchupRunText(shownRun)}
                                </p>
                                {!shownRun.dryRun && (
                                    <LiquidProgress
                                        value={factsCatchupShare(shownRun)}
                                        tone={shownRun.failed > 0 ? 'warning' : 'success'}
                                    />
                                )}
                                {!shownRun.finished && !shownRun.dryRun && !shownRun.stopped && (
                                    <p className="text-xs text-muted-foreground">
                                        {FACTS_CATCHUP_TEXT.progressHint}
                                    </p>
                                )}
                                {shownRun.finished && !shownRun.dryRun && (
                                    <p className="text-xs text-muted-foreground">
                                        {FACTS_CATCHUP_TEXT.afterFinish}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {FACTS_CATCHUP_TEXT.noRuns}
                            </p>
                        )}
                    </div>
                )}
                {domain && (
                    <div className="grid gap-3 md:grid-cols-2">
                        {(['count', 'run'] as const).map(kind => {
                            const text = FACTS_CATCHUP_TEXT[kind];
                            return (
                                <div
                                    key={kind}
                                    className="flex flex-col gap-2 rounded-lg border bg-card p-4"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        {text.what}
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
                                            {FACTS_CATCHUP_TEXT.notAvailable}
                                        </p>
                                    )}
                                    {running && (
                                        <p className="text-xs text-muted-foreground">
                                            {FACTS_CATCHUP_TEXT.runInProgress}
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
                title={confirm ? FACTS_CATCHUP_TEXT[confirm].button : ''}
                description={confirm ? FACTS_CATCHUP_TEXT[confirm].confirm : ''}
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
