import { describe, expect, it } from 'vitest';
import { STAGE_HISTORY_PROBE_TEXT } from '../consts/ai-analytics-audit.const';
import type { AiAnalyticsStageHistoryProbe } from '../model';
import { formatAuditDateTime } from './audit-format.util';
import {
    buildStageHistoryProbeView,
    formatProbeCategory,
    formatProbeMonths,
    formatProbeTransitions,
} from './stage-history-probe.util';

/** Ответ пробы в форме AiAnalyticsStageHistoryProbeResponseDto бэка (всё хорошо). */
const PROBE: AiAnalyticsStageHistoryProbe = {
    domain: 'april.bitrix24.ru',
    checkedAt: '2026-09-21T09:00:00.000Z',
    available: true,
    error: null,
    categoryBitrixId: 4,
    earliestAt: '2024-06-15T10:00:00+03:00',
    historyMonths: 27,
    transitionsInWindow: 1234,
    countIsLowerBound: false,
    windowMonths: 12,
    enough: true,
    hint: 'история доступна, глубина 27 мес., переходов за окно 12 мес. — 1234',
};

/** «21.09.2026, 12:00» — день.месяц.год, запятая, часы:минуты (пояс браузера). */
const DATE_TIME_RU = /^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/;

const fieldValue = (
    view: ReturnType<typeof buildStageHistoryProbeView>,
    key: string,
): string | undefined => view.fields.find(field => field.key === key)?.value;

describe('formatProbeMonths / formatProbeTransitions / formatProbeCategory', () => {
    it('месяцы: число с единицей, null — «—»', () => {
        expect(formatProbeMonths(27)).toBe('27 мес.');
        expect(formatProbeMonths(0)).toBe('0 мес.');
        expect(formatProbeMonths(null)).toBe('—');
    });

    it('переходы: точное число, «не меньше N» для нижней границы, «—» без метода', () => {
        expect(formatProbeTransitions(1234, false)).toBe('1234');
        expect(formatProbeTransitions(50, true)).toBe('не меньше 50');
        expect(formatProbeTransitions(null, false)).toBe('—');
    });

    it('категория: #id воронки или «все воронки»', () => {
        expect(formatProbeCategory(4)).toBe('#4');
        expect(formatProbeCategory(null)).toBe('все воронки');
    });
});

describe('formatAuditDateTime: даты пробы', () => {
    it('ISO UTC и ISO с поясом портала — в русском формате «дата, время»', () => {
        expect(formatAuditDateTime(PROBE.checkedAt)).toMatch(DATE_TIME_RU);
        expect(formatAuditDateTime(PROBE.earliestAt)).toMatch(DATE_TIME_RU);
    });

    it('null — «—», мусор — как есть', () => {
        expect(formatAuditDateTime(null)).toBe('—');
        expect(formatAuditDateTime('вчера')).toBe('вчера');
    });
});

describe('buildStageHistoryProbeView: доступно и достаточно', () => {
    const view = buildStageHistoryProbeView(PROBE);

    it('тон success, бейджи «история доступна» и «достаточно»', () => {
        expect(view.tone).toBe('success');
        expect(view.availability).toEqual({
            label: STAGE_HISTORY_PROBE_TEXT.available,
            tone: 'success',
        });
        expect(view.enough).toEqual({
            label: STAGE_HISTORY_PROBE_TEXT.enough,
            tone: 'success',
        });
        expect(view.error).toBeNull();
        expect(view.hint).toBe(PROBE.hint);
    });

    it('поля глубины и объёма строками в порядке показа', () => {
        expect(view.fields.map(field => field.key)).toEqual([
            'earliestAt',
            'historyMonths',
            'windowMonths',
            'transitionsInWindow',
            'category',
            'checkedAt',
        ]);
        expect(fieldValue(view, 'earliestAt')).toMatch(DATE_TIME_RU);
        expect(fieldValue(view, 'historyMonths')).toBe('27 мес.');
        expect(fieldValue(view, 'windowMonths')).toBe('12 мес.');
        expect(fieldValue(view, 'transitionsInWindow')).toBe('1234');
        expect(fieldValue(view, 'category')).toBe('#4');
        expect(fieldValue(view, 'checkedAt')).toMatch(DATE_TIME_RU);
    });
});

describe('buildStageHistoryProbeView: доступно, но глубины не хватает', () => {
    const view = buildStageHistoryProbeView({
        ...PROBE,
        historyMonths: 3,
        transitionsInWindow: 50,
        countIsLowerBound: true,
        categoryBitrixId: null,
        enough: false,
    });

    it('тон warning, «недостаточно» тоже warning', () => {
        expect(view.tone).toBe('warning');
        expect(view.availability.tone).toBe('success');
        expect(view.enough).toEqual({
            label: STAGE_HISTORY_PROBE_TEXT.notEnough,
            tone: 'warning',
        });
    });

    it('нижняя граница переходов помечена, категория — все воронки', () => {
        expect(fieldValue(view, 'transitionsInWindow')).toBe('не меньше 50');
        expect(fieldValue(view, 'category')).toBe('все воронки');
        expect(fieldValue(view, 'historyMonths')).toBe('3 мес.');
    });
});

describe('buildStageHistoryProbeView: метод недоступен', () => {
    const view = buildStageHistoryProbeView({
        ...PROBE,
        available: false,
        error: 'Insufficient scope: crm',
        earliestAt: null,
        historyMonths: null,
        transitionsInWindow: null,
        enough: false,
        hint: 'история недоступна: Insufficient scope: crm',
    });

    it('тон destructive, оба бейджа destructive, ошибка Bitrix сохранена', () => {
        expect(view.tone).toBe('destructive');
        expect(view.availability).toEqual({
            label: STAGE_HISTORY_PROBE_TEXT.unavailable,
            tone: 'destructive',
        });
        expect(view.enough.tone).toBe('destructive');
        expect(view.error).toBe('Insufficient scope: crm');
    });

    it('пустые поля — «—», окно пробы всё равно показано', () => {
        expect(fieldValue(view, 'earliestAt')).toBe('—');
        expect(fieldValue(view, 'historyMonths')).toBe('—');
        expect(fieldValue(view, 'transitionsInWindow')).toBe('—');
        expect(fieldValue(view, 'windowMonths')).toBe('12 мес.');
    });
});
