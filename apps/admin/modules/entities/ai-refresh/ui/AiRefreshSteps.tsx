'use client';

import type { AiRefreshScenarioDto } from '@workspace/nest-admin-api';
import { ToneBadge } from '@workspace/april-ui/badges';
import { MicroSpinner } from '@workspace/april-ui/feedback';
import {
    AI_REFRESH_STEP_TONE,
    AI_REFRESH_TEXT as TEXT,
} from '../consts/ai-refresh.const';
import { shortDateTime, summaryOf } from '../lib/ai-refresh-view';

interface AiRefreshStepsProps {
    scenario: AiRefreshScenarioDto;
    /** Короткий вид для сводки по порталам: без текстов сделанных шагов. */
    compact?: boolean;
}

/** Шаги сценария по порядку: номер, название, состояние, что происходит. */
export const AiRefreshSteps = ({ scenario, compact = false }: AiRefreshStepsProps) => {
    const summary = summaryOf(scenario);
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                {!scenario.finished && <MicroSpinner />}
                <ToneBadge tone={summary.tone} variant="soft">
                    {summary.text}
                </ToneBadge>
                <span className="text-xs text-muted-foreground">
                    {TEXT.startedAt(
                        scenario.monthKey,
                        shortDateTime(scenario.startedAt),
                    )}
                </span>
            </div>
            <ol className="space-y-1.5">
                {scenario.steps.map((step, index) => {
                    const showText =
                        !!step.text &&
                        (!compact ||
                            step.state === 'running' ||
                            step.state === 'error');
                    return (
                        <li key={step.code} className="text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="w-4 text-right text-xs text-muted-foreground">
                                    {index + 1}
                                </span>
                                <ToneBadge
                                    tone={AI_REFRESH_STEP_TONE[step.state]}
                                    variant="soft"
                                >
                                    {TEXT.stepState[step.state]}
                                </ToneBadge>
                                <span>{step.title}</span>
                            </div>
                            {showText && (
                                <p className="ml-6 mt-0.5 text-xs text-muted-foreground">
                                    {step.text}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};
