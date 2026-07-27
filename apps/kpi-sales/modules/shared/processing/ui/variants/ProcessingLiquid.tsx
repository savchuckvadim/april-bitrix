'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ProcessingHero } from '../components/ProcessingHero';
import { GradientCountdown } from '../components/GradientCountdown';
import {
    LIQUID_COLORS,
    PROCESSING_DURATION_SEC,
    PROCESSING_TIMER_KEY,
} from '../../lib/processing-fx';

const LiquidEther = dynamic(
    () => import('@workspace/ui/components/LiquidEther'),
    { ssr: false },
);

/**
 * Вариант «liquid»: полноэкранный Processing с жидким WebGL-фоном
 * (ReactBits LiquidEther) и стеклянной карточкой по центру.
 */
export const ProcessingLiquid = () => (
    <div className="bg-background relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
            <LiquidEther colors={LIQUID_COLORS} autoDemo resolution={0.5} />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6">
            <div className="border-border/40 bg-background/60 rounded-2xl border p-8 shadow-lg backdrop-blur-md">
                <ProcessingHero>
                    <GradientCountdown
                        duration={PROCESSING_DURATION_SEC}
                        persistKey={PROCESSING_TIMER_KEY}
                    />
                </ProcessingHero>
            </div>
        </div>
    </div>
);
