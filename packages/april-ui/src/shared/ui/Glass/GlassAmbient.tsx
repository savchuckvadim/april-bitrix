'use client';

import './GlassAmbient.css';

interface GlassAmbientProps {
    className?: string;
}

/**
 * Декоративный градиентный фон под стеклянные поверхности: fixed-слой с
 * мягкими цветовыми пятнами от токенов темы + два медленно дрейфующих
 * блоба. Стекло (blur) читается только когда за ним есть что размывать —
 * этот слой и есть «что». Чистый CSS, кликов не ловит, screen-reader'ам
 * не виден; дрейф отключается prefers-reduced-motion.
 */
export const GlassAmbient = ({ className = '' }: GlassAmbientProps) => (
    <div aria-hidden className={`april-glass-ambient ${className}`} />
);
