'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ProcessingHero, GradientCountdown } from '@workspace/april-ui/feedback';
import {
    AURORA_COLOR_STOPS,
    PROCESSING_DURATION_SEC,
    PROCESSING_TIMER_KEY,
} from '../../lib/processing-fx';

const Aurora = dynamic(() => import('@workspace/ui/components/Aurora'), {
    ssr: false,
});

/**
 * Вариант «aurora»: полноэкранный Processing с северным сиянием
 * (ReactBits Aurora) сверху и градиентным заголовком.
 */
export const ProcessingAurora = () => (
    <div className="bg-background relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 opacity-70">
            <Aurora
                colorStops={AURORA_COLOR_STOPS}
                amplitude={1.1}
                blend={0.6}
            />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6">
            <ProcessingHero gradientTitle>
                <GradientCountdown
                    duration={PROCESSING_DURATION_SEC}
                    persistKey={PROCESSING_TIMER_KEY}
                />
            </ProcessingHero>
        </div>
    </div>
);
