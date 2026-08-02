'use client';

import { useEffect } from 'react';

/**
 * Включает стекло на время, пока открыт раздел «Процесс».
 *
 * Переключателя здесь нет намеренно — страница показывает продукт, а не
 * настраивает его вид. Но выключатель стекла общий на всю монорепу: если
 * человек погасил стекло в другом приложении, без принудительного включения
 * он приехал бы сюда на плоскую страницу и не смог бы её вернуть.
 *
 * Системную настройку «меньше прозрачности» не перебиваем: она не про вкус, а
 * про то, что человеку тяжело смотреть. Предыдущее значение возвращаем при
 * уходе — чужие приложения свой выбор сохраняют.
 */
export const useForcedGlass = (): void => {
    useEffect(() => {
        const root = document.documentElement;
        const previous = root.dataset.glass;

        const prefersReduced = window.matchMedia(
            '(prefers-reduced-transparency: reduce)',
        ).matches;

        if (prefersReduced) return;

        root.dataset.glass = 'on';

        return () => {
            if (previous === undefined) {
                delete root.dataset.glass;
            } else {
                root.dataset.glass = previous;
            }
        };
    }, []);
};
