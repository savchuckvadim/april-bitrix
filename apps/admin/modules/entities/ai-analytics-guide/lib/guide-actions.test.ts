import { describe, expect, it } from 'vitest';
import {
    buildActionPayload,
    currentMonthKey,
    defaultActionValues,
    GUIDE_ACTION_CODES,
    GUIDE_ACTIONS,
    isGuideActionCode,
    parseCsvNumbers,
    parseCsvStrings,
    parseOptionalInt,
} from './guide-actions';

const DOMAIN = 'gsr.bitrix24.ru';

describe('GUIDE_ACTIONS', () => {
    it('у каждого кода действия есть спецификация с методом и полями', () => {
        for (const code of GUIDE_ACTION_CODES) {
            const spec = GUIDE_ACTIONS[code];
            expect(spec.title.length).toBeGreaterThan(0);
            expect(['GET', 'POST']).toContain(spec.method);
            expect(Array.isArray(spec.fields)).toBe(true);
        }
        expect(isGuideActionCode('backfill')).toBe(true);
        expect(isGuideActionCode('nope')).toBe(false);
        expect(isGuideActionCode(null)).toBe(false);
    });

    it('внешние действия — только у ручек kpi-report-sales и event-sales', () => {
        const external = GUIDE_ACTION_CODES.filter(code => GUIDE_ACTIONS[code].external);
        expect(external.sort()).toEqual(['cache-reset', 'install-smart', 'push']);
    });
});

describe('defaultActionValues', () => {
    it('дефолты полей, чекбоксы — булевы, у cost — текущий месяц', () => {
        const now = new Date(2026, 9, 21);
        expect(defaultActionValues('recompute')).toMatchObject({
            rhythm: 'monthly',
            monthKey: '',
            steps: 'calls,stage-history,forecast-log-replay,forecast-backtest',
        });
        expect(defaultActionValues('reanalyze').dryRun).toBe(true);
        expect(defaultActionValues('cost', now).month).toBe('2026-10');
        expect(currentMonthKey(new Date(2026, 0, 5))).toBe('2026-01');
    });
});

describe('парсеры значений формы', () => {
    it('CSV строк и чисел, необязательное целое', () => {
        expect(parseCsvStrings(' calls, kpi ,, ')).toEqual(['calls', 'kpi']);
        expect(parseCsvNumbers('317, 448')).toEqual([317, 448]);
        expect(parseCsvNumbers('317, abc')).toBeNull();
        expect(parseCsvNumbers('')).toEqual([]);
        expect(parseOptionalInt('')).toBeUndefined();
        expect(parseOptionalInt('7')).toBe(7);
        expect(parseOptionalInt('7.5')).toBeNull();
    });
});

describe('buildActionPayload', () => {
    it('backfill: домен и месяцы, пустые steps не уходят', () => {
        expect(
            buildActionPayload('backfill', DOMAIN, { from: '2024-11', to: '2026-09', steps: '' }),
        ).toEqual({
            kind: 'admin',
            action: 'backfill',
            data: { domain: DOMAIN, from: '2024-11', to: '2026-09' },
        });
    });

    it('recompute: steps — массив кодов', () => {
        const payload = buildActionPayload('recompute', DOMAIN, {
            rhythm: 'monthly',
            monthKey: '2026-09',
            day: '',
            weekKey: '',
            steps: 'calls, forecast-backtest',
        });
        expect(payload).toEqual({
            kind: 'admin',
            action: 'recompute',
            data: {
                domain: DOMAIN,
                rhythm: 'monthly',
                monthKey: '2026-09',
                steps: ['calls', 'forecast-backtest'],
            },
        });
    });

    it('reanalyze: userIds — числа, quota — число, dryRun — флаг', () => {
        expect(
            buildActionPayload('reanalyze', DOMAIN, {
                from: '2026-07-21',
                to: '2026-10-21',
                userIds: '317',
                quota: '300',
                dryRun: true,
                timeZone: '',
            }),
        ).toEqual({
            kind: 'admin',
            action: 'reanalyze',
            data: {
                domain: DOMAIN,
                from: '2026-07-21',
                to: '2026-10-21',
                userIds: [317],
                quota: 300,
                dryRun: true,
            },
        });
    });

    it('обязательное поле пустое — русская ошибка до запроса', () => {
        expect(buildActionPayload('reanalyze-status', DOMAIN, { from: '', to: '2026-10-21' })).toBe(
            'Заполните поле «from (YYYY-MM-DD)»',
        );
        expect(buildActionPayload('etl-status', DOMAIN, { days: 'x' })).toContain(
            'ожидается целое число',
        );
        expect(
            buildActionPayload('reanalyze', DOMAIN, {
                from: '2026-07-21',
                to: '2026-10-21',
                userIds: '317, abc',
                dryRun: true,
            }),
        ).toContain('bitrix-id');
    });

    it('внешние действия дают тело для Swagger', () => {
        expect(
            buildActionPayload('cache-reset', DOMAIN, { requesterUserId: '447', scope: 'all' }),
        ).toEqual({
            kind: 'external',
            action: 'cache-reset',
            body: { domain: DOMAIN, requesterUserId: '447', scope: 'all' },
        });
        expect(
            buildActionPayload('push', DOMAIN, {
                requesterUserId: '447',
                kind: 'digest_all',
                date: '',
                recipients: '447',
            }),
        ).toEqual({
            kind: 'external',
            action: 'push',
            body: { domain: DOMAIN, requesterUserId: '447', kind: 'digest_all', recipients: [447] },
        });
        expect(buildActionPayload('install-smart', DOMAIN, {})).toEqual({
            kind: 'external',
            action: 'install-smart',
            body: { domain: DOMAIN },
        });
    });
});
