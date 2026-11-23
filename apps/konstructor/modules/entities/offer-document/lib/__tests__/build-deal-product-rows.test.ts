import { describe, expect, it } from 'vitest';
import { selectParticipants } from '../../../complect-variant/lib/participants';
import { COMPLECT_VARIANT_STAGE, type ComplectVariantStage } from '../../../complect-variant/lib/stage';
import { COMPLECT_MODE, type ComplectMode, type ComplectVariantRecordDto } from '../../../complect-variant/model/dto';
import { buildGarantRow, buildProductRows, type RowSet, upsertRow } from '../../../row-set';
import { buildDealProductRows, type DealProductRowsInput } from '../build-deal-product-rows';
import { mainSetOf, recordOf, snapshotRowsOf, variantCatalog } from '../__fixtures__/variant-records';

/**
 * Товарные строки сделки по вариантам: живое состояние принадлежит открытому
 * варианту 201 (комплект «Бухгалтер»), слепок варианта 202 хранит комплект «Юрист».
 */

const OPEN_ID = 201;
const OTHER_ID = 202;

const additionalRow = (key: string, complectCode: string) =>
    buildGarantRow({
        catalog: variantCatalog,
        regionCode: 'stv',
        withTax: false,
        key,
        setId: 'general',
        role: 'additional',
        complectCode,
        supplyCode: 'internet_5',
        contractCode: 'abonYear',
    })!;

/** Набор из главной строки и одной дополнительной: две строки сделки. */
const twoRowSet = (key: string, mainCode: string, extraCode: string): RowSet =>
    upsertRow(mainSetOf(key, mainCode), additionalRow(`${key}_extra`, extraCode));

const liveGeneral = twoRowSet('live', 'buh', 'expert');

/** Оба варианта черновики: участвуют все нефинальные. */
const draftsOnly = () => COMPLECT_VARIANT_STAGE.draft;

const inputOf = (
    mode: ComplectMode,
    records: ComplectVariantRecordDto[],
    openVariantSmartId: number | null = OPEN_ID,
    stageOf: (variantSmartId: number | null) => ComplectVariantStage = draftsOnly,
): DealProductRowsInput => ({
    catalog: variantCatalog,
    mode,
    participants: selectParticipants(records, stageOf, mode, openVariantSmartId),
    items: [],
    openVariantSmartId,
    live: { general: liveGeneral, alternative: [] },
});

const twoRecords = (otherGeneral: RowSet = twoRowSet('other', 'ur', 'expert')): ComplectVariantRecordDto[] => [
    recordOf(1, OPEN_ID, 'buh'),
    recordOf(2, OTHER_ID, 'ur', snapshotRowsOf(otherGeneral)),
];

describe('строки сделки, когда варианты продаются вместе', () => {
    it.each([COMPLECT_MODE.multi_contract, COMPLECT_MODE.single_contract])(
        'режим %s, два участника: строки живого набора, затем строки слепка',
        mode => {
            const otherGeneral = twoRowSet('other', 'ur', 'expert');
            const { rows, skipped } = buildDealProductRows(inputOf(mode, twoRecords(otherGeneral)));

            const liveRows = buildProductRows(liveGeneral, variantCatalog);
            const otherRows = buildProductRows(otherGeneral, variantCatalog);
            expect(skipped).toEqual([]);
            expect(rows).toHaveLength(liveRows.length + otherRows.length);
            expect(rows.slice(0, liveRows.length).map(row => row.productName)).toEqual(
                liveRows.map(row => row.productName),
            );
            expect(rows.slice(liveRows.length).map(row => row.productName)).toEqual(
                otherRows.map(row => row.productName),
            );
        },
    );

    it('номера sort идут сквозь наборы участников', () => {
        const { rows } = buildDealProductRows(inputOf(COMPLECT_MODE.multi_contract, twoRecords()));

        expect(rows).toHaveLength(4);
        expect(rows.map(row => row.sort)).toEqual([0, 1, 2, 3]);
    });

    it('строки открытого варианта берутся из живого состояния, даже когда его слепок хранит другой комплект', () => {
        // слепок открытого варианта хранит «Юрист», а живой набор на экране — «Бухгалтер»
        const records = [recordOf(1, OPEN_ID, 'ur'), recordOf(2, OTHER_ID, 'ur')];
        const { rows } = buildDealProductRows(inputOf(COMPLECT_MODE.multi_contract, records));

        const liveNames = buildProductRows(liveGeneral, variantCatalog).map(row => row.productName);
        expect(rows).toHaveLength(liveNames.length + 1);
        expect(rows.slice(0, liveNames.length).map(row => row.productName)).toEqual(liveNames);
    });

    it('открытого варианта нет: все строки из слепков', () => {
        const records = [recordOf(1, OPEN_ID, 'buh'), recordOf(2, OTHER_ID, 'ur')];
        const { rows } = buildDealProductRows(inputOf(COMPLECT_MODE.multi_contract, records, null));

        expect(rows).toHaveLength(2);
        expect(rows.map(row => row.sort)).toEqual([0, 1]);
    });

    it('свёрнутый набор участника даёт одну строку итога, нумерация продолжается за ней', () => {
        const collapsed: RowSet = { ...twoRowSet('other', 'ur', 'expert'), collapsed: true };
        const { rows } = buildDealProductRows(inputOf(COMPLECT_MODE.multi_contract, twoRecords(collapsed)));

        // две строки открытого варианта и одна итоговая строка свёрнутого
        expect(rows).toHaveLength(3);
        expect(rows[2]?.productName).toContain(' + ');
        expect(rows.map(row => row.sort)).toEqual([0, 1, 2]);
    });

    it('свёрнутый набор первого участника: следующий участник нумеруется с единицы', () => {
        const records = [recordOf(1, OPEN_ID, 'buh'), recordOf(2, OTHER_ID, 'ur')];
        const input = inputOf(COMPLECT_MODE.multi_contract, records);
        const collapsedLive: RowSet = { ...liveGeneral, collapsed: true };
        const { rows } = buildDealProductRows({ ...input, live: { general: collapsedLive, alternative: [] } });

        expect(rows).toHaveLength(2);
        expect(rows.map(row => row.sort)).toEqual([0, 1]);
    });
});

describe('строки сделки по живому набору', () => {
    const liveNames = buildProductRows(liveGeneral, variantCatalog).map(row => row.productName);

    it('режим «Только открытый вариант»: только живой набор, слепки вариантов в сделку не идут', () => {
        const { rows, skipped } = buildDealProductRows(inputOf(COMPLECT_MODE.compare, twoRecords()));

        expect(skipped).toEqual([]);
        expect(rows.map(row => row.productName)).toEqual(liveNames);
        expect(rows.map(row => row.sort)).toEqual([0, 1]);
    });

    it('режим «Только открытый вариант»: нечитаемый слепок строк не меняет и сделку не блокирует', () => {
        const records = [recordOf(1, OPEN_ID, 'buh'), recordOf(2, OTHER_ID, 'ur', '{broken')];
        const { rows, skipped } = buildDealProductRows(inputOf(COMPLECT_MODE.compare, records));

        expect(skipped).toEqual([]);
        expect(rows.map(row => row.productName)).toEqual(liveNames);
    });

    it('один участник: живой набор', () => {
        const { rows, skipped } = buildDealProductRows(
            inputOf(COMPLECT_MODE.multi_contract, [recordOf(1, OPEN_ID, 'ur')]),
        );

        expect(skipped).toEqual([]);
        expect(rows.map(row => row.productName)).toEqual(liveNames);
    });

    it('вариантов нет: живой набор', () => {
        const { rows, skipped } = buildDealProductRows(inputOf(COMPLECT_MODE.single_contract, []));

        expect(skipped).toEqual([]);
        expect(rows.map(row => row.productName)).toEqual(liveNames);
    });

    it('вариант в финальной стадии участником не считается: остаётся живой набор', () => {
        const rejectedOther = (variantSmartId: number | null) =>
            variantSmartId === OTHER_ID ? COMPLECT_VARIANT_STAGE.rejected : COMPLECT_VARIANT_STAGE.draft;
        const { rows } = buildDealProductRows(
            inputOf(COMPLECT_MODE.multi_contract, twoRecords(), OPEN_ID, rejectedOther),
        );

        expect(rows.map(row => row.productName)).toEqual(liveNames);
    });
});

describe('участник, которого собрать нельзя', () => {
    it('уходит в skipped, строки остальных участников собираются', () => {
        const records = [recordOf(1, OPEN_ID, 'buh'), recordOf(2, OTHER_ID, 'ur', '{broken')];
        const { rows, skipped } = buildDealProductRows(inputOf(COMPLECT_MODE.multi_contract, records));

        expect(skipped).toEqual([
            { variantSmartId: OTHER_ID, title: `Вариант ${OTHER_ID}`, reason: 'snapshotUnreadable' },
        ]);
        expect(rows).toHaveLength(2);
    });
});
