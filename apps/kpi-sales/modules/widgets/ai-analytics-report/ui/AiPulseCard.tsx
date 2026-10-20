'use client';

import { HintTooltip, SectionCard } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app';
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
import { AiPulseHeadline } from './components/AiPulseHeadline';
import { AiPulseManagersTable } from './components/AiPulseManagersTable';
import { AiPulseAlertsList } from './components/AiPulseAlertsList';

interface AiPulseCardProps {
    /** Руководитель: показываем строки менеджеров периметра. */
    canViewAll: boolean;
}

const T = AI_PULSE_TEXT;

/**
 * «Пульс» — дисциплина «следующий шаг с датой» за окно 5 рабочих дней
 * (не зависит от периода отчёта): цифра с объёмом и интервалом,
 * стабильность по дням, окно, доля коротких звонков, строки менеджеров и
 * сигналы руководителю (фильтр «Не отработано / Все», свёрнутый список,
 * ссылка на разбор, «что сделать», «Отработано»). Пороги — из ответа.
 */
export const AiPulseCard = ({ canViewAll }: AiPulseCardProps) => {
    const pulse = useAiSection('pulse');
    const minDurationSec = useAppSelector(selectAiMinDurationSec);

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
                    <AiPulseHeadline
                        pulse={pulse.data}
                        minDurationSec={minDurationSec}
                    />
                    {canViewAll && (
                        <section>
                            <h4 className="mb-2 text-sm font-medium">
                                {T.managers.title}
                            </h4>
                            <AiPulseManagersTable
                                pulse={pulse.data}
                                minDurationSec={minDurationSec}
                            />
                        </section>
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
