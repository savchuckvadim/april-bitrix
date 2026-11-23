import { COMPLECT_MODE, type ComplectMode } from '../../complect-variant/model/dto';
import { buildProductRows, type BitrixProductRow } from '../../row-set';
import { buildVariantEntries, type SkippedVariant, type VariantsPayloadInput } from './build-variants-payload';

/**
 * Товарные строки сделки по вариантам комплекта. Когда варианты продаются
 * вместе (режим «Все варианты, каждому свой договор» или «Все варианты одним
 * договором») и участников два и больше, в сделку уходят общие наборы всех
 * участников по порядку: открытый вариант из живого состояния, остальные из
 * слепков. Иначе (режим «Только открытый вариант» или участников меньше двух)
 * строки берутся из живого общего набора, как до вариантов.
 */

export interface DealProductRowsInput extends VariantsPayloadInput {
    mode: ComplectMode;
}

export interface DealProductRowsResult {
    /** Строки сделки; номера `sort` идут сквозь наборы участников. */
    rows: BitrixProductRow[];
    /** Участники, которых собрать нельзя: по ним запись в сделку блокируется. */
    skipped: SkippedVariant[];
}

/**
 * Строки для записи в сделку. Режим «Только открытый вариант» берёт только живой набор: в
 * документы и в сделку идёт открытый вариант, а он и есть живое состояние.
 * Участников меньше двух тоже ведут к живому набору. Участники те же, что у
 * документов (buildVariantEntries); кого собрать нельзя, попадает в `skipped`,
 * и вызывающий блокирует запись, чтобы в сделку не ушла неполная сумма.
 * Свёрнутый набор участника даёт одну строку итога.
 */
export const buildDealProductRows = (input: DealProductRowsInput): DealProductRowsResult => {
    const liveRows = () => buildProductRows(input.live.general, input.catalog);
    if (input.mode === COMPLECT_MODE.compare) return { rows: liveRows(), skipped: [] };

    const { entries, skipped } = buildVariantEntries(input);
    if (entries.length + skipped.length < 2) return { rows: liveRows(), skipped: [] };

    const rows: BitrixProductRow[] = [];
    for (const entry of entries) {
        rows.push(...buildProductRows(entry.general, input.catalog, rows.length));
    }
    return { rows, skipped };
};
