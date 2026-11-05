'use client';

import { HintTooltip, SectionCard } from '@workspace/april-ui';
import { selectIsRealSuperUser, useAppSelector } from '@/modules/app';
import {
    AI_FEEDBACK_OBJECT,
    AI_PULSE_TEXT,
    countUnhandledAlerts,
    selectAiMinDurationSec,
} from '@/modules/entities/ai-analytics';
import { useAiSection } from '../hooks/use-ai-section';
import { AiSectionState } from './components/AiSectionState';
import { AiFeedbackButtons } from './components/AiFeedbackButtons';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiPulseCoach } from './components/AiPulseCoach';
import { AiPulseHeadline } from './components/AiPulseHeadline';
import { AiPulseSummary } from './components/AiPulseSummary';
import { AiPulseAlertsList } from './components/AiPulseAlertsList';

interface AiPulseCardProps {
    /** Руководитель: показываем строки менеджеров периметра. */
    canViewAll: boolean;
}

const T = AI_PULSE_TEXT;

/**
 * «Пульс» — договорённости о следующем шаге с датой за окно 5 рабочих дней
 * (не зависит от периода отчёта). Для всех — итог словами и «неделей
 * раньше»; руководителю — «С кем поработать» (от слабого к сильному,
 * звонки без даты и образец) и сигналы («Отработано» — разобрали с
 * менеджером). Разброс и стабильность по дням — только суперпользователю
 * вендора (решение владельца 05.11.2026). Пороги — из ответа.
 */
export const AiPulseCard = ({ canViewAll }: AiPulseCardProps) => {
    const pulse = useAiSection('pulse');
    const minDurationSec = useAppSelector(selectAiMinDurationSec);
    // Разброс, «коридор» и стабильность — техника, только вендору.
    const technical = useAppSelector(selectIsRealSuperUser);

    return (
        <SectionCard
            surface="glass"
            title={T.title}
            description={T.description}
            actions={
                <>
                    <AiTheoryLink topic="pulse" variant="icon" />
                    {pulse.status === 'ready' && (
                        <AiFeedbackButtons object={AI_FEEDBACK_OBJECT.PULSE} />
                    )}
                </>
            }
        >
            <AiSectionState
                status={pulse.status}
                error={pulse.error}
                loadingText="Считаем пульс…"
                onRetry={pulse.retry}
            />
            {pulse.status === 'ready' && pulse.data && (
                <div className="space-y-5">
                    <AiPulseSummary
                        pulse={pulse.data}
                        minDurationSec={minDurationSec}
                    />
                    {technical && (
                        <details className="rounded-md border border-dashed border-border/60 p-3">
                            <summary className="cursor-pointer text-xs text-muted-foreground">
                                {T.summary.technical}
                            </summary>
                            <div className="mt-3">
                                <AiPulseHeadline
                                    pulse={pulse.data}
                                    minDurationSec={minDurationSec}
                                />
                            </div>
                        </details>
                    )}
                    {canViewAll && (
                        <AiPulseCoach
                            pulse={pulse.data}
                            minDurationSec={minDurationSec}
                        />
                    )}
                    <section>
                        <h4 className="mb-2 text-sm font-medium">
                            <HintTooltip
                                title={T.alerts.hint.title}
                                lines={[...T.alerts.hint.lines]}
                            >
                                <span className="cursor-help border-b border-dashed border-muted-foreground/60">
                                    {T.alerts.title}
                                </span>
                            </HintTooltip>
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                {T.alerts.unhandled(
                                    countUnhandledAlerts(pulse.data.alerts),
                                )}
                            </span>
                        </h4>
                        <AiPulseAlertsList alerts={pulse.data.alerts} />
                    </section>
                </div>
            )}
        </SectionCard>
    );
};
