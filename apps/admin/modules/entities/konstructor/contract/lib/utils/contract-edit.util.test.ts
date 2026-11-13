import { describe, expect, it } from 'vitest';
import type { Contract } from '../../model';
import {
    missingRequiredFields,
    toContractDraft,
    toContractUpdate,
} from './contract-edit.util';

const lic = {
    id: 3,
    name: 'licenzia',
    title: 'Лицензионный',
    number: 9,
    code: 'lic',
    type: 'product',
    withPrepayment: true,
    productName: 'Неисключительная лицензия на использование базы данных',
    product: 'null',
} as Contract;

describe('правка вида договора', () => {
    it('легаси-строка null и отсутствующие поля в форме пустые', () => {
        const draft = toContractDraft(lic);
        expect(draft.product).toBe('');
        expect(draft.comment).toBe('');
        expect(draft.name).toBe('licenzia');
    });

    it('уходят только изменённые поля, с обрезанными краями', () => {
        const draft = { ...toContractDraft(lic), name: '  Лицензионный ' };
        expect(toContractUpdate(lic, draft)).toEqual({ name: 'Лицензионный' });
    });

    it('без правок — пустой набор, null в базе не затирается пустой строкой', () => {
        expect(toContractUpdate(lic, toContractDraft(lic))).toEqual({});
    });

    it('наименование и заголовок пустыми не сохраняются', () => {
        const draft = { ...toContractDraft(lic), name: ' ', title: '' };
        expect(missingRequiredFields(draft).map(field => field.key)).toEqual([
            'name',
            'title',
        ]);
    });
});
