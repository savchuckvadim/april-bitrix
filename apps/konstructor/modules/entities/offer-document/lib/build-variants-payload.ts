import type { Catalog } from '../../catalog';
// чистые модули complect-variant, не баррель: баррель тянет thunk → portal → app
import type { ComplectVariantItem } from '../../complect-variant/lib/api/complect-variant-helper';
import type { ComplectVariantRecordDto } from '../../complect-variant/model/dto';
import { buildDocVariant, type DocVariant } from '../../document-payload';
import type { OfferPdfSnapshot } from '../../offer-pdf/model/types';
import type { RowSet } from '../../row-set';
import { parseSnapshotV2 } from '../../snapshot';

export interface VariantsPayloadInput {
    catalog: Catalog;
    /**
     * Участники документов: результат selectParticipants. Правило участия
     * (режим сделки, открытый вариант, закрытые стадии) применяется один раз,
     * в селекторе selectVariantParticipants, и сюда приходит готовым.
     */
    participants: ComplectVariantRecordDto[];
    /** Элементы смарта: названия участников */
    items: ComplectVariantItem[];
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
    /**
     * Те же участники вместе с данными, из которых они собраны. По ним PDF-КП
     * берёт у каждого участника его способ печати наполнения (поле `pdf`).
     */
    entries: VariantEntry[];
    /** Участники без документа: по ним формирование блокируется. */
    skipped: SkippedVariant[];
}

/** Откуда собран участник: наборы и настройки PDF-КП, сохранённые вместе с ними. */
interface VariantSource {
    general: RowSet;
    alternative: RowSet[];
    pdf: OfferPdfSnapshot | null;
}

const fromRecord = (record: ComplectVariantRecordDto): VariantSource | null => {
    const snapshot = parseSnapshotV2(record.rows);
    return snapshot
        ? { general: snapshot.general, alternative: snapshot.alternative, pdf: snapshot.pdf ?? null }
        : null;
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
 * Участник, которого удалось собрать: запись варианта, наборы, из которых он
 * собран, и готовый участник КП. Наборы нужны документам, которым участник КП
 * не годится (договор собирает свой запрос по общему набору варианта).
 */
export interface VariantEntry {
    record: ComplectVariantRecordDto;
    variantSmartId: number | null;
    title: string;
    /** Вариант открыт в конструкторе: наборы взяты из живого состояния, не из слепка. */
    isOpen: boolean;
    general: RowSet;
    alternative: RowSet[];
    /**
     * Формат и стиль КП из слепка варианта. У открытого варианта null: его
     * настройки лежат на экране.
     */
    pdf: OfferPdfSnapshot | null;
    doc: DocVariant;
}

export interface VariantEntries {
    /** Собранные участники в порядке записей. */
    entries: VariantEntry[];
    /** Участники без документа: по ним формирование блокируется. */
    skipped: SkippedVariant[];
}

/**
 * Участники документов (`input.participants`, правило selectParticipants):
 * те же варианты, что видит менеджер на экране вариантов. Открытый вариант
 * берётся из текущего row-set — что на экране, то и в документе, даже без
 * сохранения. Варианты только v2 (смарт появился после v2). Участник, которого
 * собрать нельзя, попадает в `skipped` с причиной: вызывающий блокирует
 * документ, и менеджер видит, какой вариант и почему не вошёл.
 */
export const buildVariantEntries = (input: VariantsPayloadInput): VariantEntries => {
    const entries: VariantEntry[] = [];
    const skipped: SkippedVariant[] = [];
    for (const record of input.participants) {
        const item = input.items.find(candidate => candidate.id === Number(record.variantSmartId));
        const title = item?.title || `Вариант ${record.variantSmartId ?? record.id}`;
        const isOpen = record.variantSmartId !== null && record.variantSmartId === input.openVariantSmartId;
        const source = isOpen ? { ...input.live, pdf: null } : fromRecord(record);
        if (!source) {
            skipped.push({ variantSmartId: record.variantSmartId, title, reason: 'snapshotUnreadable' });
            continue;
        }
        const doc = tryBuildDocVariant({
            catalog: input.catalog,
            variantSmartId: record.variantSmartId,
            title,
            general: source.general,
            alternative: source.alternative,
        });
        if (doc) {
            entries.push({
                record,
                variantSmartId: record.variantSmartId,
                title,
                isOpen,
                general: source.general,
                alternative: source.alternative,
                pdf: source.pdf,
                doc,
            });
        } else {
            skipped.push({ variantSmartId: record.variantSmartId, title, reason: 'noMainRow' });
        }
    }
    return { entries, skipped };
};

/**
 * Участники КП (DocumentVariantDto[]) из buildVariantEntries: собранные уходят
 * в документ, пропущенные возвращаются с причиной.
 * Пустой список вариантов — бэк печатает одиночное КП из полей самого запроса.
 */
export const buildVariantsPayload = (input: VariantsPayloadInput): VariantsPayload => {
    const { entries, skipped } = buildVariantEntries(input);
    return { variants: entries.map(entry => entry.doc), entries, skipped };
};
