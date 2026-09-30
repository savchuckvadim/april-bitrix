'use client';

import type { AiAboutForecastAccuracy } from '@/modules/entities/ai-analytics';
import { buildAiAboutForecastAccuracy } from '../../lib/ai-about-phase4-checks.util';
import { AiHowWeCountSection } from './AiHowWeCountSection';

interface AiHowWeCountForecastAccuracyProps {
    accuracy: AiAboutForecastAccuracy;
}

/** «Точность прогноза на истории»: месяцы без показа, вилка, простые правила. */
export const AiHowWeCountForecastAccuracy = ({
    accuracy,
}: AiHowWeCountForecastAccuracyProps) => (
    <AiHowWeCountSection
        view={buildAiAboutForecastAccuracy(accuracy)}
        topic="forecastBacktest"
    />
);
