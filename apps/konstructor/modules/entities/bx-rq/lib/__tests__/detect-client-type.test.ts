import { describe, expect, it } from 'vitest';
import { RQ_TYPE, type RqBundle, type RqRecord } from '../../model/types';
import {
    collectExistingRqTypes,
    detectClientTypeByBundle,
    detectClientTypeByRqTypes,
} from '../detect-client-type.util';

/** Запись реквизита: для определения типа важны только id в Битриксе и тип пресета. */
const record = (bxId: number | string, type: RQ_TYPE): RqRecord =>
    ({ bx_id: bxId, type }) as unknown as RqRecord;

/** Пустая группа, как её отдаёт бэк: одна заготовка нового реквизита (bx_id -1). */
const emptyGroup = (type: RQ_TYPE) => ({
    items: [record(-1, type)],
    default: record(-1, type),
});

const bundleOf = (
    items: Partial<
        Record<RQ_TYPE.ORGANIZATION | RQ_TYPE.IP | RQ_TYPE.FIZ, RqRecord[]>
    >,
): RqBundle => {
    const group = (type: RQ_TYPE.ORGANIZATION | RQ_TYPE.IP | RQ_TYPE.FIZ) => {
        const own = items[type];
        return own
            ? { items: own, default: record(-1, type) }
            : emptyGroup(type);
    };
    return {
        [RQ_TYPE.ORGANIZATION]: group(RQ_TYPE.ORGANIZATION),
        [RQ_TYPE.IP]: group(RQ_TYPE.IP),
        [RQ_TYPE.FIZ]: group(RQ_TYPE.FIZ),
        current: null,
    };
};

describe('detectClientTypeByRqTypes', () => {
    it('реквизитов нет — тип неизвестен', () => {
        expect(detectClientTypeByRqTypes([])).toBeNull();
    });

    it('один тип, хоть сколько реквизитов — он и есть тип клиента', () => {
        expect(detectClientTypeByRqTypes([RQ_TYPE.IP])).toBe(RQ_TYPE.IP);
        expect(detectClientTypeByRqTypes([RQ_TYPE.FIZ, RQ_TYPE.FIZ])).toBe(
            RQ_TYPE.FIZ,
        );
        expect(
            detectClientTypeByRqTypes([
                RQ_TYPE.ORGANIZATION,
                RQ_TYPE.ORGANIZATION,
            ]),
        ).toBe(RQ_TYPE.ORGANIZATION);
    });

    it('типы разные — тип неизвестен', () => {
        expect(
            detectClientTypeByRqTypes([RQ_TYPE.ORGANIZATION, RQ_TYPE.IP]),
        ).toBeNull();
        expect(
            detectClientTypeByRqTypes([
                RQ_TYPE.IP,
                RQ_TYPE.FIZ,
                RQ_TYPE.ORGANIZATION,
            ]),
        ).toBeNull();
    });

    it('бюджетники — отдельный тип: сами дают бюджет, вместе с организациями — разные', () => {
        expect(detectClientTypeByRqTypes([RQ_TYPE.BUDGET])).toBe(
            RQ_TYPE.BUDGET,
        );
        expect(
            detectClientTypeByRqTypes([RQ_TYPE.BUDGET, RQ_TYPE.ORGANIZATION]),
        ).toBeNull();
    });
});

describe('collectExistingRqTypes', () => {
    it('пакета нет — типов нет', () => {
        expect(collectExistingRqTypes(null)).toEqual([]);
        expect(collectExistingRqTypes(undefined)).toEqual([]);
    });

    it('заготовки новых реквизитов (bx_id -1) компании не принадлежат', () => {
        expect(collectExistingRqTypes(bundleOf({}))).toEqual([]);
    });

    it('реальные реквизиты считаются по типу записи; bx_id может прийти строкой', () => {
        const bundle = bundleOf({
            [RQ_TYPE.ORGANIZATION]: [
                record(5, RQ_TYPE.ORGANIZATION),
                record('6', RQ_TYPE.BUDGET),
            ],
            [RQ_TYPE.IP]: [record(7, RQ_TYPE.IP)],
        });
        expect(collectExistingRqTypes(bundle)).toEqual([
            RQ_TYPE.ORGANIZATION,
            RQ_TYPE.BUDGET,
            RQ_TYPE.IP,
        ]);
    });
});

describe('detectClientTypeByBundle', () => {
    it('нет реквизитов — null', () => {
        expect(detectClientTypeByBundle(bundleOf({}))).toBeNull();
        expect(detectClientTypeByBundle(null)).toBeNull();
    });

    it('реквизиты одного типа — тип клиента', () => {
        expect(
            detectClientTypeByBundle(
                bundleOf({ [RQ_TYPE.IP]: [record(11, RQ_TYPE.IP)] }),
            ),
        ).toBe(RQ_TYPE.IP);
        expect(
            detectClientTypeByBundle(
                bundleOf({
                    [RQ_TYPE.ORGANIZATION]: [
                        record(1, RQ_TYPE.ORGANIZATION),
                        record(2, RQ_TYPE.ORGANIZATION),
                    ],
                }),
            ),
        ).toBe(RQ_TYPE.ORGANIZATION);
    });

    it('реквизиты разных типов — null', () => {
        expect(
            detectClientTypeByBundle(
                bundleOf({
                    [RQ_TYPE.ORGANIZATION]: [record(1, RQ_TYPE.ORGANIZATION)],
                    [RQ_TYPE.FIZ]: [record(2, RQ_TYPE.FIZ)],
                }),
            ),
        ).toBeNull();
    });

    it('бюджетный реквизит — бюджет', () => {
        expect(
            detectClientTypeByBundle(
                bundleOf({
                    [RQ_TYPE.ORGANIZATION]: [record(3, RQ_TYPE.BUDGET)],
                }),
            ),
        ).toBe(RQ_TYPE.BUDGET);
    });
});
