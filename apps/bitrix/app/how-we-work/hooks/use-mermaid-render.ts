'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

let mermaidModule: Promise<typeof import('mermaid')> | null = null;

const loadMermaid = () => {
    mermaidModule ??= import('mermaid');
    return mermaidModule;
};

/**
 * Ленивая отрисовка mermaid-диаграммы в контейнер с учётом текущей темы.
 * Библиотека загружается динамически при первом использовании.
 */
export const useMermaidRender = (chart: string) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const reactId = useId();
    const { resolvedTheme } = useTheme();
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const renderChart = async () => {
            try {
                const { default: mermaid } = await loadMermaid();
                mermaid.initialize({
                    startOnLoad: false,
                    securityLevel: 'strict',
                    theme: resolvedTheme === 'dark' ? 'dark' : 'neutral',
                    fontFamily: 'inherit',
                });
                const renderId = `mmd-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
                const { svg } = await mermaid.render(renderId, chart);
                if (!cancelled && containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            } catch {
                if (!cancelled) setError(true);
            }
        };
        void renderChart();
        return () => {
            cancelled = true;
        };
    }, [chart, reactId, resolvedTheme]);

    return { containerRef, error };
};
