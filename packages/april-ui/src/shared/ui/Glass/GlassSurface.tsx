'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import './GlassSurface.css';

/**
 * Вендоренный reactbits GlassSurface — «жидкое стекло»: рефракция фона
 * через SVG displacement map в backdrop-filter (стиль Apple Liquid Glass).
 *
 * Отличия от апстрима (react-bits/src/ts-default/Components/GlassSurface):
 * - дети рендерятся прямо в контейнер (без flex-центрирующей обёртки) —
 *   компонент ведёт себя как обычный div, layout задаёт вызывающий;
 * - width/height опциональны и без дефолтов — сайзинг классами, инлайн-стили
 *   не перебивают Tailwind; убран задублированный ResizeObserver-эффект;
 * - фростовая подложка и fallback построены на токенах темы (--card,
 *   --glass-card-mix) вместо light-dark()/prefers-color-scheme — корректно
 *   работает с классовыми темами монорепы (default-dark и т.п.);
 * - рефракция доступна только в Chromium (backdrop-filter: url(#…));
 *   Safari/Firefox автоматически получают рецепт april-glass-card.
 */
export interface GlassSurfaceProps
    extends React.HTMLAttributes<HTMLDivElement> {
    width?: number | string;
    height?: number | string;
    /** Радиус скругления в px — участвует в генерации displacement map. */
    borderRadius?: number;
    /** Толщина «линзы» по краю (доля меньшей стороны). */
    borderWidth?: number;
    /** Яркость серого в карте искажений, 0–100. */
    brightness?: number;
    /** Непрозрачность карты искажений, 0–1. */
    opacity?: number;
    /** Размытие внутри карты искажений, px. */
    blur?: number;
    /** Смягчение итоговой рефракции (feGaussianBlur), px. */
    displace?: number;
    /** Доля --card во фростовой подложке, 0–1 (читаемость текста). */
    backgroundOpacity?: number;
    /** saturate() поверх рефракции. */
    saturation?: number;
    /** Сила искажения краёв (отрицательное — «линза внутрь»). */
    distortionScale?: number;
    /** Хроматические аберрации: смещение каналов относительно scale. */
    redOffset?: number;
    greenOffset?: number;
    blueOffset?: number;
    xChannel?: 'R' | 'G' | 'B';
    yChannel?: 'R' | 'G' | 'B';
    /** Режим смешивания градиентов в карте искажений. */
    mixBlendMode?: React.CSSProperties['mixBlendMode'];
}

export const GlassSurface = ({
    children,
    width,
    height,
    borderRadius = 16,
    borderWidth = 0.07,
    brightness = 50,
    opacity = 0.93,
    blur = 11,
    displace = 0.6,
    backgroundOpacity = 0,
    saturation = 1,
    distortionScale = -180,
    redOffset = 0,
    greenOffset = 10,
    blueOffset = 20,
    xChannel = 'R',
    yChannel = 'G',
    mixBlendMode = 'difference',
    className = '',
    style,
    ...rest
}: GlassSurfaceProps) => {
    const id = useId();
    const filterId = `glass-filter-${id}`;
    const redGradId = `red-grad-${id}`;
    const blueGradId = `blue-grad-${id}`;

    const [svgSupported, setSvgSupported] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const feImageRef = useRef<SVGFEImageElement>(null);
    const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
    const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
    const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
    const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

    const generateDisplacementMap = () => {
        const rect = containerRef.current?.getBoundingClientRect();
        const actualWidth = rect?.width || 400;
        const actualHeight = rect?.height || 200;
        const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

        const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

        return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    };

    const updateDisplacementMap = () => {
        feImageRef.current?.setAttribute('href', generateDisplacementMap());
    };

    useEffect(() => {
        updateDisplacementMap();
        [
            { ref: redChannelRef, offset: redOffset },
            { ref: greenChannelRef, offset: greenOffset },
            { ref: blueChannelRef, offset: blueOffset },
        ].forEach(({ ref, offset }) => {
            if (ref.current) {
                ref.current.setAttribute(
                    'scale',
                    (distortionScale + offset).toString(),
                );
                ref.current.setAttribute('xChannelSelector', xChannel);
                ref.current.setAttribute('yChannelSelector', yChannel);
            }
        });

        gaussianBlurRef.current?.setAttribute('stdDeviation', displace.toString());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        width,
        height,
        borderRadius,
        borderWidth,
        brightness,
        opacity,
        blur,
        displace,
        distortionScale,
        redOffset,
        greenOffset,
        blueOffset,
        xChannel,
        yChannel,
        mixBlendMode,
    ]);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            setTimeout(updateDisplacementMap, 0);
        });
        resizeObserver.observe(containerRef.current);

        setSvgSupported(supportsSVGFilters());

        return () => {
            resizeObserver.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const supportsSVGFilters = () => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return false;
        }

        const isWebkit =
            /Safari/.test(navigator.userAgent) &&
            !/Chrome/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        if (isWebkit || isFirefox) return false;

        const div = document.createElement('div');
        div.style.backdropFilter = `url(#${filterId})`;
        return div.style.backdropFilter !== '';
    };

    const containerStyle = {
        ...style,
        ...(width !== undefined && {
            width: typeof width === 'number' ? `${width}px` : width,
        }),
        ...(height !== undefined && {
            height: typeof height === 'number' ? `${height}px` : height,
        }),
        borderRadius: `${borderRadius}px`,
        '--glass-frost': `${backgroundOpacity * 100}%`,
        '--glass-saturation': saturation,
        '--filter-id': `url(#${filterId})`,
    } as React.CSSProperties;

    return (
        <div
            ref={containerRef}
            className={`glass-surface ${
                svgSupported ? 'glass-surface--svg' : 'glass-surface--fallback'
            } ${className}`}
            style={containerStyle}
            {...rest}
        >
            <svg
                className="glass-surface__filter"
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter
                        id={filterId}
                        colorInterpolationFilters="sRGB"
                        x="0%"
                        y="0%"
                        width="100%"
                        height="100%"
                    >
                        <feImage
                            ref={feImageRef}
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            preserveAspectRatio="none"
                            result="map"
                        />

                        <feDisplacementMap
                            ref={redChannelRef}
                            in="SourceGraphic"
                            in2="map"
                            result="dispRed"
                        />
                        <feColorMatrix
                            in="dispRed"
                            type="matrix"
                            values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
                            result="red"
                        />

                        <feDisplacementMap
                            ref={greenChannelRef}
                            in="SourceGraphic"
                            in2="map"
                            result="dispGreen"
                        />
                        <feColorMatrix
                            in="dispGreen"
                            type="matrix"
                            values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
                            result="green"
                        />

                        <feDisplacementMap
                            ref={blueChannelRef}
                            in="SourceGraphic"
                            in2="map"
                            result="dispBlue"
                        />
                        <feColorMatrix
                            in="dispBlue"
                            type="matrix"
                            values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
                            result="blue"
                        />

                        <feBlend in="red" in2="green" mode="screen" result="rg" />
                        <feBlend in="rg" in2="blue" mode="screen" result="output" />
                        <feGaussianBlur
                            ref={gaussianBlurRef}
                            in="output"
                            stdDeviation="0.7"
                        />
                    </filter>
                </defs>
            </svg>

            {children}
        </div>
    );
};
