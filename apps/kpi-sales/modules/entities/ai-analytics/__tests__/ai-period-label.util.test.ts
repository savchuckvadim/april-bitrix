import { describe, expect, it } from 'vitest';
import {
    AI_DATE_EMPTY,
    AI_PERIOD_UNKNOWN,
    aiIsoWeekMonday,
    aiIsoWeekMondayUtc,
    aiIsoWeekRange,
    formatAiFullDate,
    formatAiMonthKey,
    formatAiMonthKeyGenitive,
    formatAiMonthLabel,
    formatAiMonthLabelRange,
    formatAiMonthRange,
    formatAiPeriodKey,
    formatAiWeekKey,
} from '../lib/ai-period-label.util';

const day = (date: Date | null) => date?.toISOString().slice(0, 10);

describe('formatAiFullDate — день', () => {
    it('полная дата, ISO-момент; пусто и мусор — прочерк', () => {
        expect(formatAiFullDate('2026-09-07')).toBe('07.09.2026');
        expect(formatAiFullDate('2026-09-07T10:00:00Z')).toBe('07.09.2026');
        expect(formatAiFullDate('')).toBe('—');
        expect(formatAiFullDate(null)).toBe('—');
        expect(formatAiFullDate(undefined)).toBe('—');
        expect(formatAiFullDate('garbage')).toBe(AI_DATE_EMPTY);
        expect(AI_DATE_EMPTY).toBe(AI_PERIOD_UNKNOWN);
    });
});

describe('formatAiMonthLabel — месяц словами', () => {
    it('именительный с годом, родительный после «против», без года', () => {
        expect(formatAiMonthLabel('2026-09')).toBe('сентябрь 2026');
        expect(formatAiMonthLabel('2025-09', { genitive: true })).toBe(
            'сентября 2025',
        );
        expect(formatAiMonthLabel('2026-01', { withoutYear: true })).toBe(
            'январь',
        );
    });

    it('битый ключ или месяц вне 1–12 — прочерк', () => {
        expect(formatAiMonthLabel('2026-13')).toBe(AI_PERIOD_UNKNOWN);
        expect(formatAiMonthLabel('garbage')).toBe(AI_PERIOD_UNKNOWN);
        expect(formatAiMonthLabel('2026-W38')).toBe(AI_PERIOD_UNKNOWN);
    });

    it('ключ, который может не прийти: null и пусто — прочерк', () => {
        expect(formatAiMonthKey('2026-09')).toBe('сентябрь 2026');
        expect(formatAiMonthKey('2026-01')).toBe('январь 2026');
        expect(formatAiMonthKey('2026-13')).toBe('—');
        expect(formatAiMonthKey(null)).toBe('—');
        expect(formatAiMonthKey(undefined)).toBe('—');
        expect(formatAiMonthKeyGenitive('2025-09')).toBe('сентября 2025');
        expect(formatAiMonthKeyGenitive('bad')).toBe('—');
        expect(formatAiMonthKeyGenitive(null)).toBe('—');
    });
});

describe('диапазоны месяцев', () => {
    it('один год — год один раз в конце; разные годы — у обоих', () => {
        expect(formatAiMonthLabelRange('2026-06', '2026-08')).toBe(
            'июнь – август 2026',
        );
        expect(formatAiMonthLabelRange('2025-11', '2026-01')).toBe(
            'ноябрь 2025 – январь 2026',
        );
    });

    it('битая граница — прочерк', () => {
        expect(formatAiMonthLabelRange('2026-06', 'x')).toBe(AI_PERIOD_UNKNOWN);
    });

    it('окно месяцев списком: тот же вид, один месяц — он сам, пусто — прочерк', () => {
        expect(formatAiMonthRange(['2026-07', '2026-08', '2026-09'])).toBe(
            'июль – сентябрь 2026',
        );
        expect(formatAiMonthRange(['2025-12', '2026-01'])).toBe(
            'декабрь 2025 – январь 2026',
        );
        expect(formatAiMonthRange(['2026-09'])).toBe('сентябрь 2026');
        expect(formatAiMonthRange([])).toBe('—');
    });
});

describe('ISO-неделя датами', () => {
    it('понедельник ISO-недели: первая, обычная, переход года; прежнее имя — тот же расчёт', () => {
        expect(day(aiIsoWeekMondayUtc('2026-W01'))).toBe('2025-12-29');
        expect(day(aiIsoWeekMondayUtc('2026-W39'))).toBe('2026-09-21');
        expect(day(aiIsoWeekMondayUtc('2020-W53'))).toBe('2020-12-28');
        expect(aiIsoWeekMonday).toBe(aiIsoWeekMondayUtc);
        expect(aiIsoWeekMonday('2026-W54')).toBeNull();
        expect(aiIsoWeekMonday('2026-09')).toBeNull();
    });

    it('«2026-W31» → «27.07–02.08», «2026-W36» → «31.08–06.09»', () => {
        expect(aiIsoWeekRange('2026-W31')).toBe('27.07–02.08');
        expect(aiIsoWeekRange('2026-W36')).toBe('31.08–06.09');
        expect(aiIsoWeekRange('2026-W01')).toBe('29.12–04.01');
    });

    it('сдвиг недели: −1 — неделя перед указанной (повестка планёрки)', () => {
        expect(aiIsoWeekRange('2026-W39', -1)).toBe('14.09–20.09');
        expect(aiIsoWeekRange('2027-W01', -1)).toBe('28.12–03.01');
        expect(aiIsoWeekRange('2026-W39', 1)).toBe('28.09–04.10');
    });

    it('битый ключ или номер вне года — null (в 2026 году 53 недели, в 2025 — 52)', () => {
        expect(aiIsoWeekRange('2026-W00')).toBeNull();
        expect(aiIsoWeekRange('2026-W53')).toBe('28.12–03.01');
        expect(aiIsoWeekRange('2025-W53')).toBeNull();
        expect(aiIsoWeekRange('2026-09')).toBeNull();
        expect(aiIsoWeekRange('')).toBeNull();
    });

    it('неделя и ключ точки ряда с прочерком вместо null', () => {
        expect(formatAiWeekKey('2026-W39')).toBe('21.09–27.09');
        expect(formatAiWeekKey('nope')).toBe('—');
        expect(formatAiPeriodKey('2026-W39')).toBe('21.09–27.09');
        expect(formatAiPeriodKey('2026-09')).toBe('сентябрь 2026');
        expect(formatAiPeriodKey('2026')).toBe('—');
    });
});
