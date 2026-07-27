'use client';

import React from 'react';
import { ProcessingHero } from './components/ProcessingHero';
import { GradientCountdown } from './components/GradientCountdown';
import {
    PROCESSING_DURATION_SEC,
    PROCESSING_TIMER_KEY,
} from '../lib/processing-fx';

/**
 * Вариант «modern»: тот же лейаут и картинка, что у классического
 * Processing, но с новым градиентным таймером секунд (без WebGL-фона).
 * Drop-in замена старого экрана.
 */
export const Processing = () => (
    <div className="bg-background flex flex-col items-center px-4 py-6 text-center">
        <ProcessingHero>
            <GradientCountdown
                duration={PROCESSING_DURATION_SEC}
                persistKey={PROCESSING_TIMER_KEY}
                size={70}
            />
        </ProcessingHero>
    </div>
);
