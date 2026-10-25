import { getRq } from '@workspace/nest-konstructor-api';
import type { RqCaseKind, RqStoreResponse } from '../../model/dto';
import type {
    AddressRqItem,
    BankRqItem,
    RqBundle,
    RqRecord,
} from '../../model/types';
import {
    fromBundleDto,
    toAddressItemDto,
    toBankItemDto,
    toRecordDto,
} from '../adapters/rq-dto.adapter';

/** Форма ответа store_rq зависит от того, что сохраняли; сужаем по ветке. */
const storedRqId = (response: RqStoreResponse): number | null => {
    const data: unknown = response.data;
    if (typeof data !== 'object' || data === null || !('bx_id' in data)) {
        return null;
    }
    const bxId = (data as { bx_id?: unknown }).bx_id;
    return typeof bxId === 'number' ? bxId : null;
};

/**
 * Реквизиты компании с нашего бэка (`rq/*`, тот же RqModule, что у apps/rq).
 * Единственное место импорта api-пакета для слайса bx-rq.
 */
export class RqHelper {
    private api = getRq();

    async fetch(domain: string, companyId: number): Promise<RqBundle> {
        const response = await this.api.rqGetRq({
            domain,
            company_id: companyId,
            iswait: true,
        });
        return fromBundleDto(response.rqs);
    }

    /** Создать/обновить реквизит; вернёт bx_id (новый — для только что созданного). */
    async storeRecord(
        domain: string,
        companyId: number,
        record: RqRecord,
    ): Promise<number | null> {
        const response = await this.api.rqStoreRq({
            domain,
            company_id: companyId,
            iswait: true,
            preset_id: record.preset_id,
            bx_id: record.bx_id,
            rq: toRecordDto(record),
        });
        return storedRqId(response);
    }

    async storeAddress(
        domain: string,
        companyId: number,
        rqId: number,
        address: AddressRqItem,
    ): Promise<void> {
        await this.api.rqStoreRq({
            domain,
            company_id: companyId,
            iswait: true,
            bx_id: rqId,
            address: toAddressItemDto(address),
        });
    }

    /** Сохранить банк; вернёт id банка (новый — для созданного). */
    async storeBank(
        domain: string,
        companyId: number,
        rqId: number,
        bank: BankRqItem,
    ): Promise<number> {
        const response = await this.api.rqStoreRq({
            domain,
            company_id: companyId,
            iswait: true,
            bx_id: rqId,
            bank: toBankItemDto(bank),
        });
        return typeof response.data === 'number' ? response.data : bank.id;
    }

    /** Родительный падеж (ФИО — kind person, должность/основание — word). */
    async declineCase(value: string, kind: RqCaseKind): Promise<string> {
        const response = await this.api.rqDeclineCase({ value, kind });
        return response.case || value;
    }
}
