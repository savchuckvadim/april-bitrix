'use client';

import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import { PROCESSING_TEXTS, TIMER_GRADIENT } from './processing-fx';
import {
    acquireCountdownStart,
    releaseCountdownStart,
} from './countdown-persist.util';

const GradientText = dynamic(
    () => import('@workspace/ui/components/GradientText'),
    { ssr: false },
);

export interface GradientCountdownProps {
    /** Длительность отсчёта в секундах. */
    duration: number;
    /**
     * Ключ персиста старта: таймер переживает кратковременный ремаунт
     * (dynamic-fallback) и не сбрасывается на полную длительность.
     */
    persistKey?: string;
    size?: number;
    /** Палитра кольца и цифр. По умолчанию — фирменная «продажи». */
    gradient?: string[];
    /** Текст по завершении отсчёта. */
    finishedLabel?: ReactNode;
    onComplete?: () => void;
}

const STROKE_WIDTH = 5;
const TICK_MS = 200;

/**
 * SVG-кольцо с градиентным штрихом, мягким вращающимся glow и градиентными
 * цифрами секунд. Современная замена CountdownCircleTimer: без внешней
 * зависимости и без массива из трёх десятков хардкод-цветов.
 */
export const GradientCountdown = ({
    duration,
    persistKey,
    size = 112,
    gradient = TIMER_GRADIENT,
    finishedLabel = PROCESSING_TEXTS.almostReady,
    onComplete,
}: GradientCountdownProps) => {
    const gradientId = useId();
    const localStartRef = useRef<number | null>(null);
    const completedRef = useRef(false);

    const getRemaining = useCallback(() => {
        const start = persistKey
            ? acquireCountdownStart(persistKey)
            : (localStartRef.current ??= Date.now());
        return Math.max(0, duration - (Date.now() - start) / 1000);
    }, [duration, persistKey]);

    /*
     * Стартовое значение — всегда полная длительность, без Date.now().
     * Отсчёт зависит от времени и от модульного персиста старта, а на сервере
     * этот персист живёт между запросами Node: SSR отдавал «почти готово»,
     * клиент рисовал полное кольцо — и гидратация падала с React #418
     * (заметно на публичной /share, где Processing рендерится сервером).
     * Реальный остаток подставляется в эффекте, то есть уже только на клиенте.
     */
    const [remaining, setRemaining] = useState(duration);

    useEffect(() => {
        setRemaining(getRemaining());
        const id = setInterval(() => {
            const left = getRemaining();
            setRemaining(left);
            if (left <= 0 && !completedRef.current) {
                completedRef.current = true;
                onComplete?.();
            }
        }, TICK_MS);
        return () => {
            clearInterval(id);
            if (persistKey) {
                releaseCountdownStart(persistKey);
            }
        };
    }, [getRemaining, onComplete, persistKey]);

    if (remaining <= 0) {
        return (
            <div className="animate-pulse motion-reduce:animate-none">
                <GradientText colors={gradient} animationSpeed={4}>
                    <span className="text-sm font-bold tracking-wide">
                        {finishedLabel}
                    </span>
                </GradientText>
            </div>
        );
    }

    const radius = (size - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = duration > 0 ? remaining / duration : 0;
    const dashOffset = circumference * (1 - progress);

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
            role="timer"
            aria-live="off"
        >
            {/* мягкий вращающийся glow позади кольца */}
            <div
                className="absolute inset-1 animate-spin rounded-full opacity-40 blur-xl motion-reduce:animate-none"
                style={{
                    animationDuration: '8s',
                    background: `conic-gradient(from 0deg, ${gradient.join(', ')})`,
                }}
            />

            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="relative -rotate-90"
            >
                <defs>
                    <linearGradient
                        id={gradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor={gradient[0]} />
                        <stop offset="50%" stopColor={gradient[1]} />
                        <stop offset="100%" stopColor={gradient[2]} />
                    </linearGradient>
                </defs>
                {/* трек */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={STROKE_WIDTH}
                    className="stroke-muted"
                />
                {/* прогресс */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    stroke={`url(#${gradientId})`}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{
                        transition: `stroke-dashoffset ${TICK_MS}ms linear`,
                    }}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <GradientText colors={gradient} animationSpeed={6}>
                    <span className="text-md font-bold tabular-nums">
                        {Math.ceil(remaining)}
                    </span>
                </GradientText>
            </div>
        </div>
    );
};
