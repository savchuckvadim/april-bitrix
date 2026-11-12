import { describe, expect, it } from 'vitest';
import { suggestOrganizationName } from './organization-name';

describe('черновик названия организации по домену', () => {
    it.each([
        ['alfacentr.bitrix24.ru', 'alfacentr'],
        ['April-Garant.bitrix24.ru', 'april garant'],
        ['crm.example.com', 'crm'],
        [null, ''],
    ])('%s → «%s»', (domain, expected) => {
        expect(suggestOrganizationName(domain)).toBe(expected);
    });
});
