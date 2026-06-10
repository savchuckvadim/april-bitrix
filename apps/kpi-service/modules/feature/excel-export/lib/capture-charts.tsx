'use client';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Chart as ChartJS } from 'chart.js';

export interface ChartCaptureSpec {
    title: string;
    /** Готовый chart-компонент (например <LineChart .../>) */
    node: React.ReactNode;
    width?: number;
    height?: number;
}

export interface CapturedChart {
    title: string;
    pngDataUrl: string;
    width: number;
    height: number;
}

const DEFAULT_W = 900;
const DEFAULT_H = 360;

const nextFrame = () =>
    new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Рендерит chart-компоненты в offscreen-контейнере и снимает PNG из их canvas.
 * Анимация chart.js на время захвата отключается глобально (с восстановлением),
 * чтобы canvas был полностью отрисован к моменту toDataURL.
 * Не зависит от видимости графиков на странице (тогглы аналитики/итогов).
 */
export async function captureCharts(
    specs: ChartCaptureSpec[],
): Promise<CapturedChart[]> {
    if (typeof window === 'undefined' || specs.length === 0) return [];

    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        left: '-100000px',
        top: '0',
        background: '#ffffff',
        pointerEvents: 'none',
        zIndex: '-1',
    } as CSSStyleDeclaration);
    document.body.appendChild(container);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevAnimation = (ChartJS.defaults as any).animation;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ChartJS.defaults as any).animation = false;

    const root = createRoot(container);
    root.render(
        <div style={{ background: '#fff' }}>
            {specs.map((spec, i) => (
                <div
                    key={i}
                    data-cap={String(i)}
                    style={{
                        width: `${spec.width ?? DEFAULT_W}px`,
                        height: `${spec.height ?? DEFAULT_H}px`,
                        background: '#fff',
                    }}
                >
                    {spec.node}
                </div>
            ))}
        </div>,
    );

    // дождаться монтирования и отрисовки canvas
    await wait(0);
    await nextFrame();
    await nextFrame();
    await wait(150);

    const results: CapturedChart[] = [];
    specs.forEach((spec, i) => {
        const wrap = container.querySelector(`[data-cap="${i}"]`);
        // Узел может содержать несколько графиков (например ImplementationAnalytics)
        const canvases = wrap
            ? Array.from(wrap.querySelectorAll('canvas'))
            : [];
        canvases.forEach((canvas, j) => {
            const rect = canvas.getBoundingClientRect();
            results.push({
                title:
                    canvases.length > 1
                        ? `${spec.title} (${j + 1})`
                        : spec.title,
                pngDataUrl: canvas.toDataURL('image/png'),
                width: Math.round(rect.width) || spec.width || DEFAULT_W,
                height: Math.round(rect.height) || spec.height || DEFAULT_H,
            });
        });
    });

    root.unmount();
    container.remove();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ChartJS.defaults as any).animation = prevAnimation;

    return results;
}
