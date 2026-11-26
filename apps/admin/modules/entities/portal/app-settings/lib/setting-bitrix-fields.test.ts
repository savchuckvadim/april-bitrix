import { describe, expect, it } from 'vitest';
import {
    bitrixFieldEntityOf,
    missingFieldNames,
    orderPickableFields,
    parseFieldNames,
} from './setting-bitrix-fields';

const fields = [
    { fieldName: 'UF_CRM_1695372881', title: 'ИНН (new)' },
    { fieldName: 'UF_CRM_5AF9505846BAD', title: 'ИНН организации' },
    { fieldName: 'UF_CRM_1687845131', title: 'ИНН для поиска' },
    { fieldName: 'UF_CRM_100', title: 'Регион' },
];

describe('setting-bitrix-fields: настройка-поля портала', () => {
    it('выбор полей знает свою сущность, остальные выборы — нет', () => {
        expect(bitrixFieldEntityOf('bitrix-deal-fields')).toBe('deal');
        expect(bitrixFieldEntityOf('bitrix-company-fields')).toBe('company');
        expect(bitrixFieldEntityOf('bitrix-lead-fields')).toBe('lead');
        expect(bitrixFieldEntityOf('bitrix-users')).toBeNull();
        expect(bitrixFieldEntityOf(undefined)).toBeNull();
    });

    it('значение → имена в верхнем регистре без повторов', () => {
        expect(
            parseFieldNames('uf_crm_1695372881, UF_CRM_1695372881,UF_CRM_100'),
        ).toEqual(['UF_CRM_1695372881', 'UF_CRM_100']);
        expect(parseFieldNames(null)).toEqual([]);
    });

    it('выбранные первыми и всегда, остальные — по поиску в подписи и имени', () => {
        const selected = new Set(['UF_CRM_100']);
        expect(
            orderPickableFields(fields, selected, 'инн').map(f => f.fieldName),
        ).toEqual([
            'UF_CRM_100',
            'UF_CRM_1695372881',
            'UF_CRM_5AF9505846BAD',
            'UF_CRM_1687845131',
        ]);
        expect(
            orderPickableFields(fields, new Set(), '5af95').map(
                f => f.fieldName,
            ),
        ).toEqual(['UF_CRM_5AF9505846BAD']);
    });

    it('выбранное, которого нет на портале, — отдельно', () => {
        expect(
            missingFieldNames(['UF_CRM_100', 'UF_CRM_GONE'], fields),
        ).toEqual(['UF_CRM_GONE']);
    });
});
