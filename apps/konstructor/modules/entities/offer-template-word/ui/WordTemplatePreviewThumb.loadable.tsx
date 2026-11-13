'use client';

import dynamic from 'next/dynamic';

/**
 * Миниатюра превью шаблона только в браузере: react-pdf трогает DOM при
 * импорте (SSR иначе падает на 500). Пока грузится — место под страницу.
 */
export const WordTemplatePreviewThumbLoadable = dynamic(
    () =>
        import('./components/WordTemplatePreviewThumb/WordTemplatePreviewThumb').then(
            m => m.WordTemplatePreviewThumb,
        ),
    { ssr: false, loading: () => null },
);
