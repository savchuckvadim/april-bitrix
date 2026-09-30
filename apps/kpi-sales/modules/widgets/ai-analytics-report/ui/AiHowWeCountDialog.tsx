'use client';

import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { GlassDialog } from '@workspace/april-ui';
import type { AiAboutEndpoint } from '@/modules/entities/ai-analytics';
import { useAiAbout } from '../hooks/use-ai-about';
import {
    AI_ABOUT_ENDPOINT_LABELS,
    formatAiAboutComparableFrom,
} from '../lib/ai-about.util';
import { AI_ABOUT_THEORY_TOPIC } from '../lib/ai-theory-link';
import { AiSectionState } from './components/AiSectionState';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiHowWeCountTexts } from './components/AiHowWeCountTexts';
import { AiHowWeCountParams } from './components/AiHowWeCountParams';
import { AiHowWeCountModel } from './components/AiHowWeCountModel';
import { AiHowWeCountReliability } from './components/AiHowWeCountReliability';
import { AiHowWeCountQualityLink } from './components/AiHowWeCountQualityLink';
import { AiHowWeCountForecastAccuracy } from './components/AiHowWeCountForecastAccuracy';
import { AiHowWeCountPool } from './components/AiHowWeCountPool';
import { AiHowWeCountAdviceEffect } from './components/AiHowWeCountAdviceEffect';

interface AiHowWeCountDialogProps {
    /** Раздел витрины, для которого показываем блок. */
    endpoint: AiAboutEndpoint;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DEFAULT_DESCRIPTION =
    'Что считает раздел, откуда берёт данные и какие параметры действуют на портале.';

/**
 * «Как считаем» (раздел about) для одного раздела витрины: назначение,
 * источники, как читать, чего не делаем, таблица параметров с действующими
 * значениями, модель портала (готовность, оценки модели, переходы воронки,
 * проверка качества данных) либо причина её отсутствия, надёжность оценок
 * AI (повторные разборы), секции Фазы 4 — связь качества с результатом,
 * точность прогноза на истории, общая статистика порталов, эффект советов
 * (только те, что прислал бэк) — и начало сравнимой истории. Запрос уходит при
 * открытии; ответ хранится по разделу.
 */
export const AiHowWeCountDialog = ({
    endpoint,
    open,
    onOpenChange,
}: AiHowWeCountDialogProps) => {
    const about = useAiAbout(endpoint, open);
    const data = about.status === 'ready' ? about.data : null;

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="lg"
            intensity="soft"
            cardClassName="max-h-[88vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <DialogTitle>
                    Как считаем:{' '}
                    {data?.title ?? AI_ABOUT_ENDPOINT_LABELS[endpoint]}
                </DialogTitle>
                <DialogDescription>
                    {data?.purpose ?? DEFAULT_DESCRIPTION}
                </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                <AiSectionState
                    status={about.status}
                    error={about.error}
                    loadingText="Собираем описание расчёта…"
                    onRetry={about.retry}
                />
                {data && (
                    <>
                        <AiHowWeCountTexts about={data} />
                        <AiHowWeCountParams params={data.params} />
                        <AiHowWeCountModel
                            model={data.model}
                            modelReason={data.modelReason}
                        />
                        {data.qualityLink && (
                            <AiHowWeCountQualityLink
                                link={data.qualityLink}
                                readiness={data.model?.readiness ?? null}
                            />
                        )}
                        {data.forecastAccuracy && (
                            <AiHowWeCountForecastAccuracy
                                accuracy={data.forecastAccuracy}
                            />
                        )}
                        {data.pool && <AiHowWeCountPool pool={data.pool} />}
                        {data.recommendationsEffect && (
                            <AiHowWeCountAdviceEffect
                                effect={data.recommendationsEffect}
                            />
                        )}
                        <AiHowWeCountReliability
                            reliability={data.reliability}
                        />
                    </>
                )}
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span>
                    {data
                        ? formatAiAboutComparableFrom(data.comparableFrom)
                        : ''}
                </span>
                <AiTheoryLink topic={AI_ABOUT_THEORY_TOPIC[endpoint]} />
            </footer>
        </GlassDialog>
    );
};
