'use client';

import { SectionCard, ToneBadge } from '@workspace/april-ui';
import { sortAiAttention } from '@/modules/entities/ai-analytics';
import { useAiSection } from '../hooks/use-ai-section';
import { useAiTypesDrawer } from '../hooks/use-ai-types-drawer';
import { AiQueuedState } from './components/AiQueuedState';
import { AiAttentionCard } from './components/AiAttentionCard';

/**
 * «Внимание» — кого разбирать на неделе: ≤ 7 карточек, ≤ 3 на менеджера
 * (риск, нет данных, дисциплина, падение «шага с датой», разрыв плана).
 * Считается над кэшем обзора: пока обзора нет — ждём его вместе с ним.
 */
export const AiAttentionList = () => {
    const attention = useAiSection('attention');
    const { openWithType } = useAiTypesDrawer();
    const items = attention.data ? sortAiAttention(attention.data.items) : [];

    return (
        <SectionCard
            surface="glass"
            title="Внимание"
            description="Кого разбирать на этой неделе: сигналы по менеджерам с основанием"
            actions={
                attention.data && (
                    <ToneBadge tone="muted" variant="soft" size="sm">
                        рассмотрено {attention.data.managersConsidered}
                    </ToneBadge>
                )
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
                        За период сигналов нет — правила «Внимания» ни у кого не
                        сработали.
                    </p>
                ))}
        </SectionCard>
    );
};
