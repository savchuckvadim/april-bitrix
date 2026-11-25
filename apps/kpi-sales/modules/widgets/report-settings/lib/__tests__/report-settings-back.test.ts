import { describe, expect, it } from 'vitest';
import { CALLS_LIST_PATH } from '@/modules/entities/calls-list/lib/calls-list.const';
import { REPORT_PAGE_PATH } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import { REPORT_SETTINGS_TEXT } from '../../consts/report-settings.texts';
import {
    canStepBackInHistory,
    reportSettingsBackTarget,
} from '../report-settings-back';

/*
 * Стрелка «назад» в шапке настроек возвращает туда, откуда настройки открыли.
 * Шаг по истории окна — только когда пришли кнопкой приложения: иначе он увёл
 * бы из приложения или не сделал бы ничего.
 */

const T = REPORT_SETTINGS_TEXT.back;

describe('reportSettingsBackTarget — куда возвращает стрелка', () => {
    it('открыли из отчёта — в отчёт', () => {
        expect(reportSettingsBackTarget('report')).toEqual({
            path: REPORT_PAGE_PATH,
            hint: T.toReport,
        });
    });

    it('открыли из «Разборов звонков» — в разборы', () => {
        expect(reportSettingsBackTarget('calls')).toEqual({
            path: CALLS_LIST_PATH,
            hint: T.toCalls,
        });
    });

    it('страницу открыли напрямую (пометки нет) — в отчёт', () => {
        expect(reportSettingsBackTarget(null)).toEqual({
            path: REPORT_PAGE_PATH,
            hint: T.toReport,
        });
    });
});

describe('canStepBackInHistory — шаг назад по истории окна', () => {
    it.each(['report', 'calls'] as const)(
        'пришли кнопкой приложения (%s), в истории есть предыдущая запись — шаг назад',
        from => {
            expect(canStepBackInHistory(from, 2)).toBe(true);
        },
    );

    it('пометки нет — по адресу страницы, даже когда история есть', () => {
        expect(canStepBackInHistory(null, 7)).toBe(false);
    });

    it('страница открыта в новом окне (истории нет) — по адресу страницы', () => {
        expect(canStepBackInHistory('calls', 1)).toBe(false);
    });
});
