import { describe, expect, it } from 'vitest';
import type { CalculationInfo } from '@/modules/shared/lib/calculation-info/calculation-info';
import { resolveCalculatedAt } from '../calculation-notice.util';

/*
 * Что показать в шапке о расчёте: дата — только у нужного вкладке источника
 * с закрытым периодом; из двух таких источников берётся более ранняя дата.
 */

const EARLY = '2026-11-10T08:00:00.000Z';
const LATE = '2026-11-12T07:40:00.000Z';

const closed = (generatedAt: string): CalculationInfo => ({
    generatedAt,
    closedPeriod: true,
});

const BOTH = { events: true, callings: true };
const NONE = { events: false, callings: false };
const EVENTS_ONLY = { events: true, callings: false };
const CALLINGS_ONLY = { events: false, callings: true };

describe('resolveCalculatedAt — когда строки нет', () => {
    it('у обоих источников нет сведений (старый сервер): null', () => {
        expect(
            resolveCalculatedAt({ events: null, callings: null }, BOTH),
        ).toBeNull();
    });

    it('период открытый: закрытым не помечен, даже с датой — null', () => {
        expect(
            resolveCalculatedAt(
                {
                    events: { generatedAt: LATE, closedPeriod: false },
                    callings: { generatedAt: LATE, closedPeriod: false },
                },
                BOTH,
            ),
        ).toBeNull();
    });

    it('признак закрытого периода есть, даты нет — null', () => {
        expect(
            resolveCalculatedAt(
                { events: { closedPeriod: true }, callings: null },
                BOTH,
            ),
        ).toBeNull();
    });

    it('дата есть, признака закрытого периода нет — null', () => {
        expect(
            resolveCalculatedAt(
                { events: { generatedAt: LATE }, callings: null },
                BOTH,
            ),
        ).toBeNull();
    });

    it('дата не разбирается — источник пропускается', () => {
        expect(
            resolveCalculatedAt(
                { events: closed('не дата'), callings: null },
                BOTH,
            ),
        ).toBeNull();
    });

    it('вкладке источники не нужны («Дайджест», «Финансы», «AI аналитика»): null, даже если сведения есть', () => {
        expect(
            resolveCalculatedAt(
                { events: closed(LATE), callings: closed(LATE) },
                NONE,
            ),
        ).toBeNull();
    });

    it('нужен только источник без сведений: чужие сведения не учитываются', () => {
        expect(
            resolveCalculatedAt(
                { events: null, callings: closed(LATE) },
                EVENTS_ONLY,
            ),
        ).toBeNull();
        expect(
            resolveCalculatedAt(
                { events: closed(LATE), callings: null },
                CALLINGS_ONLY,
            ),
        ).toBeNull();
    });
});

describe('resolveCalculatedAt — когда строка есть', () => {
    it('закрыт только источник событий — его дата', () => {
        expect(
            resolveCalculatedAt(
                { events: closed(LATE), callings: null },
                BOTH,
            ),
        ).toBe(LATE);
    });

    it('закрыт только источник звонков — его дата', () => {
        expect(
            resolveCalculatedAt(
                { events: null, callings: closed(LATE) },
                BOTH,
            ),
        ).toBe(LATE);
    });

    it('один источник закрыт, другой открыт — дата закрытого', () => {
        expect(
            resolveCalculatedAt(
                {
                    events: closed(LATE),
                    callings: { generatedAt: EARLY, closedPeriod: false },
                },
                BOTH,
            ),
        ).toBe(LATE);
    });

    it('закрыты оба: берётся более ранняя дата, события раньше', () => {
        expect(
            resolveCalculatedAt(
                { events: closed(EARLY), callings: closed(LATE) },
                BOTH,
            ),
        ).toBe(EARLY);
    });

    it('закрыты оба: берётся более ранняя дата, звонки раньше', () => {
        expect(
            resolveCalculatedAt(
                { events: closed(LATE), callings: closed(EARLY) },
                BOTH,
            ),
        ).toBe(EARLY);
    });

    it('даты сравниваются по времени, а не по строке (разные пояса записи)', () => {
        // 10:00 в +03:00 — это 07:00 UTC, раньше, чем 08:00 UTC.
        const earlier = '2026-11-12T10:00:00+03:00';
        const later = '2026-11-12T08:00:00.000Z';
        expect(
            resolveCalculatedAt(
                { events: closed(later), callings: closed(earlier) },
                BOTH,
            ),
        ).toBe(earlier);
    });

    it('вкладке нужны только события: дата событий, звонки не учитываются', () => {
        expect(
            resolveCalculatedAt(
                { events: closed(LATE), callings: closed(EARLY) },
                EVENTS_ONLY,
            ),
        ).toBe(LATE);
    });

    it('вкладке нужны только звонки: дата звонков, события не учитываются', () => {
        expect(
            resolveCalculatedAt(
                { events: closed(EARLY), callings: closed(LATE) },
                CALLINGS_ONLY,
            ),
        ).toBe(LATE);
    });

    it('один источник с корректной датой, другой с битой: дата корректного', () => {
        expect(
            resolveCalculatedAt(
                { events: closed('не дата'), callings: closed(LATE) },
                BOTH,
            ),
        ).toBe(LATE);
    });
});
