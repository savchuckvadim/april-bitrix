'use client';

import { preload } from 'react-dom';
import { PROCESSING_IMAGE_SRC } from './processing-fx';

/**
 * Подгрузить заранее то, что экран «конструируем отчёт» показывает первым:
 * картинку и код градиентных цифр таймера (он грузится отдельным куском —
 * `dynamic(..., { ssr: false })` в GradientCountdown).
 *
 * Вызывать, пока крутится прелоадер приложения. Без этого экран появлялся
 * пустым фоном, а картинка и таймер доезжали примерно через секунду: экран
 * рисуется только на клиенте, и до его появления браузер о них не знал
 * (замечание владельца 18.11.2026).
 */
export function preloadProcessingAssets(
    imageSrc: string = PROCESSING_IMAGE_SRC,
): void {
    preload(imageSrc, { as: 'image' });
    // Тот же модуль, что у dynamic в GradientCountdown, — браузер возьмёт
    // кусок из кэша. Не загрузился — не страшно: экран догрузит его сам.
    void import('@workspace/ui/components/GradientText').catch(
        () => undefined,
    );
}
