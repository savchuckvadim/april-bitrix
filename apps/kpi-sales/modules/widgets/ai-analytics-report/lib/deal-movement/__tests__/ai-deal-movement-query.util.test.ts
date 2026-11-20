import { describe, expect, it } from 'vitest';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { clampAiPeriod } from '@/modules/entities/ai-analytics';
import {
    aiDmLoadError,
    aiDmManagerIdsOfKey,
    aiDmOverviewQuery,
    aiDmPeriod,
    aiDmScopeManagerKey,
} from '../ai-deal-movement-query.util';

const days = (period: { from: string; to: string }): number =>
    differenceInCalendarDays(parseISO(period.to), parseISO(period.from)) + 1;

describe('ai-deal-movement-query — период и тело обзора', () => {
    it('период не длиннее 92 дней: начало подтягивается к концу', () => {
        expect(aiDmPeriod('2026-11-01', '2026-11-20')).toEqual({
            from: '2026-11-01',
            to: '2026-11-20',
        });
        const long = aiDmPeriod('2026-01-01', '2026-11-20');
        expect(long?.to).toBe('2026-11-20');
        expect(long && days(long)).toBe(92);
    });

    it('битые даты и начало позже конца — запрос не шлём', () => {
        expect(aiDmPeriod('nope', '2026-11-20')).toBeNull();
        expect(aiDmPeriod('2026-11-21', '2026-11-20')).toBeNull();
    });

    it('период витрины (три месяца) всегда укладывается в 92 дня', () => {
        for (const to of ['2026-05-31', '2026-08-31', '2026-10-31', '2026-12-31', '2027-01-31']) {
            const period = clampAiPeriod('2025-01-01', to);
            expect(period).not.toBeNull();
            if (!period) continue;
            expect(aiDmPeriod(period.from, period.to)?.from).toBe(period.from);
        }
    });

    it('менеджеры фильтра: строкой туда и обратно, пусто — все', () => {
        expect(aiDmScopeManagerKey({ managerIds: [447, 512] })).toBe('447,512');
        expect(aiDmScopeManagerKey(null)).toBe('');
        expect(aiDmManagerIdsOfKey('447,512')).toEqual(['447', '512']);
        expect(aiDmManagerIdsOfKey('')).toEqual([]);
    });

    it('тело обзора: период и менеджеры; без дат — null', () => {
        expect(aiDmOverviewQuery('2026-11-01', '2026-11-20', [])).toEqual({
            from: '2026-11-01',
            to: '2026-11-20',
        });
        expect(aiDmOverviewQuery('2026-11-01', '2026-11-20', ['447'])).toEqual({
            from: '2026-11-01',
            to: '2026-11-20',
            managerIds: ['447'],
        });
        expect(aiDmOverviewQuery(null, '2026-11-20', [])).toBeNull();
    });
});

describe('ai-deal-movement-query — ошибки ручек', () => {
    const httpError = (status: number, message?: string) => ({
        response: { status, data: message ? { resultCode: 1, message } : {} },
    });

    it('403 — «Раздел доступен руководителям», повтор не предлагаем', () => {
        expect(aiDmLoadError(httpError(403))).toEqual({
            error: 'Раздел доступен руководителям',
            forbidden: true,
        });
    });

    it('понятный текст сервера — как есть, служебный — запасной', () => {
        expect(aiDmLoadError(httpError(400, 'Период — не длиннее 92 дней'))).toEqual({
            error: 'Период — не длиннее 92 дней',
            forbidden: false,
        });
        expect(aiDmLoadError(new Error('Network Error'))).toEqual({
            error: 'Не удалось получить движение сделок — попробуйте ещё раз',
            forbidden: false,
        });
    });
});
