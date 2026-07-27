import { describe, expect, it } from 'vitest';
import oldInit from '../../../../docs/oldinit.json';
import { catalogFromOldInit } from '../../catalog';
import legacyRecord from './__fixtures__/legacy-deal.v1.json';
import { hasDealData, parseV1 } from './v1/parse-v1';
import { mapV1 } from './v1/map-v1';
import { restoreV2, serializeV2 } from './v2/serialize';
import type { V1Record } from './v1/types';

/**
 * Фикстура — реальный прод-стейт (Эксперт PRO из evs.json), обёрнутый
 * в формат записи bx_document_deals. Специально БЕЗ iskraConfig/ltOther
 * (легаси на этом падал), без academy/lt_other в сетах и без contract.code
 * в строке — проверяем все легаси-миграции.
 */
const catalog = catalogFromOldInit(oldInit);
const record = legacyRecord as unknown as V1Record;

describe('parse-v1', () => {
    it('разбирает запись и не падает на отсутствующих полях', () => {
        const parsed = parseV1(record);
        expect(parsed.parseErrors).toEqual([]);
        expect(parsed.dealId).toBe(129487);
        expect(parsed.currentComplect?.number).toBe(3);
        expect(parsed.odNumber).toBe(1);
        expect(hasDealData(parsed)).toBe(true);
    });

    it('переваривает битые и пустые поля', () => {
        const broken = parseV1({
            ...record,
            currentComplect: '{oops',
            rows: undefined,
            regions: 'null',
        });
        expect(broken.parseErrors).toContain('currentComplect');
        expect(broken.currentComplect).toBeNull();
        expect(hasDealData(broken)).toBe(false);
    });
});

describe('map-v1: номера/индексы/имена → codes', () => {
    const restored = mapV1(parseV1(record), catalog);

    it('главная строка: role main, code-ссылки', () => {
        const main = restored.general.rows.find(row => row.role === 'main');
        expect(main).toBeDefined();
        expect(main!.refs.complectCode).toBe('expert'); // number 3
        expect(main!.refs.supplyCode).toBe('internet_1'); // supply number 1
        // contract.code в строке отсутствовал — достроен по number 0
        expect(main!.refs.contractCode).toBe('internet');
    });

    it('composition главной строки из currentComplect', () => {
        const main = restored.general.rows.find(row => row.role === 'main');
        const composition = main!.composition!;
        // filling: имена → codes; «Доп. материалы» схлопнулись в родителя
        expect(composition.infoblocks).toContain('ot');
        expect(composition.infoblocks).toContain('sprom');
        expect(composition.infoblocks).toContain('ntss');
        expect(composition.infoblocks).toHaveLength(3);
        // lt: [1,3] — это NUMBER, не индексы → ltconstructor, ltdisk
        expect(composition.lt).toEqual(['ltconstructor', 'ltdisk']);
        // freeBlocks: [0,1,2,5] — ИНДЕКСЫ → praim, archives, bhome, freesud
        expect(composition.freeBlocks).toEqual([
            'praim',
            'archives',
            'bhome',
            'freesud',
        ]);
        // consalting: [0]=hotline (всегда), consaltingProduct пуст → null
        expect(composition.consalting).toBeNull();
        expect(composition.star).toBe(false);
        // регион spb из слепка
        expect(composition.regions).toEqual(['spb']);
    });

    it('цены сохранены как есть (не пересчитаны по текущему прайсу)', () => {
        const main = restored.general.rows.find(row => row.role === 'main');
        // В слепке 8008 (старый прайс), в текущем oldinit-прайсе цена другая
        expect(main!.price.base).toBe(8008);
        expect(main!.price.current).toBe(8008);
        expect(main!.price.discount.percent).toBe(1);
    });

    it('восстанавливает выбор региона/договора/ОД', () => {
        expect(restored.regionCode).toBe('spb');
        expect(restored.contractCode).toBe('internet');
        expect(restored.supplyCode).toBe('internet_1');
        expect(restored.warnings).toEqual([]);
    });
});

describe('v2: сериализация и восстановление', () => {
    it('v1 → v2 → restore без потерь', () => {
        const restored = mapV1(parseV1(record), catalog);
        const snapshot = serializeV2({
            state: restored,
            dealId: 129487,
            domain: 'gsr.bitrix24.ru',
            userId: 447,
            savedAt: '2026-07-27T00:00:00.000Z',
        });
        expect(snapshot.schemaVersion).toBe(2);

        const roundTrip = restoreV2(snapshot);
        expect(roundTrip.general.rows[0]!.refs.complectCode).toBe('expert');
        expect(roundTrip.general.rows[0]!.composition?.lt).toEqual([
            'ltconstructor',
            'ltdisk',
        ]);
    });
});
