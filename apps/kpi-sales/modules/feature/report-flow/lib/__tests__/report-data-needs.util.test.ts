import { describe, expect, it } from 'vitest';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import {
    getReportDataNeeds,
    REPORT_DATA_NEEDS,
} from '../report-data-needs.util';

/*
 * Карта нужд вкладки отчёта: что запрашивать и что блокирует страницу.
 * Таблица — решение владельца («запросы только для своей вкладки»).
 */

describe('getReportDataNeeds', () => {
    it.each([
        [EReportType.All, 'report'],
        [EReportType.EVENTS, 'report'],
        [EReportType.MERGED, 'report'],
        [EReportType.CALLINGS, 'calling'],
    ] as const)(
        'вкладка отчёта «%s»: события и звонки нужны, страницу блокирует «%s»',
        (type, blocking) => {
            expect(getReportDataNeeds(type)).toEqual({
                events: true,
                callings: true,
                blocking,
            });
        },
    );

    it.each([EReportType.DIGEST, EReportType.FINANCE, EReportType.AI])(
        'вкладка «%s»: события и звонки не нужны, страницу ничто не блокирует',
        type => {
            expect(getReportDataNeeds(type)).toEqual({
                events: false,
                callings: false,
                blocking: null,
            });
        },
    );

    it('карта описывает все вкладки, и только их', () => {
        expect(Object.keys(REPORT_DATA_NEEDS).sort()).toEqual(
            Object.values(EReportType).sort(),
        );
    });

    it('блокирует страницу только нужный вкладке источник', () => {
        for (const type of Object.values(EReportType)) {
            const { events, callings, blocking } = getReportDataNeeds(type);
            if (blocking === 'report') expect(events).toBe(true);
            if (blocking === 'calling') expect(callings).toBe(true);
        }
    });
});
