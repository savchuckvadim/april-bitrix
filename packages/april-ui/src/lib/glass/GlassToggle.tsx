'use client';

import { Sparkle, SparklesIcon } from 'lucide-react';
import { useGlass } from './use-glass';

/** Вкл/выкл стеклянных поверхностей во всём приложении. */
export const GlassToggle = () => {
    const { enabled, toggle } = useGlass();

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={enabled}
            title={enabled ? 'Выключить стекло' : 'Включить стекло'}
            className="cursor-pointer rounded-md p-1 text-foreground transition hover:bg-muted"
        >
            {enabled ? <SparklesIcon size={20} /> : <Sparkle size={20} />}
        </button>
    );
};
