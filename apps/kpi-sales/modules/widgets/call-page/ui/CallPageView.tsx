'use client';

import type { CallPageDto } from '@/modules/entities/call-page';
import { useCallPageSelection } from '../model/use-call-page-selection';
import { CallFactsCard } from './CallFactsCard';
import { CallMethodologyCard } from './CallMethodologyCard';
import { CallObjectionsCard } from './CallObjectionsCard';
import { CallPageHeader } from './CallPageHeader';
import { CallScoreStrip } from './CallScoreStrip';
import { CallSectionsCard } from './CallSectionsCard';
import { CallSummaryCard } from './CallSummaryCard';
import { CallTranscriptCard } from './CallTranscriptCard';

interface CallPageViewProps {
    data: CallPageDto;
    /** Адрес записи на нашем сайте (прокси), не адрес бэкенда. */
    audioSrc: string;
}

/**
 * Страница разбора звонка: шапка, сводка оценок, слева разбор (суть, итоги,
 * разделы, возражения, методика), справа — запись и расшифровка с
 * подсветкой мест разбора. На узком экране колонки идут друг за другом.
 */
export const CallPageView = ({ data, audioSrc }: CallPageViewProps) => {
    const state = useCallPageSelection(data);

    return (
        <div className="mx-auto max-w-[96rem] space-y-4 px-4 py-6">
            <CallPageHeader call={data.call} score={data.score} />
            <CallScoreStrip score={data.score.score} sections={data.sections} />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,42rem)]">
                <div className="space-y-4">
                    <CallSummaryCard data={data} />
                    <CallFactsCard
                        facts={data.facts}
                        onOpenHighlight={state.openHighlightById}
                    />
                    <CallObjectionsCard
                        objections={data.objections}
                        onOpenHighlight={state.openHighlightById}
                    />
                    <CallSectionsCard
                        sections={data.sections}
                        onOpenHighlight={state.openHighlightById}
                    />
                    <CallMethodologyCard
                        methodology={data.methodology}
                        onOpenHighlight={state.openHighlightById}
                    />
                </div>
                <aside className="lg:sticky lg:top-4 lg:self-start">
                    <CallTranscriptCard
                        data={data}
                        audioSrc={audioSrc}
                        state={state}
                    />
                </aside>
            </div>
        </div>
    );
};
