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
        expect(options[0]).toEqual({ value: FACET_ALL, label: 'Все' });
        expect(options[1].value).toBe('yandex');
        expect(options[1].label.replace(/\s/g, ' ')).toBe('Яндекс · 1 412');
        expect(options[1].keywords).toEqual(['yandex']);
        expect(options[2].label).toBe('bitrix-vibecode · 3');
    });

    it('без значений — только «Все»', () => {
        expect(facetOptions([])).toEqual([{ value: FACET_ALL, label: 'Все' }]);
    });
});
