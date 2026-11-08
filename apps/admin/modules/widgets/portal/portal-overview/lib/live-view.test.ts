import { describe, expect, it } from 'vitest';
import {
    failureShare,
    formatCount,
    formatPeakHour,
    formatSeconds,
    liveWidgetsView,
} from './live-view';

const API = 'https://api.pbx.april-app.ru/api/bitrix-marketplace/placement';

describe('сводка портала: живые привязки виджетов', () => {
    const bindings = [
        { placement: 'CRM_DEAL_DETAIL_TAB', handler: `${API}/event-sales`, ours: true, widget: 'event-sales' },
        { placement: 'CRM_LEAD_DETAIL_TAB', handler: `${API}/event-sales`, ours: true, widget: 'event-sales' },
        { placement: 'CRM_DEAL_DETAIL_TAB', handler: `${API}/old-widget`, ours: true, widget: 'old-widget' },
        { placement: 'CRM_COMPANY_DETAIL_TAB', handler: 'https://old.vercel.app/h', ours: false, widget: null },
    ];

    it('где стоит каждый виджет из списка, лишние наши и привязки на чужой адрес', () => {
        const view = liveWidgetsView(['event-sales', 'konstructor'], bindings, { 'event-sales': 'Звонки (ОП)' });
        expect(view.rows).toEqual([
            { code: 'event-sales', title: 'Звонки (ОП)', places: ['CRM_DEAL_DETAIL_TAB', 'CRM_LEAD_DETAIL_TAB'] },
            { code: 'konstructor', title: 'konstructor', places: [] },
        ]);
        expect(view.extra.map(item => item.widget)).toEqual(['old-widget']);
        expect(view.foreign.map(item => item.placement)).toEqual(['CRM_COMPANY_DETAIL_TAB']);
    });

    it('пустой список портала — все наши привязки лишние', () => {
        const view = liveWidgetsView([], bindings.slice(0, 1), {});
        expect(view.rows).toEqual([]);
        expect(view.extra).toHaveLength(1);
    });
});

describe('сводка портала: нагрузка на Битрикс', () => {
    it('доля неудачных — ошибки и таймауты от всех вызовов, до десятых', () => {
        expect(failureShare({ total: 1000, errors: 12, timeouts: 3 })).toBe(1.5);
        expect(failureShare({ total: 0, errors: 0, timeouts: 0 })).toBeNull();
    });

    it('длительность: миллисекунды до секунды, дальше секунды с запятой', () => {
        expect(formatSeconds(0.12)).toBe('120 мс');
        expect(formatSeconds(2.345)).toBe('2,3 с');
        expect(formatSeconds(null)).toBe('—');
    });

    it('час пика — от часа до конца окна, по времени браузера', () => {
        const end = new Date(2026, 10, 8, 15, 0, 0).toISOString();
        expect(formatPeakHour(end)).toBe('14:00–15:00');
        expect(formatPeakHour('не дата')).toBe('—');
    });

    it('счётчики с разрядами', () => {
        expect(formatCount(12345).replace(/\s/g, ' ')).toBe('12 345');
    });
});
