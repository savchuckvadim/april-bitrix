'use client';

import type { AiAboutRecommendationsEffect } from '@/modules/entities/ai-analytics';
import { buildAiAboutRecommendationsEffect } from '../../lib/ai-about-phase4-checks.util';
import { AiHowWeCountSection } from './AiHowWeCountSection';

interface AiHowWeCountAdviceEffectProps {
    effect: AiAboutRecommendationsEffect;
}

/** «Эффект советов»: выдано, выполнено, несогласия, шаги воронки до и после. */
export const AiHowWeCountAdviceEffect = ({
    effect,
}: AiHowWeCountAdviceEffectProps) => (
    <AiHowWeCountSection
        view={buildAiAboutRecommendationsEffect(effect)}
        topic="recommendationsEffect"
    />
);
