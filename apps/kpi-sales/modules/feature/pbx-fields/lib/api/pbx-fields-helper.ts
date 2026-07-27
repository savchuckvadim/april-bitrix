import { getPbxFields } from '@workspace/nest-kpi-report-sales-api';
import type { PbxFieldMeta, PbxFieldUpdatePayload } from '../../model';

/**
 * Обёртка generated-клиента pbx-полей — ЕДИНСТВЕННОЕ место импорта
 * функций @workspace/nest-kpi-report-sales-api в фиче (правило CLAUDE.md).
 */
export class PbxFieldsHelper {
    private api: ReturnType<typeof getPbxFields>;

    constructor() {
        this.api = getPbxFields();
    }

    /** Метаданные редактируемых полей портала (items с портала). */
    async getMeta(domain: string): Promise<PbxFieldMeta[]> {
        const response = await this.api.pbxFieldsGetMeta({ domain });
        return response.fields;
    }

    /** Записать значение; возвращает нормализованное сохранённое значение. */
    async update(
        domain: string,
        payload: PbxFieldUpdatePayload,
    ): Promise<string | null> {
        const response = await this.api.pbxFieldsUpdate({
            domain,
            fieldCode: payload.fieldCode,
            entityId: payload.entityId,
            value: payload.value,
        });
        return response.value;
    }
}
