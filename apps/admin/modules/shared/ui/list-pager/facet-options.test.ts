import { describe, expect, it } from 'vitest';
import { FACET_ALL, facetOptions } from './facet-options';

describe('варианты фильтра серверного списка', () => {
    it('«Все» первым, дальше значения с числом записей и своей подписью', () => {
        const options = facetOptions(
            [
                { value: 'yandex', count: 1412 },
                { value: 'bitrix-vibecode', count: 3 },
            ],
            value => (value === 'yandex' ? 'Яндекс' : value),
        );
        const [all, yandex, vibecode] = options;
        expect(all).toEqual({ value: FACET_ALL, label: 'Все' });
        expect(yandex?.value).toBe('yandex');
        expect(yandex?.label.replace(/\s/g, ' ')).toBe('Яндекс · 1 412');
        expect(yandex?.keywords).toEqual(['yandex']);
        expect(vibecode?.label).toBe('bitrix-vibecode · 3');
    });

    it('без значений — только «Все»', () => {
        expect(facetOptions([])).toEqual([{ value: FACET_ALL, label: 'Все' }]);
    });
});
