'use client';

import { SectionCard } from '@workspace/april-ui';
import { AI_FEEDBACK_OBJECT } from '@/modules/entities/ai-analytics';
import { useAiSection } from '../hooks/use-ai-section';
import {
    AI_AGENDA_TEXT,
    aiAgendaDescription,
} from '../lib/ai-agenda-week.util';
import { AiSectionState } from './components/AiSectionState';
import { AiFeedbackButtons } from './components/AiFeedbackButtons';
import { AiAgendaItemRow } from './components/AiAgendaItemRow';
import { AiAgendaDisagreements } from './components/AiAgendaDisagreements';

/**
 * «Повестка» планёрки: звонки ПРОШЛОЙ полной ISO-недели (пн–вс, TZ портала;
 * риск-флаг → спорное возражение → слабый раздел) с цитатами и ссылками,
 * плюс несогласия с разбором с понедельника прошлой недели по сейчас.
 * weekKey ответа — текущая неделя планёрки; в подписи — даты прошлой недели.
 */
export const AiAgendaCard = () => {
    const agenda = useAiSection('agenda');

    return (
        <SectionCard
            surface="glass"
            title="Повестка планёрки"
            description={aiAgendaDescription(agenda.data?.weekKey)}
            actions={
                agenda.status === 'ready' && (
                    <AiFeedbackButtons object={AI_FEEDBACK_OBJECT.AGENDA} />
                )
            }
        >
            <AiSectionState
                status={agenda.status}
                error={agenda.error}
                loadingText="Собираем повестку…"
                onRetry={agenda.retry}
            />
            {agenda.status === 'ready' && agenda.data && (
                <div className="space-y-5">
                    {agenda.data.items.length ? (
                        <ol className="space-y-2">
                            {agenda.data.items.map((item, index) => (
                                <AiAgendaItemRow
                                    key={item.transcriptionId}
                                    item={item}
                                    index={index}
                                />
                            ))}
                        </ol>
                    ) : (
                        <p className="py-2 text-xs text-muted-foreground">
                            {AI_AGENDA_TEXT.itemsEmpty}
                        </p>
                    )}
                    <AiAgendaDisagreements items={agenda.data.disagreements} />
                </div>
            )}
        </SectionCard>
    );
};
