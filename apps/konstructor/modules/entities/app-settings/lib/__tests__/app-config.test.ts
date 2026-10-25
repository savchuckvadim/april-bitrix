import { describe, expect, it } from 'vitest';
import { toAppConfig } from '../app-config.util';

describe('toAppConfig', () => {
    it('флаг из плоского ответа: boolean или строка; нет ключа — дефолт реестра (выключено)', () => {
        expect(toAppConfig({ zakupkiEnabled: true, storedKeys: ['zakupkiEnabled'] }).zakupkiEnabled).toBe(true);
        expect(toAppConfig({ zakupkiEnabled: 'true' }).zakupkiEnabled).toBe(true);
        expect(toAppConfig({ zakupkiEnabled: 'false' }).zakupkiEnabled).toBe(false);
        expect(toAppConfig({}).zakupkiEnabled).toBe(false);
    });
});
