import { RQ_TYPE, type RqBundle } from '../model/types';

/** Группы пакета реквизитов: тип пресета на бэке (бюджетники лежат в «организациях»). */
const TYPED_GROUPS = [RQ_TYPE.ORGANIZATION, RQ_TYPE.IP, RQ_TYPE.FIZ] as const;

/**
 * Типы реквизитов, которые у компании реально заведены в Битриксе. Заготовка
 * для нового реквизита (bx_id ≤ 0) компании не принадлежит и не считается.
 * Тип записи задаёт её пресет: бэк кладёт его в `type` при сборке пакета.
 */
export const collectExistingRqTypes = (
    bundle: RqBundle | null | undefined,
): RQ_TYPE[] => {
    if (!bundle) return [];
    return TYPED_GROUPS.flatMap(group =>
        (bundle[group]?.items ?? [])
            .filter(record => Number(record.bx_id) > 0)
            .map(record => record.type),
    );
};

/**
 * Тип реквизитов, по которому тип клиента не определить: бюджетники хранятся
 * в пресете организаций, поэтому «организация» бывает и коммерческой, и
 * бюджетной. Ошибка здесь меняет договор и шаблон счёта — такой тип менеджер
 * выбирает сам в окне «Укажите тип клиента».
 */
const AMBIGUOUS_RQ_TYPES: ReadonlySet<RQ_TYPE> = new Set([RQ_TYPE.ORGANIZATION]);

/**
 * Тип клиента по типам реквизитов компании: все реквизиты одного однозначного
 * типа (ИП, физлицо, бюджет) — это и есть тип клиента. Реквизитов нет, типы
 * разные или тип неоднозначен (организация) — null: решает менеджер.
 */
export const detectClientTypeByRqTypes = (
    types: readonly RQ_TYPE[],
): RQ_TYPE | null => {
    const distinct = new Set(types);
    if (distinct.size !== 1) return null;
    const [type] = types;
    if (type === undefined || AMBIGUOUS_RQ_TYPES.has(type)) return null;
    return type;
};

/** Тип клиента по загруженному пакету реквизитов компании. */
export const detectClientTypeByBundle = (
    bundle: RqBundle | null | undefined,
): RQ_TYPE | null => detectClientTypeByRqTypes(collectExistingRqTypes(bundle));
