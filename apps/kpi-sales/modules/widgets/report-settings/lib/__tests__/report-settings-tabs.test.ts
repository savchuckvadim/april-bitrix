import { describe, expect, it } from 'vitest';
import type { PortalViewTabOption } from '@/modules/feature/portal-view';
import {
    commonReportTabs,
    lockedReportTabCode,
    quotedTabNames,
} from '../report-settings-tabs';

const TABS: PortalViewTabOption[] = [
    { code: 'all', name: 'Все', common: true },
    { code: 'events', name: 'События', common: true },
    { code: 'callings', name: 'Звонки', common: true },
    { code: 'merged', name: 'Объединённый отчёт', common: true },
    { code: 'digest', name: 'Дайджест', common: true },
    { code: 'finance', name: 'Финансы', common: false },
    { code: 'ai', name: 'AI аналитика', common: false },
];

describe('commonReportTabs — вкладки, которые видят все сотрудники', () => {
    it('только отмеченные бэком, порядок сохраняется', () => {
        expect(commonReportTabs(TABS).map(tab => tab.code)).toEqual([
            'all',
            'events',
            'callings',
            'merged',
            'digest',
        ]);
    });

    it('бэк не отметил ни одной — пусто', () => {
        const plain = TABS.map(tab => ({ ...tab, common: false }));
        expect(commonReportTabs(plain)).toEqual([]);
    });
});

describe('lockedReportTabCode — последнюю общую вкладку не выключить', () => {
    it('видимых несколько — блокировать нечего', () => {
        expect(lockedReportTabCode(TABS, [])).toBeNull();
        expect(lockedReportTabCode(TABS, ['all', 'events', 'callings'])).toBeNull();
    });

    it('видима одна — заблокирована она', () => {
        expect(lockedReportTabCode(TABS, ['all', 'events', 'callings', 'merged'])).toBe(
            'digest',
        );
        expect(lockedReportTabCode(TABS, ['events', 'callings', 'merged', 'digest', 'ai'])).toBe(
            'all',
        );
    });

    it('скрытые вкладки «по правам» на блокировку не влияют', () => {
        expect(lockedReportTabCode(TABS, ['finance', 'ai'])).toBeNull();
    });

    it('скрыты все общие вкладки (чужая настройка) — блокировать нечего', () => {
        expect(
            lockedReportTabCode(TABS, ['all', 'events', 'callings', 'merged', 'digest']),
        ).toBeNull();
    });

    it('бэк не отметил вкладки (старая версия) — блокировки нет', () => {
        const plain = TABS.map(tab => ({ ...tab, common: false }));
        expect(lockedReportTabCode(plain, ['all', 'events', 'callings', 'merged'])).toBeNull();
    });
});

describe('quotedTabNames', () => {
    it('названия в кавычках через запятую', () => {
        expect(quotedTabNames(commonReportTabs(TABS))).toBe(
            '«Все», «События», «Звонки», «Объединённый отчёт», «Дайджест»',
        );
    });

    it('пустой список — пустая строка', () => {
        expect(quotedTabNames([])).toBe('');
    });
});
