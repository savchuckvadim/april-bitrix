import type { Catalog } from '../../catalog';
// чистые модули complect-variant, не баррель: баррель тянет thunk → portal → app
import type { ComplectVariantItem } from '../../complect-variant/lib/api/complect-variant-helper';
import { selectParticipants } from '../../complect-variant/lib/participants';
import type { ComplectVariantStage } from '../../complect-variant/lib/stage';
import type { ComplectVariantRecordDto } from '../../complect-variant/model/dto';
import { buildDocVariant, type DocVariant } from '../../document-payload';
import type { RowSet } from '../../row-set';
import { parseSnapshotV2 } from '../../snapshot';

export interface VariantsPayloadInput {
    catalog: Catalog;
    records: ComplectVariantRecordDto[];
    items: ComplectVariantItem[];
    stageOf: (variantSmartId: number | null) => ComplectVariantStage;
    /** Вариант, открытый в конструкторе: печатается из живого состояния, не из слепка */
    openVariantSmartId: number | null;
    live: { general: RowSet; alternative: RowSet[] };
}

const fromRecord = (record: ComplectVariantRecordDto): VariantsPayloadInput['live'] | null => {
    const snapshot = parseSnapshotV2(record.rows);
    return snapshot ? { general: snapshot.general, alternative: snapshot.alternative } : null;
};

/**
 * Участники КП (DocumentVariantDto[]) по правилу selectParticipants: те же
 * варианты, что видит менеджер на экране вариантов. Открытый вариант берётся
 * из текущего row-set — что на экране, то и в документе, даже без сохранения.
 * Варианты только v2 (смарт появился после v2); нечитаемый слепок пропускаем.
 * Пустой список — бэк печатает одиночное КП из полей самого запроса.
 */
export const buildVariantsPayload = (input: VariantsPayloadInput): DocVariant[] => {
    const participants = selectParticipants(input.records, input.stageOf);
    return participants.flatMap(record => {
        const item = input.items.find(candidate => candidate.id === Number(record.variantSmartId));
        const title = item?.title || `Вариант ${record.variantSmartId ?? record.id}`;
        const source =
            record.variantSmartId !== null && record.variantSmartId === input.openVariantSmartId
                ? input.live
                : fromRecord(record);
        if (!source) return [];
        const variant = buildDocVariant({
            catalog: input.catalog,
            variantSmartId: record.variantSmartId,
            title,
            ...source,
        });
        return variant ? [variant] : [];
    });
};
