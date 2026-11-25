import { describe, expect, it } from 'vitest';
import { REPORT_SETTINGS_PATH } from '../consts/portal-view.consts';
import {
    REPORT_SETTINGS_FROM,
    REPORT_SETTINGS_FROM_PARAM,
    parseReportSettingsFrom,
    reportSettingsHref,
} from '../lib/report-settings-nav';

/*
 * Настройки отчёта открывают из отчёта и из «Разборов звонков»: в адресе
 * остаётся пометка, откуда пришли, — по ней стрелка «назад» в шапке настроек
 * знает, куда вернуть.
 */

describe('reportSettingsHref — адрес настроек с пометкой «откуда»', () => {
    it('из отчёта', () => {
        expect(reportSettingsHref('report')).toBe('/settings?from=report');
    });

    it('из «Разборов звонков»', () => {
        expect(reportSettingsHref('calls')).toBe('/settings?from=calls');
    });

    it.each(REPORT_SETTINGS_FROM)(
        'путь страницы прежний (%s): каркас страницы выбирается по пути',
        from => {
            const [path] = reportSettingsHref(from).split('?');
            expect(path).toBe(REPORT_SETTINGS_PATH);
        },
    );
});

describe('parseReportSettingsFrom — пометка из адреса', () => {
    it.each(REPORT_SETTINGS_FROM)('знакомая пометка «%s» читается', from => {
        expect(parseReportSettingsFrom(from)).toBe(from);
    });

    it.each([null, undefined, '', 'CALLS', 'calls ', '/calls', 'share'])(
        'пустая или незнакомая (%j) — null',
        value => {
            expect(parseReportSettingsFrom(value)).toBeNull();
        },
    );

    it.each(REPORT_SETTINGS_FROM)(
        'пометка из собранного адреса (%s) читается обратно',
        from => {
            const url = new URL(reportSettingsHref(from), 'https://portal.test');
            expect(
                parseReportSettingsFrom(
                    url.searchParams.get(REPORT_SETTINGS_FROM_PARAM),
                ),
            ).toBe(from);
        },
    );
});
