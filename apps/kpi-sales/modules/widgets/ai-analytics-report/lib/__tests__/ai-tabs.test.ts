import { describe, expect, it } from 'vitest';
import { AI_SETTINGS_TABS } from '../ai-settings-form.util';
import {
    AI_EMPLOYEE_SETTINGS_SECTIONS,
    AI_SHOWCASE_SETTINGS_SECTIONS,
    AI_TABS,
    AI_TABS_TEXT,
    aiSettingsSectionId,
    aiTabHref,
    aiTabOfSettingsTab,
    parseAiSettingsSection,
    parseAiTab,
    withAiTab,
} from '../ai-tabs';
import {
    AI_SETTINGS_INLINE_TEXT,
    AI_SETTINGS_SECTION_TEXT,
} from '../ai-settings-sections.texts';

/* Правило владельца: по-русски, без кодов, формул, стрелок и «админки». */
const FORBIDDEN = /[→×≥≤σκβ↑↓]|n ?=|админк|значимо|рычаг|вилк|в тени|периметр/i;

const flatten = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [];
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === 'object') {
        return Object.values(value).flatMap(flatten);
    }
    return [];
};

describe('ai-tabs — подвкладки вкладки «AI аналитика»', () => {
    it('четыре подвкладки в порядке постановки, «Сводка» по умолчанию', () => {
        expect(AI_TABS.map(tab => tab.key)).toEqual([
            'summary',
            'employees',
            'quality',
            'settings',
        ]);
        expect(parseAiTab(null)).toBe('summary');
        expect(parseAiTab('quality')).toBe('quality');
        expect(parseAiTab('nope')).toBe('summary');
    });

    it('тексты подвкладок и секций настроек — по-русски и без запрещённых слов', () => {
        for (const text of [
            ...flatten(AI_TABS),
            ...flatten(AI_TABS_TEXT),
            ...flatten(AI_SETTINGS_SECTION_TEXT),
            ...flatten(AI_SETTINGS_INLINE_TEXT),
            AI_SETTINGS_INLINE_TEXT.footer.willSave(['уровни', 'цели']),
        ]) {
            expect(text).not.toMatch(FORBIDDEN);
        }
        expect(AI_SETTINGS_INLINE_TEXT.footer.willSave(['уровни', 'цели'])).toBe(
            'Будет сохранено: уровни, цели.',
        );
    });

    it('каждая секция настроек живёт ровно на одной подвкладке', () => {
        for (const tab of AI_SETTINGS_TABS) {
            expect(AI_SETTINGS_SECTION_TEXT[tab].label.length).toBeGreaterThan(0);
            expect(AI_SETTINGS_SECTION_TEXT[tab].description.length).toBeGreaterThan(
                20,
            );
        }
        expect(AI_EMPLOYEE_SETTINGS_SECTIONS).toEqual([
            'levels',
            'targets',
            'absences',
            'roster',
        ]);
        expect(AI_SHOWCASE_SETTINGS_SECTIONS).toEqual(['hypothesis', 'pool']);
        expect(aiTabOfSettingsTab('targets')).toBe('employees');
        expect(aiTabOfSettingsTab('pool')).toBe('settings');
        expect(aiSettingsSectionId('targets')).toBe('ai-settings-targets');
    });

    it('секция из параметра: знакомая как есть, незнакомая — null', () => {
        expect(parseAiSettingsSection('targets')).toBe('targets');
        expect(parseAiSettingsSection('nope')).toBeNull();
        expect(parseAiSettingsSection(null)).toBeNull();
    });

    it('поисковая строка: «Сводка» без параметра, секция добавляется и убирается, чужие параметры целы', () => {
        expect(withAiTab('tab=ai', 'summary')).toBe('?tab=ai');
        expect(withAiTab('tab=ai', 'employees', 'targets')).toBe(
            '?tab=ai&aiTab=employees&aiSection=targets',
        );
        expect(
            withAiTab('tab=ai&aiTab=employees&aiSection=targets', 'quality'),
        ).toBe('?tab=ai&aiTab=quality');
        expect(withAiTab('', 'summary')).toBe('');
    });

    it('ссылка на подвкладку со страницы сотрудника ведёт на отчёт с вкладкой AI', () => {
        expect(aiTabHref('summary')).toBe('/report?tab=ai');
        expect(aiTabHref('employees', 'targets')).toBe(
            '/report?tab=ai&aiTab=employees&aiSection=targets',
        );
    });
});
