import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { defaultComposition, type Composition } from '../../../composition';
import {
    buildGarantRow,
    createSet,
    syncSetWithComposition,
    upsertRow,
    type KRow,
    type RowRole,
    type RowSet,
} from '../../../row-set';

/**
 * Общий набор из нескольких garant-строк для тестов документов: главная
 * («Бухгалтер») и дополнительные комплекты со своим наполнением. Сервисные
 * строки (пакеты LT, консалтинг, СТАР) набор получает тем же пересчётом, что и
 * в приложении (syncSetWithComposition), поэтому цены и строки согласованы.
 */
export const catalog = catalogFromOldInit(oldInit);

export const REGION_CODE = 'stv';

/** Наполнение комплекта: дефолты каталога с переопределёнными полями. */
export const compositionOf = (complectCode: string, patch: Partial<Composition> = {}): Composition => ({
    ...defaultComposition(catalog.complects.byCode[complectCode]!),
    ...patch,
});

export const garantRowOf = (
    key: string,
    role: RowRole,
    complectCode: string,
    composition: Composition | undefined,
): KRow =>
    buildGarantRow({
        catalog,
        regionCode: REGION_CODE,
        withTax: false,
        key,
        setId: 'general',
        role,
        complectCode,
        supplyCode: 'internet_5',
        contractCode: 'abonYear',
        composition,
    })!;

/** Набор из строк без пересчёта: сервисных строк в нём нет. */
export const bareGeneral = (rows: KRow[]): RowSet => {
    let set = createSet('general', 'general');
    for (const row of rows) set = upsertRow(set, row);
    return set;
};

/** Набор из строк с пересчётом: сервисные строки выведены из объединённого наполнения. */
export const syncedGeneral = (rows: KRow[]): RowSet =>
    syncSetWithComposition(bareGeneral(rows), catalog, { regionCode: REGION_CODE, withTax: false });

/** Комплект набора для сравнения: строка роли comparison, её набор — `setId`. */
export const comparisonRowOf = (
    key: string,
    setId: string,
    complectCode: string,
    composition: Composition | undefined,
): KRow => ({ ...garantRowOf(key, 'comparison', complectCode, composition), setId });

/** Набор для сравнения из строк с пересчётом: сервисные строки выведены из объединённого наполнения. */
export const syncedAlternative = (setId: string, rows: KRow[]): RowSet => {
    let set = createSet(setId, 'alternative');
    for (const row of rows) set = upsertRow(set, row);
    return syncSetWithComposition(set, catalog, { regionCode: REGION_CODE, withTax: false });
};
