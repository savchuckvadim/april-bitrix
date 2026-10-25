import { describe, expect, it } from 'vitest';
import oldInit from '../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../catalog';
import legacyRecord from './__fixtures__/legacy-deal.v1.json';
import { parseV1 } from './v1/parse-v1';
import { mapV1 } from './v1/map-v1';
import type { V1Parsed, V1Record, V1Row } from './v1/types';

/**
 * «Голый» второй Гарант в general (легаси: дополнительный товар без своих
 * supply/contract — они жили у главного). У нас у каждой garant-строки свои
 * поставка/договор/наполнение (решение владельца 29.07): при restore v1
 * голая строка наследует рефы главного товара, без предупреждений.
 */
const catalog = catalogFromOldInit(oldInit);
const record = legacyRecord as unknown as V1Record;

const withBareSecondGarant = (parsed: V1Parsed): V1Parsed => {
    const general = parsed.rows?.sets?.general?.[0];
    const main = general?.rows.garant?.[0];
    if (!general || !main) throw new Error('fixture: нет garant-строки в general');
    const bare: V1Row = {
        ...main,
        id: 1,
        name: 'Эксперт PRO (второй)',
        complect: { number: 3 },
        supply: undefined,
        contract: undefined,
    } as V1Row;
    general.rows.garant = [main, bare];
    return parsed;
};

describe('map-v1: голый второй Гарант', () => {
    const restored = mapV1(withBareSecondGarant(parseV1(record)), catalog);
    const main = restored.general.rows.find(row => row.role === 'main')!;
    const second = restored.general.rows.find(row => row.role === 'additional')!;

    it('восстанавливается без предупреждений', () => {
        expect(restored.warnings).toEqual([]);
        expect(second).toBeDefined();
    });

    it('наследует поставку и договор главного товара, комплект — свой', () => {
        expect(second.refs.supplyCode).toBe(main.refs.supplyCode);
        expect(second.refs.contractCode).toBe(main.refs.contractCode);
        expect(second.refs.complectCode).toBe('expert');
    });

    it('наполнение — дефолт своего комплекта (в v1 оно было только у главного)', () => {
        expect(second.composition?.complectCode).toBe('expert');
        expect(second.composition?.mode).toBe('rules');
        // дефолт комплекта (в фикстуре legacy-кодов состав может быть пустым) — но не наполнение главного
        expect(second.composition?.infoblocks).toEqual(
            catalog.complects.byCode['expert']!.defaults.infoblocks,
        );
        expect(second.composition).not.toBe(main.composition);
    });
});
