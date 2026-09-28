import { describe, expect, it } from 'vitest';
import {
    AI_KPI_EVENT_FALLBACK,
    AI_KPI_REASON_FALLBACK,
    aiKpiEventLabel,
    aiKpiReasonLabel,
} from '../lib/ai-kpi-codes.data';
import {
    aiKpiHintLines,
    aiSectionHintLines,
    formatAiByCalls,
    formatAiCalls,
    formatAiDeals,
    formatAiKpiLine,
} from '../lib/ai-overview.util';

// Неразрывный пробел ru-RU: сравниваем без учёта вида пробелов.
const plain = (value: string) => value.replace(/\s/g, ' ');

describe('подписи кодов самоотчёта', () => {
    it('коды карты алфавитов подписаны по справочнику CRM', () => {
        for (const code of [
            'xo',
            'site',
            'call',
            'come_call',
            'presentation_uniq',
            'presentation_contact_uniq',
            'call_in_progress',
            'call_in_money',
            'ev_success',
        ]) {
            expect(aiKpiEventLabel(code)).not.toBe(code);
            expect(aiKpiEventLabel(code)).toMatch(/^[А-ЯЁ]/);
        }
        expect(aiKpiEventLabel('xo')).toBe('Холодный звонок');
        expect(aiKpiEventLabel('call_in_money')).toBe('Звонок по оплате');
    });

    it('незнакомый код — нейтральная подпись без самого кода', () => {
        expect(aiKpiEventLabel('weird_code')).toBe(AI_KPI_EVENT_FALLBACK);
        expect(aiKpiEventLabel('weird_code')).not.toContain('weird');
    });
});

describe('причины отсутствия факта', () => {
    it('коды карты — словами', () => {
        expect(aiKpiReasonLabel('refine-mapped-to-call')).toBe(
            'доработка считается как звонок',
        );
        expect(aiKpiReasonLabel('other-share-in-meta')).toBe(
            'доля «прочего» — в сводке',
        );
        expect(aiKpiReasonLabel('irrelevant-share-in-meta')).toBe(
            'доля нерелевантных — в сводке',
        );
    });

    it('отсутствующее событие списка — с названием, незнакомое — без кода', () => {
        expect(aiKpiReasonLabel('kpi-item-missing:call_in_money')).toBe(
            'в списке событий CRM нет «Звонок по оплате»',
        );
        expect(aiKpiReasonLabel('kpi-item-missing:zzz')).toBe(
            'события нет в списке CRM',
        );
        expect(aiKpiReasonLabel('mystery')).toBe(AI_KPI_REASON_FALLBACK);
        expect(aiKpiReasonLabel(null)).toBeNull();
        expect(aiKpiReasonLabel(undefined)).toBeNull();
        expect(aiKpiReasonLabel('')).toBeNull();
    });
});

describe('строки показателей ячейки', () => {
    it('formatAiKpiLine: название, факт и план; без факта — причина словами', () => {
        expect(
            plain(formatAiKpiLine({ code: 'call', fact: 12, planCrm: 20 })),
        ).toBe('Звонок: 12 / 20');
        expect(formatAiKpiLine({ code: 'xo', fact: 3 })).toBe(
            'Холодный звонок: 3',
        );
        expect(
            formatAiKpiLine({
                code: 'refine',
                fact: null,
                reason: 'refine-mapped-to-call',
            }),
        ).toBe('Доработка: — (доработка считается как звонок)');
        expect(formatAiKpiLine({ code: 'ev_success', fact: null })).toBe(
            'Успех: — (нет факта)',
        );
    });

    it('подсказка главного показателя — планы словами', () => {
        expect(
            aiKpiHintLines({ code: 'call', fact: 1, planCrm: 20, planHead: 30 }),
        ).toEqual(['План CRM: 20', 'План руководителя: 30']);
        expect(aiKpiHintLines({ code: 'call', fact: 1 })).toEqual([
            'Плана CRM нет',
            'Плана руководителя нет',
        ]);
    });

    it('подсказка раздела: применимость по звонкам, без «n =»', () => {
        const lines = aiSectionHintLines({
            section: 'PRICE',
            title: 'Работа по цене',
            avgScore: 5,
            n: 11,
            avgRelevance: 72.4,
            explanation: { text: 'Текст', basis: [], evidenceCallIds: [] },
        });
        expect(lines).toEqual(['Текст', 'Применимость 72 % по 11 звонкам.']);
        expect(lines.join(' ')).not.toContain('n =');
    });
});

describe('счётчики словами', () => {
    it('звонки, звонки в дательном падеже, сделки', () => {
        expect(formatAiCalls(1)).toBe('1 звонок');
        expect(formatAiCalls(42)).toBe('42 звонка');
        expect(formatAiCalls(5)).toBe('5 звонков');
        expect(formatAiByCalls(1)).toBe('по 1 звонку');
        expect(formatAiByCalls(21)).toBe('по 21 звонку');
        expect(formatAiByCalls(24)).toBe('по 24 звонкам');
        expect(formatAiDeals(3)).toBe('3 сделки');
        expect(formatAiDeals(1)).toBe('1 сделка');
        expect(formatAiDeals(7)).toBe('7 сделок');
        expect(formatAiDeals(21)).toBe('21 сделка');
    });
});
