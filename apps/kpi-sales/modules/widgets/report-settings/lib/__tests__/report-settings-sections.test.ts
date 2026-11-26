import { describe, expect, it } from 'vitest';
import { REPORT_SETTINGS_TEXT } from '../../consts/report-settings.texts';
import {
    REPORT_SETTINGS_DEFAULT_SECTION,
    REPORT_SETTINGS_SECTIONS,
    isReportSettingsSection,
    reportSettingsNavItems,
} from '../report-settings-sections';

/*
 * Страница настроек разбита на разделы со списком слева. Раздел — экран
 * страницы: у каждого есть название, короткое пояснение для списка и описание
 * над содержимым.
 */

describe('разделы настроек', () => {
    it('при входе открыт первый раздел списка', () => {
        expect(REPORT_SETTINGS_DEFAULT_SECTION).toBe(REPORT_SETTINGS_SECTIONS[0]);
    });

    it('«Показатели» — третьим, после вкладок и бейджей', () => {
        expect([...REPORT_SETTINGS_SECTIONS]).toEqual(['report', 'calls', 'indicators']);
    });

    it('разделы не повторяются', () => {
        expect(new Set(REPORT_SETTINGS_SECTIONS).size).toBe(
            REPORT_SETTINGS_SECTIONS.length,
        );
    });

    it.each(REPORT_SETTINGS_SECTIONS)(
        'у раздела «%s» есть название, пояснение и описание',
        section => {
            const text = REPORT_SETTINGS_TEXT.sections[section];
            expect(text.title.trim()).not.toBe('');
            expect(text.nav.trim()).not.toBe('');
            expect(text.description.trim()).not.toBe('');
        },
    );
});

describe('reportSettingsNavItems — пункты списка разделов', () => {
    it('идут в порядке разделов, с названием и пояснением', () => {
        expect(reportSettingsNavItems()).toEqual(
            REPORT_SETTINGS_SECTIONS.map(section => ({
                code: section,
                label: REPORT_SETTINGS_TEXT.sections[section].title,
                description: REPORT_SETTINGS_TEXT.sections[section].nav,
            })),
        );
    });

    it('названия разделов разные — по ним ориентируются в списке', () => {
        const labels = reportSettingsNavItems().map(item => item.label);
        expect(new Set(labels).size).toBe(labels.length);
    });
});

describe('isReportSettingsSection — код раздела из списка', () => {
    it.each(REPORT_SETTINGS_SECTIONS)('«%s» — раздел', section => {
        expect(isReportSettingsSection(section)).toBe(true);
    });

    it.each(['', 'badges', 'REPORT', 'report '])('«%s» — не раздел', value => {
        expect(isReportSettingsSection(value)).toBe(false);
    });
});
