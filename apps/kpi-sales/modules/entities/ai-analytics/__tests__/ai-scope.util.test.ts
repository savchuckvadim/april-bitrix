import { describe, expect, it } from 'vitest';
import {
    AI_SCOPE_TEXT,
    aiScopeEmptyText,
    buildAiScopeNote,
    isAiScopeChipVisible,
} from '../lib/ai-scope.util';

const FORBIDDEN = /[→×≥≤σκβ]|n ?=|админк|периметр|значимо/i;

describe('ai-scope.util — периметр разбора', () => {
    it('старый кэш без meta.scope — примечания нет', () => {
        expect(buildAiScopeNote(undefined)).toBeNull();
        expect(buildAiScopeNote(null)).toBeNull();
        expect(isAiScopeChipVisible(null)).toBe(false);
    });

    it('список разбора действует — чип виден; пусто только при нуле строк', () => {
        const note = buildAiScopeNote({
            pilotActive: true,
            shownManagers: 2,
            hiddenByPilot: 5,
        });
        expect(note).toEqual({
            pilotActive: true,
            shownManagers: 2,
            hiddenByPilot: 5,
            empty: false,
        });
        expect(isAiScopeChipVisible(note)).toBe(true);
        expect(
            buildAiScopeNote({
                pilotActive: true,
                shownManagers: 0,
                hiddenByPilot: 7,
            })?.empty,
        ).toBe(true);
    });

    it('ограничения нет — чип не показываем, пустота не из-за разбора', () => {
        const note = buildAiScopeNote({
            pilotActive: false,
            shownManagers: 0,
            hiddenByPilot: 0,
        });
        expect(note?.empty).toBe(false);
        expect(isAiScopeChipVisible(note)).toBe(false);
    });

    it('тексты: чип с числом, пустое состояние с именами и «что сделать», без жаргона', () => {
        expect(AI_SCOPE_TEXT.chip(3)).toBe('Только сотрудники из разбора: 3');
        expect(aiScopeEmptyText(['Иванов', 'Петров'])).toBe(
            'В выбранном фильтре нет сотрудников, чьи звонки разбирает AI. Что сделать: выберите в фильтре отчёта Иванов, Петров или попросите разработчика добавить нужных сотрудников в разбор.',
        );
        expect(aiScopeEmptyText([])).toContain('Что сделать');
        const texts = [
            AI_SCOPE_TEXT.chipHint.title,
            ...AI_SCOPE_TEXT.chipHint.lines,
            AI_SCOPE_TEXT.totalsCaption,
            AI_SCOPE_TEXT.forecastNote,
            aiScopeEmptyText([]),
        ];
        for (const text of texts) expect(text).not.toMatch(FORBIDDEN);
        expect(AI_SCOPE_TEXT.chipHint.lines.join(' ')).toContain(
            'попросите разработчика',
        );
    });
});
