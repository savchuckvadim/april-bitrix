import { expect } from 'vitest';
import type { AiAboutSectionView } from '../lib/ai-about-phase4.util';

/** Клиентские тексты: без кодов, формул, греческих букв и жаргона. */
export const FORBIDDEN = [
    '→',
    '×',
    '≥',
    '≤',
    'σ',
    'κ',
    'β',
    'P10',
    'P90',
    'MASE',
    'shadow',
    'LLM',
    'кэш',
    'снапшот',
    'конвейер',
    'админк',
    'рычаг',
    'рекомендац',
];

export const allTexts = (view: AiAboutSectionView): string[] => [
    view.title,
    view.month,
    view.badge.label,
    view.todo,
    ...view.reasons,
    ...view.facts.flatMap(item => [item.label, item.value, ...item.hint]),
];

export const expectClientTexts = (view: AiAboutSectionView) => {
    for (const text of allTexts(view)) {
        for (const word of FORBIDDEN) expect(text).not.toContain(word);
        expect(text).not.toMatch(/\b[a-z]+[-_][a-z]+\b/);
    }
    expect(view.todo.length).toBeGreaterThan(0);
};

export const valueOf = (
    view: AiAboutSectionView,
    label: string,
): string | undefined => view.facts.find(item => item.label === label)?.value;
