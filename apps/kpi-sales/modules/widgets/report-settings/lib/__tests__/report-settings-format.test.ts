import { describe, expect, it } from 'vitest';
import type { PortalViewSettings } from '@/modules/feature/portal-view';
import { formatSettingsDate, lastChangeText } from '../report-settings-format';

const view = (patch: Partial<PortalViewSettings> = {}): PortalViewSettings => ({
    tabsHidden: [],
    chartsEnabled: true,
    badgesMain: [],
    labels: {},
    plansEvents: false,
    plansMerged: false,
    plansCallings: false,
    planColumnsHidden: [],
    updatedBy: null,
    updatedAt: null,
    ...patch,
});

/** ISO момента, заданного по ЛОКАЛЬНОМУ времени: тест не зависит от пояса машины. */
const localIso = (year: number, month: number, day: number, hour: number, minute: number) =>
    new Date(year, month - 1, day, hour, minute).toISOString();

describe('formatSettingsDate — «dd.MM.yyyy HH:mm»', () => {
    it('двузначные день, месяц, часы и минуты', () => {
        expect(formatSettingsDate(localIso(2026, 11, 5, 9, 7))).toBe('05.11.2026 09:07');
        expect(formatSettingsDate(localIso(2026, 1, 31, 23, 59))).toBe('31.01.2026 23:59');
    });

    it('полночь', () => {
        expect(formatSettingsDate(localIso(2026, 12, 1, 0, 0))).toBe('01.12.2026 00:00');
    });

    it('нет даты или она не разбирается — пустая строка', () => {
        expect(formatSettingsDate(null)).toBe('');
        expect(formatSettingsDate('')).toBe('');
        expect(formatSettingsDate('не дата')).toBe('');
    });
});

describe('lastChangeText — «Последнее изменение: …»', () => {
    it('кто и когда', () => {
        const text = lastChangeText(
            view({ updatedBy: 'Иванов Иван', updatedAt: localIso(2026, 11, 20, 12, 30) }),
        );
        expect(text).toBe('Последнее изменение: Иванов Иван, 20.11.2026 12:30');
    });

    it('только кто', () => {
        expect(lastChangeText(view({ updatedBy: 'Иванов Иван' }))).toBe(
            'Последнее изменение: Иванов Иван',
        );
    });

    it('только когда', () => {
        expect(lastChangeText(view({ updatedAt: localIso(2026, 11, 20, 8, 5) }))).toBe(
            'Последнее изменение: 20.11.2026 08:05',
        );
    });

    it('настройки не менялись — строки нет', () => {
        expect(lastChangeText(view())).toBeNull();
    });

    it('битая дата без автора — строки нет', () => {
        expect(lastChangeText(view({ updatedAt: 'не дата' }))).toBeNull();
    });
});
