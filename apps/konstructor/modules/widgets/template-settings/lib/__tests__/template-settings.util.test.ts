import { describe, expect, it } from 'vitest';
import {
    TEMPLATE_SETTINGS_TABS,
    toSettingsTab,
} from '../template-settings.util';

describe('template-settings.util', () => {
    it('два раздела: шаблоны КП и шаблоны счетов', () => {
        expect(TEMPLATE_SETTINGS_TABS.map(tab => tab.label)).toEqual([
            'Шаблоны КП',
            'Шаблоны счетов',
        ]);
    });

    it('раздел по значению переключателя', () => {
        expect(toSettingsTab('invoice')).toBe('invoice');
        expect(toSettingsTab('offer')).toBe('offer');
    });

    it('незнакомое значение открывает КП', () => {
        expect(toSettingsTab('')).toBe('offer');
        expect(toSettingsTab('contract')).toBe('offer');
    });
});
