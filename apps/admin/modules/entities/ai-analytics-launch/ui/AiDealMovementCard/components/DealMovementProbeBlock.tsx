'use client';

import { useEffect, useState } from 'react';
import { AButton } from '@workspace/april-ui';
import { Input } from '@workspace/ui/components/input';
import { ConfirmDialog } from '@/modules/shared';
import { LAUNCH_TEXT } from '../../../consts/ai-analytics-launch.const';
import {
    DEAL_MOVEMENT_PROBE_TEXT,
    dealMovementDealHref,
} from '../../../consts/deal-movement.const';
import {
    parseProbeDealId,
    probeResultHeadline,
    probeResultLines,
    probeRunOutcome,
} from '../../../lib/deal-movement-probe-view';
import {
    dealMovementHelper,
    useDealMovementProbeStatus,
    useLaunchAction,
} from '../../../lib/hooks';
import { describeLaunchError } from '../../../lib/launch-error';
import type { LaunchOutcome } from '../../../model';
import { LaunchOutcomeView } from '../../AiLaunchPanel/components/LaunchOutcomeView';

interface DealMovementProbeBlockProps {
    domain: string;
}

/**
 * Проверка записи в ленту на одной сделке: номер сделки, кнопка с
 * подтверждением (пишет в живой портал) и итог последней проверки. Пока
 * проверка идёт или ждём начатую отсюда — опрос раз в 30 секунд.
 */
export const DealMovementProbeBlock = ({
    domain,
}: DealMovementProbeBlockProps) => {
    const text = DEAL_MOVEMENT_PROBE_TEXT;
    const [input, setInput] = useState('');
    const [awaiting, setAwaiting] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [outcome, setOutcome] = useState<LaunchOutcome | null>(null);
    const [error, setError] = useState<string | null>(null);
    const action = useLaunchAction(domain);
    const status = useDealMovementProbeStatus(domain, awaiting);
    const pending = status.data?.pending === true;
    const result = status.data?.result ?? null;
    const dealId = parseProbeDealId(input);

    useEffect(() => {
        if (awaiting && status.data && !status.data.pending && result) {
            setAwaiting(false);
        }
    }, [awaiting, status.data, result]);

    const canPress = dealId !== null && !action.isPending && !pending;

    const start = () => {
        if (dealId === null) return;
        setError(null);
        setOutcome(null);
        action.mutate(
            async () =>
                probeRunOutcome(await dealMovementHelper.probe(domain, dealId)),
            {
                onSuccess: next => {
                    setOutcome(next);
                    if (next.ok) setAwaiting(true);
                },
                onError: cause => setError(describeLaunchError(cause)),
            },
        );
    };

    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
            <p className="text-sm font-medium">{text.title}</p>
            <p className="text-sm text-muted-foreground">{text.what}</p>
            <div className="flex flex-wrap items-end gap-2">
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {text.dealLabel}
                    <Input
                        className="w-40"
                        inputMode="numeric"
                        value={input}
                        placeholder={text.dealPlaceholder}
                        onChange={event => setInput(event.target.value)}
                    />
                </label>
                <AButton
                    title={action.isPending ? LAUNCH_TEXT.running : text.button}
                    size="big"
                    isActive={canPress}
                    clickHendler={canPress ? () => setConfirm(true) : undefined}
                />
            </div>
            {input.trim() !== '' && dealId === null && (
                <p className="text-xs text-destructive">{text.badDeal}</p>
            )}
            {pending && (
                <p className="text-xs text-muted-foreground">{text.pending}</p>
            )}
            <LaunchOutcomeView outcome={outcome} error={error} />
            {result && (
                <div className="space-y-2 text-sm">
                    <p className="font-medium">
                        {probeResultHeadline(result)} ·{' '}
                        <a
                            className="text-primary hover:underline"
                            href={dealMovementDealHref(
                                result.domain,
                                String(result.dealId),
                            )}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {text.deal} →
                        </a>
                    </p>
                    <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[18rem_minmax(0,1fr)]">
                        {probeResultLines(result).map(line => (
                            <div key={line.label} className="contents">
                                <dt className="text-muted-foreground">
                                    {line.label}
                                </dt>
                                <dd>{line.value}</dd>
                            </div>
                        ))}
                    </dl>
                    {result.conclusions.length > 0 && (
                        <ul className="list-disc space-y-1 pl-5">
                            {result.conclusions.map(item => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    )}
                    {result.error && (
                        <p className="text-destructive">{result.error}</p>
                    )}
                </div>
            )}
            <ConfirmDialog
                open={confirm}
                onOpenChange={open => setConfirm(open)}
                title={text.button}
                description={text.confirm}
                onConfirm={() => {
                    start();
                    setConfirm(false);
                }}
                confirmLabel={LAUNCH_TEXT.confirm}
                cancelLabel={LAUNCH_TEXT.cancel}
                isLoading={action.isPending}
            />
        </div>
    );
};
