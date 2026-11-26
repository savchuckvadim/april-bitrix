import { describe, expect, it } from 'vitest';
import { buildFieldsListParams } from './fields-list-params';

describe('buildFieldsListParams', () => {
    it('по умолчанию шлёт только носитель — элементы списков бэк читает сам', () => {
        expect(buildFieldsListParams({ entity: 'deal' })).toEqual({
            entity: 'deal',
        });
    });

    it('withItems уходит только явным false', () => {
        expect(
            buildFieldsListParams({ entity: 'deal', withItems: false }),
        ).toEqual({ entity: 'deal', withItems: false });
        expect(
            buildFieldsListParams({ entity: 'deal', withItems: true }),
        ).toEqual({ entity: 'deal' });
    });

    it('умолчательные флаги не плодят второй ключ кэша', () => {
        expect(
            buildFieldsListParams({
                entity: 'smart',
                smartId: 3,
                onlyManual: false,
            }),
        ).toEqual({ entity: 'smart', smartId: 3 });
        expect(
            buildFieldsListParams({ entity: 'company', onlyManual: true }),
        ).toEqual({ entity: 'company', onlyManual: true });
    });
});
