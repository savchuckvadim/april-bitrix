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
    shortAiAboutVersion,
} from '../lib/ai-about.util';
import { AiSectionState } from './components/AiSectionState';
import { AiHowWeCountTexts } from './components/AiHowWeCountTexts';
import { AiHowWeCountParams } from './components/AiHowWeCountParams';
import { AiHowWeCountModel } from './components/AiHowWeCountModel';
import { AiHowWeCountReliability } from './components/AiHowWeCountReliability';

interface AiHowWeCountDialogProps {
    /** Ручка витрины, для которой показываем блок. */
    endpoint: AiAboutEndpoint;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DEFAULT_DESCRIPTION =
    'Что считает раздел, откуда берёт данные и какие параметры действуют на портале.';

/**
 * «Как считаем» (ручка about) для одной ручки витрины: назначение,
 * источники, как читать, чего не делаем, таблица параметров реестра с
 * действующими значениями, модель портала (готовность, κ/φ/λ, трактовка
 * рёбер, санити) либо причина её отсутствия, надёжность оценщика
 * (test-retest: σ_llm, κ по полям, F1 возражений), версия параметров и
 * начало сравнимой истории. Запрос уходит при открытии; кэш — по ручке.
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
                        <AiHowWeCountReliability
                            reliability={data.reliability}
                        />
                        <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                            <span title={data.paramsVersion}>
                                версия параметров:{' '}
                                <code>
                                    {shortAiAboutVersion(data.paramsVersion)}
                                </code>
                            </span>
                            <span>
                                {formatAiAboutComparableFrom(
                                    data.comparableFrom,
                                )}
                            </span>
                        </footer>
                    </>
                )}
            </div>
        </GlassDialog>
    );
};
