import { describe, expect, it } from 'vitest';
import { EReportType, REPORT_TYPE_LABELS } from '../../consts/report-type.consts';
import {
    REPORT_NAV_CALL_REVIEWS,
    reportNavItems,
    reportTypeHref,
    type ReportNavItem,
} from '../report-nav';

const ALL_TYPES = Object.values(EReportType);
const WITHOUT_AI = ALL_TYPES.filter(type => type !== EReportType.AI);

/** Короткая запись ряда: тип вкладки или `calls`. */
const shape = (items: ReportNavItem[]): string[] =>
    items.map(item => (item.kind === 'type' ? item.type : item.kind));

describe('reportNavItems', () => {
    it('«Разборы звонков» стоит сразу после «AI аналитики»', () => {
        const items = reportNavItems(ALL_TYPES, true);
        const labels = items.map(item => item.label);
        const ai = labels.indexOf(REPORT_TYPE_LABELS[EReportType.AI]);
        expect(ai).toBeGreaterThanOrEqual(0);
        expect(labels[ai + 1]).toBe(REPORT_NAV_CALL_REVIEWS.label);
    });

    it('«AI аналитика» не последняя — раздел встаёт сразу за ней, а не в конец', () => {
        const available = [EReportType.All, EReportType.AI, EReportType.FINANCE];
        expect(shape(reportNavItems(available, true))).toEqual([
            EReportType.All,
            EReportType.AI,
            'calls',
            EReportType.FINANCE,
        ]);
    });

    it('без «AI аналитики» раздел — в конце ряда', () => {
        const items = reportNavItems(WITHOUT_AI, true);
        expect(shape(items)).toEqual([...WITHOUT_AI, 'calls']);
    });

    it('без права раздела нет, типы отчёта — по порядку', () => {
        const items = reportNavItems(ALL_TYPES, false);
        expect(shape(items)).toEqual(ALL_TYPES);
        expect(items.every(item => item.kind === 'type')).toBe(true);
    });

    it('подписи типов — из REPORT_TYPE_LABELS', () => {
        for (const item of reportNavItems(ALL_TYPES, true)) {
            if (item.kind === 'type') {
                expect(item.label).toBe(REPORT_TYPE_LABELS[item.type]);
            }
        }
    });

    it('раздел один, даже если типов отчёта нет', () => {
        expect(shape(reportNavItems([], true))).toEqual(['calls']);
        expect(reportNavItems([], false)).toEqual([]);
    });

    it('подпись раздела — по-русски, без кодов', () => {
        const calls = reportNavItems(ALL_TYPES, true).find(item => item.kind === 'calls');
        expect(calls?.label).toBe('Разборы звонков');
    });
});

describe('reportTypeHref', () => {
    it('ведёт на отчёт с вкладкой в ?tab=', () => {
        expect(reportTypeHref(EReportType.AI)).toBe('/report?tab=ai');
        expect(reportTypeHref(EReportType.All)).toBe('/report?tab=all');
        expect(reportTypeHref(EReportType.DIGEST)).toBe('/report?tab=digest');
    });

    it('для каждого типа значение ?tab= — сам тип', () => {
        for (const type of ALL_TYPES) {
            expect(reportTypeHref(type)).toBe(`/report?tab=${type}`);
        }
    });
});
