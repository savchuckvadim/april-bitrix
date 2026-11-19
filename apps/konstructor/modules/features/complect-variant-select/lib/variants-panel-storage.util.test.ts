import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    readVariantsPanelOpen,
    storeVariantsPanelOpen,
} from './variants-panel-storage.util';

const memoryStorage = () => {
    const data = new Map<string, string>();
    return {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
    };
};

describe('запоминание раскрытия панели вариантов', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('по умолчанию панель свёрнута', () => {
        vi.stubGlobal('localStorage', memoryStorage());
        expect(readVariantsPanelOpen()).toBe(false);
    });

    it('раскрытое состояние запоминается и сворачивается обратно', () => {
        vi.stubGlobal('localStorage', memoryStorage());
        storeVariantsPanelOpen(true);
        expect(readVariantsPanelOpen()).toBe(true);
        storeVariantsPanelOpen(false);
        expect(readVariantsPanelOpen()).toBe(false);
    });

    it('хранилище недоступно — свёрнуто, записи не падают', () => {
        vi.stubGlobal('localStorage', {
            getItem: () => {
                throw new Error('нет доступа');
            },
            setItem: () => {
                throw new Error('нет доступа');
            },
        });
        expect(readVariantsPanelOpen()).toBe(false);
        expect(() => storeVariantsPanelOpen(true)).not.toThrow();
    });
});
