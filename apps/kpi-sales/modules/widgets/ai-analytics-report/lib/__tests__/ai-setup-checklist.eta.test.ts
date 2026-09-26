import { describe, expect, it } from 'vitest';
import {
    aiAddDaysIso,
    aiAddMonthsIso,
    aiNextMonthDay,
    aiRoughEta,
    aiScheduledEta,
    aiWeeksSince,
} from '../ai-setup-checklist.eta';

describe('aiNextMonthDay — ближайший слот расписания', () => {
    it('число ещё впереди — в этом месяце, прошло или сегодня — в следующем', () => {
        expect(aiNextMonthDay('2026-09-02', 3)).toBe('2026-09-03');
        expect(aiNextMonthDay('2026-09-03', 3)).toBe('2026-10-03');
        expect(aiNextMonthDay('2026-09-26', 3)).toBe('2026-10-03');
        expect(aiNextMonthDay('2026-09-26', 1)).toBe('2026-10-01');
    });

    it('переход через год и битая дата', () => {
        expect(aiNextMonthDay('2026-12-15', 1)).toBe('2027-01-01');
        expect(aiNextMonthDay('не дата', 1)).toBeNull();
    });
});

describe('сдвиги дат', () => {
    it('aiAddDaysIso / aiAddMonthsIso (30,44 дня в месяце, вверх)', () => {
        expect(aiAddDaysIso('2026-09-25', 31)).toBe('2026-10-26');
        expect(aiAddMonthsIso('2026-09-26', 1)).toBe('2026-10-27');
        expect(aiAddMonthsIso('2026-09-26', 0)).toBe('2026-09-26');
        expect(aiAddMonthsIso('2026-09-26', -1)).toBeNull();
        expect(aiAddMonthsIso('2026-09-26', Number.NaN)).toBeNull();
    });

    it('aiWeeksSince — полные недели, не меньше 0', () => {
        expect(aiWeeksSince('2026-09-01', '2026-09-26')).toBe(3);
        expect(aiWeeksSince('2026-09-26', '2026-09-26')).toBe(0);
        expect(aiWeeksSince('2026-10-01', '2026-09-26')).toBe(0);
        expect(aiWeeksSince('', '2026-09-26')).toBeNull();
    });
});

describe('обёртки срока', () => {
    it('расписание — с временем, оценка — rough без времени', () => {
        expect(aiScheduledEta('2026-10-03', '04:00')).toEqual({
            date: '2026-10-03',
            rough: false,
            time: '04:00',
        });
        expect(aiRoughEta('2026-11-01')).toEqual({
            date: '2026-11-01',
            rough: true,
            time: null,
        });
        expect(aiScheduledEta(null, '04:00')).toBeNull();
        expect(aiRoughEta(null)).toBeNull();
    });
});
