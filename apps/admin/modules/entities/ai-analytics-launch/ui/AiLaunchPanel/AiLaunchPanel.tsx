'use client';

import { useState } from 'react';
import { AButton } from '@workspace/april-ui';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ConfirmDialog } from '@/modules/shared';
import { LAUNCH_TEXT } from '../../consts/ai-analytics-launch.const';
import { describeLaunchError } from '../../lib/launch-error';
import type { LaunchStepView } from '../../lib/launch-steps';
import { LaunchOutcomeView } from './components/LaunchOutcomeView';
import { LaunchProgressBar } from './components/LaunchProgressBar';
import { LaunchStepCard } from './components/LaunchStepCard';
import { LaunchSummary } from './components/LaunchSummary';
import { useLaunchPanel } from './hooks/use-launch-panel';

interface AiLaunchPanelProps {
    /** Домен портала: из карточки портала или из выбора в путеводителе. */
    domain: string | undefined;
}

/**
 * Панель «Запуск AI после выкладки»: девять больших кнопок по порядку —
 * смарт, кэш, история, прогноз (восстановить, проверить, показать),
 * переразбор (посчитать, запустить), пересборка витрины. Состояния — из
 * `GET admin/ai-analytics/launch-status`, итоги — человеческим текстом.
 */
export const AiLaunchPanel = ({ domain }: AiLaunchPanelProps) => {
    const panel = useLaunchPanel(domain);
    const [forceOpen, setForceOpen] = useState(false);
    const { status } = panel;

    const extraOf = (step: LaunchStepView) => {
        if (step.code === 'reanalyze-count') {
            return (
                <p className="text-xs text-muted-foreground">
                    {LAUNCH_TEXT.periodLabel}: {panel.countPeriod.from} —{' '}
                    {panel.countPeriod.to}, {LAUNCH_TEXT.pilotDefault}.
                </p>
            );
        }
        if (step.code === 'reanalyze-run' && panel.progressRun) {
            return <LaunchProgressBar run={panel.progressRun} />;
        }
        if (
            step.code === 'forecast-show' &&
            !step.enabled &&
            step.state !== 'done' &&
            status.data
        ) {
            return (
                <button
                    type="button"
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-destructive"
                    disabled={panel.busy}
                    onClick={() => setForceOpen(true)}
                >
                    {LAUNCH_TEXT.forceLink}
                </button>
            );
        }
        return null;
    };

    return (
        <SectionCard
            title={LAUNCH_TEXT.panelTitle}
            description={LAUNCH_TEXT.panelDescription}
            accent
            actions={
                domain ? (
                    <AButton
                        title={
                            status.isFetching
                                ? LAUNCH_TEXT.refreshing
                                : LAUNCH_TEXT.refresh
                        }
                        size="small"
                        isActive={!status.isFetching}
                        clickHendler={() => void panel.refresh()}
                    />
                ) : undefined
            }
        >
            <div className="space-y-4">
                {!domain && (
                    <p className="text-sm text-muted-foreground">
                        {LAUNCH_TEXT.noDomain}
                    </p>
                )}
                {domain && status.isLoading && (
                    <p className="text-sm text-muted-foreground">
                        {LAUNCH_TEXT.statusLoading}
                    </p>
                )}
                {status.isError && (
                    <LaunchOutcomeView
                        error={`${LAUNCH_TEXT.statusError}: ${describeLaunchError(status.error)}`}
                    />
                )}
                {status.data && <LaunchSummary status={status.data} />}
                {domain && (
                    <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {panel.steps.map(step => (
                            <LaunchStepCard
                                key={step.code}
                                step={step}
                                pending={panel.activeCode === step.code}
                                busy={panel.busy}
                                outcome={panel.results[step.code]?.outcome}
                                error={panel.results[step.code]?.error}
                                onRun={() => panel.runStep(step.code)}
                            >
                                {extraOf(step)}
                            </LaunchStepCard>
                        ))}
                    </ol>
                )}
            </div>
            <ConfirmDialog
                open={forceOpen}
                onOpenChange={setForceOpen}
                title={LAUNCH_TEXT.forceConfirmTitle}
                description={LAUNCH_TEXT.forceConfirm}
                onConfirm={() => panel.runStep('forecast-show', true)}
                confirmLabel={LAUNCH_TEXT.forceConfirmLabel}
                cancelLabel={LAUNCH_TEXT.cancel}
                variant="destructive"
            />
        </SectionCard>
    );
};
