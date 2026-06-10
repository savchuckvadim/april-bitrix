import type { BitrixService, IUserFieldConfig } from '@workspace/bitrix';
import type { BxSmartFullType, BxSmartStage } from '../../model/types';

/**
 * API helper for reading live smart-process data from a Bitrix portal.
 * Receives an already-initialized BitrixService (from bitrixPortalClient).
 *
 * Stateless: create a new instance per call or reuse — no internal state.
 */
export class BitrixSmartHelper {
    constructor(private readonly bitrix: BitrixService) {}

    /** All smart-process types on the portal with their categories and stages. */
    async getAllSmarts(): Promise<BxSmartFullType[]> {
        return this.bitrix.smartType.getListFull({
            order: { id: 'asc' },
            start: -1,
        });
    }

    /** Stages for a single category of a smart process. */
    async getStagesForCategory(
        entityTypeId: number | string,
        categoryId: number | string,
    ): Promise<BxSmartStage[]> {
        const result = await this.bitrix.status.getList({
            ENTITY_ID: `DYNAMIC_${entityTypeId}_STAGE_${categoryId}`,
            CATEGORY_ID: categoryId as number,
        });
        // result.result is the actual array from Bitrix
        const statuses = (result as any)?.result ?? [];
        return statuses as BxSmartStage[];
    }
    /** Smart process type with all categories and stages. */
    async getSmartFull(entityTypeId: number | string): Promise<BxSmartFullType> {
        return await this.bitrix.smartType.getSmartFull({
            entityTypeId: entityTypeId as string,
        });
    }

    /**
     * User fields (UF_CRM_DYNAMIC_*) for a specific smart-process entityTypeId.
     * Uses `userFieldConfig.list` with entityId = `CRM_DYNAMIC_{entityTypeId}`.
     */
    async getFieldsForSmart(entityTypeId: number | string): Promise<IUserFieldConfig[]> {
        const entityId = `CRM_DYNAMIC_${entityTypeId}`;
        const result = await this.bitrix.userFieldConfig.list({
            moduleId: 'crm',
            filter: { entityId },
            start: -1,
        });
        // userFieldConfig.list returns { result: { fields: [...] } } or similar
        const raw = (result as any)?.result ?? (result as any)?.fields ?? result ?? [];
        return Array.isArray(raw) ? raw : (raw.fields ?? []);
    }
}
