import { createSelector } from '@reduxjs/toolkit';
import { findUfKey } from '@workspace/pbx';
// Глубокий импорт файла-констант: баррель pbx-data тянет class-энтити,
// не проходящие strict-tsc этого приложения.
import { PBX_SALES_KONSTRUCTOR_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/konstructor/pbx-sales-konstructor-field.type';
import type { RootState } from '@/modules/app/model/store';

/**
 * Куда читать/писать ИНН: текущая сущность по приоритету владельца —
 * есть компания → прежде всего по ней; без компании — сделка; лид-контекст —
 * лид (решение владельца). Поле — pbx `op_inn`, резолв по коду через слепок
 * портала (доктрина docs/pbx-fields-system.md); поле не проинсталлено —
 * target null, UI молчит (§5: никаких вечных предупреждений).
 */
export interface InnTarget {
    entity: 'company' | 'deal' | 'lead';
    entityId: number;
    /** Полный ключ Bitrix-поля: UF_CRM_<bitrixId(op_inn)>. */
    ufKey: string;
    /** Текущее значение из сущности (сырое), пустое — null. */
    value: string | null;
    /**
     * Склад кандидатов op_inn_pool: ключ + текущие значения. Поле может быть
     * ещё не проинсталлено — тогда poolKey null и запись идёт без склада.
     */
    poolKey: string | null;
    poolValues: unknown;
}

const INN_CODE = PBX_SALES_KONSTRUCTOR_FIELD_CODES.op_inn;
const INN_POOL_CODE = PBX_SALES_KONSTRUCTOR_FIELD_CODES.op_inn_pool;

export const getInnTarget = createSelector(
    [
        (state: RootState) => state.portal.portal,
        (state: RootState) => state.app.bitrix.company,
        (state: RootState) => state.app.bitrix.deal,
        (state: RootState) => state.app.bitrix.lead,
    ],
    (portal, company, deal, lead): InnTarget | null => {
        const target = company
            ? { entity: 'company' as const, raw: company, fields: portal?.company?.bitrixfields }
            : deal
              ? { entity: 'deal' as const, raw: deal, fields: portal?.bitrixDeal?.bitrixfields }
              : lead
                ? { entity: 'lead' as const, raw: lead, fields: portal?.lead?.bitrixfields }
                : null;
        if (!target) return null;

        const key = findUfKey(target.fields, INN_CODE);
        if (!key) return null;

        const entityId = Number((target.raw as { ID?: unknown }).ID);
        if (!Number.isFinite(entityId) || entityId <= 0) return null;

        const rawValue = (target.raw as Record<string, unknown>)[key];
        const value =
            typeof rawValue === 'string' && rawValue.trim()
                ? rawValue.trim()
                : null;

        const poolKey = findUfKey(target.fields, INN_POOL_CODE);
        const poolValues = poolKey
            ? (target.raw as Record<string, unknown>)[poolKey]
            : null;

        return {
            entity: target.entity,
            entityId,
            ufKey: key,
            value,
            poolKey,
            poolValues,
        };
    },
);

/** Текущий ИНН: свежесохранённый в сессии перекрывает значение из сущности. */
export const getCurrentInn = (state: RootState): string | null =>
    state.inn.savedValue ?? getInnTarget(state)?.value ?? null;
