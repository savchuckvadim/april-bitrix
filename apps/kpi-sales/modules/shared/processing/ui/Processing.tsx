'use client';

import { ProcessingScreen } from '@workspace/april-ui/feedback';
import { PROCESSING_TIMER_KEY } from '../lib/processing-fx';

/**
 * Экран сборки отчёта продаж. Вёрстка, таймер и палитра — из дизайн-системы
 * (@workspace/april-ui); локально остаётся только ключ персиста таймера —
 * он обязан отличаться от сервисного отчёта, иначе переход между отчётами
 * продолжит чужой отсчёт.
 */
export const Processing = () => (
    <ProcessingScreen persistKey={PROCESSING_TIMER_KEY} />
);
