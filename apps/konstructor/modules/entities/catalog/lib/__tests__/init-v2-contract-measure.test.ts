import { describe, expect, it } from 'vitest';
import liveInit from '../__fixtures__/init-v2.live.json';
import type { InitV2Data } from '../../model/dto';
import { catalogFromInitV2 } from '../adapters/from-init-v2';

/**
 * Единица договора в справочнике — короткое имя меры, как в легаси-init
 * Laravel. Nest в `measureName` отдаёт `portal_measure.name` («Лицензия
 * 6 месяцев», «месяц»), и документы нового фронта печатали его в «Ед.».
 */
const live = liveInit as unknown as InitV2Data;
const catalog = catalogFromInitV2(live);

/** Слепок с одним договором licHalf: мера договора задаётся тестом. */
const withLicHalfMeasure = (shortName: string, globalShortName: unknown) => {
    const licHalf = live.contracts.items.find(item => item.code === 'licHalf')!;
    return catalogFromInitV2({
        ...live,
        contracts: {
            ...live.contracts,
            items: [
                {
                    ...licHalf,
                    portalMeasure: {
                        ...licHalf.portalMeasure,
                        shortName,
                        measure: { shortName: globalShortName },
                    },
                },
            ],
        },
    });
};

describe('единица договора из init v2', () => {
    it('короткое имя меры договора, полное остаётся в fullName', () => {
        expect(catalog.contracts.byCode['internet']!.measure.name).toBe('мес.');
        expect(catalog.contracts.byCode['licHalf']!.measure.name).toBe('лиц. 6 мес.');
        expect(catalog.contracts.byCode['abonYear']!.measure.name).toBe('абон. 12 мес.');
        expect(catalog.contracts.byCode['licHalf']!.measure.fullName).toBe('Лицензия 6 месяцев');
    });

    it('у копии меры портала нет короткого имени — берётся общая мера', () => {
        const fromGlobal = withLicHalfMeasure('', 'лиц. 6 мес. (общая)');
        expect(fromGlobal.contracts.byCode['licHalf']!.measure.name).toBe('лиц. 6 мес. (общая)');
    });

    it('коротких имён нет совсем — остаётся measureName', () => {
        const bare = withLicHalfMeasure('', undefined);
        expect(bare.contracts.byCode['licHalf']!.measure.name).toBe('Лицензия 6 месяцев');
    });
});
