'use client';

import { SectionCard } from '@workspace/april-ui';
import {
    AI_FEEDBACK_OBJECT,
    countUnhandledAlerts,
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

/**
 * «Пульс» — дисциплина «следующий шаг с датой» за окно 5 рабочих дней:
 * цифра с объёмом и интервалом, стабильность по дням, окно, доля коротких
 * звонков, строки менеджеров и сигналы руководителю (фильтр
 * «Не отработано / Все», свёрнутый список, ссылка на разбор, «что
 * сделать», «Отработано»). В шапке — ссылка на теорию.
 */
export const AiPulseCard = ({ canViewAll }: AiPulseCardProps) => {
    const pulse = useAiSection('pulse');

    return (
        <SectionCard
            surface="glass"
            title="Пульс"
            description="Доля разобранных звонков, где назначен следующий шаг с датой"
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
                    <AiPulseHeadline pulse={pulse.data} />
                    {canViewAll && (
                        <section>
                            <h4 className="mb-2 text-sm font-medium">
                                По менеджерам
                            </h4>
                            <AiPulseManagersTable rows={pulse.data.byManager} />
                        </section>
                    )}
                    <section>
                        <h4 className="mb-2 text-sm font-medium">
                            Сигналы
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                {countUnhandledAlerts(pulse.data.alerts)} не
                                отработано
                            </span>
                        </h4>
                        <AiPulseAlertsList alerts={pulse.data.alerts} />
                    </section>
                </div>
            )}
        </SectionCard>
    );
};
