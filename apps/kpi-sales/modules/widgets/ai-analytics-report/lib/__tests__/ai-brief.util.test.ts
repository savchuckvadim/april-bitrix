import { describe, expect, it } from 'vitest';
import { brief } from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import {
    AI_BRIEF_LOADING_TEXT,
    AI_BRIEF_QUEUED_TEXT,
    AI_BRIEF_TEMPLATE_REASON_FALLBACK,
    AI_BRIEF_TONE,
    aiBriefCostHint,
    aiBriefFooterReason,
    aiBriefLoadingText,
    aiBriefScopeKey,
    aiBriefTemplateReason,
    formatAiBriefUsage,
    isAiBriefTemplate,
} from '../ai-brief.util';

// Неразрывный пробел ru-RU: сравниваем без учёта вида пробелов.
const plain = (value: string | null) => (value ?? '').replace(/\s/g, ' ');

describe('тон итогов и причина шаблона', () => {
    it('карта тона покрывает calm | attention | alarm; подписи — по-русски', () => {
        expect(Object.keys(AI_BRIEF_TONE).sort()).toEqual([
            'alarm',
            'attention',
            'calm',
        ]);
        expect(AI_BRIEF_TONE.calm.tone).toBe('success');
        expect(AI_BRIEF_TONE.alarm.tone).toBe('destructive');
        for (const { label } of Object.values(AI_BRIEF_TONE)) {
            expect(label).toMatch(/^[а-яё ]+$/);
        }
    });

    it('шаблон: причина сервера, иначе общая подпись', () => {
        expect(isAiBriefTemplate(brief().source)).toBe(false);
        expect(isAiBriefTemplate('template')).toBe(true);
        expect(aiBriefTemplateReason('Исчерпана дневная квота')).toBe(
            'Исчерпана дневная квота',
        );
        expect(aiBriefTemplateReason('  ')).toBe(
            AI_BRIEF_TEMPLATE_REASON_FALLBACK,
        );
        expect(aiBriefTemplateReason(null)).toBe(
            AI_BRIEF_TEMPLATE_REASON_FALLBACK,
        );
    });

    it('строка под итогами: причина только у шаблона', () => {
        expect(aiBriefFooterReason(brief())).toBeNull();
        expect(
            aiBriefFooterReason(
                brief({ source: 'llm', reason: 'не должно попасть на экран' }),
            ),
        ).toBeNull();
        expect(
            aiBriefFooterReason(
                brief({
                    source: 'template',
                    reason: 'Резюме собрано по шаблону: нейросеть не ответила.',
                }),
            ),
        ).toBe('Резюме собрано по шаблону: нейросеть не ответила.');
        expect(
            aiBriefFooterReason(brief({ source: 'template', reason: null })),
        ).toBe(AI_BRIEF_TEMPLATE_REASON_FALLBACK);
        expect(
            aiBriefFooterReason(
                brief({ source: 'template', reason: undefined }),
            ),
        ).toBe(AI_BRIEF_TEMPLATE_REASON_FALLBACK);
    });
});

describe('ожидание очереди', () => {
    it('queued / processing — обещаем результат через несколько секунд', () => {
        expect(aiBriefLoadingText(null)).toBe(AI_BRIEF_LOADING_TEXT);
        expect(aiBriefLoadingText('queued')).toBe(AI_BRIEF_QUEUED_TEXT);
        expect(aiBriefLoadingText('processing')).toBe(AI_BRIEF_QUEUED_TEXT);
    });
});

describe('стоимость подготовки', () => {
    it('только рубли; оценка — словом «около», без значков', () => {
        expect(plain(formatAiBriefUsage(brief().usage))).toBe('1,20 ₽');
        const estimated = plain(
            formatAiBriefUsage({ tokens: 1201, price: 0.5, estimated: true }),
        );
        expect(estimated).toBe('около 0,50 ₽');
        expect(estimated).not.toContain('≈');
        expect(plain(aiBriefCostHint(brief().usage))).toBe(
            'Стоимость подготовки: 1,20 ₽',
        );
    });

    it('нейросеть не вызывали или цены нет — null', () => {
        expect(formatAiBriefUsage(undefined)).toBeNull();
        expect(
            formatAiBriefUsage({ tokens: null, price: null, estimated: false }),
        ).toBeNull();
        expect(
            formatAiBriefUsage({ tokens: 2, price: null, estimated: false }),
        ).toBeNull();
        expect(aiBriefCostHint(undefined)).toBeNull();
    });
});

describe('периметр', () => {
    it('ключ периметра: период и менеджеры; без периметра — null', () => {
        expect(
            aiBriefScopeKey({
                from: '2026-08-01',
                to: '2026-08-31',
                managerIds: [7, 8],
            }),
        ).toBe('2026-08-01|2026-08-31|7,8');
        expect(aiBriefScopeKey({ from: '2026-08-01', to: '2026-08-31' })).toBe(
            '2026-08-01|2026-08-31|',
        );
        expect(aiBriefScopeKey(null)).toBeNull();
        expect(aiBriefScopeKey(undefined)).toBeNull();
    });
});
