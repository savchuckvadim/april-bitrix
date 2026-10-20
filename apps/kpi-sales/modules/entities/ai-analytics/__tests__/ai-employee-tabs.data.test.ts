import { describe, expect, it } from 'vitest';
import {
    AI_EMPLOYEE_TAB_DEFAULT,
    AI_EMPLOYEE_TAB_PARAM,
    AI_EMPLOYEE_TABS,
    aiEmployeeHref,
    aiEmployeeTabLabel,
    isAiEmployeeTab,
    parseAiEmployeeTab,
    withAiEmployeeTab,
} from '../lib/ai-employee-tabs.data';

/* Правило владельца: по-русски, без кодов, формул, стрелок и «админки». */
const FORBIDDEN = /[→×≥≤σκβ↑↓]|n ?=|админк|значимо|рычаг|вилк|в тени|периметр|[a-z]{3,}/i;

describe('ai-employee-tabs.data — подвкладки страницы сотрудника', () => {
    it('шесть подвкладок в порядке постановки, первая — «Коротко»', () => {
        expect(AI_EMPLOYEE_TABS.map(tab => tab.key)).toEqual([
            'brief',
            'target',
            'quality',
            'style',
            'calls',
            'feedback',
        ]);
        expect(AI_EMPLOYEE_TAB_DEFAULT).toBe('brief');
        expect(aiEmployeeTabLabel('feedback')).toBe('Обратная связь');
    });

    it('подписи и подсказки — по-русски, без кодов и формул', () => {
        for (const tab of AI_EMPLOYEE_TABS) {
            expect(tab.label).not.toMatch(FORBIDDEN);
            expect(tab.hint).not.toMatch(FORBIDDEN);
            expect(tab.hint.length).toBeGreaterThan(20);
        }
    });

    it('разбор параметра: знакомый ключ как есть, иное — «Коротко»', () => {
        expect(parseAiEmployeeTab('calls')).toBe('calls');
        expect(parseAiEmployeeTab('nope')).toBe('brief');
        expect(parseAiEmployeeTab(null)).toBe('brief');
        expect(isAiEmployeeTab('style')).toBe(true);
        expect(isAiEmployeeTab(7)).toBe(false);
    });

    it('ссылка на страницу: без параметра для «Коротко», с параметром для остальных', () => {
        expect(aiEmployeeHref('7')).toBe('/report/user?userId=7');
        expect(aiEmployeeHref('7', 'brief')).toBe('/report/user?userId=7');
        expect(aiEmployeeHref('7', 'calls')).toBe(
            `/report/user?userId=7&${AI_EMPLOYEE_TAB_PARAM}=calls`,
        );
    });

    it('смена подвкладки сохраняет остальные параметры и убирает параметр у «Коротко»', () => {
        expect(withAiEmployeeTab('userId=7', 'style')).toBe(
            '?userId=7&aiUserTab=style',
        );
        expect(withAiEmployeeTab('userId=7&aiUserTab=style', 'brief')).toBe(
            '?userId=7',
        );
        expect(withAiEmployeeTab('', 'brief')).toBe('');
    });
});
