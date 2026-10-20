'use client';

import { HintTooltip, SectionCard, ToneBadge } from '@workspace/april-ui';
import { AI_ATTENTION_TEXT, sortAiAttention } from '@/modules/entities/ai-analytics';
import { useAiSection } from '../hooks/use-ai-section';
import { useAiTypesDrawer } from '../hooks/use-ai-types-drawer';
import { AiQueuedState } from './components/AiQueuedState';
import { AiAttentionCard } from './components/AiAttentionCard';
import { AiTheoryLink } from './components/AiTheoryLink';

const T = AI_ATTENTION_TEXT;

/**
 * «Внимание» — кого разбирать на неделе: ≤ 7 карточек, ≤ 3 на менеджера
 * в порядке: слабые презентации, слабая доработка, звонки с низкой
 * оценкой, нет данных, отставание от плана, реже шаг с датой, разрыв
 * плана, риск — последним. Считается над кэшем обзора: пока обзора нет —
 * ждём его вместе с ним.
 */
export const AiAttentionList = () => {
    const attention = useAiSection('attention');
    const { openWithType } = useAiTypesDrawer();
    const items = attention.data ? sortAiAttention(attention.data.items) : [];

    return (
        <SectionCard
            surface="glass"
            title={T.title}
            description={T.description}
            actions={
                <>
                    <AiTheoryLink topic="attention" variant="icon" />
                    {attention.data && (
                        <HintTooltip
                            title={T.considered.hint.title}
                            lines={[...T.considered.hint.lines]}
                        >
                            <span>
                                <ToneBadge tone="muted" variant="soft" size="sm">
                                    {T.considered.label(
                                        attention.data.managersConsidered,
                                    )}
                                </ToneBadge>
                            </span>
                        </HintTooltip>
                    )}
                </>
            }
        >
            <AiQueuedState
                status={attention.status}
                jobStatus={attention.jobStatus}
                error={attention.error}
                loadingText="Собираем сигналы…"
                skeletonRows={3}
                onRetry={attention.retry}
            />
            {attention.status === 'ready' &&
                (items.length ? (
                    <ol className="grid gap-2 md:grid-cols-2">
                        {items.map(item => (
                            <AiAttentionCard
                                key={`${item.managerId}-${item.signal}`}
                                item={item}
                                onOpenType={openWithType}
                            />
                        ))}
                    </ol>
                ) : (
                    <p className="py-2 text-xs text-muted-foreground">
                        {T.empty}
                    </p>
                ))}
        </SectionCard>
    );
};
