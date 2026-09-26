import { describe, expect, it } from 'vitest';
import { brief } from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import {
    AI_BRIEF_LOADING_TEXT,
    AI_BRIEF_QUEUED_TEXT,
    AI_BRIEF_SOURCE,
    AI_BRIEF_TEMPLATE_REASON_FALLBACK,
    AI_BRIEF_TONE,
    aiBriefLoadingText,
    aiBriefScopeKey,
    aiBriefTemplateReason,
    formatAiBriefFactRefs,
    formatAiBriefUsage,
    isAiBriefTemplate,
} from '../ai-brief.util';

// Неразрывный пробел ru-RU: сравниваем без учёта вида пробелов.
const plain = (value: string | null) => (value ?? '').replace(/\s/g, ' ');

describe('тон и источник резюме', () => {
    it('карты покрывают calm | attention | alarm и llm | template', () => {
        expect(Object.keys(AI_BRIEF_TONE).sort()).toEqual([
            'alarm',
            'attention',
            'calm',
        ]);
        expect(AI_BRIEF_TONE.calm.tone).toBe('success');
        expect(AI_BRIEF_TONE.alarm.tone).toBe('destructive');
        expect(Object.keys(AI_BRIEF_SOURCE).sort()).toEqual([
            'llm',
            'template',
        ]);
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
});

describe('ожидание очереди', () => {
    it('queued / processing — обещаем результат через несколько секунд', () => {
        expect(aiBriefLoadingText(null)).toBe(AI_BRIEF_LOADING_TEXT);
        expect(aiBriefLoadingText('queued')).toBe(AI_BRIEF_QUEUED_TEXT);
        expect(aiBriefLoadingText('processing')).toBe(AI_BRIEF_QUEUED_TEXT);
    });
});

describe('расход модели', () => {
    it('токены и рубли; оценка — со знаком ≈', () => {
        expect(plain(formatAiBriefUsage(brief().usage))).toBe(
            '800 токенов · 1,20 ₽',
        );
        expect(
            plain(
                formatAiBriefUsage({
                    tokens: 1201,
                    price: 0.5,
                    estimated: true,
                }),
            ),
        ).toBe('≈ 1 201 токен · 0,50 ₽');
    });

    it('модель не вызывали — null; без цены — только токены', () => {
        expect(formatAiBriefUsage(undefined)).toBeNull();
        expect(
            formatAiBriefUsage({ tokens: null, price: null, estimated: false }),
        ).toBeNull();
        expect(
            plain(
                formatAiBriefUsage({
                    tokens: 2,
                    price: null,
                    estimated: false,
                }),
            ),
        ).toBe('2 токена');
    });
});

describe('факты и периметр', () => {
    it('коды фактов через точку, пустые отбрасываются', () => {
        expect(formatAiBriefFactRefs(['alerts', '', 'funnel_gap'])).toBe(
            'alerts · funnel_gap',
        );
        expect(formatAiBriefFactRefs([])).toBe('');
    });

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
