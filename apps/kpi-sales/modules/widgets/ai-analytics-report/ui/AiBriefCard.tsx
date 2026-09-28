'use client';

import { Sparkles } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { AI_QUEUED_ERROR_MESSAGES } from '@/modules/entities/ai-analytics';
import { useAiBrief } from '../hooks/use-ai-brief';
import { aiBriefLoadingText } from '../lib/ai-brief.util';
import {
    AI_BRIEF_NO_SCOPE_TEXT,
    AI_BRIEF_TITLE,
} from '../lib/ai-brief-view.util';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiQueuedState } from './components/AiQueuedState';
import { AiBriefHeadline } from './components/AiBriefHeadline';
import { AiBriefBullets } from './components/AiBriefBullets';
import { AiBriefMeta } from './components/AiBriefMeta';

/**
 * «Итоги периода: что изменилось и что сделать» — в периметре обзора
 * (период фильтра ≤ 3 мес., выбранные менеджеры): главный вывод одной
 * фразой с тоном, затем три группы пунктов — что изменилось к прошлому
 * периоду, на кого смотреть, что сделать на неделе; под ними — когда
 * собрано и причина шаблона. Очередь + WS: пока считается — скелетон с
 * состоянием расчёта; «Пересобрать» (руководителю) — собрать заново.
 */
export const AiBriefCard = () => {
    const brief = useAiBrief();
    const loading = brief.status === 'loading';

    return (
        <SectionCard
            surface="glass"
            title={AI_BRIEF_TITLE}
            description={brief.description}
            actions={
                <>
                    <AiTheoryLink topic="brief" variant="icon" />
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
                    {AI_BRIEF_NO_SCOPE_TEXT}
                </p>
            ) : (
                <>
                    <AiQueuedState
                        status={brief.status}
                        jobStatus={brief.jobStatus}
                        error={brief.error}
                        loadingText={aiBriefLoadingText(brief.jobStatus)}
                        skeletonRows={3}
                        errorFallback={AI_QUEUED_ERROR_MESSAGES.brief}
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
