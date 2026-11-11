import { describe, expect, it } from 'vitest';
import { VENDOR_SOURCE_LABELS, vendorSourceLabel } from './index';

describe('vendorSourceLabel: что действует у настройки', () => {
    it('значение по умолчанию — подпись с самим значением, а не «не задано»', () => {
        expect(
            vendorSourceLabel({ source: 'default', defaultValue: '180000' }),
        ).toBe('действует значение по умолчанию: 180000');
    });

    it('остальные источники — подпись как есть', () => {
        expect(vendorSourceLabel({ source: 'admin', defaultValue: '6' })).toBe(
            VENDOR_SOURCE_LABELS.admin.label,
        );
        expect(vendorSourceLabel({ source: 'none', defaultValue: null })).toBe(
            'не задано нигде',
        );
    });

    it('значение по умолчанию — спокойный тон, не красный', () => {
        expect(VENDOR_SOURCE_LABELS.default.tone).toBe('muted');
    });
});
