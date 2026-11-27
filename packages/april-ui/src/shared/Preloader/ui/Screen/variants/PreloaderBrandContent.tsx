'use client';

import Image from 'next/image';
import './PreloaderBrand.css';

interface PreloaderBrandContentProps {
    title: string;
    logoSrc: string | null;
    /** Инлайн-SVG знака (цвет currentColor); приоритетнее logoSrc */
    logoMarkup?: string | null;
}

/**
 * Brand-вариант: крупный логотип в «дышащем» кольце + индикатор.
 * Чистый CSS (без WebGL) — быстрый и спокойный. Знак — картинкой по logoSrc или
 * инлайн-разметкой (так он выглядит на boot-прелоадере: контурный, без заливки).
 */
export const PreloaderBrandContent = ({
    title,
    logoSrc,
    logoMarkup = null,
}: PreloaderBrandContentProps) => (
    <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative flex h-28 w-28 items-center justify-center">
            <span className="april-preloader-ring april-preloader-ring--outer" />
            <span className="april-preloader-ring" />
            {logoMarkup ? (
                <span
                    role="img"
                    aria-label={title}
                    className="april-preloader-logo april-preloader-logo--inline"
                    dangerouslySetInnerHTML={{ __html: logoMarkup }}
                />
            ) : logoSrc ? (
                <Image
                    src={logoSrc}
                    alt={title}
                    width={96}
                    height={96}
                    priority
                    className="april-preloader-logo"
                />
            ) : null}
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            {title}
        </p>
        <div className="april-preloader-bar" />
    </div>
);
