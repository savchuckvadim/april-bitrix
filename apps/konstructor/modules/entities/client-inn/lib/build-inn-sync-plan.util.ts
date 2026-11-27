import { findUfKey } from '@workspace/pbx';
// Глубокий импорт файла-констант: баррель pbx-data тянет class-энтити
import { PBX_SALES_KONSTRUCTOR_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/konstructor/pbx-sales-konstructor-field.type';
import type { InnCarrier, InnSetEntity, InnSyncPlan } from '../model/types';
import { addInnToPool, isInnInPool, readInnPool } from './inn-pool.util';
import { digitsOf, normalizeInn } from './inn-validate.util';

const INN_CODE: string = PBX_SALES_KONSTRUCTOR_FIELD_CODES.op_inn;
const INN_POOL_CODE: string = PBX_SALES_KONSTRUCTOR_FIELD_CODES.op_inn_pool;

type Entity = Record<string, unknown> | null | undefined;
type Fields = Parameters<typeof findUfKey>[0];

export interface InnSyncInput {
    /** ИНН текущего сохранённого реквизита. */
    requisiteInn: string | null;
    domain: string | null;
    userId: number | null;
    deal: Entity;
    dealFields: Fields;
    company: Entity;
    companyFields: Fields;
}

const entityId = (entity: Entity): number | null => {
    const id = Number(entity?.ID);
    return Number.isFinite(id) && id > 0 ? id : null;
};

/** Где у сущности лежат `op_inn` и `op_inn_pool`; поля ИНН нет на портале или сущности нет — null. */
const toCarrier = (entity: Entity, fields: Fields): InnCarrier | null => {
    const id = entityId(entity);
    const innKey = findUfKey(fields, INN_CODE);
    if (!entity || !id || !innKey) return null;
    const poolKey = findUfKey(fields, INN_POOL_CODE);
    return {
        id,
        innKey,
        poolKey,
        storedInn: digitsOf(entity[innKey]),
        pool: poolKey ? readInnPool(entity[poolKey]) : [],
    };
};

const isInSync = (carrier: InnCarrier, inn: string): boolean =>
    carrier.storedInn === inn &&
    (!carrier.poolKey || isInnInPool(carrier.pool, inn));

/**
 * План выравнивания: ИНН текущего реквизита должен стать текущим ИНН сделки и
 * компании и оказаться в их пуле. null — делать нечего: реквизита с ИНН нет,
 * ИНН не проходит контрольную сумму (бэк его отклонит), писать некуда или всё
 * уже совпадает.
 */
export const buildInnSyncPlan = (input: InnSyncInput): InnSyncPlan | null => {
    const inn = normalizeInn(input.requisiteInn);
    if (!inn || !input.domain) return null;

    const deal = toCarrier(input.deal, input.dealFields);
    const company = toCarrier(input.company, input.companyFields);
    const pending = [deal, company].filter(
        (carrier): carrier is InnCarrier => carrier !== null && !isInSync(carrier, inn),
    );
    if (!pending.length) return null;

    const dealId = entityId(input.deal);
    const companyId = entityId(input.company);
    return {
        inn,
        request: {
            domain: input.domain,
            inn,
            ...(dealId ? { dealId } : {}),
            ...(companyId ? { companyId } : {}),
            ...(input.userId ? { userId: input.userId } : {}),
        },
        deal,
        company,
    };
};

/** Поля носителя после записи: текущий ИНН и пул с новым значением. */
const carrierPatch = (carrier: InnCarrier, inn: string): Record<string, unknown> => ({
    [carrier.innKey]: inn,
    ...(carrier.poolKey ? { [carrier.poolKey]: addInnToPool(carrier.pool, inn) } : {}),
});

export interface InnPatches {
    deal: Record<string, unknown> | null;
    company: Record<string, unknown> | null;
}

/**
 * Что бэк записал, то и правим в сторе, чтобы шапка и следующая проверка
 * видели новое: сделка с компанией, только компания или ничего (заявка).
 */
export const buildInnPatches = (plan: InnSyncPlan, entity: InnSetEntity): InnPatches => ({
    deal: entity === 'deal' && plan.deal ? carrierPatch(plan.deal, plan.inn) : null,
    company:
        entity !== 'lead' && plan.company ? carrierPatch(plan.company, plan.inn) : null,
});
