import type { Catalog, KComplect, KService } from '../../../../catalog';
import type { Composition } from '../../../model/types';
import { ltFreeLimit, ltServiceWeight, ltWeightOf } from './weights';

/**
 * Единое чтение пакетов Legal Tech. Данные состава остаются прежними (lt,
 * ltInPacket, ltOther: слепки читаются без миграции), а редактор, строки цен и
 * документы видят их одинаково: бесплатная часть комплекта, платный пакет и
 * дополнительные пакеты. Пакет каталога подбирается по сумме весов: 2 / 5 / 10.
 */

/** «Средний устаревший» — только сервисному отделу; без правил доступен всем */
export const LT_RESTRICTED_WEIGHT = 4;

export interface LtPackageOptions {
    serviceDepartment?: boolean;
    mode?: Composition['mode'];
}

export const isLtWeightLocked = (weight: number, options: LtPackageOptions = {}): boolean =>
    weight === LT_RESTRICTED_WEIGHT && !options.serviceDepartment && options.mode !== 'free';

export const findLtPackage = (
    catalog: Catalog,
    weight: number,
    options: LtPackageOptions = {},
): KService | null => {
    if (weight <= 0 || isLtWeightLocked(weight, options)) return null;
    return catalog.services.ltPackages.find(pkg => pkg.weight === weight) ?? null;
};

export type LtPacketKind = 'included' | 'paid' | 'extra';

/**
 * ok — пакет собран; empty — сервисов нет; under-limit — в бесплатной части
 * есть свободные места; incomplete — вес не совпал ни с одним пакетом;
 * locked — вес закрыт для отдела.
 */
export type LtPacketStatus = 'ok' | 'empty' | 'under-limit' | 'incomplete' | 'locked';

export interface LtPacketService {
    code: string;
    name: string;
    weight: number;
}

export interface LtPacketView {
    /** 'included' | 'paid' или id дополнительного пакета */
    id: string;
    kind: LtPacketKind;
    services: LtPacketService[];
    weight: number;
    /** Вес, которым ограничена бесплатная часть; у платных null */
    limit: number | null;
    package: KService | null;
    title: string;
    status: LtPacketStatus;
    /** Ближайшие пакеты по весу — для подсказки, что поправить */
    lower: KService | null;
    upper: KService | null;
    /** Даёт ли товарную строку: бесплатная часть товаром не идёт */
    isProduct: boolean;
}

export interface LtPacketsCtx extends Pick<LtPackageOptions, 'serviceDepartment'> {
    catalog: Catalog;
    complect: KComplect | null;
}

const NOT_ASSEMBLED_TITLE = 'Пакет LT не собран';

export const ltPackageName = (pkg: KService): string => pkg.fullName || pkg.name;

const nearestPackages = (
    catalog: Catalog,
    weight: number,
    options: LtPackageOptions,
): Pick<LtPacketView, 'lower' | 'upper'> => {
    const steps = catalog.services.ltPackages
        .filter(pkg => !isLtWeightLocked(pkg.weight, options))
        .sort((a, b) => a.weight - b.weight);
    return {
        lower: steps.filter(pkg => pkg.weight < weight).at(-1) ?? null,
        upper: steps.find(pkg => pkg.weight > weight) ?? null,
    };
};

const toServices = (codes: readonly string[], catalog: Catalog): LtPacketService[] =>
    codes.map(code => ({
        code,
        name: catalog.services.lt.find(service => service.code === code)?.name ?? code,
        weight: ltServiceWeight(code, catalog),
    }));

const statusOfPaid = (weight: number, pkg: KService | null, options: LtPackageOptions): LtPacketStatus => {
    if (weight === 0) return 'empty';
    if (pkg) return 'ok';
    return isLtWeightLocked(weight, options) ? 'locked' : 'incomplete';
};

const describePaid = (
    id: string,
    kind: 'paid' | 'extra',
    codes: readonly string[],
    alternativeName: string | null,
    catalog: Catalog,
    options: LtPackageOptions,
): LtPacketView => {
    const weight = ltWeightOf(codes, catalog);
    const pkg = findLtPackage(catalog, weight, options);
    return {
        id,
        kind,
        services: toServices(codes, catalog),
        weight,
        limit: null,
        package: pkg,
        title: alternativeName?.trim() || (pkg ? ltPackageName(pkg) : NOT_ASSEMBLED_TITLE),
        status: statusOfPaid(weight, pkg, options),
        ...nearestPackages(catalog, weight, options),
        isProduct: Boolean(pkg),
    };
};

const describeIncluded = (composition: Composition, limit: number, catalog: Catalog): LtPacketView => {
    const weight = ltWeightOf(composition.lt, catalog);
    // бесплатная часть называется пакетом комплекта, даже пока есть свободные места
    const pkg = findLtPackage(catalog, limit || weight, { serviceDepartment: true });
    return {
        id: 'included',
        kind: 'included',
        services: toServices(composition.lt, catalog),
        weight,
        limit,
        package: pkg,
        title: pkg ? ltPackageName(pkg) : 'Legal Tech в комплекте',
        status: weight === 0 ? 'empty' : weight < limit ? 'under-limit' : 'ok',
        lower: null,
        upper: null,
        isProduct: false,
    };
};

export const describeLtPackets = (composition: Composition, ctx: LtPacketsCtx): LtPacketView[] => {
    const { catalog, complect } = ctx;
    const options: LtPackageOptions = {
        serviceDepartment: ctx.serviceDepartment,
        mode: composition.mode,
    };
    const limit = complect ? ltFreeLimit(complect, catalog) : 0;
    return [
        ...(limit > 0 || composition.lt.length ? [describeIncluded(composition, limit, catalog)] : []),
        ...(composition.ltInPacket.length
            ? [describePaid('paid', 'paid', composition.ltInPacket, null, catalog, options)]
            : []),
        ...composition.ltOther.map(packet =>
            describePaid(packet.id, 'extra', packet.services, packet.alternativeName, catalog, options),
        ),
    ];
};

/** Что поправить в несобранном пакете: называет ближайшие пакеты по весу. */
export const ltPacketHint = (packet: LtPacketView): string => {
    const { lower, upper, weight } = packet;
    const add = upper ? `добавьте ещё ${upper.weight - weight} до «${upper.name}»` : null;
    const drop = lower ? `уберите ${weight - lower.weight} до «${lower.name}»` : null;
    if (add && drop) return `Вес ${weight}: ${add} или ${drop}`;
    if (add) return `Вес ${weight}: ${add}`;
    if (drop) return `Вес ${weight}: ${drop} или вынесите часть в доп. пакет`;
    return `Вес ${weight} не соответствует ни одному пакету`;
};
