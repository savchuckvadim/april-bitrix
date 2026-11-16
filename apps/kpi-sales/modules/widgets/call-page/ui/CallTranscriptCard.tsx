'use client';

import * as React from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { AudioPlayer } from '@workspace/ui/components/audio-player';
import type { CallPageDto } from '@/modules/entities/call-page';
import type { CallPageSelectionState } from '../model/use-call-page-selection';
import { CallHighlightBar } from './CallHighlightBar';
import { CallTranscriptSegment } from './CallTranscriptSegment';

interface CallTranscriptCardProps {
    data: CallPageDto;
    audioSrc: string;
    state: CallPageSelectionState;
}

const describe = (data: CallPageDto): string => {
    if (data.highlights.length === 0) {
        return data.transcriptTimed
            ? 'Нажмите на время у реплики, чтобы слушать с этого места.'
            : 'Текст разговора без времени: запись слушается с начала.';
    }
    return 'Нажмите на бейдж — места разбора подсветятся в тексте. Нажатие на место ведёт к реплике и включает запись.';
};

/** Запись разговора, бейджи мест разбора и расшифровка по репликам. */
export const CallTranscriptCard = ({
    data,
    audioSrc,
    state,
}: CallTranscriptCardProps) => {
    const [audioFailed, setAudioFailed] = React.useState(false);
    const canPlay = data.call.hasAudio && !audioFailed;

    return (
        <SectionCard title="Запись и расшифровка" description={describe(data)}>
            <div className="space-y-3">
                {canPlay && (
                    <AudioPlayer
                        src={audioSrc}
                        seekTo={state.seek}
                        onTimeChange={state.setCurrentSec}
                        onError={() => setAudioFailed(true)}
                    />
                )}
                {!canPlay && (
                    <p className="text-sm text-muted-foreground">
                        {data.call.hasAudio
                            ? 'Запись разговора сейчас недоступна — портал её не отдал. Текст разговора ниже.'
                            : 'У этого звонка нет записи. Текст разговора ниже.'}
                    </p>
                )}

                <CallHighlightBar
                    groups={state.groups}
                    selection={state.selection}
                    hasAudio={canPlay}
                    onToggleKind={state.toggleKind}
                    onOpenHighlight={state.openHighlight}
                    onClear={state.clear}
                />

                {data.transcript.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Текста разговора нет.
                    </p>
                ) : (
                    <ol className="max-h-[70vh] space-y-0.5 overflow-y-auto pr-1">
                        {data.transcript.map(segment => (
                            <CallTranscriptSegment
                                key={segment.index}
                                segment={segment}
                                tone={state.tones.get(segment.index) ?? null}
                                labels={state.labels.get(segment.index) ?? []}
                                playing={state.playingIndex === segment.index}
                                focused={state.focusIndex === segment.index}
                                playable={canPlay && segment.startSec !== null}
                                onOpen={state.openSegment}
                            />
                        ))}
                    </ol>
                )}
            </div>
        </SectionCard>
    );
};
