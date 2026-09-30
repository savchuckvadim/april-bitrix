'use client';

import { RefreshCw } from 'lucide-react';
import { SectionCard, ToneBadge } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAiForecast } from '../hooks/use-ai-forecast';
import { AI_FORECAST_TEXT } from '../lib/ai-forecast.texts';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiSectionState } from './components/AiSectionState';
import { AiForecastShadow } from './components/AiForecastShadow';
import { AiForecastPublished } from './components/AiForecastPublished';

const T = AI_FORECAST_TEXT;

/**
 * «Прогноз отдела» (Фаза 4) — только руководителю, как остальные карточки
 * витрины. В тени — прогресс теневого журнала и точность на истории без
 * цифр вилки; включён — середина, границы, деньги и сделано. Ошибки —
 * общим механизмом секций (текст сервера + подсказка «что это значит»).
 */
export const AiForecastCard = () => {
    const forecast = useAiForecast();
    if (!forecast.isLeader) return null;

    const { view } = forecast;
    const loading = forecast.status === 'loading';

    return (
        <SectionCard
            surface="glass"
            title={
                <span className="flex items-center gap-2">
                    {T.title}
                    <ToneBadge tone="muted" variant="soft" size="sm">
                        {T.badge}
                    </ToneBadge>
                </span>
            }
            description={
                view?.kind === 'published' ? view.period : T.description
            }
            actions={
                <>
                    <AiTheoryLink
                        topic={
                            view?.kind === 'shadow' ? view.theory : 'forecast'
                        }
                        variant="icon"
                    />
                    <AiHowWeCountButton endpoint="forecast" />
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={loading}
                        onClick={forecast.refresh}
                    >
                        <RefreshCw
                            className={cn('h-3 w-3', loading && 'animate-spin')}
                        />
                        Обновить
                    </Button>
                </>
            }
        >
            <AiSectionState
                status={forecast.status}
                error={forecast.error}
                loadingText={T.loading}
                onRetry={forecast.retry}
            />
            {view?.kind === 'shadow' && <AiForecastShadow view={view} />}
            {view?.kind === 'published' && (
                <AiForecastPublished view={view} />
            )}
            {view?.kind === 'empty' && (
                <p className="py-2 text-xs text-muted-foreground">
                    {view.text}
                </p>
            )}
        </SectionCard>
    );
};
