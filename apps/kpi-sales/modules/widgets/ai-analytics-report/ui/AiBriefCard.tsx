'use client';

import { Sparkles } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { formatAiDay } from '@/modules/entities/ai-analytics';
import { useAiBrief } from '../hooks/use-ai-brief';
import { aiBriefLoadingText } from '../lib/ai-brief.util';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiQueuedState } from './components/AiQueuedState';
import { AiBriefHeadline } from './components/AiBriefHeadline';
import { AiBriefBullets } from './components/AiBriefBullets';
import { AiBriefMeta } from './components/AiBriefMeta';

/**
 * «AI-резюме периода» — короткая сводка по пакету фактов витрины в
 * периметре обзора (период фильтра ≤ 3 мес., выбранные менеджеры):
 * заголовок и тон, буллеты с менеджером и типом звонка, шаблон с
 * причиной, момент сборки и расход. Очередь + WS: пока считается —
 * скелетон с состоянием джобы; «Пересобрать» (руководителю) — заново,
 * минуя кэш.
 */
export const AiBriefCard = () => {
    const brief = useAiBrief();
    const loading = brief.status === 'loading';

    return (
        <SectionCard
            surface="glass"
            title="AI-резюме периода"
            description={
                brief.from && brief.to
                    ? `${formatAiDay(brief.from)} – ${formatAiDay(brief.to)} · периметр обзора`
                    : 'Короткая сводка периода по фактам витрины'
            }
            actions={
                <>
                    <AiHowWeCountButton endpoint="brief" />
                    {brief.isLeader && brief.hasScope && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            disabled={loading}
                            onClick={brief.rebuild}
                        >
                            <Sparkles
                                className={cn(
                                    'h-3 w-3',
                                    loading && 'animate-pulse',
                                )}
                            />
                            Пересобрать
                        </Button>
                    )}
                </>
            }
        >
            {!brief.hasScope ? (
                <p className="py-2 text-xs text-muted-foreground">
                    Период отчёта не задан — резюме собрать не из чего.
                </p>
            ) : (
                <>
                    <AiQueuedState
                        status={brief.status}
                        jobStatus={brief.jobStatus}
                        error={brief.error}
                        loadingText={aiBriefLoadingText(brief.jobStatus)}
                        skeletonRows={3}
                        onRetry={brief.retry}
                    />
                    {brief.status === 'ready' && brief.data && (
                        <div className="space-y-4">
                            <AiBriefHeadline brief={brief.data} />
                            <AiBriefBullets bullets={brief.data.bullets} />
                            <AiBriefMeta brief={brief.data} />
                        </div>
                    )}
                </>
            )}
        </SectionCard>
    );
};
