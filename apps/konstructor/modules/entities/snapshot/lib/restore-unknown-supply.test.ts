import { describe, expect, it } from 'vitest';
import oldInit from '../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../catalog';
import legacyRecord from './__fixtures__/legacy-deal.v1.json';
import { parseV1 } from './v1/parse-v1';
import { mapV1 } from './v1/map-v1';
import type { V1Parsed, V1Record } from './v1/types';

/**
 * Restore v1 с неизвестной поставкой: легаси-number, которого нет в таблице
 * SUPPLY_NUMBER_TO_KEY (например, поставку сняли с продажи). Слепок должен
 * восстановиться с предупреждением, а не упасть — менеджер поправит ОД руками.
 */
const catalog = catalogFromOldInit(oldInit);
const record = legacyRecord as unknown as V1Record;

const withUnknownSupply = (parsed: V1Parsed): V1Parsed => {
    const general = parsed.rows?.sets?.general?.[0];
    const garant = general?.rows.garant?.[0];
    if (!garant) throw new Error('fixture: нет garant-строки в general');
    garant.supply = { number: 99, name: 'Снятая с продажи' };
    return parsed;
};

describe('map-v1: неизвестная поставка', () => {
    it('warning вместо падения; код поставки — unknown, остальные строки целы', () => {
        const restored = mapV1(withUnknownSupply(parseV1(record)), catalog);
        expect(
            restored.warnings.some(w => w.includes('не удалось смапить поставку number=99')),
        ).toBe(true);
        const main = restored.general.rows.find(row => row.role === 'main');
        expect(main?.refs.supplyCode).toBe('unknown');
        expect(restored.general.rows.length).toBeGreaterThan(0);
    });

    it('известный номер предупреждений не даёт', () => {
        expect(mapV1(parseV1(record), catalog).warnings).toEqual([]);
    });
});
