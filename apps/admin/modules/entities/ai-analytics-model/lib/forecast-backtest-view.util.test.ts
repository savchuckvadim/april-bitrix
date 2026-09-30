import { describe, expect, it } from 'vitest';
import { plain } from './plain-text.test-helper';
import type { ModelForecastBacktest } from '../model';
import { toBacktestView } from './forecast-backtest-view.util';

const backtest = (patch: Partial<ModelForecastBacktest> = {}): ModelForecastBacktest => ({
    monthKey: '2026-08',
    generatedAt: '2026-09-02T01:00:00.000Z',
    status: 'fail',
    reasons: ['coverage-below', 'mase-naive'],
    shadowMonths: 2,
    shadowMinMonths: 3,
    months: 3,
    days: 62,
    coverageShare: 0.71,
    coverageCi90: [0.6, 0.8],
    coverageTarget: 0.8,
    maseNaive: 1.04,
    maseNaiveCi90: [0.9, 1.2],
    maseMean3: 0.87,
    maseMean3Ci90: null,
    maseMax: 1,
    pinballMean: 1.234,
    ...patch,
});

describe('toBacktestView: точность прогноза по месяцам', () => {
    it('строка месяца: статус, покрытие с интервалом, отношения ошибок', () => {
        const [row] = toBacktestView([backtest()]).rows;

        expect(row?.month).toBe('август 2026');
        expect(row?.status.label).toBe('Проверка не пройдена');
        expect(plain(row?.coverage ?? '')).toBe('71 % (60 % – 80 %)');
        expect(plain(row?.coverageTarget ?? '')).toBe('80 %');
        expect(row?.maseNaive).toBe('1,04 (0,90 – 1,20)');
        expect(row?.maseMean3).toBe('0,87');
        expect(row?.maseMax).toBe('1,00');
        expect(row?.shadow).toBe('2 из 3');
        expect(row?.volume).toBe('3 мес., 62 дня');
        expect(row?.reasons.map(reason => reason.label)).toEqual([
            'Факт попадает в вилку реже цели',
            'Ошибка не ниже, чем у прогноза «по темпу с начала месяца»',
        ]);
    });

    it('проверять не на чем — прочерки и «нет данных», а не нули', () => {
        const [row] = toBacktestView([
            backtest({
                status: 'insufficient',
                reasons: ['not-enough-months'],
                months: 0,
                days: 0,
                coverageShare: null,
                coverageCi90: null,
                coverageTarget: null,
                maseNaive: null,
                maseNaiveCi90: null,
                maseMean3: null,
                maseMax: null,
                pinballMean: null,
            }),
        ]).rows;

        expect(row?.status.label).toBe('Мало данных');
        expect(row?.coverage).toBe('—');
        expect(row?.maseNaive).toBe('—');
        expect(row?.volume).toBe('нет данных');
    });

    it('сводка — по свежей проверке (первой в списке)', () => {
        const view = toBacktestView([
            backtest({ monthKey: '2026-08', status: 'pass', reasons: [] }),
            backtest({ monthKey: '2026-07' }),
        ]);

        expect(view.rows).toHaveLength(2);
        expect(view.latest?.[0]).toMatchObject({
            label: 'Последняя проверка',
            value: 'август 2026: проверка пройдена',
            tone: 'success',
        });
        expect(view.latest?.[3]?.value).toBe('1,23');
    });

    it('пусто — сводки нет, строк нет', () => {
        expect(toBacktestView([])).toEqual({ latest: null, rows: [] });
    });
});
