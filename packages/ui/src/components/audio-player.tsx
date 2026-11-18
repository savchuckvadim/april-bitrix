'use client';

import * as React from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Slider } from '@workspace/ui/components/slider';

export interface AudioPlayerProps {
    src: string;
    title?: string;
    className?: string;
    /** уведомление о старте/паузе (для «только один играет» снаружи) */
    onPlayingChange?: (isPlaying: boolean) => void;
    /** внешний стоп: при false проигрывание останавливается */
    playing?: boolean;
    /**
     * внешний переход: поставить запись на секунду и играть. `key` меняется
     * на каждый запрос — иначе повторный переход на ту же секунду не сработает
     */
    seekTo?: { time: number; key: number } | null;
    /** текущая секунда записи (для подсветки реплики расшифровки) */
    onTimeChange?: (seconds: number) => void;
    /** запись не загрузилась */
    onError?: () => void;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;

const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
};

/** Длина записи, если браузер её знает; неизвестная или бесконечная — 0. */
const durationOf = (audio: HTMLAudioElement): number =>
    Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;

/**
 * Аудио-плеер (shadcn-стиль, токены тем): play/pause, перемотка, скорость —
 * для прослушивания записей звонков. Без внешних зависимостей (native audio).
 */
export const AudioPlayer = ({
    src,
    title,
    className,
    onPlayingChange,
    playing,
    seekTo,
    onTimeChange,
    onError,
}: AudioPlayerProps) => {
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [rateIndex, setRateIndex] = React.useState(0);

    // Начало записи браузер мог прочитать раньше, чем страница ожила: тогда
    // событие loadedmetadata уже прошло и длина осталась 0 — ползунок
    // упирался в конец (страница звонка, 18.11.2026). Берём длину у записи.
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio || audio.readyState < HTMLMediaElement.HAVE_METADATA) return;
        setDuration(durationOf(audio));
        setCurrentTime(audio.currentTime);
    }, [src]);

    // внешний стоп (когда начинает играть другая запись)
    React.useEffect(() => {
        if (playing === false && audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
        }
    }, [playing]);

    // внешний переход на секунду (клик по реплике или подсветке) — и играть
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !seekTo) return;
        audio.currentTime = Math.max(0, seekTo.time);
        setCurrentTime(audio.currentTime);
        void audio.play().catch(() => undefined);
    }, [seekTo]);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            void audio.play();
        } else {
            audio.pause();
        }
    };

    const cycleRate = () => {
        const next = (rateIndex + 1) % PLAYBACK_RATES.length;
        setRateIndex(next);
        if (audioRef.current) {
            audioRef.current.playbackRate = PLAYBACK_RATES[next]!;
        }
    };

    const seek = (value: number[]) => {
        const audio = audioRef.current;
        const next = value[0];
        if (audio && typeof next === 'number') {
            audio.currentTime = next;
            setCurrentTime(next);
        }
    };

    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-md border border-border bg-card p-2',
                className,
            )}
        >
            <audio
                ref={audioRef}
                src={src}
                preload="metadata"
                onLoadedMetadata={e => setDuration(durationOf(e.currentTarget))}
                onDurationChange={e => setDuration(durationOf(e.currentTarget))}
                onTimeUpdate={e => {
                    setCurrentTime(e.currentTarget.currentTime);
                    onTimeChange?.(e.currentTarget.currentTime);
                }}
                onError={() => onError?.()}
                onPlay={() => {
                    setIsPlaying(true);
                    onPlayingChange?.(true);
                }}
                onPause={() => {
                    setIsPlaying(false);
                    onPlayingChange?.(false);
                }}
                onEnded={() => {
                    setIsPlaying(false);
                    onPlayingChange?.(false);
                }}
            />

            <Button
                type="button"
                size="icon"
                variant={isPlaying ? 'default' : 'outline'}
                className="size-8 shrink-0"
                onClick={toggle}
                aria-label={isPlaying ? 'Пауза' : 'Слушать'}
            >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>

            <div className="min-w-0 flex-1 space-y-1">
                {title && (
                    <p className="truncate text-xs text-muted-foreground">{title}</p>
                )}
                <Slider
                    value={[currentTime]}
                    max={duration || 1}
                    step={1}
                    onValueChange={seek}
                />
            </div>

            <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                className="shrink-0 font-mono text-xs"
                onClick={cycleRate}
                aria-label="Скорость воспроизведения"
            >
                {PLAYBACK_RATES[rateIndex]}x
            </Button>
        </div>
    );
};
