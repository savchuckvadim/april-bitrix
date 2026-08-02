'use client';

import { GradientCountdown } from './GradientCountdown';
import { ProcessingHero, type ProcessingHeroProps } from './ProcessingHero';
import { PROCESSING_DURATION_SEC, PROCESSING_TIMER_KEY } from './processing-fx';

export interface ProcessingScreenProps
    extends Omit<ProcessingHeroProps, 'children'> {
    /** Длительность отсчёта, сек. */
    duration?: number;
    /**
     * Ключ персиста таймера. Разный у разных отчётов — иначе переход между
     * ними продолжит чужой отсчёт.
     */
    persistKey?: string;
    /** Палитра кольца и цифр таймера. */
    gradient?: string[];
    timerSize?: number;
}

/**
 * Экран «конструируем отчёт»: картинка + тексты + градиентный таймер.
 * Единый для всех отчётных приложений — kpi-sales и kpi-service отличаются
 * только палитрой и текстами, но не вёрсткой и не механикой.
 */
export const ProcessingScreen = ({
    duration = PROCESSING_DURATION_SEC,
    persistKey = PROCESSING_TIMER_KEY,
    gradient,
    timerSize = 70,
    ...hero
}: ProcessingScreenProps) => (
    <div className="flex flex-col items-center bg-background px-4 py-6 text-center">
        <ProcessingHero {...hero}>
            <GradientCountdown
                duration={duration}
                persistKey={persistKey}
                size={timerSize}
                gradient={gradient}
            />
        </ProcessingHero>
    </div>
);
