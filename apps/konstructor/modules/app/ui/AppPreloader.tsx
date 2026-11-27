'use client';

import { PreloaderScreen } from '@workspace/april-ui';
import { APRIL_BOOT_LOGO_SVG } from '@workspace/april-ui/feedback';

interface AppPreloaderProps {
    /** Подпись этапа под знаком; не задана — «Апрель» */
    title?: string;
}

/**
 * Экран загрузки приложения после старта (повторная инициализация, долгое
 * действие «документ → сделка»). Знак тот же прозрачный контурный, что на
 * стартовом boot-прелоадере: переход между экранами без скачка размера и цвета.
 */
export const AppPreloader = ({ title }: AppPreloaderProps) => (
    <PreloaderScreen
        variant="brand"
        title={title}
        logoMarkup={APRIL_BOOT_LOGO_SVG}
    />
);
