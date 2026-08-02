'use client';

import { ProcessingScreen } from '@workspace/april-ui/feedback';
import {
    PROCESSING_TIMER_KEY,
    TIMER_GRADIENT_SERVICE,
    TITLE_GRADIENT_SERVICE,
} from '../lib/processing-fx';

/**
 * Экран сборки сервисного отчёта. Вёрстка, тексты и механика таймера —
 * ровно те же, что в отчёте продаж (общий ProcessingScreen из
 * @workspace/april-ui). Отличие одно и намеренное: бирюзово-зелёная палитра
 * вместо фиолетово-синей — по цвету сразу видно, отчёт сервиса перед тобой
 * или продаж.
 *
 * Прежняя реализация тянула react-countdown-circle-timer с массивом из
 * 31 хардкод-цвета, держала мёртвые duration/setKey и писала в консоль.
 */
const Processing = () => (
    <ProcessingScreen
        persistKey={PROCESSING_TIMER_KEY}
        gradient={TIMER_GRADIENT_SERVICE}
        titleGradient={TITLE_GRADIENT_SERVICE}
        gradientTitle
    />
);

export default Processing;
