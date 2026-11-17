'use client';

import { useEffect, useState } from 'react';
import { AButton } from '@workspace/april-ui';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ConfirmDialog } from '@/modules/shared';
import { LAUNCH_TEXT } from '../../consts/ai-analytics-launch.const';
import { DEAL_MOVEMENT_TEXT } from '../../consts/deal-movement.const';
import {
    dealMovementOutcome,
    isAwaitedDealMovementDone,
    isDealMovementRunning,
} from '../../lib/deal-movement-results';
import {
    dealMovementHelper,
    useDealMovementStatus,
    useLaunchAction,
} from '../../lib/hooks';
import { describeLaunchError } from '../../lib/launch-error';
import type { LaunchOutcome } from '../../model';
import { LaunchOutcomeView } from '../AiLaunchPanel/components/LaunchOutcomeView';
import { DealMovementEnabledNote } from './components/DealMovementEnabledNote';
import { DealMovementRunView } from './components/DealMovementRunView';
import { DealMovementSnapshotView } from './components/DealMovementSnapshotView';

interface AiDealMovementCardProps {
    domain: string | undefined;
    /** id портала — ссылка на категорию «Движение сделок» в его настройках. */
    portalId: number;
}

type Action = 'count' | 'run';

/** Ждём прогон, начатый отсюда: какой и `updatedAt` прошлого прогона. */
interface Awaiting {
    kind: Action;
    updatedAtBefore: string | null;
}

/**
 * Карточка «Движение сделок»: включён ли ночной счёт, последний
 * сохранённый счёт со сменами статуса, ход последнего прогона и две
 * кнопки — подсчёт без сохранения и внеочередной счёт. Кнопки в ленты
 * сделок не пишут: записи (если включены) делает только ночной счёт.
 * Состояние опрашивается раз в 30 секунд, пока идёт прогон или
 * ждём начатый отсюда.
 */
export const AiDealMovementCard = ({
    domain,
    portalId,
}: AiDealMovementCardProps) => {
    const now = new Date();
    const [awaiting, setAwaiting] = useState<Awaiting | null>(null);
    const [outcome, setOutcome] = useState<LaunchOutcome | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirm, setConfirm] = useState<Action | null>(null);
    const action = useLaunchAction(domain);

    useEffect(() => {
        setAwaiting(null);
        setOutcome(null);
        setError(null);
    }, [domain]);

    const initial = useDealMovementStatus(domain, false);
    const running = isDealMovementRunning(initial.data?.run, now);
    const polled = useDealMovementStatus(domain, running || awaiting !== null);
    const shown = polled.data ?? initial.data;
    const run = shown?.run ?? null;

    useEffect(() => {
        if (
            awaiting !== null &&
            isAwaitedDealMovementDone(run, awaiting.updatedAtBefore)
        ) {
            setAwaiting(null);
        }
    }, [awaiting, run]);

    const busy = action.isPending;
    const available = shown?.runAvailable !== false;
    const shownRunning = isDealMovementRunning(run, now);
    const canPress = !!domain && !busy && available && !shownRunning;

    const start = (kind: Action) => {
        if (!domain) return;
        setError(null);
        setOutcome(null);
        const updatedAtBefore = run?.updatedAt ?? null;
        action.mutate(
            async () =>
                dealMovementOutcome(
                    await dealMovementHelper.run(domain, kind === 'count'),
                ),
            {
                onSuccess: result => {
                    setOutcome(result);
                    if (result.ok) setAwaiting({ kind, updatedAtBefore });
                },
                onError: cause => setError(describeLaunchError(cause)),
            },
        );
    };

    return (
        <SectionCard
            title={DEAL_MOVEMENT_TEXT.title}
            description={DEAL_MOVEMENT_TEXT.description}
        >
            <div className="space-y-4">
                {!domain && (
                    <p className="text-sm text-muted-foreground">
                        {LAUNCH_TEXT.noDomain}
                    </p>
                )}
                {initial.isError && (
                    <LaunchOutcomeView
                        error={`${LAUNCH_TEXT.statusError}: ${describeLaunchError(initial.error)}`}
                    />
                )}
                {domain && shown && (
                    <>
                        <DealMovementEnabledNote
                            enabled={shown.enabled}
                            portalId={portalId}
                        />
                        <DealMovementSnapshotView
                            domain={domain}
                            snapshot={shown.lastSnapshot}
                        />
                        <DealMovementRunView run={run} now={now} />
                    </>
                )}
                {domain && (
                    <div className="grid gap-3 md:grid-cols-2">
                        {(['count', 'run'] as const).map(kind => {
                            const text = DEAL_MOVEMENT_TEXT[kind];
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
                                            canPress
                                                ? () => setConfirm(kind)
                                                : undefined
                                        }
                                    />
                                    {!available && (
                                        <p className="text-xs text-muted-foreground">
                                            {DEAL_MOVEMENT_TEXT.notAvailable}
                                        </p>
                                    )}
                                    {shownRunning && (
                                        <p className="text-xs text-muted-foreground">
                                            {DEAL_MOVEMENT_TEXT.runInProgress}
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
                title={confirm ? DEAL_MOVEMENT_TEXT[confirm].button : ''}
                description={confirm ? DEAL_MOVEMENT_TEXT[confirm].confirm : ''}
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
