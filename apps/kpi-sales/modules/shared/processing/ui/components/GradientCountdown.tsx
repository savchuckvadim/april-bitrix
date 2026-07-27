'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
    PROCESSING_TEXTS,
    TIMER_GRADIENT,
} from '../../lib/processing-fx';
import {
    acquireCountdownStart,
    releaseCountdownStart,
} from '../../lib/countdown-persist.util';

const GradientText = dynamic(
    () => import('@workspace/ui/components/GradientText'),
    { ssr: false },
);

interface GradientCountdownProps {
    /** Длительность отсчёта в секундах. */
    duration: number;
    /**
     * Ключ персиста старта: таймер переживает кратковременный ремаунт
     * (dynamic-fallback) и не сбрасывается на полную длительность.
     */
    persistKey?: string;
    size?: number;
    onComplete?: () => void;
}

const STROKE_WIDTH = 5;
const TICK_MS = 200;

/**
 * Современная альтернатива CountdownCircleTimer: SVG-кольцо с градиентным
 * штрихом, мягким вращающимся glow и градиентными цифрами секунд.
 */
export const GradientCountdown = ({
    duration,
    persistKey,
    size = 112,
    onComplete,
}: GradientCountdownProps) => {
    const gradientId = React.useId();
    const localStartRef = React.useRef<number | null>(null);
    const completedRef = React.useRef(false);

    const getRemaining = React.useCallback(() => {
        const start = persistKey
            ? acquireCountdownStart(persistKey)
            : (localStartRef.current ??= Date.now());
        return Math.max(0, duration - (Date.now() - start) / 1000);
    }, [duration, persistKey]);

    const [remaining, setRemaining] = React.useState(getRemaining);

    React.useEffect(() => {
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

    const isFinished = remaining <= 0;
    const radius = (size - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = duration > 0 ? remaining / duration : 0;
    const dashOffset = circumference * (1 - progress);
    const seconds = Math.ceil(remaining);

    if (isFinished) {
        return (
            <div className="animate-pulse">
                <GradientText colors={TIMER_GRADIENT} animationSpeed={4}>
                    <span className="text-sm font-bold tracking-wide">
                        {PROCESSING_TEXTS.almostReady}
                    </span>
                </GradientText>
            </div>
        );
    }

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            {/* мягкий вращающийся glow позади кольца */}
            <div
                className="animate-spin absolute inset-1 rounded-full opacity-40 blur-xl"
                style={{
                    animationDuration: '8s',
                    background: `conic-gradient(from 0deg, ${TIMER_GRADIENT.join(', ')})`,
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
                        <stop offset="0%" stopColor={TIMER_GRADIENT[0]} />
                        <stop offset="50%" stopColor={TIMER_GRADIENT[1]} />
                        <stop offset="100%" stopColor={TIMER_GRADIENT[2]} />
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
                <GradientText colors={TIMER_GRADIENT} animationSpeed={6}>
                    <span
                        className="font-bold tabular-nums text-md"
                        // style={{ fontSize: size * 0.3 }}
                    >
                        {seconds}
                    </span>
                </GradientText>
                {/* <span className="text-muted-foreground text-[10px] uppercase tracking-widest">
                    сек
                </span> */}
            </div>
        </div>
    );
};
