import { describe, expect, it } from 'vitest';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import {
    ACTIONS_FILTER_TABS,
    isActionsFilterVisibleOnTab,
} from '../report-filter-sections.util';

/*
 * Раздел «Действия» панели главного фильтра показывается только на вкладках,
 * где выбор действий работает. Таблица — решение владельца.
 */

describe('isActionsFilterVisibleOnTab', () => {
    it.each([EReportType.All, EReportType.EVENTS, EReportType.MERGED])(
        'вкладка «%s»: раздел «Действия» показывается',
        type => {
            expect(isActionsFilterVisibleOnTab(type)).toBe(true);
        },
    );

    it.each([
        EReportType.CALLINGS,
        EReportType.DIGEST,
        EReportType.FINANCE,
        EReportType.AI,
    ])('вкладка «%s»: раздел «Действия» скрыт', type => {
        expect(isActionsFilterVisibleOnTab(type)).toBe(false);
    });

    it('правило описывает все вкладки, и только их', () => {
        expect(Object.keys(ACTIONS_FILTER_TABS).sort()).toEqual(
            Object.values(EReportType).sort(),
        );
    });
});
