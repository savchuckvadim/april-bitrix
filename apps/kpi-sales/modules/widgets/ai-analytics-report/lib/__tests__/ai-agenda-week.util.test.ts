import { describe, expect, it } from 'vitest';
import {
    AI_AGENDA_TEXT,
    aiAgendaDescription,
    aiAgendaPrevWeekRange,
    aiIsoWeekMonday,
} from '../ai-agenda-week.util';

const day = (date: Date | null) => date?.toISOString().slice(0, 10) ?? null;

describe('неделя повестки планёрки', () => {
    it('понедельник ISO-недели, включая 53-ю и переход года', () => {
        expect(day(aiIsoWeekMonday('2026-W39'))).toBe('2026-09-21');
        expect(day(aiIsoWeekMonday('2026-W01'))).toBe('2025-12-29');
        expect(day(aiIsoWeekMonday('2026-W53'))).toBe('2026-12-28');
        expect(day(aiIsoWeekMonday('2027-W01'))).toBe('2027-01-04');
    });

    it('битый ключ или номер вне года — null', () => {
        expect(aiIsoWeekMonday('2025-W53')).toBeNull();
        expect(aiIsoWeekMonday('2026-W00')).toBeNull();
        expect(aiIsoWeekMonday('2026-39')).toBeNull();
        expect(aiIsoWeekMonday('')).toBeNull();
    });

    it('звонки — прошлая неделя: weekKey − 1 неделя, пн–вс', () => {
        expect(aiAgendaPrevWeekRange('2026-W39')).toBe('14.09–20.09');
        expect(aiAgendaPrevWeekRange('2027-W01')).toBe('28.12–03.01');
        expect(aiAgendaPrevWeekRange('неделя')).toBeNull();
    });

    it('подпись карточки без сырого YYYY-Www', () => {
        expect(aiAgendaDescription('2026-W39')).toBe(
            'Звонки прошлой недели (14.09–20.09) для планёрки',
        );
        expect(aiAgendaDescription('2026-W39')).not.toContain('W39');
        expect(aiAgendaDescription('битый')).toBe(
            AI_AGENDA_TEXT.descriptionNoRange,
        );
        expect(aiAgendaDescription(null)).toBe(
            AI_AGENDA_TEXT.descriptionNoRange,
        );
    });
});
