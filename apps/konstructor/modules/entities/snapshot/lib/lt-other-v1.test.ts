import { describe, expect, it } from 'vitest';
import oldInit from '../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../catalog';
import { buildGarantRow, createSet, findMainRow, upsertRow } from '../../row-set';
import { defaultComposition, type Composition } from '../../composition';
import legacyDeal from './__fixtures__/legacy-deal.v1.json';
import { parseV1 } from './v1/parse-v1';
import { mapV1, mapV1LtOther } from './v1/map-v1';
import type { V1Record } from './v1/types';
import { restoreV2 } from './v2/serialize';
import type { SnapshotV2 } from '../model/types';

/**
 * BC слепков для LT-other: v1 хранил пакеты отдельным полем ltOther
 * (IOtherLtPack[] с сервисами по number/code), v2 до этапа 9 — составы без
 * поля ltOther. Оба читаются в composition.ltOther.
 */
const catalog = catalogFromOldInit(oldInit);

describe('ltOther в слепках', () => {
    it('v1: пакеты поля ltOther → наполнение главной строки, неизвестные сервисы — в warnings', () => {
        const record = {
            ...(legacyDeal as unknown as V1Record),
            ltOther: JSON.stringify([
                {
                    id: 'x1',
                    services: [{ number: 1000, name: 'Искра' }, { code: 'ltsut' }, { number: 99999, name: 'Нет такого' }],
                    alternativePacketName: ' Мой пакет ',
                    weight: 3,
                },
                { id: 7, services: [{ number: 99999 }] },
            ]),
        } satisfies V1Record;
        const parsed = parseV1(record);
        expect(parsed.ltOther).toHaveLength(2);
        expect(parsed.parseErrors).not.toContain('ltOther');

        const restored = mapV1(parsed, catalog);
        const main = findMainRow(restored.general);
        expect(main?.composition?.ltOther).toEqual([
            { id: 'x1', services: ['iscra', 'ltsut'], alternativeName: 'Мой пакет' },
        ]);
        expect(restored.warnings.filter(warning => warning.includes('не найден в каталоге'))).toHaveLength(2);
    });

    it('v1: битое поле ltOther — parseErrors, остальное читается', () => {
        const parsed = parseV1({ ...(legacyDeal as unknown as V1Record), ltOther: '{oops' });
        expect(parsed.ltOther).toBeNull();
        expect(parsed.parseErrors).toContain('ltOther');
        expect(mapV1LtOther(null, catalog, [])).toEqual([]);
    });

    it('v2 без ltOther: составы нормализуются при восстановлении', () => {
        const buh = catalog.complects.byCode['buh']!;
        const legacyComposition = { ...defaultComposition(buh), ltOther: undefined } as unknown as Composition;
        const row = {
            ...buildGarantRow({
                catalog,
                regionCode: 'stv',
                withTax: false,
                key: 'main',
                setId: 'general',
                role: 'main',
                complectCode: 'buh',
                supplyCode: 'internet_1',
                contractCode: 'internet',
            })!,
            composition: legacyComposition,
        };
        const snapshot: SnapshotV2 = {
            schemaVersion: 2,
            dealId: 1,
            domain: 'test.bitrix24.ru',
            userId: null,
            serviceSmartId: null,
            regionCode: 'stv',
            contractCode: 'internet',
            supplyCode: 'internet_1',
            general: upsertRow(createSet('general', 'general'), row),
            alternative: [],
            templateId: null,
            savedAt: new Date().toISOString(),
        };
        const restored = restoreV2(snapshot);
        expect(findMainRow(restored.general)?.composition?.ltOther).toEqual([]);
    });
});
