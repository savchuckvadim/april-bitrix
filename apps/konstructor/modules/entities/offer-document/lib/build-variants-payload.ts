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

/**
 * Почему участник не попал в документ:
 *  - snapshotUnreadable — слепок варианта не читается;
 *  - noMainRow — нет главной строки комплекта, её договора или поставки в каталоге
 *    (в эту же причину входит договор любой строки, которого нет в каталоге).
 */
export type SkippedVariantReason = 'snapshotUnreadable' | 'noMainRow';

/** Участник, которого собрать в документ не удалось. */
export interface SkippedVariant {
    variantSmartId: number | null;
    title: string;
    reason: SkippedVariantReason;
}

export interface VariantsPayload {
    /** Собранные участники — уходят в документ. */
    variants: DocVariant[];
    /** Участники без документа: по ним формирование блокируется. */
    skipped: SkippedVariant[];
}

const fromRecord = (record: ComplectVariantRecordDto): VariantsPayloadInput['live'] | null => {
    const snapshot = parseSnapshotV2(record.rows);
    return snapshot ? { general: snapshot.general, alternative: snapshot.alternative } : null;
};

/**
 * Договор строки, которого нет в каталоге, buildDocVariant выбрасывает ошибкой:
 * для участника это та же ситуация, что и пустой результат (комплект собрать нельзя).
 */
const tryBuildDocVariant = (input: Parameters<typeof buildDocVariant>[0]): DocVariant | null => {
    try {
        return buildDocVariant(input);
    } catch {
        return null;
    }
};

/**
 * Участники КП (DocumentVariantDto[]) по правилу selectParticipants: те же
 * варианты, что видит менеджер на экране вариантов. Открытый вариант берётся
 * из текущего row-set — что на экране, то и в документе, даже без сохранения.
 * Варианты только v2 (смарт появился после v2). Участник, которого собрать
 * нельзя, попадает в `skipped` с причиной: вызывающий блокирует документ, и
 * менеджер видит, какой вариант и почему не вошёл.
 * Пустой список вариантов — бэк печатает одиночное КП из полей самого запроса.
 */
export const buildVariantsPayload = (input: VariantsPayloadInput): VariantsPayload => {
    const variants: DocVariant[] = [];
    const skipped: SkippedVariant[] = [];
    for (const record of selectParticipants(input.records, input.stageOf)) {
        const item = input.items.find(candidate => candidate.id === Number(record.variantSmartId));
        const title = item?.title || `Вариант ${record.variantSmartId ?? record.id}`;
        const source =
            record.variantSmartId !== null && record.variantSmartId === input.openVariantSmartId
                ? input.live
                : fromRecord(record);
        if (!source) {
            skipped.push({ variantSmartId: record.variantSmartId, title, reason: 'snapshotUnreadable' });
            continue;
        }
        const variant = tryBuildDocVariant({
            catalog: input.catalog,
            variantSmartId: record.variantSmartId,
            title,
            ...source,
        });
        if (variant) {
            variants.push(variant);
        } else {
            skipped.push({ variantSmartId: record.variantSmartId, title, reason: 'noMainRow' });
        }
    }
    return { variants, skipped };
};
