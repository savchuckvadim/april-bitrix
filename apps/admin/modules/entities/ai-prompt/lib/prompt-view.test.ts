import { describe, expect, it } from 'vitest';
import type { LlmPromptRunResult, LlmPromptTargetInfo } from '../model';
import {
    fallbackTarget,
    formatElapsed,
    formatUsage,
    resultMeta,
    targetLabel,
} from './prompt-view';

const target = (
    code: LlmPromptTargetInfo['code'],
    issue: string | null = null,
): LlmPromptTargetInfo => ({
    code,
    title: code,
    description: '',
    kind: 'gateway',
    acceptsModel: false,
    issue,
});

const result = (over: Partial<LlmPromptRunResult> = {}): LlmPromptRunResult => ({
    text: 'ответ',
    provider: 'vibecode',
    model: 'bitrix/bitrixgpt-5.5',
    elapsedMs: 4321,
    usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    ...over,
});

describe('prompt-view', () => {
    it('подпись исполнителя: недоступный — с причиной', () => {
        expect(targetLabel(target('auto'))).toBe('auto');
        expect(targetLabel(target('vibecode', 'нужен портал'))).toBe(
            'vibecode — недоступен: нужен портал',
        );
    });

    it('время: до 10 с с десятыми, дальше целые', () => {
        expect(formatElapsed(4321)).toBe('4,3 с');
        expect(formatElapsed(12_600)).toBe('13 с');
    });

    it('расход: null без totalTokens, иначе всего + запрос + ответ', () => {
        expect(formatUsage(null)).toBeNull();
        expect(
            formatUsage({ promptTokens: null, completionTokens: null, totalTokens: null }),
        ).toBeNull();
        expect(
            formatUsage({ promptTokens: 10, completionTokens: null, totalTokens: 15 }),
        ).toBe('Токены: всего 15, запрос 10');
    });

    it('строки «кто ответил»: модель только если отличается от провайдера', () => {
        expect(resultMeta(result())).toEqual([
            'Ответил: vibecode, модель bitrix/bitrixgpt-5.5',
            'Время: 4,3 с',
            'Токены: всего 15, запрос 10, ответ 5',
        ]);
        expect(
            resultMeta(result({ provider: 'gigachat', model: 'gigachat', usage: null })),
        ).toEqual(['Ответил: gigachat', 'Время: 4,3 с']);
    });

    it('недоступный выбранный исполнитель заменяется первым доступным', () => {
        const targets = [target('auto'), target('vibecode', 'нужен портал')];
        expect(fallbackTarget(targets, 'vibecode')).toBe('auto');
        expect(fallbackTarget(targets, 'auto')).toBe('auto');
        expect(fallbackTarget([target('vibecode', 'нет ключа')], 'vibecode')).toBe(
            'vibecode',
        );
    });
});
