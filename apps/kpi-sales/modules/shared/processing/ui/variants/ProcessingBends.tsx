'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ProcessingHero, GradientCountdown } from '@workspace/april-ui/feedback';
import {
    BENDS_COLORS,
    PROCESSING_DURATION_SEC,
    PROCESSING_TIMER_KEY,
} from '../../lib/processing-fx';

// у ColorBends нет типизации пропсов (colors выводится как never[]) —
// ослабляем тип на границе dynamic-импорта
const ColorBends = dynamic(
    () =>
        import('@workspace/ui/components/ColorBends').then(
            mod =>
                mod.ColorBends as React.ComponentType<
                    Record<string, unknown>
                >,
        ),
    { ssr: false },
);

/**
 * Вариант «bends»: полноэкранный Processing с переливающимися
 * цветовыми волнами (ReactBits ColorBends) и градиентным заголовком.
 */
export const ProcessingBends = () => (
    <div className="bg-background relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 opacity-60">
            <ColorBends
                colors={BENDS_COLORS}
                speed={0.2}
                rotation={45}
                transparent
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
