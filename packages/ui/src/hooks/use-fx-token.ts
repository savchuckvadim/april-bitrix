'use client';

import { useEffect, useState } from 'react';

/**
 * Читает вычисленное значение CSS-переменной с <html> и следит за её сменой.
 *
 * Зачем: часть эффектов нельзя выразить одним CSS — тяжёлый компонент (SVG-
 * рефракция, WebGL, mousemove-подсветка) должен НЕ рендериться, когда эффект
 * выключен, а не просто быть прозрачным. Источник правды при этом остаётся
 * один — токен в effects.css.
 *
 * Пересчитывается при смене класса/атрибутов <html> (переключение темы, scale,
 * data-glass) и при смене системных настроек прозрачности/движения.
 *
 * SSR: до гидратации возвращает `fallback` — на сервере getComputedStyle нет.
 * Поэтому компоненты, завязанные на результат, обязаны переживать первый
 * рендер с fallback-значением без скачка вёрстки.
 */
export const useFxToken = (name: string, fallback = ''): string => {
    const [value, setValue] = useState(fallback);

    useEffect(() => {
        const root = document.documentElement;

        const read = () => {
            const next = getComputedStyle(root).getPropertyValue(name).trim();
            // Функциональный setState: не завязываемся на value в зависимостях,
            // иначе observer пересоздаётся на каждое изменение.
            setValue(prev => (prev === next ? prev : next));
        };

        read();

        const observer = new MutationObserver(read);
        observer.observe(root, {
            attributes: true,
            attributeFilter: ['class', 'style', 'data-theme', 'data-scale', 'data-glass'],
        });

        const queries = [
            window.matchMedia('(prefers-reduced-transparency: reduce)'),
            window.matchMedia('(prefers-reduced-motion: reduce)'),
        ];
        queries.forEach(q => q.addEventListener('change', read));

        return () => {
            observer.disconnect();
            queries.forEach(q => q.removeEventListener('change', read));
        };
    }, [name]);

    return value;
};

/** Тот же токен, приведённый к флагу: `1` → true, всё остальное → false. */
export const useFxFlag = (name: string, fallback = false): boolean =>
    useFxToken(name, fallback ? '1' : '0') === '1';
