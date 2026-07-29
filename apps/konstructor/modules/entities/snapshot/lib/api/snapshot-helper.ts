import { getKonstructorDeal } from '@workspace/nest-konstructor-api';
import type { SnapshotRecordDto, SnapshotUpsertDto } from '../../model/dto';
import type { SnapshotV2 } from '../../model/types';
import type { V1Record } from '../v1/types';

/**
 * Слепки bx_document_deals через @workspace/nest-konstructor-api —
 * ЕДИНСТВЕННОЕ место импорта api-пакета для snapshot-слайса.
 * Конверт {resultCode, data} разворачивает customAxios пакета.
 */
export const hasSnapshotApi = true;

/**
 * SnapshotRecordDto → V1Record: та же плоская запись; DTO даёт `null`
 * там, где V1Record ждёт undefined — parse-v1 защищённо переваривает оба.
 */
const toV1Record = (dto: SnapshotRecordDto): V1Record =>
    dto as unknown as V1Record;

export class SnapshotHelper {
    private api = getKonstructorDeal();

    /** null = слепка нет (нормальный флоу новой сделки) */
    async getSnapshot(
        domain: string,
        dealId: number,
        serviceSmartId?: number,
    ): Promise<V1Record | null> {
        const result = await this.api.innerDealFind({
            domain,
            dealId,
            serviceSmartId,
        });
        return result.found && result.deal ? toV1Record(result.deal) : null;
    }

    /** Все слепки сделки (обычный + сервисные смарты) */
    async listSnapshots(domain: string, dealId: number): Promise<V1Record[]> {
        const result = await this.api.innerDealList({ domain, dealId });
        return result.map(toV1Record);
    }

    /**
     * Сохранение слепка v2: сериализованный SnapshotV2 лежит в колонке rows
     * (детект при чтении — schemaVersion: 2), остальные v1-колонки null.
     * templateId дублируется в свою колонку (чиним легаси-асимметрию).
     */
    async saveSnapshot(snapshot: SnapshotV2): Promise<void> {
        if (!snapshot.dealId) throw new Error('saveSnapshot: нет dealId');
        const dto: SnapshotUpsertDto = {
            domain: snapshot.domain,
            dealId: snapshot.dealId,
            userId: snapshot.userId,
            serviceSmartId: snapshot.serviceSmartId,
            templateId: snapshot.templateId,
            rows: JSON.stringify(snapshot),
        };
        await this.api.innerDealUpsert(dto);
    }
}
