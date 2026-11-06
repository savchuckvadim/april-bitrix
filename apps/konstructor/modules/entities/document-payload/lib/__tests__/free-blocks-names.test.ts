import { describe, expect, it } from 'vitest';
import liveInit from '../../../catalog/lib/__fixtures__/init-v2.live.json';
import { catalogFromInitV2, type InitV2Data } from '../../../catalog';
import { FREEBLOCK_INDEX_TO_CODE } from '../../../catalog/lib/legacy-codes';
import { defaultComposition, normalizeComposition } from '../../../composition';
import { buildComplectGroups } from '../build-complect-groups';

/**
 * В КП бесплатные блоки из старых слепков печатались кодом
 * («bcaonsalting_free», «ltsemi_free») вместо названия: таблица легаси-индексов
 * давала коды, которых нет в каталоге.
 */
const catalog = catalogFromInitV2(liveInit as unknown as InitV2Data);

describe('бесплатные блоки в документе — названиями', () => {
    it('каждый код таблицы легаси-индексов есть в каталоге (кроме блока, которого нет в БД)', () => {
        const missing = FREEBLOCK_INDEX_TO_CODE.filter(code => !catalog.infoblocks[code]);
        // «ПК Премиум: База знаний» не заведён в админке — данные, не код; заведут — убрать
        expect(missing).toEqual(['pbcaonsalting']);
    });

    it('слепок со старыми кодами: после восстановления — название каталога, без кодов', () => {
        const complect = catalog.complects.prof[0]!;
        const composition = normalizeComposition({
            ...defaultComposition(complect),
            freeBlocks: ['bhome', 'bcaonsalting_free', 'ltsemi_free', 'bcaonsalting'],
        });
        expect(composition.freeBlocks).toEqual(['bhome', 'bcaonsalting', 'ltsemi']);

        const names = buildComplectGroups(catalog, composition)
            .flatMap(group => group.value)
            .map(block => block.name);
        expect(names).toContain(catalog.infoblocks['bcaonsalting']!.name);
        expect(names).toContain(catalog.infoblocks['ltsemi']!.name);
        expect(names.some(name => name.endsWith('_free'))).toBe(false);
    });
});
