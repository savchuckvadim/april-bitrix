/** Какую карточку имитирует dev-режим вне фрейма Bitrix. */
export type DevPlacementKind = 'deal' | 'company';

export interface DevPlacementEnv {
    /** NEXT_PUBLIC_DEV_DEAL_ID; 0 — не задан */
    dealId: number;
    /** NEXT_PUBLIC_DEV_COMPANY_ID; 0 — не задан */
    companyId: number;
    /** NEXT_PUBLIC_DEV_PLACEMENT: `deal`, `company` или пусто */
    kind: string;
}

export interface DevPlacement {
    placement: string;
    options: { ID: number };
}

const PLACEMENT_CODE: Record<DevPlacementKind, string> = {
    deal: 'CRM_DEAL_DETAIL_TAB',
    company: 'CRM_COMPANY_DETAIL_TAB',
};

/**
 * Placement dev-режима из env. Явный `kind` выбирает карточку (нужен ID
 * именно её), пустой берёт сделку, а без сделки — компанию. Нужного ID нет —
 * null: dev не настроен.
 */
export const buildDevPlacement = (env: DevPlacementEnv): DevPlacement | null => {
    const byKind: Record<DevPlacementKind, number> = {
        deal: env.dealId,
        company: env.companyId,
    };
    const kind: DevPlacementKind | null =
        env.kind === 'deal' || env.kind === 'company'
            ? env.kind
            : env.dealId
              ? 'deal'
              : env.companyId
                ? 'company'
                : null;
    if (!kind || !byKind[kind]) return null;
    return { placement: PLACEMENT_CODE[kind], options: { ID: byKind[kind] } };
};
