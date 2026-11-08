'use client';

import { useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { describeLaunchError } from '@/modules/entities/ai-analytics-launch/lib/launch-error';
import { AI_REFRESH_TEXT as TEXT } from '../consts/ai-refresh.const';
import {
    useAiRefreshState,
    useStartAiRefresh,
} from '../lib/hooks/use-ai-refresh';
import { AiRefreshControls } from './AiRefreshControls';
import { AiRefreshSteps } from './AiRefreshSteps';

interface AiRefreshCardProps {
    domain: string | undefined;
}

/**
 * Карточка «Обновить всё по порядку» на странице AI портала (просьба
 * владельца 08.11.2026: вместо цепочки кнопок и очередей — одна кнопка и
 * один список шагов, который обновляется сам).
 */
export const AiRefreshCard = ({ domain }: AiRefreshCardProps) => {
    const state = useAiRefreshState(domain);
    const start = useStartAiRefresh(domain);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const scenario = state.data?.scenario ?? null;
    const running = !!scenario && !scenario.finished;

    return (
        <SectionCard title={TEXT.title} description={TEXT.description}>
            {!domain ? (
                <p className="text-sm text-muted-foreground">{TEXT.noDomain}</p>
            ) : (
                <div className="space-y-4">
                    <AiRefreshControls
                        title={TEXT.start}
                        disabled={running || start.isPending}
                        onStart={input => {
                            setError(null);
                            start.mutate(input, {
                                onSuccess: result => setMessage(result.message),
                                onError: cause =>
                                    setError(describeLaunchError(cause)),
                            });
                        }}
                    />
                    {message && <p className="text-sm">{message}</p>}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {scenario ? (
                        <AiRefreshSteps scenario={scenario} />
                    ) : (
                        !state.isLoading && (
                            <p className="text-sm text-muted-foreground">
                                {TEXT.notStarted}
                            </p>
                        )
                    )}
                </div>
            )}
        </SectionCard>
    );
};
